import React from "react";
import { useBalance } from "wagmi";
import {
  TokenIcon,
  TokenAmount,
  TruncatedText,
} from "@/components/features/token";
import { BalanceBottomNavigation } from "@/components/ui/navigation";
import { useSignature } from "@/hooks";
import { BalancePanelProps } from "@/types";
import { formatAndRoundBalance } from "@/utils";

const BalancePanel: React.FC<BalancePanelProps> = ({
  showIcon = false,
  showBalanceLabel = true,
}) => {
  const { AAaddress } = useSignature();
  const { data, isLoading } = useBalance({ address: AAaddress });

  const accountBalance = data?.value
    ? formatAndRoundBalance(data.value.toString())
    : "0";

  return (
    <>
      <div
        className="bg-white h-31 rounded-md mx-auto border border-border-primary mt-3"
        data-oid="7jf59c."
      >
        <div className="p-6 mb-2" data-oid="axl1xvb">
          {showIcon && (
            <div className="flex items-center pb-3" data-oid="he09i9o">
              <TokenIcon
                tokenAddress="0x"
                symbol="NERO"
                isNative={true}
                size="sm"
                className="mr-2"
                data-oid="m2swp2."
              />

              <TruncatedText
                text={"NERO"}
                fontSize="sm"
                maxWidth="max-w-[200px]"
                data-oid="3tqp_9d"
              />
            </div>
          )}
          {showBalanceLabel && (
            <p className="text-sm pb-3" data-oid="4q0_uqm">
              Balance
            </p>
          )}
          <div className="flex justify-center" data-oid="quk5203">
            {isLoading ? (
              <p className="text-2xl" data-oid="s8_k51m">
                Loading balance...
              </p>
            ) : (
              <TokenAmount
                amount={accountBalance}
                symbol="NERO"
                amountFontSize="text-4xl"
                symbolClassName="text-2xl text-text-primary"
                containerClassName="break-all"
                data-oid="q1gmpc3"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4" data-oid="vhhi9bk">
        <BalanceBottomNavigation data-oid="t_x:rlu" />
      </div>
    </>
  );
};

export default BalancePanel;
