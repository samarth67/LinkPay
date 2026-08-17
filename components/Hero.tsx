import Link from "next/link";
import {
  ArrowRight,
  Check,
  Link2,
  Share2,
  Wallet,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.05]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/[0.07] blur-[130px]" />

        <div className="absolute left-[15%] top-[35%] h-px w-px bg-blue-400 shadow-[0_0_80px_30px_rgba(37,99,235,0.12)]" />

        <div className="absolute right-[15%] top-[45%] h-px w-px bg-blue-400 shadow-[0_0_80px_30px_rgba(37,99,235,0.10)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-20 pt-20 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-8 lg:pb-28 lg:pt-28">
        {/* Left */}
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs text-zinc-400 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            Live on Arc Testnet
          </div>

          <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-[68px]">
            Get Paid With
            <br />
            a Simple{" "}
            <span className="text-blue-500">Link.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            Create a payment link in seconds, share it anywhere, and receive
            USDC directly on Arc.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_35px_rgba(37,99,235,0.2)] transition hover:bg-blue-500"
            >
              Create Payment Link
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-500">
            <span className="flex items-center gap-2">
              <Check size={14} className="text-blue-500" />
              Wallet connected
            </span>

            <span className="flex items-center gap-2">
              <Check size={14} className="text-blue-500" />
              On-chain payments
            </span>

            <span className="flex items-center gap-2">
              <Check size={14} className="text-blue-500" />
              Arc Testnet
            </span>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
          <div className="absolute inset-0 rounded-full bg-blue-600/[0.06] blur-[80px]" />

          {/* Orbit */}
          <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/[0.08]" />
          <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/[0.07]" />

          {/* Main payment card */}
          <div className="relative mx-auto w-[78%] rounded-3xl border border-blue-500/20 bg-[#090d16]/95 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55),0_0_50px_rgba(37,99,235,0.08)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                  Payment request
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  USDC Payment
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                <Link2 size={19} />
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-white/[0.06] bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Payment link</span>
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              </div>

              <div className="mt-4 h-10 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 flex items-center">
                <span className="truncate text-xs text-zinc-400">
                  linkpay.xyz/pay/...
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-zinc-600">
                  Share anywhere
                </span>

                <span className="flex items-center gap-1.5 text-xs text-blue-400">
                  <Share2 size={12} />
                  Share Link
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-zinc-500" />
                <span className="text-xs text-zinc-500">
                  Connected wallet
                </span>
              </div>

              <span className="text-xs text-zinc-300">
                Arc Testnet
              </span>
            </div>
          </div>

          {/* Floating received card */}
          <div className="absolute -bottom-8 right-0 w-[46%] rounded-2xl border border-white/[0.09] bg-[#0b0f17]/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Check size={17} />
              </div>

              <div>
                <p className="text-xs font-medium text-white">
                  Payment received
                </p>
                <p className="mt-1 text-[10px] text-zinc-500">
                  Transaction completed
                </p>
              </div>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div className="h-full w-full rounded-full bg-blue-500" />
            </div>
          </div>

          {/* Small floating icon */}
          <div className="absolute -left-2 top-12 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-[#0b101a] text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.12)]">
            <Link2 size={19} />
          </div>
        </div>
      </div>
    </section>
  );
}