import { NEROTokenDetail, TokenDetail } from "@/components/features";
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
} from "@/components/screens";
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

import { screens, Screen } from "@/types";

interface ScreenRendererProps {
  currentScreen: Screen;
}

function ScreenRenderer({ currentScreen }: ScreenRendererProps) {
  switch (currentScreen) {
    case screens.HOME:
      return <WalletPanel data-oid="4sm5x.2" />;
    case screens.TOP:
      return <WalletPanel data-oid="t0kpqm1" />;
    case screens.WALLET:
      return <WalletPanel data-oid=".si6od7" />;
    case screens.SEND:
      return <SendPanel data-oid="vdpytdj" />;
    case screens.RECEIVE:
      return <ReceivePanel data-oid="xlmiix7" />;
    case screens.SETTING:
      return <SettingPanel data-oid="3yn2yi0" />;
    case screens.NFT:
      return <ExpandedTabContent tab="NFTs" data-oid="92xbze6" />;
    case screens.NFTDETAIL: // Ensure NFTDetail is exported from @/components/screens
      return <NFTDetail data-oid="zblb8a1" />;
    case screens.TOKEN: // Ensure ExpandedTabContent or a specific Token screen component is appropriate
      return <ExpandedTabContent tab="Tokens" data-oid="kvzwjzk" />;
    // case screens.TOKENINDEX: // If TokenIndex is a distinct screen
    // return <TokenIndex />
    case screens.ACTIVITY:
      return <WalletPanel initialTab="Activity" data-oid="sht0.2y" />;
    case screens.TOKENDETAIL:
      return <TokenDetail data-oid="qsp_38z" />;
    case screens.NEROTOKENDETAIL:
      return <NEROTokenDetail data-oid="t01qks_" />;
    case screens.SENDUSEROP:
      return <SendUserOpPanel data-oid="_9m3l.1" />;
    default:
      console.log(
        "[ScreenRenderer] Defaulting to WalletPanel for screen:",
        currentScreen,
      );
      return <WalletPanel data-oid="o543h_m" />;
  }
}

export default ScreenRenderer;
