"use client";

import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";

const ARC_EXPLORER = "https://explorer.arc.io";
const ARC_API = `${ARC_EXPLORER}/api/v2`;

type Transaction = {
  transaction_hash: string;
  timestamp: string | null;
  method: string | null;
  type: string;
  from: {
    hash: string;
  };
  to: {
    hash: string;
  } | null;
  token: {
    symbol?: string;
    decimals: string | number;
  };
  total: {
    value: string;
    decimals: string | number;
  };
};

export default function ExplorerPage() {
  const { address, isConnected } = useAccount();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!address) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${ARC_API}/addresses/${address}/token-transfers`
      );

      if (!response.ok) {
        throw new Error(`Explorer API error: ${response.status}`);
      }

      const data = await response.json();

      setTransactions(
        Array.isArray(data.items) ? data.items : []
      );
    } catch (err) {
      console.error("Failed to fetch Mainnet transactions:", err);
      setError("Could not load transactions. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      void fetchTransactions();
    } else {
      setTransactions([]);
      setError("");
    }
  }, [isConnected, address, fetchTransactions]);

  function formatAddress(addr: string) {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function formatValue(tx: Transaction) {
    const decimals = Number(tx.total?.decimals ?? tx.token?.decimals ?? 6);
    const rawValue = Number(tx.total?.value ?? 0);

    if (!Number.isFinite(rawValue) || !Number.isFinite(decimals)) {
      return `0.00 ${tx.token?.symbol || "USDC"}`;
    }

    const amount = rawValue / Math.pow(10, decimals);

    return `${amount.toLocaleString(undefined, {
      maximumFractionDigits: 6,
    })} ${tx.token?.symbol || "USDC"}`;
  }

  return (
    <div className="min-h-screen text-white">
      <div className="relative overflow-hidden border-b border-zinc-800 px-8 py-10">
        <div className="pointer-events-none absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />

        <h1 className="relative bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-bold text-transparent">
          🔍 Arc Explorer
        </h1>

        <p className="relative mt-2 text-sm text-gray-400">
          View on-chain token transfers powered by Arc Mainnet.
        </p>
      </div>

      <div className="mx-auto max-w-3xl p-8">
        {isConnected && address ? (
          <>
            <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="mb-1 text-sm text-gray-400">
                    Wallet Address
                  </p>

                  <p className="break-all font-mono text-sm text-gray-300">
                    {address}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => void fetchTransactions()}
                    disabled={loading}
                    className="rounded-xl bg-zinc-800 px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>

                  <a
                    href={`${ARC_EXPLORER}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg transition hover:bg-blue-500"
                  >
                    Open in Arc Explorer →
                  </a>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur">
              <div className="border-b border-zinc-800 px-6 py-4">
                <h2 className="text-lg font-bold">
                  Recent Token Transfers
                </h2>
              </div>

              {loading && transactions.length === 0 ? (
                <p className="py-12 text-center text-gray-400">
                  Loading transactions...
                </p>
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="mb-3 text-red-400">{error}</p>

                  <a
                    href={`${ARC_EXPLORER}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View wallet on Arc Explorer
                  </a>
                </div>
              ) : transactions.length === 0 ? (
                <p className="py-12 text-center text-gray-400">
                  No token transfers found for this wallet.
                </p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {transactions.map((tx, index) => {
                    const isReceived =
                      tx.to?.hash?.toLowerCase() ===
                      address.toLowerCase();

                    return (
                      <a
                        key={`${tx.transaction_hash}-${index}`}
                        href={`${ARC_EXPLORER}/tx/${tx.transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-zinc-800/50"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-sm text-blue-400">
                            {formatAddress(tx.transaction_hash)}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              isReceived
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {isReceived ? "Received" : "Sent"}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {tx.timestamp
                              ? new Date(tx.timestamp).toLocaleString()
                              : "Timestamp unavailable"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-semibold ${
                              isReceived
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {isReceived ? "+" : "-"}
                            {formatValue(tx)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            View transaction ↗
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center backdrop-blur">
            <p className="text-gray-400">
              Please connect your wallet first.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Connect your wallet using the button in the top-right corner
              to view your Mainnet token transfers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}