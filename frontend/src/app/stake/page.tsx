"use client";

import {
  useState,
  ChangeEvent,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowRightLeft, Repeat2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useSignature,
  useSendUserOp,
  useConfig,
  usePaymasterContext,
} from "@/hooks";
import { ethers, utils as ethersUtils, Contract, BigNumberish } from "ethers";
import { STAKING_ABI } from "@/constants/abi";
import { SendUserOpContext } from "@/contexts";
import { CustomConnectButton } from "@/components/features/connect";
import { STNERO_ADDRESS } from "@/constants/contracts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StakingGuide } from "@/components/features/guide";

const EasyStakeVaultABI = STAKING_ABI;
const VAULT_DECIMALS = 18;

export default function StakePage() {
  const [isStakingMode, setIsStakingMode] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>("");
  const { toast } = useToast();
  const {
    AAaddress,
    isConnected,
    signer: aaSignerDetails,
    loading: sigLoading,
  } = useSignature();
  const { execute, checkUserOpStatus } = useSendUserOp();
  const { rpcUrl: configRpcUrl } = useConfig();
  const sendUserOpCtx = useContext(SendUserOpContext);
  const paymasterCtx = usePaymasterContext();

  const [nativeBalance, setNativeBalance] = useState<string>("0");
  const [isLoadingNativeBalance, setIsLoadingNativeBalance] = useState(false);
  const [shareBalance, setShareBalance] = useState<string>("0");
  const [isLoadingShareBalance, setIsLoadingShareBalance] = useState(false);
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string>("");
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    "stake" | "unstake" | null
  >(null);
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] =
    useState<string>("0.0");

  const inputTokenSymbol = isStakingMode ? "NERO" : "stNERO";
  const outputTokenSymbol = isStakingMode ? "stNERO" : "NERO";

  const getProvider = useCallback(() => {
    if (aaSignerDetails && aaSignerDetails.provider) {
      return aaSignerDetails.provider;
    }
    return new ethers.providers.JsonRpcProvider(
      configRpcUrl || "https://rpc-testnet.nerochain.io",
    );
  }, [aaSignerDetails, configRpcUrl]);

  const fetchNativeBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== "0x" && provider) {
      setIsLoadingNativeBalance(true);
      try {
        const balance = await provider.getBalance(AAaddress);
        setNativeBalance(ethersUtils.formatEther(balance));
      } catch (error) {
        console.error("[StakePage] Error fetching native balance:", error);
        setNativeBalance("Error");
        toast({
          title: "Error",
          description: "Could not fetch NERO balance.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingNativeBalance(false);
      }
    }
  }, [AAaddress, getProvider, toast]);

  const fetchShareBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== "0x" && provider && STNERO_ADDRESS) {
      setIsLoadingShareBalance(true);
      try {
        const vaultContract = new Contract(
          STNERO_ADDRESS,
          EasyStakeVaultABI,
          provider,
        );
        const balance = await vaultContract.balanceOf(AAaddress);
        setShareBalance(ethersUtils.formatUnits(balance, VAULT_DECIMALS));
      } catch (error) {
        console.error("[StakePage] Error fetching stNERO balance:", error);
        setShareBalance("Error");
        toast({
          title: "Error",
          description: "Could not fetch stNERO balance.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingShareBalance(false);
      }
    }
  }, [AAaddress, getProvider, toast]);

  const fetchEstimates = useCallback(async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !STNERO_ADDRESS) {
      setEstimatedReceiveAmount("0.0");
      return;
    }
    const provider = getProvider();
    if (!provider) {
      setEstimatedReceiveAmount("N/A");
      return;
    }
    const vaultContract = new Contract(
      STNERO_ADDRESS,
      EasyStakeVaultABI,
      provider,
    );
    try {
      const amountInWei = ethersUtils.parseUnits(
        amount,
        isStakingMode ? 18 : VAULT_DECIMALS,
      );
      if (isStakingMode) {
        const estimatedSharesOut =
          await vaultContract.previewDeposit(amountInWei);
        setEstimatedReceiveAmount(
          ethersUtils.formatUnits(estimatedSharesOut, VAULT_DECIMALS),
        );
      } else {
        const assetsOutWei = await vaultContract.previewRedeem(amountInWei);
        setEstimatedReceiveAmount(ethersUtils.formatEther(assetsOutWei));
      }
    } catch (error) {
      console.error("[StakePage] Error fetching estimate:", error);
      setEstimatedReceiveAmount("Error");
    }
  }, [amount, isStakingMode, getProvider]);

  useEffect(() => {
    if (isConnected && AAaddress && AAaddress !== "0x") {
      fetchNativeBalance();
      fetchShareBalance();
    } else {
      setNativeBalance("0");
      setShareBalance("0");
    }
  }, [isConnected, AAaddress, fetchNativeBalance, fetchShareBalance]);

  useEffect(() => {
    if (parseFloat(amount) > 0) {
      fetchEstimates();
    } else {
      setEstimatedReceiveAmount("0.0");
    }
  }, [amount, isStakingMode, fetchEstimates]);

  const handleCancel = useCallback(() => {
    setIsPollingStatus(false);
    setIsProcessingTx(false);
    setCurrentAction(null);
    setTxStatus("");
    setUserOpHash(null);
    if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false);
    toast({
      title: "Transaction Cancelled",
      description: "You cancelled the operation.",
    });
  }, [toast, sendUserOpCtx]);

  useEffect(() => {
    if (
      sendUserOpCtx &&
      !sendUserOpCtx.isWalletPanel &&
      isProcessingTx &&
      !userOpHash
    ) {
      handleCancel();
    }
  }, [sendUserOpCtx, isProcessingTx, userOpHash, handleCancel]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const pollStatus = async () => {
      if (!userOpHash || !isPollingStatus || !currentAction) return;
      try {
        setTxStatus(`Confirming ${currentAction}...`);
        const statusResult = await checkUserOpStatus(userOpHash);
        const actionVerb = currentAction === "stake" ? "Staking" : "Unstaking";
        if (statusResult) {
          console.log(
            `[StakePage] ${actionVerb} successful for UserOpHash: ${userOpHash}`,
          );
          toast({
            title: `${actionVerb} Successful!`,
            description: `Your ${currentAction} operation was completed.`,
          });
          setIsPollingStatus(false);
          if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false);
          if (paymasterCtx) paymasterCtx.clearToken();
          fetchNativeBalance();
          fetchShareBalance();
          setUserOpHash(null);
          setCurrentAction(null);
          setAmount("");
          setEstimatedReceiveAmount("0.0");
        } else {
          setTxStatus("UserOp submitted, awaiting confirmation...");
        }
      } catch (error) {
        console.error(
          `[StakePage] Error polling ${currentAction} status for UserOpHash ${userOpHash}:`,
          error,
        );
        setIsPollingStatus(false);
      } finally {
        if (!isPollingStatus) setIsProcessingTx(false);
      }
    };
    if (userOpHash && isPollingStatus && currentAction) {
      intervalId = setInterval(pollStatus, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    userOpHash,
    isPollingStatus,
    checkUserOpStatus,
    fetchNativeBalance,
    fetchShareBalance,
    currentAction,
    toast,
    sendUserOpCtx,
    paymasterCtx,
  ]);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) setAmount(value);
  };

  const handleMaxClick = () => {
    const balanceToSet = isStakingMode ? nativeBalance : shareBalance;
    if (balanceToSet !== "Error") setAmount(balanceToSet);
    else setAmount("0");
  };

  if (sigLoading) {
    return (
      <div
        className="flex-grow flex items-center justify-center"
        data-oid="4e3.xim"
      >
        <Loader2 className="h-8 w-8 animate-spin" data-oid="pq51oob" />
      </div>
    );
  }

  const commonTxValidations = () => {
    if (!isConnected || !AAaddress || AAaddress === "0x") {
      toast({ title: "Wallet Not Connected", variant: "destructive" });
      return false;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Invalid Amount", variant: "destructive" });
      return false;
    }
    const balance = parseFloat(isStakingMode ? nativeBalance : shareBalance);
    if (isNaN(balance) || numericAmount > balance) {
      toast({ title: "Insufficient Balance", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!commonTxValidations()) return;
    const action = isStakingMode ? "stake" : "unstake";
    setCurrentAction(action);
    setIsProcessingTx(true);
    setTxStatus(`Preparing to ${action}...`);

    try {
      const amountInWei = ethersUtils.parseUnits(
        amount,
        isStakingMode ? 18 : VAULT_DECIMALS,
      );

      let functionName: string;
      let params: any[];
      let txValue: BigNumberish;

      if (isStakingMode) {
        functionName = "depositEth";
        params = [];
        txValue = amountInWei;
      } else {
        functionName = "redeemEth";
        params = [amountInWei, AAaddress];
        txValue = BigInt(0);
      }

      setTxStatus("Please confirm the transaction...");

      const result = await execute({
        target: STNERO_ADDRESS,
        abi: EasyStakeVaultABI,
        functionName,
        params,
        value: txValue,
      });

      if (result.userOpHash) {
        setUserOpHash(result.userOpHash);
        setIsPollingStatus(true);
        setTxStatus("Transaction submitted, waiting for confirmation...");
      } else {
        throw new Error(result.error || "Transaction failed or was cancelled.");
      }
    } catch (error: any) {
      console.error(`[StakePage] Error during ${action}:`, error);
      toast({
        title: `${action} Failed`,
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      handleCancel();
    }
  };

  const toggleMode = () => {
    setIsStakingMode(!isStakingMode);
    setAmount("");
    setEstimatedReceiveAmount("0.0");
    setTxStatus("");
  };

  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      data-oid="e37leli"
    >
      <Card className="w-full max-w-md" data-oid="om41khc">
        <CardHeader data-oid="iht1o_s">
          <CardTitle
            className="flex justify-between items-center"
            data-oid="b1qgwjc"
          >
            <span data-oid="yy6q9xb">
              {isStakingMode ? "Stake NERO" : "Unstake stNERO"}
            </span>
            <Repeat2
              className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={toggleMode}
              data-oid="k67qu:8"
            />
          </CardTitle>
          <CardDescription data-oid=".h_fk6a">
            {isStakingMode
              ? "Stake NERO and receive stNERO tokens."
              : "Redeem your stNERO for NERO."}
          </CardDescription>
        </CardHeader>
        <CardContent data-oid="y86f46k">
          <div className="space-y-4" data-oid="zefzyuf">
            <div className="space-y-2" data-oid="ap6xq-:">
              <div
                className="flex justify-between items-baseline"
                data-oid="1ma_bp0"
              >
                <Label htmlFor="amount-stake" data-oid="rd642ev">
                  {isStakingMode ? "Amount to Stake" : "Amount to Unstake"}
                </Label>
                <span className="text-xs text-gray-500" data-oid="irbsv96">
                  Balance:{" "}
                  {isLoadingNativeBalance || isLoadingShareBalance
                    ? "Loading..."
                    : isStakingMode
                      ? parseFloat(nativeBalance).toFixed(4)
                      : parseFloat(shareBalance).toFixed(4)}{" "}
                  {inputTokenSymbol}
                </span>
              </div>
              <div className="relative" data-oid="jttxt8-">
                <Input
                  id="amount-stake"
                  type="text"
                  placeholder="0.0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pr-16"
                  disabled={isProcessingTx}
                  data-oid="7hs61s4"
                />

                <Button
                  variant="link"
                  className="absolute inset-y-0 right-0 px-3 text-indigo-600"
                  onClick={handleMaxClick}
                  disabled={isProcessingTx}
                  data-oid="_cc1a3e"
                >
                  Max
                </Button>
              </div>
            </div>
            <div
              className="flex justify-center items-center my-2"
              data-oid="vtzov0v"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMode}
                aria-label="Switch tokens"
                disabled={!isConnected}
                data-oid="asei0u."
              >
                <ArrowRightLeft
                  className="h-5 w-5 text-primary"
                  data-oid="jdm9vsw"
                />
              </Button>
            </div>
            <div className="space-y-2" data-oid="_88hnso">
              <Label data-oid="xh-l80b">
                {isStakingMode
                  ? "Estimated stNERO Received"
                  : "Estimated NERO Received"}
              </Label>
              <div
                className="p-2 bg-gray-100 rounded-md text-lg font-medium h-[40px] flex items-center"
                data-oid="j7dyzw0"
              >
                <span data-oid=".sbls2k">
                  {estimatedReceiveAmount} {outputTokenSymbol}
                </span>
              </div>
            </div>
            {isProcessingTx && (
              <div
                className="mt-4 text-center text-sm text-gray-500"
                data-oid="dzfx_j1"
              >
                <p data-oid="kmus9b5">{txStatus}</p>
                {userOpHash && (
                  <a
                    href={`https://testnet.nerochain.io/tx/${userOpHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                    data-oid="o:i1l6p"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter data-oid="doce887">
          {isConnected ? (
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={
                isProcessingTx || !parseFloat(amount) || parseFloat(amount) <= 0
              }
              data-oid="zz9_.40"
            >
              {isProcessingTx
                ? "Processing..."
                : isStakingMode
                  ? "Stake NERO"
                  : "Unstake"}
            </Button>
          ) : (
            <CustomConnectButton className="w-full" data-oid="ttayxtr" />
          )}
        </CardFooter>
      </Card>

      <Card className="w-full max-w-md shadow-lg mt-6" data-oid="u:2:l7z">
        <CardHeader data-oid="9tgdf:8">
          <CardTitle data-oid="79-6eru">How EasyStake Works</CardTitle>
          <CardDescription data-oid="87mybp1">
            Learn about the benefits of liquid staking with EasyStake.
          </CardDescription>
        </CardHeader>
        <CardContent data-oid="-441jlx">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            data-oid="825a_7:"
          >
            <AccordionItem value="item-1" data-oid="2jxxv-b">
              <AccordionTrigger data-oid="hmuxxeo">
                How do I stake?
              </AccordionTrigger>
              <AccordionContent className="space-y-2" data-oid="b9f444y">
                <p data-oid="nyocrdq">
                  1. Connect your wallet and make sure you have NERO to stake.
                </p>
                <p data-oid="9exfzkj">
                  2. Enter the amount of NERO you wish to stake in the input
                  field above.
                </p>
                <p data-oid="eg2nawj">
                  3. Click "Stake" and confirm the transaction in your wallet.
                </p>
                <p data-oid="x.t3w.2">
                  4. You will receive stNERO tokens, which represent your staked
                  position and automatically earn rewards.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" data-oid="kss-ibi">
              <AccordionTrigger data-oid="pa4p95h">
                Why should I use EasyStake?
              </AccordionTrigger>
              <AccordionContent className="space-y-2" data-oid="6:hbdnn">
                <p data-oid="zn_7pz2">
                  <strong data-oid="tv-fm88">Liquid Staking:</strong> Instantly
                  get stNERO tokens that you can use in other DeFi apps, all
                  while your stake earns rewards. No lock-up periods, full
                  flexibility.
                </p>
                <p data-oid="j59euqs">
                  <strong data-oid="dplvn2s">Effortless Yield:</strong> No need
                  to run complex validator nodes. Just deposit your NERO and our
                  smart vaults automatically handle the rest, ensuring you get
                  competitive staking yields.
                </p>
                <p data-oid="vtuhu76">
                  <strong data-oid="_qqdkdp">AI-Optimized Strategies:</strong>{" "}
                  EasyStake is designed to integrate with AI-powered strategies
                  that optimize for the best possible yield, maximizing your
                  returns over time.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" data-oid="cbwgk23">
              <AccordionTrigger data-oid="561izln">
                How is this different from other staking?
              </AccordionTrigger>
              <AccordionContent data-oid="azqgltt">
                EasyStake is Nero's premier liquid staking solution, designed
                for simplicity and capital efficiency. While other future
                staking products may focus on validator operations or
                governance, EasyStake is built for the everyday user who wants
                to earn yield on their NERO without complexity. It's the "fire
                and forget" way to stake.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
