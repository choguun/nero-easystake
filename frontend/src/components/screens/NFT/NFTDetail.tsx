import React, { useEffect, useState } from "react";
import { AiFillCaretLeft } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Button } from "@/components/ui/buttons";
import { CommonContainerPanel } from "@/components/ui/layout";
import { BottomNavigation, HeaderNavigation } from "@/components/ui/navigation";
import {
  useNFTContext,
  useCustomERC721Tokens,
  useScreenManager,
} from "@/hooks";
import { screens } from "@/types";
import { truncateAddress } from "@/utils";

const NFTDetail: React.FC = () => {
  const { navigateTo } = useScreenManager();
  const { selectedNFT, clearNFT } = useNFTContext();
  const { removeERC721Token } = useCustomERC721Tokens();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!selectedNFT) {
      navigateTo(screens.NFT);
    }
  }, [selectedNFT, navigateTo]);

  const handleClose = () => {
    clearNFT();
    navigateTo(screens.NFT);
  };

  const navigateToTransfer = () => {
    navigateTo(screens.NFTTRANSFER);
  };

  const handleHide = () => {
    if (selectedNFT) {
      removeERC721Token(selectedNFT.contractAddress, selectedNFT.tokenId);
      clearNFT();
      navigateTo(screens.NFT);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  if (!selectedNFT) {
    return <p data-oid="2wirufy">Loading...</p>;
  }

  return (
    <CommonContainerPanel
      footer={<BottomNavigation data-oid="b6eekaf" />}
      data-oid="mh3fb_:"
    >
      <HeaderNavigation data-oid="hs_y5.u" />
      <div className="h-[42rem] px-6 mt-2 relative" data-oid="igg5cts">
        <div className="absolute top-2 right-8 z-10" data-oid="d.unu5:">
          <button onClick={toggleMenu} className="pt-1" data-oid="1a8o7px">
            <BsThreeDotsVertical className="text-xl" data-oid="9-7qigb" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              data-oid="e_lw:xh"
            >
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
                data-oid="agay7s0"
              >
                <button
                  onClick={handleHide}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  data-oid="f-eh42u"
                >
                  Hide
                </button>
              </div>
            </div>
          )}
        </div>
        <div
          className="h-[33.1rem] bg-white rounded-md mx-auto border border-border-primary relative"
          data-oid="ud7df30"
        >
          <div className="w-5/6 mx-auto my-5 pt-4" data-oid="u4_xdy7">
            <img
              src={selectedNFT.image}
              alt={selectedNFT.name}
              className="h-64 object-cover rounded-md mx-auto"
              data-oid="5kgvkor"
            />

            <p className="text-md pt-1" data-oid="_g6z-fm">
              {selectedNFT.name}
            </p>
            <label
              className="block text-text-secondary text-md mt-3"
              data-oid="tc6sr.9"
            >
              Contract Address
            </label>
            <p className="text-md" data-oid="l.0c-ef">
              {truncateAddress(selectedNFT.contractAddress)}
            </p>

            <label
              className="block text-text-secondary text-md mt-3"
              data-oid="heddq.m"
            >
              Token ID
            </label>
            <p className="text-md" data-oid="2umgzs.">
              {selectedNFT.tokenId}
            </p>
          </div>
          <div
            className="absolute bottom-[-30px] left-[-30px] right-[-20px] flex justify-between p-10"
            data-oid="fmfq40i"
          >
            <Button
              onClick={handleClose}
              variant="text"
              icon={AiFillCaretLeft}
              iconPosition="left"
              className="flex items-center text-sm text-text-primary px-2 mt-1 rounded-full"
              data-oid="u-2je6x"
            >
              Back
            </Button>
            <Button
              onClick={() => navigateToTransfer()}
              variant="primary"
              className="px-6 py-2 rounded-full text-white bg-primary text-sm"
              data-oid="-ggg-5_"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </CommonContainerPanel>
  );
};

export default NFTDetail;
