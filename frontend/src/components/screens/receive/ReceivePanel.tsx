import React from "react";
import QRCode from "qrcode.react";
import { AiFillCaretLeft } from "react-icons/ai";
import { CopyButton } from "@/components/ui/buttons";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { useSignature, useScreenManager } from "@/hooks";
import { screens } from "@/types";
import { truncateAddress } from "@/utils";

const ReceivePanel: React.FC = () => {
  const { AAaddress } = useSignature();
  const { navigateTo } = useScreenManager();

  const handleHomeClick = () => {
    navigateTo(screens.HOME);
  };

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="h943kh2" />}
      data-oid="m4e_bcz"
    >
      <HeaderNavigation data-oid="rnh_m1e" />
      <div className="mx-auto px-6" data-oid="w6ikwdp">
        <div className="flex flex-col" data-oid="8tfdcy1">
          <div
            className="w-full h-[400px] bg-white rounded-md border border-border-primary p-3 mt-2"
            data-oid="vym18by"
          >
            <h2
              className="text-xl text-center text-text-secondary mb-3"
              data-oid="cm_9g7h"
            >
              Receive
            </h2>
            <div className="mb-3" data-oid="pqt18vm">
              <label
                className="block text-text-secondary text-md mb-1"
                data-oid="w-iyn8k"
              >
                Wallet Address
              </label>
              {AAaddress && (
                <CopyButton
                  textToCopy={AAaddress}
                  className="flex items-center"
                  data-oid=":81no8w"
                >
                  <div className="text-md mr-2" data-oid="u7u4na7">
                    {truncateAddress(AAaddress)}
                  </div>
                </CopyButton>
              )}
            </div>
            <label
              className="block text-text-secondary text-md mt-5 mb-2"
              data-oid="e-v7ytd"
            >
              QR Code
            </label>
            <div className="flex justify-center mb-3" data-oid="wmbprx.">
              <div
                className="w-48 h-48 flex items-center justify-center border border-border-primary"
                data-oid="d0pgvzv"
              >
                {AAaddress && (
                  <QRCode value={AAaddress} size={180} data-oid="m-n.7u." />
                )}
              </div>
            </div>

            <div className="flex items-left mt-7" data-oid="hyo5n5m">
              <button
                onClick={handleHomeClick}
                className="flex items-center text-sm text-text-primary px-2 rounded-full"
                data-oid="y7bpim_"
              >
                <AiFillCaretLeft className="mr-2" data-oid="5g4yke:" />
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default ReceivePanel;
