import React, { useState } from "react";
import { NFTsContent } from "@/components/screens/home";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { ExpandedTabContentProps } from "@/types";

const ExpandedTabContent: React.FC<ExpandedTabContentProps> = ({ tab }) => {
  const [activeTab] = useState(tab);

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="y6n15_6" />}
      data-oid="1u30c4q"
    >
      <HeaderNavigation data-oid=":gyse84" />
      <div className="mx-auto relative px-6 mt-2" data-oid="41jq83s">
        <div
          className={`bg-white h-[33.1rem] rounded-md  border border-border-primary`}
          data-oid="oolg4w-"
        >
          {activeTab === "NFTs" && <NFTsContent data-oid="ag5km0q" />}
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default ExpandedTabContent;
