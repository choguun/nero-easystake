import React, { useContext } from "react";
import { AiFillCaretLeft } from "react-icons/ai";
import { Button } from "@/components/ui/buttons";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { MultiSendContext } from "@/contexts";
import { useScreenManager } from "@/hooks";
import { screens } from "@/types";

const MultiSendPreviewPanel: React.FC = () => {
  const { recipients } = useContext(MultiSendContext)!;
  const { navigateTo } = useScreenManager();

  const handleNext = () => {
    navigateTo(screens.MULTISENDCONFIRM);
  };

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="iph58-j" />}
      data-oid="uv5p6li"
    >
      <HeaderNavigation data-oid="l3_xwr." />
      <div className="mx-auto relative px-6" data-oid="iwj3csi">
        <div className="flex flex-col flex-grow" data-oid="dma:ok9">
          <div
            className="w-full h-[530px] bg-white rounded-md border border-border-primary p-4 mt-2 relative"
            data-oid="aq.31h8"
          >
            <h2
              className="text-md text-center font-bold mb-4"
              data-oid="3fpbm-0"
            >
              Preview
            </h2>

            <div
              className="max-h-[410px] overflow-y-auto no-scrollbar mb-4"
              data-oid="3zo.qyw"
            >
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="mb-6 border-b border-gray-100 pb-4 last:border-b-0"
                  data-oid="o0__u6u"
                >
                  <div className="mb-2" data-oid="4g7ij1e">
                    <h3 className="text-sm mb-1" data-oid="r_pk.9l">
                      {index + 1}. Address
                    </h3>
                    <p
                      className="text-sm text-primary break-all"
                      data-oid="vax:zsx"
                    >
                      {recipient.address}
                    </p>
                  </div>

                  <div
                    className="flex justify-between items-center mb-2"
                    data-oid="q3je41b"
                  >
                    <div data-oid="31_zr47">
                      <h3 className="text-sm mb-1 mt-2" data-oid="a5d6hqp">
                        Token
                      </h3>
                      <p className="text-sm text-primary" data-oid="foznt:4">
                        {recipient.token?.symbol}
                      </p>
                    </div>
                    <div data-oid="ud0-1k7">
                      <h3 className="text-sm mb-1" data-oid="7zzr6v3">
                        Amount
                      </h3>
                      <p
                        className="text-sm text-text-primary"
                        data-oid="my1kss:"
                      >
                        {Number(recipient.amount).toLocaleString()}{" "}
                        {recipient.token?.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="absolute bottom-[-30px] left-[-30px] right-[-20px] flex justify-between p-10"
              data-oid=":ytdooe"
            >
              <Button
                onClick={() => navigateTo(screens.MULTISEND)}
                variant="text"
                icon={AiFillCaretLeft}
                iconPosition="left"
                className="flex items-center text-sm text-text-primary px-2 mt-2 rounded-full"
                data-oid="z8xaecg"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                variant="primary"
                className="px-6 py-2"
                data-oid="d1383z0"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default MultiSendPreviewPanel;
