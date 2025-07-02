import React, { useState } from "react";
import { AiFillCaretLeft } from "react-icons/ai";
import {
  TokenIcon,
  ImportToken,
  TokenAmount,
  TruncatedText,
} from "@/components/features/token";
import { NEROTokenContent } from "@/components/screens/home";
import {
  useClassifiedTokens,
  useTokenContext,
  useScreenManager,
} from "@/hooks";
import { ERC20Token, screens } from "@/types";
import { formatAndRoundBalance } from "@/utils";

const TokensContent: React.FC = () => {
  const { tokensWithLogos, isLoading } = useClassifiedTokens();
  const { navigateTo } = useScreenManager();
  const { selectToken } = useTokenContext();
  const [showImportModal, setShowImportModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full" data-oid="i0-dhhz">
        <div
          className="flex-grow flex items-center justify-center"
          data-oid="02:1abz"
        >
          <div className="text-center py-4" data-oid="ai_p-zx">
            Loading tokens...
          </div>
        </div>
      </div>
    );
  }

  const handleTokenSelect = (token: ERC20Token) => {
    selectToken({
      ...token,
      isNative: false,
    });
    navigateTo(screens.TOKENDETAIL);
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
  };

  const TokenListItem: React.FC<{ token: ERC20Token }> = ({ token }) => (
    <div
      className="flex items-center justify-between py-2 border-b border-gray-200 w-[85%] mx-auto cursor-pointer"
      onClick={() => handleTokenSelect(token)}
      data-oid="f8a5w0t"
    >
      <div
        className="flex items-center space-x-2 flex-shrink-0 w-1/2"
        data-oid="nysyslk"
      >
        <TokenIcon
          tokenAddress={token.contractAddress}
          symbol={token.symbol}
          size="sm"
          className="w-10 h-10"
          data-oid="rhlag-n"
        />

        <div className="flex flex-col" data-oid="iqqlhgm">
          <TruncatedText
            text={token.symbol}
            fontSize="base"
            className="font-bold"
            maxWidth="max-w-[100px]"
            data-oid="1ckc2ak"
          />
        </div>
      </div>
      <div className="flex-shrink min-w-0" data-oid="qbmf811">
        <TokenAmount
          amount={formatAndRoundBalance(token.balance, token.decimals)}
          symbol={token.symbol}
          className="text-base"
          symbolClassName="text-base text-text-primary"
          containerClassName="justify-end"
          data-oid="ff.3tb0"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full" data-oid="ol-xb0v">
      {showImportModal ? (
        <div
          className="flex flex-col h-full w-full relative"
          data-oid="ps46tjz"
        >
          <div
            className="flex-grow flex items-center justify-center"
            data-oid="zsqj7wq"
          >
            <div
              className="w-full max-w-md p-4 bg-white rounded"
              data-oid="k:r9j4b"
            >
              <ImportToken onSuccess={handleImportSuccess} data-oid="_:ymoe." />
            </div>
          </div>
          <div
            className="absolute bottom-[-25px] left-[-20px] flex justify-between p-10"
            data-oid="w1ymuys"
          >
            <button
              onClick={() => setShowImportModal(false)}
              className="flex items-center text-sm text-text-primaryrounded-full"
              data-oid="hmusod."
            >
              <AiFillCaretLeft className="mr-2" data-oid="stvzwke" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-auto" data-oid="5010tc8">
            <NEROTokenContent data-oid="yy5fca8" />
            {tokensWithLogos.map((token, index) => (
              <TokenListItem key={index} token={token} data-oid="s2o.tz7" />
            ))}
          </div>
          <div className="mx-auto w-[85%] mt-2 mb-2" data-oid="7wxnj.8">
            <button
              onClick={() => setShowImportModal(true)}
              className="text-blue-400"
              data-oid="ep6jbs:"
            >
              + Import Token
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TokensContent;
