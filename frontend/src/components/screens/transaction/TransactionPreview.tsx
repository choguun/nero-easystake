import React, { useState, useEffect } from "react";
import { ActionButtons } from "@/components/ui/buttons";
import { TransactionDetailCard } from "@/components/ui/cards";
import { LoadingScreen } from "@/components/ui/feedback";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { useConfig, useScreenManager } from "@/hooks";
import { TransactionPreviewProps, screens } from "@/types";

const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  from,
  to,
  networkFee,
  gasTokenSymbol,
  onClose,
  onConfirm,
  onReset,
  children,
  title = "Send Detail",
}) => {
  const { navigateTo } = useScreenManager();
  const { networkType } = useConfig();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [userOpResult, setUserOpResult] = useState(false);

  // ガス計算中かどうかを判定
  const isCalculatingGas = networkFee === "Calculating...";

  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => {
        setCompleted(false);
        if (onReset) onReset();
        navigateTo(screens.ACTIVITY);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [completed, navigateTo, onReset]);

  const handleConfirm = async () => {
    if (!onConfirm) return;

    try {
      setLoading(true);
      const result = await onConfirm();
      setUserOpResult(result);
      setLoading(false);
      setCompleted(true);
    } catch (err) {
      setUserOpResult(false);
      setLoading(false);
      setCompleted(true);
    }
  };

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="56tvvym" />}
      data-oid="npp5wt3"
    >
      <HeaderNavigation data-oid="6f4icdw" />
      <div className="mx-auto relative px-6" data-oid="3w1u-qv">
        <div className="flex flex-col flex-grow" data-oid="j90j6jj">
          <div
            className="w-full bg-white rounded-md border border-border-primary items-center justify-center p-3 mt-2"
            data-oid="xcsf1ba"
          >
            <h2
              className="text-xl text-center text-text-secondary mb-3"
              data-oid="pkoailo"
            >
              {title}
            </h2>
            <TransactionDetailCard
              from={from}
              to={to}
              networkFee={networkFee}
              gasTokenSymbol={gasTokenSymbol}
              networkType={networkType}
              data-oid="e.90.6:"
            >
              {children}
            </TransactionDetailCard>
            <ActionButtons
              onBack={onClose}
              onNext={handleConfirm}
              nextLabel={
                loading
                  ? "Processing..."
                  : isCalculatingGas
                    ? "Calculating Gas..."
                    : "Confirm"
              }
              isNextDisabled={loading || completed || isCalculatingGas}
              data-oid="yw01r:2"
            />
          </div>
        </div>
      </div>
      {(loading || completed) && (
        <LoadingScreen
          message="Processing transaction"
          isCompleted={completed}
          userOpResult={userOpResult}
          data-oid="04l:04r"
        />
      )}
    </CommonContainerPanel>
  );
};

export default TransactionPreview;
