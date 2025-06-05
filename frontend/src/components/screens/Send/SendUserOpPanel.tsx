import React, { useContext, useState, useEffect } from 'react'
import { AiFillCaretLeft } from 'react-icons/ai'
import { PaymasterPanel } from '@/components/features/paymaster'
import { SendUserOpDetail } from '@/components/screens/Send'
import { Button } from '@/components/ui/buttons'
import { CommonContainerPanel } from '@/components/ui/layout'
import { BottomNavigation, HeaderNavigation } from '@/components/ui/navigation'
import { SendUserOpContext } from '@/contexts'
import { useScreenManager, usePaymasterContext, useSendUserOp } from '@/hooks'
import { screens, UserOperationResultInterface } from '@/types'

const SendUserOpPanel: React.FC = () => {
  const { navigateTo } = useScreenManager()
  const { 
    clearToken, 
    selectedMode, 
    isPaymentSelected, 
    paymaster,
    selectedToken
  } = usePaymasterContext()
  const {
    userOperations, 
    clearUserOperations, 
    isWalletPanel,
    setIsWalletPanel,
  } = useContext(SendUserOpContext)!

  const { sendUserOp } = useSendUserOp()
  const [isSending, setIsSending] = useState(false);

  const handleClosePanel = () => {
    setIsWalletPanel(false)
    clearUserOperations()
    clearToken()
  }

  const handleConfirmAndSend = async () => {
    console.log('[SendUserOpPanel] Confirm button clicked. Paymaster cfg:', { 
        usePaymaster: paymaster, 
        token: selectedToken, 
        modeValue: selectedMode?.value 
    });
    if (!userOperations || userOperations.length === 0) {
      console.error('[SendUserOpPanel] No user operations to send.')
      handleClosePanel()
      return
    }
    setIsSending(true);
    let operationSuccessful = false;
    try {
      const result: UserOperationResultInterface = await sendUserOp(
        paymaster, 
        selectedToken ?? undefined, 
        selectedMode?.value
      );
      if (result && result.result === true) {
        operationSuccessful = true;
      }
    } catch (error) {
      console.error('[SendUserOpPanel] Error calling sendUserOp from panel:', error)
    } finally {
      setIsSending(false);
      if (operationSuccessful) {
        console.log('[SendUserOpPanel] Operation successful, closing panel.');
        handleClosePanel();
      }
    }
  }

  const isUserOperationSet = (): boolean => {
    return userOperations && userOperations.length > 0
  }
  const replacer = (_: string, value: any) => (typeof value === 'bigint' ? value.toString() : value)

  const isTransferReady = isUserOperationSet() && selectedMode?.value !== undefined && isPaymentSelected

  return (
    <CommonContainerPanel 
      isOpen={isWalletPanel}
      onClose={handleClosePanel}
      title="Confirm Transaction"
      footer={
        <div className="flex justify-between w-full px-4">
          <Button
            onClick={handleClosePanel}
            variant='text'
            icon={AiFillCaretLeft}
            iconPosition='left'
            className='flex items-center text-sm text-text-primary rounded-full'
            disabled={isSending}
          >
            Back / Reject
          </Button>
          <Button
            onClick={handleConfirmAndSend}
            disabled={!isTransferReady || !isUserOperationSet() || isSending}
            variant={isTransferReady && isUserOperationSet() && !isSending ? 'primary' : 'secondary'}
            className={`px-6 py-2 ${(isTransferReady && isUserOperationSet() && !isSending) ? '' : 'opacity-50 cursor-not-allowed'}`}
          >
            {isSending ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </div>
      }
    >
      <div className='mx-auto relative px-2 md:px-6 py-2'>
        <div className='flex flex-col flex-grow'>
          <div className='w-full mb-3'>
            <div className='flex justify-between items-center'>
              <label className='block text-text-secondary text-sm font-semibold'>User Operation Details</label>
            </div>
          </div>
          <div className='w-full bg-gray-100 p-3 rounded-md overflow-y-auto max-h-[200px] md:max-h-[230px] mb-4 text-xs text-gray-700'>
            <pre className='whitespace-pre-wrap'>
              <code>{JSON.stringify(userOperations, replacer, 2)}</code>
            </pre>
          </div>
          <PaymasterPanel />
        </div>
      </div>
    </CommonContainerPanel>
  )
}

export default SendUserOpPanel
