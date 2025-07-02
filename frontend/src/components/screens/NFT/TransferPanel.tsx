import React, { useState } from "react";
import { AiFillCaretLeft } from "react-icons/ai";
import { PaymasterPanel } from "@/components/features/paymaster";
import { NFTTransferPreview } from "@/components/screens";
import { Button } from "@/components/ui/buttons";
import { ToInput } from "@/components/ui/inputs";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { useNFTContext, useScreenManager, usePaymasterContext } from "@/hooks";
import { screens } from "@/types";
import { truncateAddress } from "@/utils";

const NFTTransferPanel: React.FC = () => {
  const { navigateTo } = useScreenManager();
  const {
    selectedNFT,
    recipientAddress,
    clearRecipientAddress,
    setRecipientAddress,
    isTransferEnabled,
  } = useNFTContext();
  const [isTransferPreviewOpen, setIsTransferPreviewOpen] = useState(false);
  const { isPaymentSelected, selectedMode } = usePaymasterContext();

  const handleSend = () => {
    setIsTransferPreviewOpen(true);
  };

  const handleClose = () => {
    clearRecipientAddress();
    navigateTo(screens.NFTDETAIL);
  };

  if (!selectedNFT) {
    return <p data-oid="q63ghat">Loading...</p>;
  }

  if (isTransferPreviewOpen) {
    return <NFTTransferPreview data-oid="xdl7veh" />;
  }

  const isTransferReady =
    isTransferEnabled && selectedMode?.value !== undefined && isPaymentSelected;

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="vjstjp0" />}
      data-oid="-5vx53-"
    >
      <HeaderNavigation data-oid="lokufgd" />
      <div
        className="flex flex-col items-center flex-grow p-6 bg-bg-primary"
        data-oid="ufsgp7x"
      >
        <div
          className="w-full bg-white rounded-lg flex flex-col items-center justify-center p-3 border border-border-primary"
          data-oid="w2ks22o"
        >
          <div className="w-full" data-oid="84p4.hu">
            <h2
              className="text-xl text-center text-text-secondary"
              data-oid="5isgrmn"
            >
              Send Detail
            </h2>
            <ToInput
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              variant="send"
              data-oid="wivoox5"
            />
          </div>
        </div>
        <div
          className="w-full h-[24rem] my-2 p-4 bg-white rounded-md border border-border-primary relative"
          data-oid="gf8oz-r"
        >
          <div className="flex" data-oid="327rjsn">
            <img
              src={selectedNFT.image}
              className="size-20 rounded-md"
              data-oid="i_d3f1q"
            ></img>
            <div className="text-text-primary ml-2" data-oid="tyoko22">
              <p data-oid="iq025gg">{selectedNFT.name}</p>
            </div>
          </div>
          <label
            className="block text-text-secondary text-md mt-2"
            data-oid="7q1axqy"
          >
            Contract Address
          </label>
          <p className="text-sm" data-oid="nk_eqki">
            {truncateAddress(selectedNFT.contractAddress)}
          </p>
          <div className="flex justify-between mt-2 mb-3" data-oid="1u75jbs">
            <div data-oid="j:7.:w:">
              <label
                className="block text-text-secondary text-md"
                data-oid="z:675pa"
              >
                Token ID
              </label>
              <p className="text-sm" data-oid="jwu59y7">
                {selectedNFT.tokenId}
              </p>
            </div>
          </div>
          <PaymasterPanel data-oid="wnxyexk" />
          <div
            className="absolute bottom-[-30px] left-[-30px] right-[-20px] flex justify-between p-10"
            data-oid="wisgsvz"
          >
            <Button
              onClick={handleClose}
              variant="text"
              icon={AiFillCaretLeft}
              iconPosition="left"
              className="flex items-center text-sm text-text-primary px-2 mt-1 rounded-full"
              data-oid="jj8dnh_"
            >
              Back
            </Button>
            <Button
              onClick={handleSend}
              disabled={!isTransferReady}
              variant={isTransferReady ? "primary" : "secondary"}
              className={`px-6 py-2 rounded-full text-sm ${
                isTransferReady ? "" : "opacity-50 cursor-not-allowed"
              }`}
              data-oid="jugrubr"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default NFTTransferPanel;
