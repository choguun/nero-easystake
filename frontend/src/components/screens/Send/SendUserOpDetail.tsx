import React, { useState, useEffect, useContext } from "react";
import { TransactionPreview } from "@/components/screens/transaction";
import { SendUserOpContext } from "@/contexts";
import {
  useSimpleAccount,
  useSendUserOp,
  useResetContexts,
  useScreenManager,
  usePaymasterContext,
  usePaymasterMode,
} from "@/hooks";
import { screens } from "@/types";
import { truncateAddress, getSelectedTokenSymbol } from "@/utils";

const SendUserOpDetail: React.FC = () => {
  const { navigateTo } = useScreenManager();
  const [estimatedGasCost, setEstimatedGasCost] =
    useState<string>("Calculating...");
  const { AAaddress, simpleAccountInstance } = useSimpleAccount();
  const { sendUserOp, estimateUserOpFee } = useSendUserOp();
  const { userOperations } = useContext(SendUserOpContext)!;
  const {
    paymaster,
    selectedToken: paymasterSelectedToken,
    supportedTokens,
  } = usePaymasterContext();
  const { paymasterModeValue, isFreeGasMode } = usePaymasterMode();
  const { resetAllContexts } = useResetContexts();

  useEffect(() => {
    const estimateFees = async () => {
      if (!AAaddress || AAaddress === "0x") return;

      try {
        if (isFreeGasMode) {
          setEstimatedGasCost("0");
          return;
        }

        const fee = await estimateUserOpFee(
          paymaster,
          paymasterSelectedToken || undefined,
          paymasterModeValue,
        );
        setEstimatedGasCost(fee);
      } catch (error) {
        console.error("Error estimating gas cost:", error);
        setEstimatedGasCost("0.0001");
      }
    };

    estimateFees();
  }, [
    AAaddress,
    paymaster,
    paymasterSelectedToken,
    paymasterModeValue,
    isFreeGasMode,
    estimateUserOpFee,
    userOperations,
  ]);

  const executeTransfer = async () => {
    if (!simpleAccountInstance) {
      return Promise.reject("SimpleAccount is not initialized");
    }

    try {
      const result = await sendUserOp(
        paymaster,
        paymasterSelectedToken || undefined,
        paymasterModeValue,
      );
      return result;
    } catch (error) {
      console.error("Transfer failed");
      throw error;
    }
  };

  const handleClose = () => {
    navigateTo(screens.HOME);
  };

  const handleReset = () => {
    resetAllContexts();
  };

  const userOpContent = userOperations ? (
    <div
      className="space-y-4 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
      data-oid="xdfle8t"
    >
      {userOperations.map((operation, index) => (
        <div
          key={index}
          className="border-b border-border-secondary pb-3 last:border-b-0"
          data-oid="gu5:02o"
        >
          <div
            className="mb-2 font-medium text-text-primary"
            data-oid="q1ynt_8"
          >
            Operation #{index + 1}
          </div>
          <div className="ml-2" data-oid="94m2sau">
            <p className="text-sm text-text-secondary" data-oid="hub57.p">
              Contract
              <span
                className="text-md ml-2 text-text-primary break-all"
                data-oid="bxdollk"
              >
                {truncateAddress(operation.contractAddress)}
              </span>
            </p>
            <p className="text-sm text-text-secondary" data-oid="l8c03nl">
              Function
              <span
                className="text-md ml-2 text-text-primary break-words"
                data-oid="zp5xgca"
              >
                {operation.function}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <TransactionPreview
      from={AAaddress}
      to={""}
      networkFee={estimatedGasCost}
      gasTokenSymbol={getSelectedTokenSymbol(
        paymaster,
        paymasterSelectedToken,
        supportedTokens,
      )}
      onClose={handleClose}
      onConfirm={executeTransfer}
      onReset={handleReset}
      data-oid="tz9ypcz"
    >
      {userOpContent}
    </TransactionPreview>
  );
};

export default SendUserOpDetail;
