import { NEROTokenDetail, TokenDetail } from '@/components/features'
// Consolidate imports from the main barrel file for screens
import {
  WalletPanel, 
  ExpandedTabContent, 
  SendPanel, 
  SendUserOpPanel, 
  ReceivePanel, 
  SettingPanel, 
  TokenIndex, // Assuming TokenIndex is exported from screens/Token/index.ts then screens/index.ts
  NFTDetail, 
  // Add other components like MultiSendPanel, NFTTransferPanel if they are exported by screens/index.ts and used
} from '@/components/screens' 
// Remove individual screen component imports from subfolders if they are covered by the above
// import { NFTDetail, NFTTransferPreview, NFTTransferPanel } from '@/components/screens' // This was too broad or redundant
// import { WalletPanel, ExpandedTabContent } from '@/components/screens/home'
// import {
//   MultiSendPanel,
//   MultiSendConfirmPanel,
//   MultiSendPreviewPanel,
// } from '@/components/screens/multiSend'
// import { ReceivePanel } from '@/components/screens/receive'
// import { SendPanel, SendUserOpPanel } from '@/components/screens/Send' 
// import { SettingPanel } from '@/components/screens/setting'
// import { TokenIndex } from '@/components/screens/Token'

import { screens, Screen } from '@/types'

interface ScreenRendererProps {
  currentScreen: Screen
}

function ScreenRenderer({ currentScreen }: ScreenRendererProps) {
  switch (currentScreen) {
    case screens.HOME:
      return <WalletPanel />
    case screens.TOP:
      return <WalletPanel /> 
    case screens.WALLET:
        return <WalletPanel />
    case screens.SEND:
      return <SendPanel />
    case screens.RECEIVE:
      return <ReceivePanel />
    case screens.SETTING:
      return <SettingPanel />
    case screens.NFT:
      return <ExpandedTabContent tab='NFTs' />
    case screens.NFTDETAIL: // Ensure NFTDetail is exported from @/components/screens
      return <NFTDetail />
    case screens.TOKEN: // Ensure ExpandedTabContent or a specific Token screen component is appropriate
      return <ExpandedTabContent tab='Tokens' />
    // case screens.TOKENINDEX: // If TokenIndex is a distinct screen
    // return <TokenIndex />
    case screens.ACTIVITY:
      return <WalletPanel initialTab='Activity' />
    case screens.TOKENDETAIL:
      return <TokenDetail />
    case screens.NEROTOKENDETAIL:
      return <NEROTokenDetail />
    case screens.SENDUSEROP:
      return <SendUserOpPanel />
    default:
      console.log('[ScreenRenderer] Defaulting to WalletPanel for screen:', currentScreen);
      return <WalletPanel />
  }
}

export default ScreenRenderer 