import React, { useState, useEffect, useContext } from "react";
import { AiFillCaretLeft } from "react-icons/ai";
import { Button } from "@/components/ui/buttons";
import { LoadingScreen } from "@/components/ui/feedback";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { MultiSendContext } from "@/contexts";
import {
  useSimpleAccount,
  useMultiSender,
  useResetContexts,
  useScreenManager,
  usePaymasterContext,
  usePaymasterMode,
} from "@/hooks";
import { screens } from "@/types";

const MultiSendConfirmPanel: React.FC = () => {
  const { navigateTo } = useScreenManager();
  const { recipients, clearAll } = useContext(MultiSendContext)!;
  const {
    paymaster,
    selectedToken,
    supportedTokens: paymasterSelectedToken,
  } = usePaymasterContext();
  const { AAaddress } = useSimpleAccount();
  const { multiTransfer, estimateMultiSendFee } = useMultiSender();
  const { paymasterModeValue } = usePaymasterMode();
  const { resetAllContexts } = useResetContexts();
  const [estimatedGasCost, setEstimatedGasCost] =
    useState<string>("Calculating...");

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [userOpResult, setUserOpResult] = useState(false);

  const selectedPaymasterToken = paymasterSelectedToken.find(
    (token) => token.token === selectedToken,
  );

  const tokenTotals = recipients.reduce(
    (acc, recipient) => {
      const symbol = recipient.token?.symbol || "Unknown";
      acc[symbol] = (acc[symbol] || 0) + Number(recipient.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  useEffect(() => {
    const estimateGasCost = async () => {
      if (!AAaddress || AAaddress === "0x") {
        return;
      }

      try {
        if (paymasterModeValue === 0) {
          setEstimatedGasCost("0");
          return;
        }

        if (recipients.length === 0) {
          setEstimatedGasCost("0.0001");
          return;
        }

        const validRecipients = recipients.every((r) => r.token !== null);
        if (!validRecipients) {
          setEstimatedGasCost("0.0001");
          return;
        }

        // 送信データを準備
        const sendDataList = recipients.map((recipient) => ({
          receiverAddress: recipient.address,
          amount: recipient.amount,
          token: recipient.token,
        }));

        try {
          // ガス見積もりを実行
          const fee = await estimateMultiSendFee(
            sendDataList,
            paymaster,
            selectedToken || undefined,
            paymasterModeValue,
          );
          setEstimatedGasCost(fee);
        } catch (estimateError) {
          setEstimatedGasCost("0.0001");
        }
      } catch (error) {
        setEstimatedGasCost("0.0001");
      }
    };

    estimateGasCost();
  }, [
    AAaddress,
    recipients,
    selectedToken,
    paymasterModeValue,
    paymaster,
    estimateMultiSendFee,
  ]);

  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => {
        setCompleted(false);
        clearAll();
        resetAllContexts();
        navigateTo(screens.ACTIVITY);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [completed, navigateTo, clearAll, resetAllContexts]);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      if (!recipients.length) {
        throw new Error("No recipients specified");
      }

      // 各受信者のトークン情報を確認
      const validRecipients = recipients.every((r) => r.token !== null);
      if (!validRecipients) {
        throw new Error("Some recipients have missing token information");
      }

      const sendDataList = recipients.map((recipient) => ({
        receiverAddress: recipient.address,
        amount: recipient.amount,
        token: recipient.token,
      }));

      try {
        const result = await multiTransfer(
          sendDataList,
          paymaster,
          selectedToken || undefined,
          paymasterModeValue,
        );

        if (result) {
          setUserOpResult(true);
          setLoading(false);
          setCompleted(true);
        } else {
          throw new Error("Transaction failed");
        }
      } catch (transferError) {
        setUserOpResult(false);
        setLoading(false);
        setCompleted(true);
      }
    } catch (err) {
      setUserOpResult(false);
      setLoading(false);
      setCompleted(true);
    }
  };

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="fv-i0pl" />}
      data-oid="vvp8htf"
    >
      <HeaderNavigation data-oid="536d0pp" />
      <div className="mx-auto relative px-6" data-oid="q40lj6s">
        <div className="flex flex-col flex-grow" data-oid="ofs2bb-">
          <div
            className="w-full h-auto min-h-[530px] bg-white rounded-md border border-border-primary p-4 mt-2"
            data-oid="yfph5.l"
          >
            <h2
              className="text-md text-center font-bold mb-4"
              data-oid="-m:4mi8"
            >
              Total
            </h2>

            <div
              className="max-h-[95px] overflow-y-auto no-scrollbar mb-4"
              data-oid="gdplxgl"
            >
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flexed items-center mb-2"
                  data-oid="7ae.6ek"
                >
                  <div className=" min-w-0 mr-4" data-oid="9ff8-c5">
                    <p className="text-sm mb-1" data-oid=".vy-e31">
                      {index + 1}. Address
                    </p>
                    <p
                      className="text-sm text-primary truncate"
                      data-oid="-wah7xu"
                    >
                      {recipient.address}
                    </p>
                  </div>
                  <div
                    className="text-sm flex justify-between mt-2"
                    data-oid="1y5:11k"
                  >
                    <span className="text-sm" data-oid="4nziw57">
                      Amount
                    </span>
                    <span className="text-sm text-primary" data-oid="j:yux78">
                      {Number(recipient.amount).toLocaleString()}{" "}
                      {recipient.token?.symbol}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <h2
              className="text-sm text-white bg-primary text-left mb-4 p-0.5 px-2"
              data-oid="8rpkdxc"
            >
              Total
            </h2>
            <div
              className="mt-4 text-black text-md p-2 overflow-y-auto no-scrollbar"
              data-oid="vid.qc0"
            >
              <div className="max-h-[130px]" data-oid="h:mm4qj">
                {Object.entries(tokenTotals).map(([symbol, total]) => {
                  const recipient = recipients.find(
                    (r) => r.token?.symbol === symbol,
                  );
                  return (
                    <div key={symbol} className="mb-4" data-oid="xw5o1b8">
                      <div
                        className="flex justify-between items-center mb-1"
                        data-oid=".y2m0bd"
                      >
                        <span data-oid="vdib221">{symbol}</span>
                        <span data-oid="qzv9nfk">{total.toLocaleString()}</span>
                      </div>
                      <div
                        className="flex justify-between text-sm"
                        data-oid="sbw.b.t"
                      >
                        <span data-oid="zc_b:xj">You have:</span>
                        <span data-oid="n5v4evk">
                          {Number(recipient?.token?.balance).toLocaleString()}{" "}
                          {symbol}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="fixed bottom-36 left-0 right-0 px-12 "
              data-oid="655gn73"
            >
              <p className="text-sm font-medium mb-1" data-oid="_4z.bdq">
                Gas fee
              </p>
              {paymaster && selectedPaymasterToken ? (
                <div className="text-sm text-primary" data-oid="s-onjrh">
                  <p data-oid="v9:bi0b">
                    token: {selectedPaymasterToken.symbol}
                  </p>
                  <p data-oid="0-qpuk8">Estimated fee: {estimatedGasCost}</p>
                </div>
              ) : (
                <div className="text-sm text-gray-500" data-oid="1715s_b">
                  <p data-oid="im_91ju">NERO Token</p>
                  <p data-oid="k84.p5n">Estimated fee: {estimatedGasCost}</p>
                </div>
              )}
            </div>

            <div
              className="fixed bottom-14 left-0 right-0 flex justify-between p-10"
              data-oid="jtap1:l"
            >
              <Button
                onClick={() => navigateTo(screens.MULTISENDDETAIL)}
                variant="text"
                icon={AiFillCaretLeft}
                iconPosition="left"
                disabled={loading || completed}
                className="flex items-center text-sm text-text-primary px-2 mt-2 rounded-full"
                data-oid="k_4y:8g"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading || completed}
                variant="primary"
                className="px-6 py-2"
                data-oid="z2n.1o5"
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {(loading || completed) && (
        <LoadingScreen
          message="Processing"
          isCompleted={completed}
          userOpResult={userOpResult}
          data-oid="ofloprk"
        />
      )}
    </CommonContainerPanel>
  );
};

export default MultiSendConfirmPanel;
