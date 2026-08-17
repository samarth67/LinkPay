"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05070b]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5"
        >
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#080c14] shadow-[0_0_20px_rgba(37,99,235,0.08)] transition duration-300 group-hover:border-blue-500/30 group-hover:shadow-[0_0_25px_rgba(37,99,235,0.15)]">
            <Image
              src="/favicon.png"
              alt="LinkPay"
              width={36}
              height={36}
              priority
              className="h-9 w-9 object-cover"
            />
          </div>

          <span className="text-[20px] font-semibold tracking-[-0.03em] text-white">
            Link<span className="text-blue-500">Pay</span>
          </span>
        </Link>

        {/* Center Navigation */}
        {isHome ? (
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            <a
              href="#features"
              className="rounded-lg px-4 py-2 text-[13px] font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="rounded-lg px-4 py-2 text-[13px] font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              How it works
            </a>

            <a
              href="#faq"
              className="rounded-lg px-4 py-2 text-[13px] font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              FAQ
            </a>
          </div>
        ) : (
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
                isActive("/dashboard")
                  ? "bg-white/[0.06] text-white"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              Dashboard
            </Link>

            {/* Create */}
            <Link
              href="/create-link"
              className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
                isActive("/create-link")
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              Create
            </Link>

            {/* Swap */}
            <Link
              href="/swap"
              className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
                isActive("/swap")
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              Swap
            </Link>

            {/* Faucet */}
            <Link
              href="/faucet"
              className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
                isActive("/faucet")
                  ? "bg-white/[0.06] text-white"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              Faucet
            </Link>

            {/* History */}
            <Link
              href="/history"
              className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
                isActive("/history")
                  ? "bg-white/[0.06] text-white"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              History
            </Link>

            {/* Explorer */}
            <Link
              href="/explorer"
              className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition ${
                isActive("/explorer")
                  ? "bg-white/[0.06] text-white"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              Explorer
            </Link>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-2.5">
          {isHome && (
            <Link
              href="/dashboard"
              className="group hidden items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_25px_rgba(37,99,235,0.16)] transition-all duration-200 hover:border-blue-300/30 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.25)] sm:inline-flex"
            >
              Launch App

              <ArrowUpRight
                size={15}
                strokeWidth={2}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          )}

          {/* Wallet button only inside app */}
          <div className="rounded-xl">
            {!isHome && <appkit-button />}
          </div>
        </div>
      </div>
    </nav>
  );
}