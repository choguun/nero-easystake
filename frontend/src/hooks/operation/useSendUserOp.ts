'use client'

import { useCallback, useContext, useState, useEffect, useRef } from 'react'
import { BytesLike, ethers } from 'ethers'
import { ClientContext, SendUserOpContext, SignatureContext } from '@/contexts'
import { useEstimateUserOpFee } from '@/hooks'
import { useEthersSigner, useConfig, useScreenManager } from '@/hooks'
import { OperationData, UserOperation, UserOperationResultInterface, screens } from '@/types'
import { PAYMASTER_MODE } from '@/types/Paymaster'
import { useBuilderWithPaymaster } from '@/utils'

export const useSendUserOp = () => {
  const { navigateTo, currentScreen } = useScreenManager()
  const sendUserOpContext = useContext(SendUserOpContext)
  const signer = useEthersSigner()
  const client = useContext(ClientContext)
  const { simpleAccountInstance } = useContext(SignatureContext)!
  const { tokenPaymaster } = useConfig()
  const { estimateUserOpFee, ensurePaymasterApproval } = useEstimateUserOpFee()
  const { initBuilder } = useBuilderWithPaymaster(signer)

  if (!sendUserOpContext) {
    throw new Error('SendUserOpContext is undefined')
  }

  const { userOperations, setUserOperations, setLatestUserOpResult, latestUserOpResult } =
    useContext(SendUserOpContext)!

  const [resolveFunc, setResolveFunc] = useState<((value: UserOperationResultInterface | PromiseLike<UserOperationResultInterface>) => void) | null>(null)
  const [pendingUserOpHash, setPendingUserOpHash] = useState<string | null>(null)

  const resultRef = useRef<UserOperationResultInterface | null>(latestUserOpResult)

  useEffect(() => {
    resultRef.current = latestUserOpResult;
    if (resolveFunc && latestUserOpResult) {
      console.log('[useSendUserOp useEffect] Resolving waitForUserOpResult with:', latestUserOpResult);
      resolveFunc(latestUserOpResult);
      setResolveFunc(null);
    }
  }, [latestUserOpResult, resolveFunc])

  const waitForUserOpResultModified = useCallback(
    (): Promise<UserOperationResultInterface> =>
      new Promise((resolve, reject) => {
        if (resultRef.current && resultRef.current.error) {
            console.log('[waitForUserOpResult] Resolving immediately with pre-existing error in resultRef:', resultRef.current);
            resolve(resultRef.current);
            resultRef.current = null;
            return;
        }
        
        console.log('[waitForUserOpResult] Setting up resolver and timeout for panel interaction + sendUserOp.');
        const timer = setTimeout(() => {
          console.warn('[waitForUserOpResult] Timeout waiting for UserOp result. Panel interaction may have failed, been cancelled, or sendUserOp hung/timed out.');
          if (latestUserOpResult && latestUserOpResult.error) {
            resolve(latestUserOpResult);
          } else {
            reject(new Error('Timeout waiting for UserOperation result. Panel/sendUserOp took too long or was cancelled.'));
          }
          setResolveFunc(null);
        }, 150000);

        setResolveFunc(() => (value: UserOperationResultInterface) => {
          clearTimeout(timer);
          resolve(value);
        });
      }),
    [latestUserOpResult],
  )

  const checkUserOpStatus = useCallback(
    async (userOpHash: string): Promise<boolean | null> => {
      if (!simpleAccountInstance) {
        return null
      }
      try {
        return await simpleAccountInstance.checkUserOp(userOpHash)
      } catch (error) {
        console.error('Error checking UserOp status:', error)
        return null
      }
    },
    [simpleAccountInstance],
  )

  const estimateUserOpFeeWrapper = useCallback(
    async (usePaymaster: boolean = false, paymasterTokenAddress?: string, type: number = 0) => {
      if (userOperations.length === 0) {
        return '0'
      }

      const operations: OperationData[] = userOperations.map((op) => ({
        contractAddress: op.contractAddress,
        abi: op.abi,
        function: op.function,
        params: op.params,
        value: op.value || ethers.constants.Zero,
      }))

      return estimateUserOpFee(operations, usePaymaster, paymasterTokenAddress, type)
    },
    [estimateUserOpFee, userOperations],
  )

  const execute = useCallback(async (operation: UserOperation): Promise<UserOperationResultInterface> => {
    console.log('[useSendUserOp execute] Initiating operation:', operation);
    resultRef.current = null
    setLatestUserOpResult(null)
    setUserOperations([operation])
    
    if (!sendUserOpContext) {
        console.error('[useSendUserOp execute] SendUserOpContext not available!')
        const errorResult = { userOpHash: 'ERROR_NO_PANEL_CONTEXT', result: false, transactionHash: '', error: 'UI Context error' };
        setLatestUserOpResult(errorResult);
        resultRef.current = errorResult;
        return Promise.resolve(errorResult);
    }
    
    sendUserOpContext.forceOpenPanel()
    if (currentScreen !== screens.SENDUSEROP) {
      navigateTo(screens.SENDUSEROP)
    }
    console.log('[useSendUserOp execute] Panel forced open, navigation initiated. Returning waitForUserOpResultModified promise.');
    return waitForUserOpResultModified();
  }, [setUserOperations, sendUserOpContext, navigateTo, currentScreen, waitForUserOpResultModified, setLatestUserOpResult])

  const executeBatch = useCallback(async (operations: UserOperation[]): Promise<UserOperationResultInterface> => {
    console.log('[useSendUserOp executeBatch] Initiating batch operation:', operations);
    resultRef.current = null
    setLatestUserOpResult(null)
    setUserOperations(operations)
    
    if (!sendUserOpContext) {
        console.error('[useSendUserOp executeBatch] SendUserOpContext not available!')
        const errorResult = { userOpHash: 'ERROR_NO_PANEL_CONTEXT', result: false, transactionHash: '', error: 'UI Context error' };
        setLatestUserOpResult(errorResult);
        resultRef.current = errorResult;
        return Promise.resolve(errorResult);
    }

    sendUserOpContext.forceOpenPanel()
    if (currentScreen !== screens.SENDUSEROP) {
      navigateTo(screens.SENDUSEROP)
    }
    console.log('[useSendUserOp executeBatch] Panel forced open, navigation initiated. Returning waitForUserOpResultModified promise.');
    return waitForUserOpResultModified();
  }, [setUserOperations, sendUserOpContext, navigateTo, currentScreen, waitForUserOpResultModified, setLatestUserOpResult])

  const sendUserOp = useCallback(
    async (usePaymaster: boolean = false, paymasterTokenAddress?: string, type: number = 0) => {
      if (!signer || !client || !simpleAccountInstance || !initBuilder) {
        console.error('[useSendUserOp] sendUserOp: Missing signer, client, simpleAccountInstance, or initBuilder');
        const errorResult = {
          userOpHash: 'ERROR_NO_SIGNER_CLIENT_OR_INSTANCE',
          result: false,
          transactionHash: '',
          error: 'Missing signer, client, or AA instance'
        };
        setLatestUserOpResult(errorResult);
        return errorResult;
      }

      try {
        if (userOperations.length === 0) {
          console.warn('[useSendUserOp] sendUserOp: No user operations to send.');
          const errorResult = { userOpHash: 'ERROR_NO_OPERATIONS', result: false, transactionHash: '', error: 'No operations to send' };
          setLatestUserOpResult(errorResult);
          return errorResult;
        }
        console.log('[useSendUserOp] sendUserOp: Starting...', { usePaymaster, paymasterTokenAddress, type });

        let operations: { to: string; value: ethers.BigNumberish; data: BytesLike }[] = []

        if (usePaymaster && paymasterTokenAddress && type !== PAYMASTER_MODE.FREE_GAS) {
          try {
            console.log('[useSendUserOp] sendUserOp: Ensuring paymaster approval...');
            const approved = await ensurePaymasterApproval(paymasterTokenAddress)
            if (!approved) {
              console.warn('[useSendUserOp] sendUserOp: Failed to ensure paymaster approval, transaction may fail')
            }
            console.log('[useSendUserOp] sendUserOp: Paymaster approval check done.');
          } catch (error) {
            console.error('[useSendUserOp] sendUserOp: Error ensuring allowance:', error)
          }
        }

        if (userOperations.length === 1) {
          const userOperation = userOperations[0]
          const contract = new ethers.Contract(
            userOperation.contractAddress,
            userOperation.abi,
            signer,
          )
          operations.push({
            to: contract.address,
            value: userOperation.value || ethers.constants.Zero,
            data: contract.interface.encodeFunctionData(
              userOperation.function,
              userOperation.params,
            ),
          })
        } else if (userOperations.length > 1) {
          userOperations.forEach((operation) => {
            const contract = new ethers.Contract(operation.contractAddress, operation.abi, signer)
            operations.push({
              to: contract.address,
              value: operation.value || ethers.constants.Zero,
              data: contract.interface.encodeFunctionData(operation.function, operation.params),
            })
          })
        }
        console.log('[useSendUserOp] sendUserOp: Operations prepared:', operations);

        const builder = await initBuilder(usePaymaster, paymasterTokenAddress, type)
        if (!builder) {
          console.error('[useSendUserOp] sendUserOp: Builder initialization failed.');
          const errorResult = { userOpHash: 'ERROR_BUILDER_INIT', result: false, transactionHash: '', error: 'Builder init failed' };
          setLatestUserOpResult(errorResult);
          return errorResult;
        }
        console.log('[useSendUserOp] sendUserOp: Builder initialized.');

        let userOpForExecution
        if (operations.length === 1) {
          const op = operations[0]
          console.log('[useSendUserOp] sendUserOp: Building single operation...');
          userOpForExecution = await builder.execute(op.to, op.value, op.data)
        } else {
          const to = operations.map((op) => op.to)
          const data = operations.map((op) => op.data)
          console.log('[useSendUserOp] sendUserOp: Building batch operation...');
          userOpForExecution = await builder.executeBatch(to, data)
        }
        console.log('[useSendUserOp] sendUserOp: UserOp built by builder:', userOpForExecution);

        // START --- Manual Gas Price Override ---
        // Ensure ethers.utils is available or import utils directly if not already.
        // Assuming ethers is imported as: import { ethers } from 'ethers'
        const reasonableMaxFeePerGas = ethers.utils.parseUnits('600', 'gwei').toString(); 
        const reasonableMaxPriorityFeePerGas = ethers.utils.parseUnits('50', 'gwei').toString();

        console.log(`[useSendUserOp] sendUserOp: Original gas fees on built op: maxFeePerGas=${(userOpForExecution as any).maxFeePerGas}, maxPriorityFeePerGas=${(userOpForExecution as any).maxPriorityFeePerGas}`);
        
        // It's crucial that userOpForExecution allows these fields to be set.
        // The IUserOperation type might be partial, actual object might be different.
        (userOpForExecution as any).maxFeePerGas = reasonableMaxFeePerGas;
        (userOpForExecution as any).maxPriorityFeePerGas = reasonableMaxPriorityFeePerGas;
        
        console.log(`[useSendUserOp] sendUserOp: Overridden gas fees on op: maxFeePerGas=${(userOpForExecution as any).maxFeePerGas}, maxPriorityFeePerGas=${(userOpForExecution as any).maxPriorityFeePerGas}`);
        // END --- Manual Gas Price Override ---

        console.log('[useSendUserOp] sendUserOp: Sending UserOperation to client with potentially overridden gas fees...');
        const res = await client.sendUserOperation(userOpForExecution, {
          dryRun: false,
        })
        console.log('[useSendUserOp] sendUserOp: UserOperation sent. Response:', res, 'UserOpHash:', res.userOpHash);

        console.log('[useSendUserOp] sendUserOp: Calling res.wait()... UserOpHash:', res.userOpHash);
        let ev;
        try {
          const evPromise = res.wait();
          const timeoutDuration = 60000; // 60 seconds timeout
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`UserOperation receipt retrieval timed out after ${timeoutDuration/1000}s`)), timeoutDuration)
          ); 
          
          ev = await Promise.race([evPromise, timeoutPromise]);
          console.log('[useSendUserOp] sendUserOp: res.wait() resolved. Event:', ev);
        } catch (error: any) {
          console.error('[useSendUserOp] sendUserOp: Error or timeout in res.wait() for UserOpHash:', res.userOpHash, error);
          const errorResult = {
            userOpHash: res.userOpHash || 'UNKNOWN_HASH_ON_WAIT_TIMEOUT',
            result: false,
            transactionHash: '', 
            error: `Failed to get UserOp receipt: ${error.message}`
          };
          setLatestUserOpResult(errorResult);
          throw error;
        }

        console.log('[useSendUserOp] sendUserOp: Checking UserOp status with simpleAccountInstance... UserOpHash:', res.userOpHash);
        const userOpFinalStatus = await simpleAccountInstance.checkUserOp(res.userOpHash)
        console.log('[useSendUserOp] sendUserOp: UserOp status from simpleAccountInstance:', userOpFinalStatus);
        
        const finalResult = {
          userOpHash: res.userOpHash,
          result: userOpFinalStatus,
          transactionHash: (ev && typeof ev === 'object' && 'transactionHash' in ev) ? (ev as any).transactionHash : '',
        };

        console.log('[useSendUserOp] sendUserOp: Process complete. Final result:', finalResult);
        setUserOperations([])
        setLatestUserOpResult(finalResult)
        return finalResult;

      } catch (error: any) {
        console.error('[useSendUserOp] sendUserOp: General error:', error);
        const errorResult = {
          userOpHash: 'ERROR_IN_SENDUSEROP_GENERAL', 
          result: false,
          transactionHash: '',
          error: error.message || 'SendUserOp failed'
        };
        setLatestUserOpResult(errorResult);
        return errorResult;
      }
    },
    [
      signer,
      client,
      simpleAccountInstance,
      initBuilder,
      userOperations,
      ensurePaymasterApproval,
      setUserOperations,
      setLatestUserOpResult
    ],
  )

  return {
    execute,
    executeBatch,
    sendUserOp,
    estimateUserOpFee: estimateUserOpFeeWrapper,
    latestUserOpResult,
    waitForUserOpResult: waitForUserOpResultModified,
    checkUserOpStatus,
  }
}
