import React, { useEffect, useState } from "react";
import { FaGift } from "react-icons/fa";
import { GoArrowSwitch } from "react-icons/go";
import { MdAdsClick } from "react-icons/md";
import { PaymentOption, TokenList, ErrorDisplay } from "./components";
import { TokenIcon } from "@/components/features/token";
import { usePaymasterUI } from "@/hooks";
import { PaymasterModeValue, PAYMASTER_MODE } from "@/types/Paymaster";

const PaymasterPanel: React.FC = () => {
  const {
    screen,
    isFlipped,
    setIsFlipped,
    localError,
    isLoading,
    error,
    supportedTokens,
    sponsorshipInfo,
    selectedToken,
    selectedPaymasterType,
    handlePaymasterTypeChange,
    isSponsoredSelected,
    scrollContainerRef,
    fetchTokens,
    handleRetry,
    handleTokenClick,
    scrollLeft,
    scrollRight,
    handleSelectPaymentType,
    handleBackToSelection,
  } = usePaymasterUI();

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  if (isLoading && !localError)
    return <div data-oid="p:a23x.">Loading supported tokens...</div>;

  if (error || localError) {
    return (
      <ErrorDisplay
        error={localError || error}
        onRetry={handleRetry}
        data-oid="bcx9--o"
      />
    );
  }

  if (screen === "selection") {
    return (
      <div
        className="w-full bg-white rounded-xl flex flex-col space-y-2 p-1 relative"
        data-oid=".o52vbe"
      >
        <div className="absolute top-2 right-2 z-10" data-oid="cgwbcnu">
          <GoArrowSwitch
            className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer transition-transform duration-300 hover:rotate-180"
            onClick={() => setIsFlipped(!isFlipped)}
            data-oid=".yea54f"
          />
        </div>

        <div className="text-sm text-text-secondary" data-oid="7o03nbo">
          Select Payment Method
        </div>

        <div
          className={`relative transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""}`}
          style={{
            transformStyle: "preserve-3d",
            minHeight: "80px" /* Ensure enough space for the card content */,
          }}
          data-oid="fzm7ze."
        >
          {/* Sponsored Gas Option */}
          <div
            className={`absolute w-full backface-hidden ${!isFlipped ? "block" : "hidden"}`}
            data-oid="iu55tho"
          >
            <PaymentOption
              isSelected={isSponsoredSelected}
              isDisabled={!sponsorshipInfo?.freeGas}
              onClick={() =>
                sponsorshipInfo?.freeGas && handleSelectPaymentType("sponsored")
              }
              icon={
                <FaGift
                  className={`text-xs ${
                    isSponsoredSelected
                      ? "text-white scale-110"
                      : sponsorshipInfo?.freeGas
                        ? "text-white"
                        : "text-gray-400"
                  }`}
                  data-oid="pu6emu3"
                />
              }
              title="Sponsored Gas"
              subtitle={
                sponsorshipInfo?.freeGas
                  ? "Free transactions available"
                  : "Sponsored transactions not available"
              }
              rightIcon={
                sponsorshipInfo?.freeGas ? (
                  <MdAdsClick className="text-md" data-oid="u9-v5lh" />
                ) : undefined
              }
              data-oid=".388uc."
            />
          </div>

          {/* Token Payment Option */}
          <div
            className={`absolute w-full backface-hidden rotate-y-180 ${isFlipped ? "block" : "hidden"}`}
            data-oid="lw6tf64"
          >
            <PaymentOption
              isDisabled={!supportedTokens || supportedTokens.length === 0}
              onClick={() =>
                supportedTokens &&
                supportedTokens.length > 0 &&
                handleSelectPaymentType("token")
              }
              icon={
                <TokenIcon
                  tokenAddress={supportedTokens?.[0]?.token}
                  symbol={supportedTokens?.[0]?.symbol}
                  size="xs"
                  isNative={supportedTokens?.[0]?.type === "native"}
                  data-oid=".c69b5e"
                />
              }
              title="Pay with Token"
              subtitle={
                supportedTokens && supportedTokens.length > 0
                  ? `${supportedTokens.length} tokens available`
                  : "No tokens available"
              }
              isTokenOption={true}
              isNativeToken={supportedTokens?.[0]?.type === "native"}
              rightIcon={
                supportedTokens && supportedTokens.length > 0 ? (
                  <MdAdsClick className="text-md" data-oid="8kz5-iu" />
                ) : undefined
              }
              data-oid="_twgzii"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TokenList
      tokens={supportedTokens || []}
      selectedToken={selectedToken}
      selectedPaymasterType={selectedPaymasterType ?? PAYMASTER_MODE.PRE_FUND}
      setSelectedPaymasterType={handlePaymasterTypeChange}
      scrollContainerRef={scrollContainerRef}
      onTokenClick={handleTokenClick}
      onScrollLeft={scrollLeft}
      onScrollRight={scrollRight}
      onBackClick={handleBackToSelection}
      data-oid="fw:hf2j"
    />
  );
};

export default PaymasterPanel;
