import React, { useState, useMemo } from "react";
import { AiFillCaretLeft, AiFillCaretRight } from "react-icons/ai";
import { TokenIcon, TokenSearchInput } from "@/components/features/token";
import {
  PaymasterModeValue,
  PaymasterToken,
  TokenListProps,
} from "@/types/Paymaster";
import { getCustomERC20Tokens, truncateAddress } from "@/utils";

const TokenList: React.FC<TokenListProps> = ({
  tokens,
  selectedToken,
  selectedPaymasterType,
  setSelectedPaymasterType,
  scrollContainerRef,
  onTokenClick,
  onScrollLeft,
  onScrollRight,
  onBackClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const PAYMASTER_TYPE_OPTIONS = [
    { label: "Pre-payment", value: 1 }, // PAYMASTER_MODE.PRE_FUND
    { label: "Post-payment", value: 2 }, // PAYMASTER_MODE.POST_FUND
  ];

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;

    const query = searchQuery.toLowerCase().trim();

    return tokens.filter((token) => {
      const symbolMatch = token.symbol.toLowerCase().includes(query);
      let addressMatch = false;
      if (query.startsWith("0x") && token.token) {
        addressMatch = token.token.toLowerCase().includes(query);
      }

      return symbolMatch || addressMatch;
    });
  }, [tokens, searchQuery]);

  const sortedTokens = useMemo(() => {
    const importedTokens = getCustomERC20Tokens();
    const importedAddresses = importedTokens.map((token) =>
      token.contractAddress.toLowerCase(),
    );

    const nativeToken = filteredTokens.filter(
      (token) => token.type === "native",
    );
    const importedGroup = filteredTokens.filter(
      (token) =>
        token.type !== "native" &&
        token.token &&
        importedAddresses.includes(token.token.toLowerCase()),
    );
    const systemTokens = filteredTokens.filter(
      (token) =>
        token.type !== "native" &&
        (!token.token ||
          !importedAddresses.includes(token.token.toLowerCase())),
    );

    const sortByPrice = (
      firstToken: PaymasterToken,
      secondToken: PaymasterToken,
    ) => {
      const firstPrice = parseFloat(firstToken.price);
      const secondPrice = parseFloat(secondToken.price);
      return firstPrice - secondPrice;
    };

    const sortedImportedGroup = [...importedGroup].sort(sortByPrice);
    const sortedOtherTokens = [...systemTokens].sort(sortByPrice);

    return [...nativeToken, ...sortedImportedGroup, ...sortedOtherTokens];
  }, [filteredTokens]);

  if (tokens.length === 0) {
    return (
      <div className="p-3 text-center" data-oid="e_2cpl6">
        <p className="text-gray-500" data-oid="ydwagrh">
          No tokens available
        </p>
        <button
          onClick={onBackClick}
          className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          data-oid="k_sqsve"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-white rounded-xl flex flex-col"
      data-oid="4yzse6l"
    >
      <div
        className="p-2 border-b flex items-center justify-between"
        data-oid="3en8-89"
      >
        <button
          onClick={onBackClick}
          className="text-blue-500 hover:text-blue-600 mr-2 text-md"
          data-oid="4sjlrrz"
        >
          ← Back
        </button>

        <TokenSearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          className="relative w-32 sm:w-40"
          data-oid="b.y4p:."
        />
      </div>

      {sortedTokens.length > 0 ? (
        <>
          <div className="flex items-center mt-3 w-full" data-oid="ljgkql4">
            <AiFillCaretLeft
              className="text-2xl text-text-primary cursor-pointer"
              onClick={onScrollLeft}
              data-oid="rn5h8lv"
            />

            <div
              className="flex space-x-2 overflow-x-auto no-scrollbar"
              ref={scrollContainerRef}
              data-oid="6zpmylv"
            >
              {sortedTokens.map((token) => (
                <div
                  key={token.token}
                  className={`flex items-center text-text-primary rounded-full p-2 border border-border-primary cursor-pointer min-w-[90px] ${
                    selectedToken === token.token ? "bg-blue-200" : "bg-white"
                  }`}
                  onClick={() => onTokenClick(token)}
                  data-oid="csgxbwh"
                >
                  <TokenIcon
                    tokenAddress={token.token}
                    symbol={token.symbol}
                    size="sm"
                    isNative={token.type === "native"}
                    className="mr-2"
                    data-oid="t.eu14t"
                  />

                  <div
                    className="flex flex-col overflow-hidden"
                    data-oid="5h-cu.j"
                  >
                    <div className="text-xs font-bold" data-oid="3_j-g8z">
                      {token.symbol}
                    </div>
                    <div className="text-xs" data-oid="9.9u6u3">
                      {token.type === "native" ? "Native" : token.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AiFillCaretRight
              className="text-2xl text-text-primary cursor-pointer"
              onClick={onScrollRight}
              data-oid="n5_6.gq"
            />
          </div>
          <div className="flex flex-col text-sm p-1 mt-2" data-oid="71p.fv_">
            <span data-oid="8bcurju">
              Selected Token:{" "}
              {selectedToken
                ? selectedToken === "0x0000000000000000000000000000000000000000"
                  ? "NERO (Native)"
                  : truncateAddress(selectedToken)
                : "None"}
            </span>
          </div>
          <div
            className="flex flex-col space-y-2 mt-3 p-2 border-t border-gray-200"
            data-oid="bf0a39k"
          >
            <div
              className="text-xs text-gray-600 font-semibold text-center"
              data-oid="5tsu3mn"
            >
              Select Paymaster Mode:
            </div>
            <div className="flex space-x-3 justify-center" data-oid="xko2f0l">
              {PAYMASTER_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center space-x-1 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors"
                  data-oid="68979jn"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    checked={selectedPaymasterType === opt.value}
                    onChange={() =>
                      setSelectedPaymasterType(opt.value as PaymasterModeValue)
                    }
                    className="form-radio h-3 w-3 text-purple-600 focus:ring-purple-500"
                    data-oid="e11vmjc"
                  />

                  <span className="text-xs text-gray-700" data-oid="pjccad9">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 text-center text-gray-500" data-oid="1:83u5q">
          No tokens found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default TokenList;
