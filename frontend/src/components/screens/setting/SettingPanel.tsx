import React from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { LuImport } from "react-icons/lu";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { Button } from "@/components/ui/buttons";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import { useSettingUrls } from "@/constants/settingListURLs";
import { useScreenManager } from "@/hooks";
import { SettingItemProps, screens } from "@/types";

const SettingItem: React.FC<SettingItemProps> = ({ icon, label, onClick }) => (
  <div className="w-full flex mt-3" onClick={onClick} data-oid="1xd6qlj">
    <div
      className="w-full h-[80%] bg-bg-tertiary rounded-md flex items-center justify-start border border-border-primary p-5"
      data-oid="c._c-yk"
    >
      <div className="flex items-center text-black" data-oid="5x:a3tz">
        {icon}
        <span className="ml-4 text-black" data-oid=".nn3:ab">
          {label}
        </span>
      </div>
    </div>
  </div>
);

const SettingPanel: React.FC = () => {
  const { navigateTo } = useScreenManager();
  const { CONTACT_US_DISCORD_URL, PRIVACY_POLICY_URL, SERVICE_TERMS_URL } =
    useSettingUrls();
  const handleHomeClick = () => {
    navigateTo(screens.HOME);
  };

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="_xnj.h3" />}
      data-oid="pp.wedw"
    >
      <HeaderNavigation data-oid="wu9cc3o" />
      <div
        className="flex flex-col items-center flex-grow px-3 bg-bg-primary mt-5"
        data-oid="irr0jh8"
      >
        <div
          className="w-full bg-white rounded-md border border-border-primary p-4 mb-4"
          data-oid="r7om97n"
        >
          <label
            className="block text-center text-1sm text-black"
            data-oid="rln22h4"
          >
            Settings
          </label>
          <SettingItem
            icon={<AiOutlineQuestionCircle size={24} data-oid="efujjgc" />}
            label="Contact us"
            onClick={() => window.open(CONTACT_US_DISCORD_URL, "_blank")}
            data-oid="kly5e4y"
          />

          <SettingItem
            icon={<MdOutlinePrivacyTip size={24} data-oid="yi0wgxy" />}
            label="Privacy policy"
            onClick={() => window.open(PRIVACY_POLICY_URL, "_blank")}
            data-oid="mv_3kyz"
          />

          <SettingItem
            icon={<LuImport size={24} data-oid="60qbwmk" />}
            label="Service terms"
            onClick={() => window.open(SERVICE_TERMS_URL, "_blank")}
            data-oid="2vl65lo"
          />

          <div className="w-full pt-5 flex justify-center" data-oid="036.h8v">
            <Button
              onClick={handleHomeClick}
              variant="primary"
              className="px-6 py-2 rounded-full bg-black text-sm text-white"
              data-oid="7itlwax"
            >
              close
            </Button>
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default SettingPanel;
