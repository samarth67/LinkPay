
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits, isAddress, parseUnits } from "viem";

import { db } from "@/lib/firebase";
import { USDC_ADDRESS, USDC_ABI } from "@/lib/usdc";

const ARC_MAINNET_CHAIN_ID = 5042;

type PaymentData = {
  wallet: string;
  amount: string;
  note: string;
  status: string;
  chainId?: number;
  txHash?: string;
};

export default function PayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { address, isConnected, chainId } = useAccount();

  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: confirming,
    isSuccess: confirmed,
    isError: transactionFailed,
    error: transactionError,
  } = useWaitForTransactionReceipt({ hash });

  const {
    data: usdcBalance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address) && chainId === ARC_MAINNET_CHAIN_ID,
    },
  });

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Prevent duplicate payment-status updates.
  const finishLock = useRef(false);

  // Load the payment link.
  useEffect(() => {
    let cancelled = false;

    async function loadPayment() {
      try {
        const snap = await getDoc(doc(db, "paymentLinks", id));

        if (cancelled) return;

        if (snap.exists()) {
          setPayment(snap.data() as PaymentData);
        } else {
          setPayment(null);
        }
      } catch (error) {
        console.error("LOAD PAYMENT ERROR:", error);

        if (!cancelled) {
          setErrorMessage("Unable to load this payment link.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) void loadPayment();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Update Firestore after blockchain confirmation.
  useEffect(() => {
    if (
      !confirmed ||
      !payment ||
      !hash ||
      finishLock.current ||
      payment.status === "paid"
    ) {
      return;
    }

    finishLock.current = true;

    async function finishPayment() {
      setFinishing(true);
      setErrorMessage("");

       if (!hash) {
       setErrorMessage("Transaction hash is missing. Do not pay again.");
       setFinishing(false);
        return;
       }

      try {
        const paymentRef = doc(db, "paymentLinks", id);
        const snap = await getDoc(paymentRef);

        if (!snap.exists()) {
          throw new Error("Payment record was not found.");
        }

        const latestPayment = snap.data() as PaymentData;

        if (latestPayment.status === "paid") {
          setPayment(latestPayment);
          router.push(
            `/success?amount=${encodeURIComponent(
              latestPayment.amount
            )}&to=${encodeURIComponent(
              latestPayment.wallet
            )}&tx=${encodeURIComponent(hash)}`
          );
          return;
        }

        if (latestPayment.chainId !== ARC_MAINNET_CHAIN_ID) {
          throw new Error(
            "Payment link chain ID does not match Arc Mainnet."
          );
        }

        await updateDoc(paymentRef, {
          status: "paid",
          txHash: hash,
          chainId: ARC_MAINNET_CHAIN_ID,
          paidAt: serverTimestamp(),
        });

        setPayment({
          ...latestPayment,
          status: "paid",
          txHash: hash,
        });

        router.push(
          `/success?amount=${encodeURIComponent(
            latestPayment.amount
          )}&to=${encodeURIComponent(
            latestPayment.wallet
          )}&tx=${encodeURIComponent(hash)}`
        );
      } catch (error) {
        console.error("FIREBASE UPDATE ERROR:", error);

        setErrorMessage(
          `Transaction may already be confirmed, but LinkPay could not update its payment record. Do not pay again. Transaction: ${hash}`
        );
      } finally {
        setFinishing(false);
      }
    }

    void finishPayment();
  }, [confirmed, payment, hash, id, router]);

  // Handle failed blockchain transactions.
  useEffect(() => {
    if (!transactionFailed) return;

    console.error("TRANSACTION FAILED:", transactionError);
    setSubmitted(false);

    setErrorMessage(
      transactionError?.message ||
        "Transaction failed on the blockchain. Check the transaction before retrying."
    );
  }, [transactionFailed, transactionError]);

  // Handle wallet submission errors.
  useEffect(() => {
    if (!writeError) return;

    console.error("WRITE CONTRACT ERROR:", writeError);

    if (
      writeError.message.toLowerCase().includes("user rejected") ||
      writeError.message.toLowerCase().includes("user denied")
    ) {
      setErrorMessage("Transaction was rejected in your wallet.");
    } else {
      setErrorMessage(
        writeError.message || "Unable to submit the transaction."
      );
    }

    setSubmitted(false);
  }, [writeError]);

  // A transaction hash means the wallet submitted a transaction.
  useEffect(() => {
    if (hash) {
      setSubmitted(true);
      setErrorMessage("");
    }
  }, [hash]);

  const payNow = async () => {
    setErrorMessage("");

    if (payment?.status === "paid") {
      setErrorMessage("This payment link has already been paid.");
      return;
    }

    if (!payment) {
      setErrorMessage("Payment not found.");
      return;
    }

    if (payment.chainId !== ARC_MAINNET_CHAIN_ID) {
      setErrorMessage(
        "This payment link is not configured for Arc Mainnet. Ask the sender to create a new link."
      );
      return;
    }

    if (!isConnected || !address) {
      setErrorMessage("Connect your wallet first.");
      return;
    }

    if (chainId !== ARC_MAINNET_CHAIN_ID) {
      setErrorMessage(
        "Wrong network. Switch your wallet to Arc Mainnet (Chain ID 5042)."
      );
      return;
    }

    if (!isAddress(payment.wallet)) {
      setErrorMessage("The receiver wallet address is invalid.");
      return;
    }

    if (
      !payment.amount ||
      !Number.isFinite(Number(payment.amount)) ||
      Number(payment.amount) <= 0
    ) {
      setErrorMessage("Invalid payment amount.");
      return;
    }

    if (isPending || confirming || submitted || finishing) return;

    try {
      const requiredAmount = parseUnits(payment.amount, 6);

      if (requiredAmount <= BigInt(0)) {
        setErrorMessage("Invalid payment amount.");
        return;
      }

      const balanceResult = await refetchBalance();

      if (chainId !== ARC_MAINNET_CHAIN_ID) {
        setErrorMessage(
          "Your wallet network changed. Switch back to Arc Mainnet."
        );
        return;
      }

      const currentBalance = balanceResult.data;

      if (currentBalance === undefined) {
        setErrorMessage("Unable to read your USDC balance. Try again.");
        return;
      }

      if (currentBalance < requiredAmount) {
        setErrorMessage(
          `Insufficient USDC balance. You have ${formatUnits(
            currentBalance,
            6
          )} USDC, but ${payment.amount} USDC is required.`
        );
        return;
      }

      await writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [
          payment.wallet as `0x${string}`,
          requiredAmount,
        ],
        chainId: ARC_MAINNET_CHAIN_ID,
      });
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      setSubmitted(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to process the payment."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
        {errorMessage || "Payment Link Not Found"}
      </div>
    );
  }

  const displayedBalance =
    usdcBalance !== undefined
      ? formatUnits(usdcBalance, 6)
      : null;

  const wrongNetwork =
    isConnected && chainId !== ARC_MAINNET_CHAIN_ID;

  const wrongPaymentChain =
    payment.chainId !== ARC_MAINNET_CHAIN_ID;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          💳 LinkPay Payment
        </h1>

        <div className="space-y-6">
          <div>
            <p className="text-gray-400 text-sm">Amount</p>
            <h2 className="text-4xl font-bold text-blue-400">
              {payment.amount} USDC
            </h2>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Note</p>
            <p className="text-lg">{payment.note || "-"}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Receiver</p>
            <p className="font-mono break-all">{payment.wallet}</p>
          </div>

          {isConnected && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Your USDC Balance
                </p>
                <p className="font-semibold text-white">
                  {wrongNetwork
                    ? "Switch to Arc Mainnet"
                    : balanceLoading
                    ? "Loading..."
                    : displayedBalance !== null
                    ? `${displayedBalance} USDC`
                    : "--"}
                </p>
              </div>
            </div>
          )}

          {wrongPaymentChain ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
              This payment link is not configured for Arc Mainnet. Ask the sender to create a new link.
            </div>
          ) : payment.status === "paid" ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
              <h3 className="text-xl font-bold text-green-400">
                ✅ Payment Completed
              </h3>
              <p className="text-gray-400 mt-2">
                This payment link has already been paid.
              </p>
            </div>
          ) : !isConnected ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-yellow-300">
              Connect your wallet first.
            </div>
          ) : wrongNetwork ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-yellow-300">
              Switch your wallet to Arc Mainnet (Chain ID 5042) to pay.
            </div>
          ) : (
            <button
              onClick={payNow}
              disabled={
                isPending ||
                confirming ||
                balanceLoading ||
                submitted ||
                finishing
              }
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isPending
                ? "Waiting Wallet..."
                : confirming
                ? "Confirming..."
                : finishing
                ? "Updating Payment..."
                : balanceLoading
                ? "Checking Balance..."
                : submitted
                ? "Transaction Submitted..."
                : "PAY NOW"}
            </button>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">
                ⚠️ Payment Notice
              </p>
              <p className="text-sm text-red-300 break-words">
                {errorMessage}
              </p>
              {hash && (
                <p className="font-mono text-xs break-all text-zinc-300 mt-3">
                  Transaction: {hash}
                </p>
              )}
            </div>
          )}

          {hash && submitted && !confirmed && !transactionFailed && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-sm text-blue-300 mb-2">
                Transaction Submitted
              </p>
              <p className="text-xs text-blue-200 mb-2">
                Waiting for blockchain confirmation...
              </p>
              <p className="font-mono text-xs break-all text-zinc-300">
                {hash}
              </p>
            </div>
          )}

          {confirming && hash && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
              <p className="text-sm text-yellow-300">
                ⏳ Confirming transaction on Arc Mainnet...
              </p>
            </div>
          )}

          {transactionFailed && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">
                ❌ Transaction Failed
              </p>
              <p className="text-sm text-red-300">
                Check the transaction details before trying again.
              </p>
              {hash && (
                <p className="font-mono text-xs break-all text-zinc-400 mt-3">
                  {hash}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
