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
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import { parseUnits } from "viem";

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

  const { isConnected } = useAccount();

  const {
    data: hash,
    writeContract,
    isPending,
  } = useWriteContract();

  const {
    isLoading: confirming,
    isSuccess: confirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentData | null>(null);

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
        console.error(e);
      }

      setLoading(false);
    }

    if (id) {
      loadPayment();
    }
  }, [id]);

  useEffect(() => {
    if (!confirmed || !payment) return;

    async function finish() {
      await updateDoc(
        doc(db, "paymentLinks", id),
        {
          status: "paid",
          txHash: hash,
          paidAt: serverTimestamp(),
        }
      );

      if (!payment) return;

router.push(
  `/success?amount=${payment.amount}&to=${payment.wallet}&tx=${hash}`
      );
    }

    finish();
  }, [confirmed]);

  const payNow = async () => {
  console.log("========== PAY CLICK ==========");

  if (!payment) {
    console.log("Payment not found");
    return;
  }

  if (!isConnected) {
    alert("Connect wallet first");
    return;
  }

  console.log("Receiver:", payment.wallet);
  console.log("Amount:", payment.amount);
  console.log("USDC:", USDC_ADDRESS);

  try {
    const result = await writeContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: "transfer",
      args: [
        payment.wallet as `0x${string}`,
        parseUnits(payment.amount, 6),
      ],
    });

    console.log("writeContract result:", result);
  } catch (err) {
    console.error("WRITE CONTRACT ERROR:", err);
    alert("Check Console (F12)");
  }
};
    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Payment Link Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">

      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          💳 LinkPay Payment
        </h1>

        <div className="space-y-6">

          <div>
            <p className="text-gray-400 text-sm">
              Amount
            </p>

            <h2 className="text-4xl font-bold text-blue-400">
              {payment.amount} USDC
            </h2>
          </div>

          <div>
            <p className="text-gray-400 text-sm">
              Note
            </p>

            <p className="text-lg">
              {payment.note || "-"}
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">
              Receiver
            </p>

            <p className="font-mono break-all">
              {payment.wallet}
            </p>
          </div>

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
    disabled={isPending || confirming}
    className="w-full rounded-xl bg-blue-600 py-4 font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
  >
    {isPending
      ? "Waiting Wallet..."
      : confirming
      ? "Confirming..."
      : "PAY NOW"}
  </button>

)}

          {hash && (

            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">

              <p className="text-sm text-green-300 mb-2">
                Transaction Submitted
              </p>

              <p className="font-mono text-xs break-all">
                {hash}
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
      );
}