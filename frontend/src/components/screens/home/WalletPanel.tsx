import React, { useState, useEffect } from "react";
import {
  BalancePanel,
  ActivityContent,
  NFTsContent,
  TokensContent,
} from "@/components/screens/home";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { WalletPanelProps } from "@/types";

const WalletPanel: React.FC<WalletPanelProps> = ({ initialTab = "Tokens" }) => {
  const [cornerStyle, setCornerStyle] = useState(
    "rounded-tr-md rounded-br-md rounded-bl-md",
  );
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    handleTabClick(initialTab);
  }, [initialTab]);

  const handleTabClick = (tabName: "Tokens" | "NFTs" | "Activity") => {
    setActiveTab(tabName);
    if (tabName === "Tokens") {
      setCornerStyle("rounded-tr-md rounded-br-md rounded-bl-md");
    } else {
      setCornerStyle("rounded-md");
    }
  };

  const getTabStyle = (tabName: string) =>
    `cursor-pointer px-4 py-2 ${
      activeTab === tabName
        ? "bg-white text-text-primary border-t border-x border-border-primary rounded-t-md relative z-10"
        : ""
    }`;

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid=":ays735" />}
      data-oid="pvonzgn"
    >
      <HeaderNavigation data-oid="xinkh_d" />
      <div className="mx-auto relative px-6" data-oid="2u776g6">
        <BalancePanel data-oid="c3nsqv-" />
        <div
          className="flex pt-3 text-sm font-medium items-end"
          data-oid="etj0ry2"
        >
          <div
            className={getTabStyle("Tokens")}
            onClick={() => handleTabClick("Tokens")}
            data-oid="itxk9pi"
          >
            Tokens
          </div>
          <div className="self-stretch flex items-end pb-2" data-oid="yft-cjf">
            <div
              className="h-4 w-px bg-border-primary"
              data-oid="ln2r8um"
            ></div>
          </div>
          <div
            className={getTabStyle("NFTs")}
            onClick={() => handleTabClick("NFTs")}
            data-oid="2prij4:"
          >
            NFTs
          </div>
          <div className="self-stretch flex items-end pb-2" data-oid="p_wvx_k">
            <div
              className="h-4 w-px bg-border-primary"
              data-oid="hf_q952"
            ></div>
          </div>
          <div
            className={getTabStyle("Activity")}
            onClick={() => handleTabClick("Activity")}
            data-oid="9-yt8ie"
          >
            Activity
          </div>
        </div>
        <div
          className={`bg-white ${cornerStyle} border border-border-primary relative -mt-[1px]`}
          data-oid="a29c5r2"
        >
          <div className="h-[18rem] py-2" data-oid="8r09i62">
            {activeTab === "Tokens" && <TokensContent data-oid="o_:xkfs" />}
            {activeTab === "NFTs" && <NFTsContent data-oid="k8nqce." />}
            {activeTab === "Activity" && <ActivityContent data-oid="mhu9onr" />}
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default WalletPanel;
