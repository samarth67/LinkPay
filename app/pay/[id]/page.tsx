"use client";

import { useEffect, useState } from "react";
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

import { formatUnits, parseUnits } from "viem";

import { db } from "@/lib/firebase";
import { USDC_ADDRESS, USDC_ABI } from "@/lib/usdc";

type PaymentData = {
  wallet: string;
  amount: string;
  note: string;
  status: string;
};

export default function PayPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const { address, isConnected } = useAccount();

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
  } = useWaitForTransactionReceipt({
    hash,
  });

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
      enabled: Boolean(address),
    },
  });

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentData | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Load payment link
  useEffect(() => {
    async function loadPayment() {
      try {
        const snap = await getDoc(
          doc(db, "paymentLinks", id)
        );

        if (snap.exists()) {
          setPayment(snap.data() as PaymentData);
        }
      } catch (e) {
        console.error("LOAD PAYMENT ERROR:", e);
        setErrorMessage("Unable to load this payment link.");
      }

      setLoading(false);
    }

    if (id) {
      loadPayment();
    }
  }, [id]);

  // Mark payment as paid ONLY after blockchain confirmation
  useEffect(() => {
    if (!confirmed || !payment || !hash) return;

    async function finishPayment() {
      try {
        await updateDoc(
          doc(db, "paymentLinks", id),
          {
            status: "paid",
            txHash: hash,
            paidAt: serverTimestamp(),
          }
        );

        router.push(
          `/success?amount=${payment!.amount}&to=${payment!.wallet}&tx=${hash}`
        );
      } catch (error) {
        console.error("FIREBASE UPDATE ERROR:", error);
        setErrorMessage(
          "Payment was confirmed on-chain, but we could not update the payment record."
        );
      }
    }

    finishPayment();
  }, [confirmed, payment, hash, id, router]);

  // Handle failed blockchain transaction
  useEffect(() => {
    if (!transactionFailed) return;

    console.error("TRANSACTION FAILED:", transactionError);

    setSubmitted(false);

    setErrorMessage(
      transactionError?.message ||
        "Transaction failed on the blockchain. Your payment was not completed."
    );
  }, [transactionFailed, transactionError]);

  // Handle wallet/write errors
  useEffect(() => {
    if (!writeError) return;

    console.error("WRITE CONTRACT ERROR:", writeError);

    // User rejected the transaction
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

  const payNow = async () => {
    console.log("========== PAY CLICK ==========");

    setErrorMessage("");

    if (!payment) {
      setErrorMessage("Payment not found.");
      return;
    }

    if (!isConnected || !address) {
      setErrorMessage("Connect your wallet first.");
      return;
    }

    if (!payment.amount || Number(payment.amount) <= 0) {
      setErrorMessage("Invalid payment amount.");
      return;
    }

    try {
      console.log("Payer:", address);
      console.log("Receiver:", payment.wallet);
      console.log("Amount:", payment.amount);
      console.log("USDC:", USDC_ADDRESS);

      // Refresh balance before checking
      const balanceResult = await refetchBalance();

      const currentBalance = balanceResult.data;

      if (currentBalance === undefined) {
        setErrorMessage(
          "Unable to read your USDC balance. Please try again."
        );
        return;
      }

      const requiredAmount = parseUnits(payment.amount, 6);

      console.log(
        "Wallet USDC Balance:",
        formatUnits(currentBalance as bigint, 6)
      );

      console.log(
        "Required USDC:",
        formatUnits(requiredAmount, 6)
      );

      // IMPORTANT:
      // Stop BEFORE opening MetaMask if balance is insufficient
      if ((currentBalance as bigint) < requiredAmount) {
        const currentBalanceFormatted = formatUnits(
          currentBalance as bigint,
          6
        );

        setErrorMessage(
          `Insufficient USDC balance. You have ${currentBalanceFormatted} USDC, but ${payment.amount} USDC is required.`
        );

        return;
      }

      // Balance is sufficient, now submit transaction
      setSubmitted(false);

      await writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [
          payment.wallet as `0x${string}`,
          requiredAmount,
        ],
      });

      console.log("Transaction submitted to wallet.");
    } catch (err: any) {
      console.error("PAYMENT ERROR:", err);

      setSubmitted(false);

      setErrorMessage(
        err?.message || "Unable to process the payment."
      );
    }
  };

  // When hash becomes available, transaction has actually been submitted
  useEffect(() => {
    if (hash) {
      setSubmitted(true);
      setErrorMessage("");
    }
  }, [hash]);

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
        Payment Link Not Found
      </div>
    );
  }

  const displayedBalance =
    usdcBalance !== undefined
      ? formatUnits(usdcBalance as bigint, 6)
      : null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          💳 LinkPay Payment
        </h1>

        <div className="space-y-6">

          {/* Amount */}
          <div>
            <p className="text-gray-400 text-sm">
              Amount
            </p>

            <h2 className="text-4xl font-bold text-blue-400">
              {payment.amount} USDC
            </h2>
          </div>

          {/* Note */}
          <div>
            <p className="text-gray-400 text-sm">
              Note
            </p>

            <p className="text-lg">
              {payment.note || "-"}
            </p>
          </div>

          {/* Receiver */}
          <div>
            <p className="text-gray-400 text-sm">
              Receiver
            </p>

            <p className="font-mono break-all">
              {payment.wallet}
            </p>
          </div>

          {/* Wallet balance */}
          {isConnected && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Your USDC Balance
                </p>

                <p className="font-semibold text-white">
                  {balanceLoading
                    ? "Loading..."
                    : displayedBalance !== null
                    ? `${displayedBalance} USDC`
                    : "--"}
                </p>
              </div>
            </div>
          )}

          {/* Already paid */}
          {payment.status === "paid" ? (

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

          ) : (

            <button
              onClick={payNow}
              disabled={
                isPending ||
                confirming ||
                balanceLoading
              }
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isPending
                ? "Waiting Wallet..."
                : confirming
                ? "Confirming..."
                : balanceLoading
                ? "Checking Balance..."
                : "PAY NOW"}
            </button>

          )}

          {/* Error */}
          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">
                ❌ Payment Failed
              </p>

              <p className="text-sm text-red-300 break-words">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Transaction submitted */}
          {hash && submitted && !transactionFailed && (
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

          {/* Confirming */}
          {confirming && hash && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center">
              <p className="text-sm text-yellow-300">
                ⏳ Confirming transaction on Arc...
              </p>
            </div>
          )}

          {/* Transaction failed */}
          {transactionFailed && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">
                ❌ Transaction Failed
              </p>

              <p className="text-sm text-red-300">
                The blockchain transaction failed. No payment was completed.
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