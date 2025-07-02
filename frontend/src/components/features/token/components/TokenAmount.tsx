import React from "react";
import { TruncatedText } from "@/components/features/token";
import { TokenAmountProps } from "@/types";
import { formatNumber } from "@/utils";

const TokenAmount: React.FC<TokenAmountProps> = ({
  amount,
  symbol,
  className = "",
  symbolClassName = "",
  containerClassName = "",
  showFullAmount = false,
  amountFontSize = "",
}) => {
  const formattedAmount = showFullAmount ? amount : formatNumber(amount);

  return (
    <span
      className={`flex items-baseline flex-wrap ${containerClassName}`}
      data-oid="mnwwy-e"
    >
      <TruncatedText
        text={formattedAmount}
        className={`mr-1 ${amountFontSize} ${className}`}
        maxWidth="max-w-[200px]"
        fontSize="2xl"
        withTooltip={true}
        data-oid="nsg_j47"
      />

      <span
        className={`text-2xl shrink-0 ${symbolClassName}`}
        data-oid=".mv7p3p"
      >
        {symbol}
      </span>
    </span>
  );
};

export default TokenAmount;
