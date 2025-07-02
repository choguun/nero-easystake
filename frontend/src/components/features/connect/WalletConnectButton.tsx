import React, { useState } from "react";
import { WalletConnectRoundedButtonProps } from "@/types";

const WalletConnectRoundedButton: React.FC<WalletConnectRoundedButtonProps> = ({
  onClick,
  AAaddress,
  isConnected,
  aaNeroBalance,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAddress = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (AAaddress && AAaddress !== "0x") {
      navigator.clipboard
        .writeText(AAaddress)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1500);
        })
        .catch((err) => console.error("Failed to copy: ", err));
    }
  };

  const handleCopyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleCopyAddress(e);
    }
  };

  const getButtonContent = () => {
    if (!isConnected || !AAaddress || AAaddress === "0x") {
      return "CONNECT";
    }
    return (
      <div className="flex flex-col items-center text-xs" data-oid="j7c45m7">
        <div className="flex items-center space-x-1" data-oid="a.u2ygu">
          <span data-oid="ydm5sb:">{`${AAaddress.slice(0, 6)}...${AAaddress.slice(-2)}`}</span>
          <span
            onClick={handleCopyAddress}
            onKeyDown={handleCopyKeyDown}
            role="button"
            tabIndex={0}
            className="p-1 hover:bg-gray-700 rounded text-xs cursor-pointer"
            title="Copy address"
            data-oid="cbu5r-n"
          >
            {isCopied ? "Copied!" : "Copy"}
          </span>
        </div>
        {aaNeroBalance && (
          <span className="text-gray-400 mt-0.5" data-oid="oxwhcax">
            {aaNeroBalance}
          </span>
        )}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-black text-white rounded-full 
                 font-medium hover:bg-black/40 
                 transition-all duration-300 flex items-center justify-center
                 fixed right-0 min-w-[160px] min-h-[50px]"
      data-oid="0mm_kea"
    >
      {getButtonContent()}
    </button>
  );
};

export default WalletConnectRoundedButton;
