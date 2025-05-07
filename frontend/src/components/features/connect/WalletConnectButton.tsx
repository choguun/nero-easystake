import React, { useState } from 'react'
import { WalletConnectRoundedButtonProps } from '@/types'

const WalletConnectRoundedButton: React.FC<WalletConnectRoundedButtonProps> = ({
  onClick,
  AAaddress,
  isConnected,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (AAaddress && AAaddress !== '0x') {
      navigator.clipboard.writeText(AAaddress)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1500);
        })
        .catch(err => console.error('Failed to copy: ', err));
    }
  };

  const getButtonContent = () => {
    if (!isConnected || !AAaddress || AAaddress === '0x') {
      return 'CONNECT';
    }
    return (
      <div className="flex items-center space-x-2">
        <span>{`${AAaddress.slice(0, 6)}...${AAaddress.slice(-2)}`}</span>
        <button 
          onClick={handleCopyAddress} 
          className="p-1 hover:bg-gray-700 rounded text-xs"
          title="Copy address"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className='px-4 py-3 bg-black text-white rounded-full 
                 font-medium hover:bg-black/40 
                 transition-all duration-300 flex items-center justify-center
                 fixed right-0 min-w-[150px]'
    >
      {getButtonContent()}
    </button>
  )
}

export default WalletConnectRoundedButton
