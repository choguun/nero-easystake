"use client";

import React, { useEffect, useContext, useState } from "react";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import {
  WalletConnectSidebar,
  ToggleWalletVisibilityButton,
  WalletConnectRoundedButton,
} from "@/components/features/connect";
import { SendUserOpContext } from "@/contexts";
import { useSignature, useConfig } from "@/hooks";
import { CustomConnectButtonProps } from "@/types";
import { ethers, utils as ethersUtils } from "ethers";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ExternalLink, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ABI and amount for funding AA wallet - ENTRYPOINT_ABI_DEPOSIT_TO is no longer needed for direct transfer
// const ENTRYPOINT_ABI_DEPOSIT_TO = ['function depositTo(address account) external payable'];
const EOA_FUNDING_AMOUNT = ethersUtils.parseEther("0.1");
const FAUCET_URL = "https://app.testnet.nerochain.io/faucet";

const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({ mode }) => {
  const { isWalletPanel, setIsWalletPanel } = useContext(SendUserOpContext)!;
  const {
    AAaddress: aaAddressFromHook,
    aaNeroBalance,
    signer: eoaSignerDetails,
    connectAA,
    resetSignature,
    loading: sigContextLoading,
  } = useSignature();
  // entryPointAddress from useConfig is no longer needed for direct transfer
  // const { entryPoint: entryPointAddress } = useConfig()
  const { toast } = useToast();

  const [eoaIsConnected, setEoaIsConnected] = useState(false);
  const [currentEoaAddress, setCurrentEoaAddress] = useState<string | null>(
    null,
  );
  const [isFunding, setIsFunding] = useState(false);
  const [fundingStatus, setFundingStatus] = useState<string>("");
  const [isConnectingAA, setIsConnectingAA] = useState(false);

  useEffect(() => {
    if (!eoaIsConnected) {
      setIsWalletPanel(false);
    }
  }, [eoaIsConnected, setIsWalletPanel]);

  const handleFundAAWallet = async () => {
    if (!eoaSignerDetails) {
      toast({
        title: "EOA Wallet Error",
        description: "EOA signer not available.",
        variant: "destructive",
      });
      return;
    }
    if (!aaAddressFromHook || aaAddressFromHook === "0x") {
      toast({
        title: "AA Wallet Error",
        description: "AA Wallet address is not determined.",
        variant: "destructive",
      });
      return;
    }
    setIsFunding(true);
    setFundingStatus(
      `Funding AA wallet (${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO)...`,
    );
    try {
      console.log(
        `[CustomConnectButton] Sending EOA transaction directly to AA Wallet (${aaAddressFromHook}) with value ${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO`,
      );
      const tx = await eoaSignerDetails.sendTransaction({
        to: aaAddressFromHook,
        value: EOA_FUNDING_AMOUNT,
      });
      setFundingStatus(
        `Funding tx submitted: ${tx.hash.substring(0, 10)}... Waiting...`,
      );
      toast({
        title: "Funding Submitted",
        description: `Transaction ${tx.hash} sent. Waiting for confirmation.`,
      });
      await tx.wait(1);
      setFundingStatus(
        `AA Wallet funding successful! Tx: ${tx.hash.substring(0, 10)}...`,
      );
      toast({
        title: "Funding Successful",
        description: `AA Wallet funded successfully. Tx: ${tx.hash}`,
      });
    } catch (error: any) {
      console.error("[CustomConnectButton] EOA Funding error:", error);
      const errorMessage =
        error.reason || error.message || "Unknown funding error";
      setFundingStatus(`Funding failed: ${errorMessage}`);
      toast({
        title: "Funding Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsFunding(false);
    }
  };

  const renderButton = (openConnectModal: () => void, rkAccount?: any) => {
    if (
      rkAccount &&
      (aaAddressFromHook === "0x" || !aaAddressFromHook) &&
      !isConnectingAA &&
      !sigContextLoading
    ) {
      return (
        <WalletConnectSidebar
          onClick={async () => {
            setIsConnectingAA(true);
            await connectAA();
            setIsConnectingAA(false);
          }}
          variant="Connect AA Wallet"
          disabled={isConnectingAA || sigContextLoading}
          data-oid="wps3xjz"
        />
      );
    }
    return (
      <WalletConnectSidebar
        onClick={openConnectModal}
        variant="Connect"
        disabled={isConnectingAA || sigContextLoading}
        data-oid="tn70fys"
      />
    );
  };

  return (
    <div className="inline-flex items-center space-x-2" data-oid="a6:gt0:">
      <RainbowConnectButton.Custom data-oid="m37fi40">
        {({
          account,
          chain,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const rkReady =
            mounted && authenticationStatus !== "loading" && !sigContextLoading;

          const rkConnected = Boolean(
            rkReady &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === "authenticated"),
          );

          useEffect(() => {
            setEoaIsConnected(rkConnected);
            if (rkConnected && account?.address) {
              setCurrentEoaAddress(account.address);
            } else if (!rkConnected) {
              setCurrentEoaAddress(null);
            }
          }, [rkConnected, account?.address, resetSignature]);

          if (!rkReady) {
            return (
              <WalletConnectRoundedButton
                onClick={openConnectModal}
                isConnected={false}
                AAaddress={"0x"}
                disabled={sigContextLoading}
                isLoading={sigContextLoading}
                data-oid="xxhxc18"
              />
            );
          }

          if (chain?.unsupported) {
            return (
              <WalletConnectSidebar
                variant="Connect"
                onClick={openChainModal}
                data-oid="06yx8n_"
              />
            );
          }

          const displayAddress =
            aaAddressFromHook && aaAddressFromHook !== "0x"
              ? aaAddressFromHook
              : account?.address;
          const displayBalance =
            aaAddressFromHook && aaAddressFromHook !== "0x"
              ? aaNeroBalance
              : undefined;
          const isAaConnected = aaAddressFromHook && aaAddressFromHook !== "0x";

          if (mode === "button") {
            if (rkConnected && isAaConnected) {
              return (
                <div
                  className="inline-flex items-center space-x-2"
                  data-oid="zyr9f3k"
                >
                  <WalletConnectRoundedButton
                    onClick={() => {
                      if (isAaConnected) {
                        setIsWalletPanel(!isWalletPanel);
                      } else {
                        openConnectModal();
                      }
                    }}
                    AAaddress={displayAddress as string}
                    isConnected={isAaConnected}
                    aaNeroBalance={displayBalance}
                    isLoading={isConnectingAA || sigContextLoading}
                    data-oid="3dbgcb5"
                  />

                  <DropdownMenu data-oid="fpx.axq">
                    <DropdownMenuTrigger asChild data-oid="pq73qqh">
                      <Button variant="ghost" size="icon" data-oid="owewk1h">
                        <MoreVertical className="h-4 w-4" data-oid="8isnsdd" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" data-oid="1ow_yyc">
                      <DropdownMenuItem
                        onClick={handleFundAAWallet}
                        disabled={isFunding || !eoaSignerDetails}
                        data-oid="otiarta"
                      >
                        {isFunding
                          ? "Funding..."
                          : `Fund AA (${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO)`}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild data-oid="veyhhm7">
                        <Link
                          href={FAUCET_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-oid=".hdd:p:"
                        >
                          Nero Faucet{" "}
                          <ExternalLink
                            className="ml-auto h-4 w-4"
                            data-oid="hj:h4h."
                          />
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            }
            if (rkConnected && !isAaConnected) {
              return (
                <div
                  className="inline-flex items-center space-x-2"
                  data-oid="sijshtb"
                >
                  <WalletConnectRoundedButton
                    onClick={() => {
                      if (!isConnectingAA) {
                        setIsConnectingAA(true);
                        connectAA().finally(() => setIsConnectingAA(false));
                      }
                    }}
                    AAaddress={"Connect AA Wallet"}
                    isConnected={false}
                    isLoading={isConnectingAA || sigContextLoading}
                    data-oid="a0idrra"
                  />

                  <DropdownMenu data-oid="mj7kcm-">
                    <DropdownMenuTrigger asChild data-oid="uvsyob5">
                      <Button variant="ghost" size="icon" data-oid="agsq8fn">
                        <MoreVertical className="h-4 w-4" data-oid="-cu3ush" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" data-oid="94uu6xx">
                      <DropdownMenuItem asChild data-oid="f0vbjqv">
                        <Link
                          href={FAUCET_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-oid="jnqluyj"
                        >
                          Nero Faucet{" "}
                          <ExternalLink
                            className="ml-auto h-4 w-4"
                            data-oid="1jt2z1i"
                          />
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            }
            return (
              <WalletConnectRoundedButton
                onClick={openConnectModal}
                AAaddress={"Connect Wallet"}
                isConnected={false}
                isLoading={isConnectingAA || sigContextLoading}
                data-oid="_qfk3nq"
              />
            );
          }

          if (mode === "sidebar") {
            if (rkConnected) {
              if (aaAddressFromHook && aaAddressFromHook !== "0x") {
                return (
                  <div
                    className="flex flex-col items-end space-y-1"
                    data-oid="a:s53v-"
                  >
                    <ToggleWalletVisibilityButton
                      onClick={() => setIsWalletPanel(!isWalletPanel)}
                      size={"sm"}
                      isWalletPanel={isWalletPanel}
                      data-oid="p._r7_3"
                    />

                    <Link
                      href={FAUCET_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      data-oid="d:l6g.6"
                    >
                      Nero Faucet <ExternalLink size={12} data-oid="7a3q-m3" />
                    </Link>
                  </div>
                );
              } else {
                return (
                  <div
                    className="flex flex-col items-end space-y-1"
                    data-oid="ogqdp-r"
                  >
                    <WalletConnectSidebar
                      onClick={async () => {
                        if (typeof connectAA === "function") {
                          setIsConnectingAA(true);
                          await connectAA();
                          setIsConnectingAA(false);
                        } else {
                          console.error("connectAA is not a function");
                        }
                      }}
                      variant="Connect AA Wallet"
                      disabled={isConnectingAA || sigContextLoading}
                      data-oid="0ge5aox"
                    />

                    <Link
                      href={FAUCET_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      data-oid="oaw:j0e"
                    >
                      Nero Faucet <ExternalLink size={12} data-oid="n73wcps" />
                    </Link>
                    {isConnectingAA && (
                      <p
                        className="text-xs text-muted-foreground text-right"
                        data-oid="4oi04y5"
                      >
                        Connecting AA Wallet...
                      </p>
                    )}
                  </div>
                );
              }
            }
            return renderButton(openConnectModal, account);
          }
          return null;
        }}
      </RainbowConnectButton.Custom>
    </div>
  );
};

export default CustomConnectButton;
