import { useCallback, useContext, useState, useRef, Dispatch, SetStateAction, RefObject } from 'react';
import { PaymasterContext } from '@/contexts/PaymasterContext';
import { PaymasterToken, PAYMASTER_MODE, PaymasterModeValue, SponsorshipInfo } from '@/types/Paymaster';

// Explicit return type for clarity and to help TypeScript
interface UsePaymasterUIResult {
  screen: 'selection' | 'tokenList';
  isFlipped: boolean;
  setIsFlipped: Dispatch<SetStateAction<boolean>>;
  localError: string | null;
  isLoading: boolean;
  error: string | null | undefined;
  supportedTokens: PaymasterToken[] | undefined;
  sponsorshipInfo: SponsorshipInfo | undefined;
  selectedToken: string | null | undefined;
  selectedPaymasterType: PaymasterModeValue | undefined;
  setSelectedPaymasterType: ((value: PaymasterModeValue) => void) | undefined;
  isSponsoredSelected: boolean;
  scrollContainerRef: RefObject<HTMLDivElement>;
  fetchTokens: () => Promise<void>;
  handleRetry: () => void;
  handleTokenClick: (token: PaymasterToken) => void;
  scrollLeft: () => void;
  scrollRight: () => void;
  handleSelectPaymentType: (paymentType: 'sponsored' | 'token', mode?: PaymasterModeValue) => void;
  handleBackToSelection: () => void;
}

export const usePaymasterUI = (): UsePaymasterUIResult => {
  const paymasterCtx = useContext(PaymasterContext);

  const [screen, setScreen] = useState<'selection' | 'tokenList'>('selection');
  const [isFlipped, setIsFlipped] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!paymasterCtx) {
    throw new Error('usePaymasterUI must be used within a PaymasterProvider and PaymasterContext is not available.');
  }

  const {
    error,
    supportedTokens,
    setSupportedTokens,
    sponsorshipInfo,
    selectedToken,
    setTokenPayment,
    setSponsoredGas,
    setIsPaymentSelected,
    selectedMode, 
    selectedPaymasterType,
    setSelectedPaymasterType,
    setError,
  } = paymasterCtx;

  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    setLocalError(null);
    if (setError) setError(null);
    try {
      console.log('Placeholder: Fetching supported tokens...');
      // TODO: Replace with your actual token fetching logic, then use setSupportedTokens
      // Example: const fetched = await api.fetchTokens(); if (setSupportedTokens) setSupportedTokens(fetched);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch tokens';
      setLocalError(errorMessage);
      if (setError) setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [setSupportedTokens, setError]);

  const handleSelectPaymentType = useCallback(
    (paymentType: 'sponsored' | 'token', mode?: PaymasterModeValue) => {
      if (setIsPaymentSelected) setIsPaymentSelected(true);
      const effectiveMode = mode !== undefined ? mode : PAYMASTER_MODE.PRE_FUND;

      if (paymentType === 'token') {
        if (setSelectedPaymasterType) setSelectedPaymasterType(effectiveMode);
        if (setTokenPayment) setTokenPayment(selectedToken, effectiveMode);
        
        if (!selectedToken && supportedTokens && supportedTokens.length > 0) {
          setScreen('tokenList');
        }
      } else if (paymentType === 'sponsored') {
        if (setSponsoredGas) setSponsoredGas(); 
        // setSponsoredGas in context should also set selectedPaymasterType to FREE_GAS
      }
    },
    [
      setIsPaymentSelected, 
      setTokenPayment, 
      setSponsoredGas, 
      selectedToken, 
      supportedTokens, 
      setSelectedPaymasterType
    ]
  );

  const handleTokenClick = useCallback((token: PaymasterToken) => {
    const modeToUse = selectedPaymasterType ?? PAYMASTER_MODE.PRE_FUND;
    if (setTokenPayment) setTokenPayment(token.token, modeToUse);
    // Potentially navigate or close panel after token selection
    // e.g. setScreen('selection'); or sendUserOpContext.closePanel();
  }, [setTokenPayment, selectedPaymasterType]);

  const handleBackToSelection = useCallback(() => {
    setScreen('selection');
  }, []);

  const handleRetry = useCallback(() => {
    setLocalError(null);
    if (setError) setError(null);
    fetchTokens();
  }, [fetchTokens, setError]);

  const isSponsoredSelected = !!(sponsorshipInfo?.freeGas && selectedMode?.value === PAYMASTER_MODE.FREE_GAS);

  const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
  const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 150, behavior: 'smooth' });

  return {
    screen,
    isFlipped,
    setIsFlipped,
    localError,
    isLoading,
    error,
    supportedTokens,
    sponsorshipInfo,
    selectedToken,
    selectedPaymasterType,
    setSelectedPaymasterType,
    isSponsoredSelected,
    scrollContainerRef,
    fetchTokens,
    handleRetry,
    handleTokenClick,
    scrollLeft,
    scrollRight,
    handleSelectPaymentType,
    handleBackToSelection,
  };
}; 