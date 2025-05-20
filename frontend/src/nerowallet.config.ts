import NEROLogoSquareIcon from '@/assets/NERO-Logo-square.svg'
import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK, getEvmChainConfig } from "@web3auth/base";

const config = {
    rainbowKitProjectId: '04309ed1007e77d1f119b85205bb779d',
    walletName: 'Social Login',
    // walletLogo: NEROLogoSquareIcon,
    iconBackground: '#fff',
    contactAs: 'https://discord.com/invite/nerochainofficial',
    PrivacyPolicy: 'https://www.app.testnet.nerochain.io/privacy',
    ServiceTerms: 'https://docs.nerochain.io/',
    chains: [
      {
        chain: {
          name: 'NERO Testnet',
          // logo: NEROLogoSquareIcon,
          networkType: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          rpc: 'https://rpc-testnet.nerochain.io',
          chainId: 689,
          explorer: 'https://testnet.neroscan.io',
          explorerAPI: 'https://api-testnet.neroscan.io',
          nativeToken: {
            decimals: 18,
            name: 'NERO',
            symbol: 'NERO',
          },
        },
        aa: {
          bundler: 'https://bundler-testnet.nerochain.io',
          paymaster: 'https://paymaster-testnet.nerochain.io',
          paymasterAPIKey: process.env.NEXT_PUBLIC_TESTNET_PAYMASTER_API ?? '60ef5d24b48f4b699e79f60b8e616794',
        },
        aaContracts: {
          entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          accountFactory: '0x9406Cc6185a346906296840746125a0E44976454',
          tokenPaymaster: '0x5a6680dFd4a77FEea0A7be291147768EaA2414ad',
        },
        web3auth: {
          clientId: process.env.NEXT_PUBLIC_TESTNET_WEB3AUTH_ID ?? '',
          network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          uiConfig: {
            appName: 'NERO',
            mode: 'light',
            useLogoLoader: true,
            defaultLanguage: 'en',
            theme: {
              primary: '#768729',
            },
            loginMethodsOrder: ['google'],
            uxMode: 'redirect',
            modalZIndex: '2147483647',
          },
          loginConfig: {
            google: {
              name: 'google',
              verifier: 'Nero-EasyStake-Google-Maintest',
              typeOfLogin: 'google',
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            },
            // facebook: {
            //   name: 'facebook',
            //   verifier: 'NeroTest-Facebook-Maintest',
            //   typeOfLogin: 'facebook',
            //   clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
            // },
          },
        },
      },
      {
        chain: {
          name: 'NERO Mainnet',
          // logo: NEROLogoSquareIcon,
          networkType: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          rpc: 'https://rpc.nerochain.io',
          chainId: 1689,
          explorer: 'https://neroscan.io',
          explorerAPI: 'https://api.neroscan.io',
          nativeToken: {
            decimals: 18,
            name: 'NERO',
            symbol: 'NERO',
          },
        },
        aa: {
          bundler: 'https://bundler-mainnet.nerochain.io',
          paymaster: 'https://paymaster-mainnet.nerochain.io',
          paymasterAPIKey: process.env.NEXT_PUBLIC_MAINNET_PAYMASTER_API ?? '60ef5d24b48f4b699e79f60b8e616794',
        },
        aaContracts: {
          entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          accountFactory: '0x9406Cc6185a346906296840746125a0E44976454',
          tokenPaymaster: '0xC42E90D29D478ccFeCC28d3B838824E57e51F284',
        },
        web3auth: {
          clientId: process.env.NEXT_PUBLIC_MAINNET_WEB3AUTH_ID ?? '',
          network: 'mainnet',
          uiConfig: {
            appName: 'NERO',
            mode: 'light',
            useLogoLoader: true,
            defaultLanguage: 'en',
            theme: {
              primary: '#768729',
            },
            loginMethodsOrder: ['google'],
            uxMode: 'redirect',
            modalZIndex: '2147483647',
          },
          loginConfig: {
            google: {
              name: 'google',
              verifier: 'Nero-EasyStake-Google-Maintest',
              typeOfLogin: 'google',
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            },
            // facebook: {
            //   name: 'facebook',
            //   verifier: 'NeroTest-Facebook-Maintest',
            //   typeOfLogin: 'facebook',
            //   clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
            // },
          },
        },
      },
    ],
}
  
export default config