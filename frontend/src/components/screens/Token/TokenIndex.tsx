import React from "react";
import { TokensContent } from "@/components/screens/home";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";

const TokenIndex: React.FC = () => {
  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="lm-ufcv" />}
      data-oid="5m5gjw:"
    >
      <HeaderNavigation data-oid="j09vd6q" />
      <div className="mx-auto relative px-6 mt-2" data-oid="kfjde9t">
        <div
          className={`bg-white h-[33.1rem] rounded-md  border border-border-primary`}
          data-oid="gvr_k10"
        >
          <TokensContent data-oid="w_-k2:p" />
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default TokenIndex;
