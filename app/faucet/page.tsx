"use client";

import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({
    address: address,
  });

  const formattedBalance = balance
    ? Number(formatEther(balance.value)).toFixed(4) + " USDC"
    : "0.0000 USDC";

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/[0.06] blur-[120px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-20">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/5 px-3 py-1.5 text-xs font-medium text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Arc Testnet
          </div>

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Arc Testnet Faucet
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
            Get free USDC on Arc Testnet to test LinkPay features and
            transactions.
          </p>
        </div>

        {isConnected ? (
          <>
            {/* Main faucet card */}
            <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/60 shadow-2xl shadow-blue-950/10 backdrop-blur-xl">
              <div className="grid md:grid-cols-[1fr_1px_1fr]">
                {/* Balance */}
                <div className="p-7 md:p-9">
                  <p className="text-sm font-medium text-zinc-400">
                    Your Balance
                  </p>

                  <p className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                    {formattedBalance}
                  </p>

                  <div className="mt-4 inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
                    USDC on Arc Testnet
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden bg-zinc-800 md:block" />

                {/* Actions */}
                <div className="flex flex-col justify-center p-7 md:p-9">
                  <a
                    href="https://faucet.circle.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
                  >
                    💧 Claim Free USDC
                  </a>

                  <button
                    onClick={() => refetch()}
                    className="mt-3 flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-3.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    ↻ Refresh Balance
                  </button>
                </div>
              </div>

              {/* Connected wallet */}
              <div className="border-t border-zinc-800 px-7 py-5 md:px-9">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">
                      Connected Wallet
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-zinc-300">
                      {address}
                    </p>
                  </div>

                  <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-500 sm:block">
                    Arc Testnet
                  </div>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="mx-auto mt-6 grid max-w-4xl gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
              <div className="bg-zinc-950/70 p-6">
                <div className="mb-3 text-xl">💧</div>
                <h3 className="text-sm font-semibold text-white">
                  Free Testnet Tokens
                </h3>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Get free USDC to try out LinkPay on Arc Testnet.
                </p>
              </div>

              <div className="bg-zinc-950/70 p-6">
                <div className="mb-3 text-xl">⚡</div>
                <h3 className="text-sm font-semibold text-white">
                  Fast & Reliable
                </h3>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Tokens are sent directly to your connected wallet.
                </p>
              </div>

              <div className="bg-zinc-950/70 p-6">
                <div className="mb-3 text-xl">🛡️</div>
                <h3 className="text-sm font-semibold text-white">
                  For Testing Only
                </h3>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Testnet tokens have no real-world value.
                </p>
              </div>
            </div>

            {/* Important notice */}
            <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950/40 px-6 py-5">
              <div className="flex gap-3">
                <div className="mt-0.5 text-blue-400">ⓘ</div>

                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    Important
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    This faucet is intended for development and testing
                    purposes only. Testnet tokens have no real-world value.
                  </p>
                </div>
              </div>
            </div>

            {/* Existing instruction */}
            <p className="mx-auto mt-6 max-w-xl text-center text-xs text-zinc-600">
              Claim ke baad yahan aake Refresh Balance dabao. Network me Arc
              Testnet selected hona chahiye.
            </p>
          </>
        ) : (
          /* Not connected */
          <div className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950/60 p-10 text-center backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-2xl">
              💧
            </div>

            <h2 className="text-xl font-semibold">
              Connect your wallet
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Connect your wallet from the top-right corner to access the Arc
              Testnet faucet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}