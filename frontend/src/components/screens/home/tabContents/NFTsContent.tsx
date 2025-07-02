import React, { useState } from "react";
import { AiFillCaretLeft } from "react-icons/ai";
import { ImportNFT } from "@/components/features/nft";
import { NFTCard } from "@/components/ui/cards";
import { useNFTContext, useNftList, useScreenManager } from "@/hooks";
import { NFTCardType, screens } from "@/types";

const NFTsContent: React.FC = () => {
  const { selectNFT } = useNFTContext();
  const { navigateTo } = useScreenManager();
  const { nftWithImages, isLoading } = useNftList();
  const [showImportModal, setShowImportModal] = useState(false);

  const handleClickNFT = (nft: NFTCardType) => {
    selectNFT(nft);
    navigateTo(screens.NFTDETAIL);
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-4" data-oid=".d5mok4">
        Loading...
      </div>
    );
  }

  if (!nftWithImages) {
    return (
      <div className="text-center py-4" data-oid="-:yi8mq">
        no NFTs
      </div>
    );
  }

  const transformedNFTs: NFTCardType[] = nftWithImages.flatMap(
    ({ tokenData, ...nftWithoutTokenData }) =>
      tokenData.map((tokenDatum) => ({
        ...nftWithoutTokenData,
        ...tokenDatum,
      })),
  );

  return (
    <div className="flex flex-col h-full" data-oid="-jd2auk">
      {showImportModal ? (
        <div
          className="flex flex-col h-full w-full relative"
          data-oid="xy3lgzs"
        >
          <div
            className="flex-grow flex items-center justify-center"
            data-oid="c5l4-04"
          >
            <div
              className="w-full max-w-md p-4 bg-white rounded"
              data-oid="e7kvgi2"
            >
              <ImportNFT onSuccess={handleImportSuccess} data-oid="mkjtca6" />
            </div>
          </div>
          <div
            className="absolute bottom-[-25px] left-[-20px] flex justify-between p-10"
            data-oid="nuv28.y"
          >
            <button
              onClick={() => setShowImportModal(false)}
              className="flex items-center text-sm text-text-primaryrounded-full"
              data-oid="lc2e1md"
            >
              <AiFillCaretLeft className="mr-2" data-oid="zge:p4s" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-auto" data-oid="69je1_y">
            <div className="grid grid-cols-2 gap-4 mt-5" data-oid="ginjw-.">
              {transformedNFTs.map((nft, index) => (
                <NFTCard
                  key={index}
                  nft={nft}
                  onClick={() => handleClickNFT(nft)}
                  data-oid="il.6:2b"
                />
              ))}
            </div>
          </div>
          <div className="mx-auto w-[85%] mt-2 mb-2" data-oid="r2x24d7">
            <button
              onClick={() => setShowImportModal(true)}
              className="text-blue-400"
              data-oid=".5-3lb."
            >
              + Import NFT
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NFTsContent;
