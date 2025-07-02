import React from "react";
import { CiPower, CiLink } from "react-icons/ci";
import NEROIcon from "@/assets/NERO-icon.png";
import { WalletConnectSidebarProps } from "@/types";

const WalletConnectSidebar: React.FC<WalletConnectSidebarProps> = ({
  variant,
  onClick,
  disabled,
}) => {
  let buttonContent = <CiPower size={24} data-oid="6nb8867" />;
  let buttonTitle = "Connect Wallet";

  if (variant === "Connect AA Wallet") {
    buttonContent = <CiLink size={24} data-oid="-z9uq4o" />;
    buttonTitle = "Connect AA Wallet";
  } else if (variant === "Contact") {
    buttonTitle = "Contact Support";
  }

  return (
    <div
      className={`w-12 'h-[100px]' bg-black/30 backdrop-blur-sm rounded-lg flex flex-col items-center transition-all duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      data-oid="67_5hie"
    >
      <div
        className="flex-1 flex flex-col items-center gap-6 pt-4"
        data-oid="sm8faut"
      >
        <div className="w-8 h-8" data-oid="lqoch2a">
          <img
            src={NEROIcon.src}
            alt="Nero Logo"
            className="w-full h-full"
            data-oid="axz43a-"
          />
        </div>
      </div>

      <div className="pb-4 flex flex-col gap-4 pt-3" data-oid="qa_i1.g">
        <button
          onClick={onClick}
          disabled={disabled}
          title={buttonTitle}
          aria-label={buttonTitle}
          className={`w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text-tertiary transition-colors ${disabled ? "pointer-events-none" : "hover:text-primary"}`}
          data-oid="oznyk2s"
        >
          {buttonContent}
        </button>
      </div>
    </div>
  );
};

export default WalletConnectSidebar;
