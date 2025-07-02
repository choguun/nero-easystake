import React, { useMemo, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { TbExternalLink } from "react-icons/tb";
import {
  TokenIcon,
  TokenAmount,
  TruncatedText,
} from "@/components/features/token";
import { CommonContainerPanel } from "@/components/ui/layout";
import {
  BottomNavigation,
  HeaderNavigation,
  BalanceBottomNavigation,
} from "@/components/ui/navigation";
import {
  useCustomERC20Tokens,
  useTokenContext,
  useTransactions,
  useScreenManager,
} from "@/hooks";
import { screens } from "@/types";
import { formatAndRoundBalance } from "@/utils";

const TokenDetail: React.FC = () => {
  const { selectedToken } = useTokenContext();
  const [activeTab, setActiveTab] = useState("All");
  const [cornerStyle, setCornerStyle] = useState(
    "rounded-tr-md rounded-br-md rounded-bl-md",
  );
  const { formattedTransactions } = useTransactions();
  const targetTokenTransactions = formattedTransactions.filter(
    (tx) => tx.contractAddress === selectedToken?.contractAddress,
  );
  const displayTransactions = useMemo(() => {
    switch (activeTab) {
      case "All":
        return targetTokenTransactions;
      case "Out":
        return targetTokenTransactions.filter((tx) => tx.action === "Sent");
      case "In":
        return targetTokenTransactions.filter((tx) => tx.action === "Received");
      default:
        return targetTokenTransactions;
    }
  }, [activeTab, targetTokenTransactions]);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    switch (tabName) {
      case "All":
        setCornerStyle("rounded-tr-md rounded-br-md rounded-bl-md");
        break;
      default:
        setCornerStyle("rounded-md");
    }
  };

  const getTabStyle = (tabName: string) =>
    `cursor-pointer px-4 py-2 ${activeTab === tabName ? "bg-white text-text-primary border-t border-x border-border-primary rounded-t-md relative z-10" : ""}`;

  const [showMenu, setShowMenu] = useState(false);
  const { removeERC20Token } = useCustomERC20Tokens();
  const { navigateTo } = useScreenManager();
  const { clearToken } = useTokenContext();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleRemove = () => {
    if (selectedToken) {
      removeERC20Token(selectedToken.contractAddress);
      clearToken();
      navigateTo(screens.HOME);
    }
  };

  if (!selectedToken) {
    return (
      <div className="text-center py-4" data-oid="qhp5jx0">
        no Token
      </div>
    );
  }

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="kkld.nw" />}
      data-oid="227jxw_"
    >
      <HeaderNavigation data-oid="xbx7:4-" />
      <div className="mx-auto relative px-6" data-oid="u_aca23">
        <div className="absolute top-3 right-8 z-10" data-oid="v:mrfy9">
          <button onClick={toggleMenu} className="pt-1" data-oid="a70iz8h">
            <BsThreeDotsVertical className="text-xl" data-oid="oteq.bg" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              data-oid="tx:kqgn"
            >
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
                data-oid="mlcy600"
              >
                <button
                  onClick={handleRemove}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                  role="menuitem"
                  data-oid="s81_ubi"
                >
                  Hide
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          className="bg-white h-31 rounded-md mx-auto border border-border-primary mt-3"
          data-oid="2755qnx"
        >
          <div className="w-[90%] p-6 mb-1" data-oid="-jf_4ok">
            <div className="flex items-center pb-1" data-oid="7gda712">
              <TokenIcon
                tokenAddress={selectedToken.contractAddress}
                symbol={selectedToken.symbol}
                isNative={selectedToken.isNative}
                size="sm"
                className="mr-2"
                data-oid="i0zjq0k"
              />

              <TruncatedText
                text={selectedToken.name}
                fontSize="sm"
                maxWidth="max-w-[200px]"
                data-oid="yxclfgl"
              />
            </div>
            <div className="flex justify-center mt-2 ml-2" data-oid="yco4j38">
              <TokenAmount
                amount={formatAndRoundBalance(
                  selectedToken.balance,
                  selectedToken.decimals,
                )}
                symbol={selectedToken.symbol}
                amountFontSize="text-4xl"
                symbolClassName="text-2xl text-text-primary"
                containerClassName="break-all"
                data-oid="px1r67b"
              />
            </div>
          </div>
        </div>
        <div className="mt-2" data-oid="b6_ouy6">
          <BalanceBottomNavigation data-oid="api7wc:" />
        </div>
        <div
          className="flex pt-3 text-sm font-medium items-end"
          data-oid="lj7159a"
        >
          <div
            className={getTabStyle("All")}
            onClick={() => handleTabClick("All")}
            data-oid="d1c40:6"
          >
            All
          </div>
          <div className="self-stretch flex items-end pb-2" data-oid="s_lz-jv">
            <div
              className="h-4 w-px bg-border-primary"
              data-oid="ceqeylh"
            ></div>
          </div>
          <div
            className={getTabStyle("Out")}
            onClick={() => handleTabClick("Out")}
            data-oid="8fwhc3x"
          >
            Out
          </div>
          <div className="self-stretch flex items-end pb-2" data-oid="4x79:n2">
            <div
              className="h-4 w-px bg-border-primary"
              data-oid="av-xq3j"
            ></div>
          </div>
          <div
            className={getTabStyle("In")}
            onClick={() => handleTabClick("In")}
            data-oid="sl8c64:"
          >
            In
          </div>
        </div>
        <div
          className={`bg-white ${cornerStyle} border border-border-primary relative -mt-[1px]`}
          data-oid="roinxno"
        >
          <div className="h-[17.5rem] py-1 overflow-auto" data-oid="rwz95hs">
            {displayTransactions.map((transaction) => (
              <div
                key={transaction.explorerUrlTx}
                className="bg-white p-4 flex items-center space-x-2 cursor-pointer border-b-[0.5px] w-[95%] mx-auto"
                data-oid="0t.obbg"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center`}
                  data-oid="csrgqab"
                >
                  <img
                    src={transaction.iconSrc}
                    className="rounded-full text-md"
                    alt="Transaction icon"
                    data-oid="yuv:97i"
                  />
                </div>
                <div className="flex-grow" data-oid="zj2y2aa">
                  <div className="flex" data-oid="y_6yrox">
                    <div
                      className="text-xs text-text-secondary mr-1"
                      data-oid="a6l_96."
                    >
                      {transaction.date}
                    </div>
                    <a
                      href={transaction.explorerUrlTx}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}
                      data-oid="0ta9la2"
                    >
                      <TbExternalLink
                        className="text-text-secondary"
                        data-oid="2frhup1"
                      />
                    </a>
                  </div>
                  <div
                    className="flex justify-between items-center mt-1"
                    data-oid="87ucc7u"
                  >
                    <span className="font-semibold" data-oid="y8wkk94">
                      {transaction.action}
                    </span>
                    <TokenAmount
                      amount={transaction.value}
                      symbol={transaction.token}
                      amountFontSize="text-base"
                      symbolClassName="text-base"
                      containerClassName="space-x-1"
                      data-oid="qs.fqx6"
                    />
                  </div>
                  {transaction.gasCost && (
                    <div
                      className="text-xs text-text-secondary"
                      data-oid="9hp38-i"
                    >
                      Gas:{" "}
                      <TruncatedText
                        text={transaction.gasCost}
                        fontSize="xs"
                        maxWidth="max-w-[120px]"
                        data-oid="d3enyq:"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default TokenDetail;
