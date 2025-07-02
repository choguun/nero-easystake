"use client";

import React, { useState } from "react";
import { CiPower } from "react-icons/ci";
import {
  IoChevronUpOutline,
  IoSettingsOutline,
  IoHomeOutline,
  IoArrowBackSharp,
  IoArrowForwardSharp,
  IoCloseOutline,
} from "react-icons/io5";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { useDisconnect } from "wagmi";
import NEROIcon from "@/assets/NERO-icon.png";
import { useResetContexts, useScreenManager } from "@/hooks";
import { ToggleWalletVisibilityButtonProps, screens } from "@/types";

const ToggleWalletVisibilityButton: React.FC<
  ToggleWalletVisibilityButtonProps
> = ({ onClick, isWalletPanel }) => {
  const { navigateTo } = useScreenManager();
  const { disconnect } = useDisconnect();
  const { resetAllContexts } = useResetContexts();
  const [showButtons, setShowButtons] = useState<boolean>(true);

  const handleNavigation = (action: () => void) => {
    if (!isWalletPanel) {
      onClick();
    }
    resetAllContexts();
    action();
  };

  const handleDisconnect = async () => {
    resetAllContexts();
    disconnect();
    navigateTo(screens.HOME);
  };

  return (
    <div
      className={`w-12 ${showButtons ? "h-[500px]" : "h-[100px]"} bg-black/90 backdrop-blur-sm rounded-lg flex flex-col items-center transition-all duration-300`}
      data-oid="36ao7qp"
    >
      <div
        className="flex-1 flex flex-col items-center gap-6 pt-4"
        data-oid="dkj20m6"
      >
        <div className="w-8 h-8" data-oid="91b52w_">
          <img
            src={NEROIcon}
            alt="neo"
            className="w-full h-full"
            data-oid="pykauf2"
          />
        </div>

        {showButtons && (
          <>
            <button
              onClick={() => handleNavigation(() => navigateTo(screens.HOME))}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              data-oid="31z5n-y"
            >
              <IoHomeOutline size={20} data-oid="10b2ppm" />
            </button>

            <button
              onClick={() => handleNavigation(() => navigateTo(screens.SEND))}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              data-oid="sc42:r0"
            >
              <IoArrowBackSharp
                size={24}
                style={{ transform: "rotate(135deg)" }}
                data-oid="wo.r4s0"
              />
            </button>

            <button
              onClick={() =>
                handleNavigation(() => navigateTo(screens.MULTISEND))
              }
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              data-oid="lhlsr8u"
            >
              <MdKeyboardDoubleArrowLeft
                size={24}
                style={{ transform: "rotate(135deg)" }}
                data-oid="q05jy7y"
              />
            </button>

            <button
              onClick={() =>
                handleNavigation(() => navigateTo(screens.RECEIVE))
              }
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              data-oid="km:c1g."
            >
              <IoArrowForwardSharp
                size={24}
                style={{ transform: "rotate(135deg)" }}
                data-oid="it:-eb:"
              />
            </button>

            <button
              onClick={() =>
                handleNavigation(() => navigateTo(screens.SETTING))
              }
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              data-oid="4o8i:4-"
            >
              <IoSettingsOutline size={24} data-oid="8-z0-q8" />
            </button>

            <button
              onClick={onClick}
              className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              data-oid="wjp_ef0"
            >
              <IoCloseOutline size={24} data-oid="fx8jxxq" />
            </button>
          </>
        )}
      </div>

      <div className="pb-4 flex flex-col gap-4" data-oid="oc6oo8c">
        <button
          onClick={() => setShowButtons((prev) => !prev)}
          className={`w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white transition-colors transform ${
            !showButtons ? "rotate-180" : ""
          }`}
          data-oid="1b8v:.8"
        >
          <IoChevronUpOutline size={24} data-oid="7tn8-10" />
        </button>
        {showButtons && (
          <button
            onClick={handleDisconnect}
            className="w-8 h-8 flex items-center justify-center text-[#2ded07] hover:text-[#2ded07] transition-colors"
            data-oid="9lqsrkq"
          >
            <CiPower size={24} data-oid="qph..-_" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ToggleWalletVisibilityButton;
