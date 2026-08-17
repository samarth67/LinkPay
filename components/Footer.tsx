import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#040509]">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Link<span className="text-blue-500">Pay</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">
              Simple, shareable crypto payment links built on Arc.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Product
            </p>

            <div className="mt-4 space-y-3">
              <Link
                href="/dashboard"
                className="block text-sm text-zinc-600 transition hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/history"
                className="block text-sm text-zinc-600 transition hover:text-white"
              >
                History
              </Link>

              <Link
                href="/explorer"
                className="block text-sm text-zinc-600 transition hover:text-white"
              >
                Explorer
              </Link>

              <Link
                href="/faucet"
                className="block text-sm text-zinc-600 transition hover:text-white"
              >
                Faucet
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
              Resources
            </p>

            <div className="mt-4 space-y-3">
              <a
                href="#features"
                className="flex items-center gap-1 text-sm text-zinc-600 transition hover:text-white"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="flex items-center gap-1 text-sm text-zinc-600 transition hover:text-white"
              >
                How it works
              </a>

              <a
                href="#faq"
                className="flex items-center gap-1 text-sm text-zinc-600 transition hover:text-white"
              >
                FAQ
              </a>

              <a
                href="/dashboard"
                className="flex items-center gap-1 text-sm text-zinc-600 transition hover:text-white"
              >
                Launch App
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-zinc-700 sm:flex-row">
          <span>© 2026 LinkPay</span>
          <span>Built on Arc Network</span>
        </div>
      </div>
    </footer>
  );
}