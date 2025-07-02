import React, { useEffect, useState } from "react";
import TransactionPreview from "@/components/screens/transaction/TransactionPreview";
import {
  useSimpleAccount,
  useNFTContext,
  useErc721Transfer,
  useResetContexts,
  useScreenManager,
  usePaymasterContext,
  usePaymasterMode,
} from "@/hooks";
import { screens } from "@/types";
import { truncateAddress, getSelectedTokenSymbol } from "@/utils";

const NFTTransferPreview: React.FC = () => {
  const { navigateTo } = useScreenManager();
  const { resetAllContexts } = useResetContexts();
  const { selectedNFT, recipientAddress, clearRecipientAddress } =
    useNFTContext();
  const [estimatedGasCost, setEstimatedGasCost] =
    useState<string>("Calculating...");
  const { AAaddress, simpleAccountInstance } = useSimpleAccount();
  const { nftTransfer, estimateNftTransferFee } = useErc721Transfer();
  const { paymasterModeValue, isFreeGasMode } = usePaymasterMode();
  const {
    paymaster,
    selectedToken: paymasterSelectedToken,
    supportedTokens,
  } = usePaymasterContext();

  useEffect(() => {
    const estimateGasCost = async () => {
      if (
        !recipientAddress ||
        !AAaddress ||
        AAaddress === "0x" ||
        !selectedNFT
      ) {
        setEstimatedGasCost("null");
        return;
      }

      try {
        if (isFreeGasMode) {
          setEstimatedGasCost("0");
          return;
        }

        const fee = await estimateNftTransferFee(
          selectedNFT.contractAddress,
          recipientAddress,
          String(selectedNFT.tokenId),
          paymaster,
          paymasterSelectedToken || undefined,
          paymasterModeValue,
        );
        setEstimatedGasCost(fee);
      } catch (error) {
        console.error("Error setting estimated gas cost");
        setEstimatedGasCost("0.0001");
      }
    };

    estimateGasCost();
  }, [
    recipientAddress,
    AAaddress,
    selectedNFT,
    isFreeGasMode,
    paymaster,
    paymasterSelectedToken,
    paymasterModeValue,
    estimateNftTransferFee,
  ]);

  const handleClose = () => {
    clearRecipientAddress();
    navigateTo(screens.NFTDETAIL);
  };

  const nftContent = selectedNFT ? (
    <div className="flex" data-oid="dbnpz5u">
      <img
        src={selectedNFT.image}
        className="size-20 rounded-lg"
        alt={selectedNFT.name}
        data-oid="kwr1n0l"
      />

      <div className="ml-2" data-oid="kuu261h">
        <p data-oid="dakliwa">{selectedNFT.name}</p>
        <p className="text-sm text-text-secondary" data-oid="qn2bja2">
          Contract
          <span className="text-md ml-2 text-text-primary" data-oid="5cufsc9">
            {truncateAddress(selectedNFT.contractAddress)}
          </span>
        </p>
      </div>
    </div>
  ) : null;

  if (!selectedNFT) {
    return null;
  }

  return (
    <TransactionPreview
      from={AAaddress}
      to={recipientAddress}
      networkFee={estimatedGasCost}
      gasTokenSymbol={getSelectedTokenSymbol(
        paymaster,
        paymasterSelectedToken,
        supportedTokens,
      )}
      onClose={handleClose}
      onConfirm={() =>
        simpleAccountInstance
          ? nftTransfer(
              selectedNFT.contractAddress,
              recipientAddress,
              String(selectedNFT.tokenId),
              paymaster,
              paymasterSelectedToken || undefined,
              paymasterModeValue,
            )
          : Promise.reject("SimpleAccount is not initialized")
      }
      onReset={resetAllContexts}
      data-oid="0d92o60"
    >
      {nftContent}
    </TransactionPreview>
  );
};

export default NFTTransferPreview;
