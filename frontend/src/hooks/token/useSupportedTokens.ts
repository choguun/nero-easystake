'use client'

import { useContext, useState, useCallback, useRef } from 'react'
import { ClientContext } from '@/contexts'
import { useEthersSigner } from '@/hooks'
import { PaymasterToken, SponsorshipInfo } from '@/types'
import { useBuilderWithPaymaster } from '@/utils'

export const useSupportedTokens = () => {
  const client = useContext(ClientContext)
  const signer = useEthersSigner()
  const { initBuilder } = useBuilderWithPaymaster(signer)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supportedTokens, setSupportedTokens] = useState<PaymasterToken[]>([])
  const [sponsorshipInfo, setSponsorshipInfo] = useState<SponsorshipInfo>({
    balance: '0',
    freeGas: false,
  })
  const fetchPromiseRef = useRef<Promise<any> | null>(null)
  const hasDataRef = useRef(false)
  const hasErrorRef = useRef(false)
  const retryCountRef = useRef(0)
  const MAX_RETRIES = 2

  const getSupportedTokens = useCallback(async () => {
    if (!client) {
      throw new Error('Client is not available')
    }

    if (hasDataRef.current && supportedTokens.length > 0) {
      return { tokens: supportedTokens, sponsorship: sponsorshipInfo }
    }

    if (hasErrorRef.current && retryCountRef.current >= MAX_RETRIES) {
      throw new Error(error || 'Failed to load payment options after multiple attempts')
    }

    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current
    }

    if (!hasDataRef.current) {
      setIsLoading(true)
    }
    setIsError(false)
    setError(null)

    fetchPromiseRef.current = (async () => {
      try {
        // console.log('[useSupportedTokens] Initializing builder for FREE GAS check...');
        const builderWithFreeGas = await initBuilder(true, undefined, 0);
        // console.log('[useSupportedTokens] builderWithFreeGas initialized:', builderWithFreeGas);
        if (!builderWithFreeGas) {
          // console.error('[useSupportedTokens] Failed to initialize builderWithFreeGas');
          throw new Error('Failed to initialize builder for free gas check');
        }

        let freeGasSupported = false;
        try {
          // console.log('[useSupportedTokens] Calling client.getSupportedTokens for FREE GAS...');
          const freeGasResponse = await client.getSupportedTokens(builderWithFreeGas);
          // console.log('[useSupportedTokens] freeGasResponse from paymaster:', freeGasResponse);
          freeGasSupported = freeGasResponse.freeGas || false;
          // console.log('[useSupportedTokens] freeGasSupported evaluated to:', freeGasSupported);
        } catch (err) {
          // console.error('[useSupportedTokens] Error during client.getSupportedTokens for FREE GAS:', err);
          freeGasSupported = false;
        }

        // console.log('[useSupportedTokens] Initializing builder for TOKEN check...');
        const builderWithToken = await initBuilder(true, undefined, 2);
        // console.log('[useSupportedTokens] builderWithToken initialized:', builderWithToken);
        if (!builderWithToken) {
          // console.error('[useSupportedTokens] Failed to initialize builderWithToken');
          throw new Error('Failed to initialize builder for token check');
        }
        // console.log('[useSupportedTokens] Calling client.getSupportedTokens for TOKENS...');
        const response = await client.getSupportedTokens(builderWithToken);
        // console.log('[useSupportedTokens] Token response from paymaster:', response);

        setSupportedTokens(response.tokens || []);
        const sponsorship = {
          balance: response.native?.price?.toString() || '0',
          freeGas: freeGasSupported,
        };
        // console.log('[useSupportedTokens] Setting sponsorshipInfo:', sponsorship);
        setSponsorshipInfo(sponsorship);
        setIsSuccess(true);
        hasDataRef.current = true;
        hasErrorRef.current = false;
        retryCountRef.current = 0;
        return {
          tokens: response.tokens || [],
          sponsorship,
          native: response.native,
        }
      } catch (err) {
        console.error('Error in getSupportedTokens:', err)
        setIsError(true)
        hasErrorRef.current = true
        retryCountRef.current += 1
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
        fetchPromiseRef.current = null
      }
    })()

    return fetchPromiseRef.current
  }, [client, initBuilder, supportedTokens, sponsorshipInfo, error])

  return {
    getSupportedTokens,
    supportedTokens,
    sponsorshipInfo,
    isLoading,
    isSuccess,
    isError,
    error,
  }
}
