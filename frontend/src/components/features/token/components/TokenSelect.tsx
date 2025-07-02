import React, { useEffect, useState, useMemo } from "react";
import { AiFillCaretLeft } from "react-icons/ai";
import { useBalance } from "wagmi";
import {
  TokenIcon,
  TruncatedText,
  TokenAmount,
  TokenSearchInput,
} from "@/components/features/token";
import { Button } from "@/components/ui/buttons";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { useSignature, useClassifiedTokens } from "@/hooks";
import { Token, TokenSelectProps } from "@/types";
import { createNeroToken, formatAndRoundBalance } from "@/utils";

const TokenSelect: React.FC<
  Omit<TokenSelectProps, "tokens" | "onSelect" | "selectedToken"> & {
    onSelectToken: (token: Token) => void;
  }
> = ({ onClose, onSelectToken }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { tokensWithLogos } = useClassifiedTokens();
  const { AAaddress } = useSignature();
  const { data: neroBalance } = useBalance({ address: AAaddress });
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [neroAmount, setNeroAmount] = useState("0");

  useEffect(() => {
    if (neroBalance?.value) {
      setNeroAmount(
        formatAndRoundBalance(neroBalance.value, neroBalance.decimals),
      );
    }
  }, [neroBalance]);

  useEffect(() => {
    const neroToken = createNeroToken(
      { value: neroBalance?.value, decimals: neroBalance?.decimals },
      true,
    );

    setAllTokens([
      neroToken,
      ...tokensWithLogos.map((token) => ({
        ...token,
        balance: formatAndRoundBalance(token.balance, token.decimals),
        isNative: false,
      })),
    ]);
  }, [neroAmount, tokensWithLogos, neroBalance]);

  const handleTokenClick = (token: Token) => {
    onSelectToken(token);
    onClose();
  };

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return allTokens;

    const query = searchQuery.toLowerCase().trim();

    return allTokens.filter((token) => {
      const symbolMatch = token.symbol.toLowerCase().includes(query);

      let addressMatch = false;
      if (query.startsWith("0x") && token.contractAddress) {
        addressMatch = token.contractAddress.toLowerCase().includes(query);
      }

      return symbolMatch || addressMatch;
    });
  }, [allTokens, searchQuery]);

  const TokenListItem: React.FC<{ token: Token }> = ({ token }) => (
    <div
      className="flex justify-between items-center p-2 border-b cursor-pointer hover:bg-gray-50"
      onClick={() => handleTokenClick(token)}
      data-oid="1ob9xdw"
    >
      <div
        className="flex items-center space-x-2 flex-shrink-0 w-1/2"
        data-oid="mfxul4:"
      >
        <TokenIcon
          tokenAddress={token.contractAddress}
          symbol={token.symbol}
          isNative={token.isNative}
          size="md"
          token={token}
          data-oid="av-oysv"
        />

        <div className="flex flex-col" data-oid="sw7n92v">
          <TruncatedText
            text={token.symbol}
            fontSize="base"
            className="font-bold"
            maxWidth="max-w-[120px]"
            data-oid="1t15sgq"
          />
        </div>
      </div>
      <div className="flex-shrink min-w-0" data-oid="zlxyrl0">
        <TokenAmount
          amount={token.balance}
          symbol={token.symbol}
          className="text-base"
          symbolClassName="text-base text-gray-500"
          containerClassName="justify-end"
          data-oid="scfz66y"
        />
      </div>
    </div>
  );

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="6o6ng22" />}
      data-oid=":_jwww."
    >
      <HeaderNavigation data-oid="v58j40h" />
      <div className="mx-auto relative px-6" data-oid="9k2djh-">
        <div className="flex flex-col flex-grow" data-oid="299e.:2">
          <div
            className="w-full h-[530px] bg-white rounded-md border border-border-primary items-center justify-center py-2  mt-2"
            data-oid="7y0kxe8"
          >
            <div
              className="flex justify-center mb-4 px-4 mt-2"
              data-oid="8e138q_"
            >
              <TokenSearchInput
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                className="w-full relative"
                placeholder="Search Token"
                inputClassName="w-full p-2 pr-8 rounded-md text-secondary border border-border-primary bg-bg-primary outline-none transition-all duration-300 ease-in-out [appearance:textfield] [-webkit-appearance:none] [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:[-webkit-appearance:none] focus:border-black pl-8"
                data-oid="0sl7m17"
              />
            </div>
            <div
              className="flex h-[430px] flex-col overflow-y-auto px-4"
              data-oid="q2_:ufd"
            >
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <TokenListItem
                    key={token.contractAddress || token.symbol}
                    token={token}
                    data-oid="967-36."
                  />
                ))
              ) : (
                <div
                  className="text-center text-gray-500 mt-4"
                  data-oid="16br3yu"
                >
                  No tokens found matching "{searchQuery}"
                </div>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="text"
              icon={AiFillCaretLeft}
              iconPosition="left"
              className="flex items-center text-sm text-text-primary px-2 mb-1 rounded-full"
              data-oid="x5e7dl3"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default TokenSelect;
