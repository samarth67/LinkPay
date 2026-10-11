"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessContent() {
  const searchParams = useSearchParams();

  const amount = searchParams.get("amount");
  const tx = searchParams.get("tx");
  const receiver = searchParams.get("to");

  return (
    <div className="min-h-screen text-white">

      <div className="relative border-b border-zinc-800 px-8 py-10 overflow-hidden">

        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-green-500/10 blur-[100px] rounded-full" />

        <h1 className="relative text-3xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Payment Successful
        </h1>

        <p className="relative text-gray-400 mt-2">
          Your payment has been completed.
        </p>

      </div>

      <div className="max-w-2xl mx-auto p-8">

        <div className="rounded-3xl border border-green-500/20 bg-zinc-900/50 backdrop-blur p-8 text-center">

          <div className="w-24 h-24 rounded-full bg-green-500/20 mx-auto flex items-center justify-center text-5xl mb-6">
            ✅
          </div>

          <h2 className="text-3xl font-bold">
            Success
          </h2>

          <p className="text-gray-400 mt-2 mb-8">
            Your payment has been sent successfully.
          </p>

          <div className="space-y-6 text-left">

            <div>

              <p className="text-gray-400 text-sm">
                Amount
              </p>

              <h2 className="text-3xl font-bold text-green-400">
                {amount} USDC
              </h2>

            </div>

            <div>

              <p className="text-gray-400 text-sm">
                Receiver
              </p>

              <p className="font-mono break-all">
                {receiver}
              </p>

            </div>
                        <div>

              <p className="text-gray-400 text-sm">
                Transaction Hash
              </p>

              <p className="font-mono break-all text-blue-400">
                {tx || "Pending"}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">

            <a
              href={`https://explorer.arc.io/tx/${tx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-green-500 py-3 text-center hover:bg-green-500/10 transition"
            >
              View on ArcScan
            </a>

            <Link
              href="/dashboard"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 transition py-3 text-center font-semibold"
            >
              Back to Dashboard
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}