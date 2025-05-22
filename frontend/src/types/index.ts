export * from './Activity'
export * from './Buttons'
export * from './Inputs'
export * from './Token'
// export * from './Screen' // Remove if Screen type is now directly aliased to screens enum
export * from './TransactionResponses'
export * from './Paymaster'
export * from './WalletConfig'
export * from './Transaction'

export * from './components'
export * from './contexts'
export * from './helpers'
export * from './hooks'

import { ReactNode } from 'react';

export interface UserOperation {
  target: string
  abi: any // Consider using a more specific ABI type if available (e.g., ethers.ContractInterface)
  functionName: string
  params: any[]
  value?: any // Typically string for ETH value, or BigNumberish
}

export interface OperationData extends UserOperation {
  value: any // Ensure value is explicitly part of OperationData as well
}

export interface UserOperationResultInterface {
  userOpHash: string
  result: boolean | null // Or your specific success type
  transactionHash: string
  error?: string // Added optional error field
}

export enum screens {
  PROFILE = 'profile',
  SENDUSEROP = 'sendUserOp',
  SETTING = 'setting',
  TRANSACTION = 'transaction',
  TOP = 'top',
  WALLET = 'wallet',
  SEND = 'send',
  RECEIVE = 'receive',
  SWAP = 'swap',
  BRIDGE = 'bridge',
  NFT = 'nft',
  ADDTOKEN = 'addtoken',
  ACTIVITY = 'activity',
  TRANSACTIONDETAIL = 'transactionDetail',
  SIGNMESSAGE = 'signMessage',
  CONNECTAPP = 'connectApp',
  APPROVE = 'approve',
  // Potentially missing, adding based on ScreenRenderer usage:
  HOME = 'home', // Or confirm if HOME should be TOP/WALLET
  NFTDETAIL = 'nftDetail',
  TOKEN = 'token', // This was already present as a directory name, ensure enum matches case
  TOKENDETAIL = 'tokenDetail',
  NEROTOKENDETAIL = 'neroTokenDetail', 
  // Add any other screens referenced by ScreenRenderer if not present
  // e.g. MULTISEND, MULTISENDDETAIL, MULTISENDCONFIRM, NFTTRANSFER, NFTTRANSFERPREVIEW, TOKENINDEX etc.
  // For now, only adding those directly causing "Property does not exist" errors
}

// Define Screen type as an alias to the screens enum
export type Screen = screens;

export interface CommonContainerPanelProps {
  children: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
}
