import React, { useState } from "react";
import { BalancePanel, ActivityContent } from "@/components/screens/home";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";

const NEROTokenDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [cornerStyle, setCornerStyle] = useState(
    "rounded-tr-md rounded-br-md rounded-bl-md",
  );

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

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="zo9tjgf" />}
      data-oid="hj.7_kj"
    >
      <HeaderNavigation data-oid="p3f3i16" />
      <div className="mx-auto relative px-6" data-oid="qs_694v">
        <BalancePanel
          showIcon={true}
          showBalanceLabel={false}
          data-oid="kx1h66n"
        />

        <div
          className="flex pt-3 text-sm font-medium items-end"
          data-oid="03xl3.d"
        >
          <div
            className={getTabStyle("All")}
            onClick={() => handleTabClick("All")}
            data-oid="80pmu4p"
          >
            All
          </div>
        </div>
        <div
          className={`bg-white ${cornerStyle} border border-border-primary relative -mt-[1px]`}
          data-oid="i.tpe6v"
        >
          <div className="h-[17.5rem] py-1" data-oid="7jl7p:t">
            <ActivityContent data-oid="lahwp8-" />
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default NEROTokenDetail;
