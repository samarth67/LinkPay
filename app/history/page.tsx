
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Payment = {
  id: string;
  wallet: string;
  amount: string;
  note: string;
  status: string;
  chainId?: number;
  txHash?: string;
  createdAt?: { seconds?: number };
};

export default function HistoryPage() {
  const { address } = useAccount();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      setLoading(true);
      setErrorMessage("");

      if (!address) {
        setPayments([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "paymentLinks"),
          where("wallet", "==", address),
          where("status", "==", "paid"),
          where("chainId", "==", 5042),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        console.log("History wallet:", address);
        console.log("History documents found:", snapshot.size);
        console.log(
          "History data:",
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );

        const list: Payment[] = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Payment, "id">),
        }));

        if (!cancelled) setPayments(list);
      } catch (error) {
        console.error("HISTORY FIRESTORE ERROR:", error);

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load payment history."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPayments();

    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="min-h-screen text-white">
      <div className="border-b border-zinc-800 px-8 py-10">
        <h1 className="text-4xl font-bold">📊 Payment Activity</h1>
        <p className="mt-2 text-gray-400">
          Track your payment links and completed transactions.
        </p>
        {address && (
          <p className="mt-3 break-all font-mono text-xs text-gray-500">
            Connected wallet: {address}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-4xl p-8">
        {loading ? (
          <div className="text-center text-gray-400">
            Loading payment history...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h2 className="font-bold text-red-400">
              History Loading Error
            </h2>
            <p className="mt-2 break-words text-sm text-red-300">
              {errorMessage}
            </p>
          </div>
        ) : !address ? (
          <div className="rounded-3xl border border-zinc-800 p-10 text-center">
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="mt-2 text-gray-400">
              Connect the receiver wallet to view its payment history.
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
            <h2 className="text-2xl font-bold">No Payments Yet</h2>
            <p className="mt-2 text-gray-400">
              No paid links were found for this wallet on Arc Mainnet.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-black p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {payment.amount} USDC
                    </h2>
                    <p className="mt-1 text-gray-400">
                      {payment.note || "Payment Request"}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-500/20 px-4 py-2 text-green-400">
                    ✅ Paid
                  </span>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-5">
                  <p className="text-xs text-gray-500">Receiver Wallet</p>
                  <p className="mt-2 break-all font-mono text-sm">
                    {payment.wallet}
                  </p>
                </div>

                {payment.txHash && (
                  <div className="mt-5 rounded-xl bg-green-500/10 p-4">
                    <p className="break-all font-mono text-xs">
                      {payment.txHash}
                    </p>
                    <a
                      href={`https://explorer.arc.io/tx/${payment.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm"
                    >
                      View Transaction ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
