'use client'

import React, { createContext, useState, Dispatch, SetStateAction } from 'react'
import { Presets } from 'userop'
import { PaymasterContextType, ProviderProps } from '@/types'
import {
  PaymasterToken,
  PaymasterData,
  PaymasterMode,
  PaymasterModeValue,
  PAYMASTER_MODE,
  SponsorshipInfo,
} from '@/types/Paymaster'

export const PaymasterContext = createContext<PaymasterContextType | undefined>(undefined)

export const PaymasterProvider: React.FC<ProviderProps> = ({ children }) => {
  const [paymaster, setPaymaster] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [selectedPaymasterType, setSelectedPaymasterType] = useState<PaymasterModeValue>(PAYMASTER_MODE.PRE_FUND)
  const [supportedTokens, setSupportedTokens] = useState<PaymasterToken[]>([])
  const [freeGas, setFreeGas] = useState(false)
  const [paymasterData, setPaymasterData] = useState<PaymasterData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [builder, setBuilder] = useState<Presets.Builder.Kernel | null>(null)
  const [selectedMode, setSelectedMode] = useState<PaymasterMode>({
    value: PAYMASTER_MODE.FREE_GAS,
  })

  const [sponsorshipInfo, setSponsorshipInfo] = useState<SponsorshipInfo>({
    balance: '0',
    freeGas: false,
  })

  const [isPaymentSelected, setIsPaymentSelected] = useState(false)

  const clearPaymasterStates = () => {
    setPaymaster(false)
    setSelectedToken(null)
    setSelectedPaymasterType(PAYMASTER_MODE.PRE_FUND)
    setFreeGas(false)
    setSelectedMode({ value: PAYMASTER_MODE.FREE_GAS })
    setSponsorshipInfo((prev) => ({ ...prev, freeGas: false }))
    setIsPaymentSelected(false)
  }

  const setSponsoredGas = () => {
    clearPaymasterStates()
    setPaymaster(true)
    setSelectedToken(null)
    setSelectedPaymasterType(PAYMASTER_MODE.FREE_GAS)
    setFreeGas(true)
    setSelectedMode({ value: PAYMASTER_MODE.FREE_GAS })
    setSponsorshipInfo((prev) => ({ ...prev, freeGas: true }))
    setIsPaymentSelected(true)
  }

  const setTokenPayment = (
    token: string | null,
    mode: PaymasterModeValue = PAYMASTER_MODE.PRE_FUND,
  ) => {
    clearPaymasterStates()
    if (token) {
      setPaymaster(mode !== PAYMASTER_MODE.NATIVE)
      setSelectedToken(token)
      setSelectedPaymasterType(mode)
      setFreeGas(false)
      setSelectedMode({ value: mode })
      setSponsorshipInfo((prev) => ({ ...prev, freeGas: false }))
      setIsPaymentSelected(true)
    } else {
      clearPaymasterStates()
    }
  }

  const clearToken = () => {
    clearPaymasterStates()
  }

  const contextValue: PaymasterContextType = {
    paymaster,
    setPaymaster,
    selectedToken,
    setSelectedToken,
    selectedPaymasterType,
    setSelectedPaymasterType,
    supportedTokens,
    setSupportedTokens,
    freeGas,
    setFreeGas,
    paymasterData,
    setPaymasterData,
    error,
    setError,
    builder,
    setBuilder,
    selectedMode,
    setSelectedMode,
    sponsorshipInfo,
    setSponsorshipInfo,
    isPaymentSelected,
    setIsPaymentSelected,
    clearPaymasterStates,
    setSponsoredGas,
    setTokenPayment,
    clearToken,
  }

  return (
    <PaymasterContext.Provider value={contextValue}>
      {children}
    </PaymasterContext.Provider>
  )
}
