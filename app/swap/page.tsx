"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  Clock3,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

export default function SwapPage() {
  return (
    <main className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-[#05070b] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[12%] h-[420px] w-[420px] rounded-full bg-blue-600/[0.07] blur-[130px]" />
        <div className="absolute right-[12%] top-[42%] h-[380px] w-[380px] rounded-full bg-violet-600/[0.055] blur-[130px]" />
        <div className="absolute bottom-[-180px] left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/[0.035] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-68px)] max-w-5xl items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-2xl">
          {/* Back */}
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-500 transition hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-zinc-200"
            >
              <span>←</span>
              Back to Dashboard
            </Link>
          </div>

          {/* Main card */}
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#090d15]/95 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            {/* Top glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[90px]" />

            <div className="relative px-6 py-10 text-center sm:px-10 sm:py-14">
              {/* Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/[0.08] text-blue-400 shadow-[0_0_40px_rgba(37,99,235,0.10)]">
                <ArrowLeftRight size={28} />
              </div>

              {/* Label */}
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.05] px-3 py-1.5">
                <Sparkles size={12} className="text-blue-400" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  LinkPay Swap
                </span>
              </div>

              {/* Heading */}
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Swap is coming soon.
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-500">
                A simple and seamless way to swap supported assets directly
                through LinkPay. We&apos;re building the experience carefully
                before opening it to everyone.
              </p>

              {/* Status */}
              <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/[0.05] px-4 py-2">
                <Clock3 size={14} className="text-amber-400" />

                <span className="text-xs font-medium text-amber-300">
                  Coming Soon
                </span>
              </div>

              {/* Feature preview */}
              <div className="mx-auto mt-10 grid max-w-xl gap-3 text-left sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/[0.08] text-blue-400">
                    <ArrowLeftRight size={17} />
                  </div>

                  <p className="mt-4 text-sm font-medium text-zinc-200">
                    Asset Swaps
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                    Swap supported assets from one place.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/[0.08] text-emerald-400">
                    <ShieldCheck size={17} />
                  </div>

                  <p className="mt-4 text-sm font-medium text-zinc-200">
                    Non-Custodial
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                    Your wallet remains in control.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/[0.08] text-violet-400">
                    <Wallet size={17} />
                  </div>

                  <p className="mt-4 text-sm font-medium text-zinc-200">
                    Arc Native
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                    Designed for the Arc ecosystem.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-10 border-t border-white/[0.06] pt-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-700">
                  LinkPay • Arc Testnet
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Swap functionality will be available in a future release.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}