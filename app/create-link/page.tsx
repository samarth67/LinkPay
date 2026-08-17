"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Link2,
  Loader2,
  Wallet,
} from "lucide-react";
import { useAccount } from "wagmi";

import { createPaymentLink } from "@/lib/payment";

type PaymentToken = {
  symbol: string;
  name: string;
  description: string;
  available: boolean;
};

const PAYMENT_TOKENS: PaymentToken[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    description: "USD Coin",
    available: true,
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    description: "Euro Coin",
    available: false,
  },
  {
    symbol: "ARC",
    name: "Arc",
    description: "Arc native asset",
    available: false,
  },
  {
    symbol: "LINK",
    name: "LinkPay Token",
    description: "LinkPay ecosystem token",
    available: false,
  },
];

export default function CreateLinkPage() {
  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [selectedToken, setSelectedToken] = useState("USDC");
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);

  const tokenDropdownRef = useRef<HTMLDivElement>(null);

  const activeToken =
    PAYMENT_TOKENS.find((token) => token.symbol === selectedToken) ??
    PAYMENT_TOKENS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tokenDropdownRef.current &&
        !tokenDropdownRef.current.contains(event.target as Node)
      ) {
        setTokenDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function generateLink() {
    if (!address) {
      alert("Connect your wallet first");
      return;
    }

    if (!activeToken.available) {
      alert(`${activeToken.symbol} payment links are coming soon.`);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setCreatingPayment(true);

    try {
      const id = await createPaymentLink({
        wallet: address,
        amount,
        note,
      });

      setPaymentLink(`${window.location.origin}/pay/${id}`);
    } catch (error) {
      console.error("Failed to create payment link:", error);
      alert("Failed to create payment link");
    } finally {
      setCreatingPayment(false);
    }
  }

  async function copyLink() {
    if (!paymentLink) return;

    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopiedLink(true);

      setTimeout(() => {
        setCopiedLink(false);
      }, 1800);
    } catch {
      alert("Unable to copy payment link");
    }
  }

  function resetForm() {
    setAmount("");
    setNote("");
    setPaymentLink("");
    setCopiedLink(false);
  }

  function selectToken(token: PaymentToken) {
    if (!token.available) {
      return;
    }

    setSelectedToken(token.symbol);
    setTokenDropdownOpen(false);
  }

  if (!isConnected) {
    return (
      <main className="min-h-[calc(100vh-68px)] bg-[#05070b] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto flex min-h-[65vh] max-w-3xl items-center justify-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.07] bg-[#090d15] p-8 text-center">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[80px]" />

            <div className="relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Wallet size={22} />
              </div>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                LinkPay
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Connect your wallet
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Connect your Arc Testnet wallet to create a real payment link.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Your wallet controls the payment destination.
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-68px)] overflow-hidden bg-[#05070b] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[20%] top-[15%] h-[420px] w-[420px] rounded-full bg-blue-600/[0.045] blur-[120px]" />
        <div className="absolute right-[10%] top-[45%] h-[360px] w-[360px] rounded-full bg-indigo-600/[0.035] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Payment Product
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Create Payment Link
            </h1>

            <p className="mt-1.5 text-sm text-zinc-500">
              Request crypto with a secure, shareable payment link.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Main product */}
        <section className="overflow-visible rounded-2xl border border-white/[0.08] bg-[#090d15] shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left */}
            <div className="border-b border-white/[0.06] p-5 sm:p-7 lg:border-b-0 lg:border-r">
              {/* Connected wallet */}
              <div className="mb-6 flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Wallet size={15} />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                      Receiving wallet
                    </p>

                    <p className="mt-0.5 font-mono text-xs text-zinc-300">
                      {address
                        ? `${address.slice(0, 8)}...${address.slice(-6)}`
                        : "—"}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Amount
                </label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="h-14 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 pr-28 text-xl font-medium text-white outline-none transition placeholder:text-zinc-700 focus:border-blue-500/50 focus:bg-black/40"
                  />

                  {/* Token selector */}
                  <div
                    ref={tokenDropdownRef}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setTokenDropdownOpen((current) => !current)
                      }
                      className="flex items-center gap-2 rounded-lg border border-blue-500/15 bg-blue-500/[0.06] px-2.5 py-2 transition hover:border-blue-500/30 hover:bg-blue-500/[0.10]"
                    >
                      <span className="text-xs font-semibold text-blue-400">
                        {activeToken.symbol}
                      </span>

                      <ChevronDown
                        size={13}
                        className={`text-blue-400 transition-transform ${
                          tokenDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {tokenDropdownOpen && (
                      <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0b1019] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                        {PAYMENT_TOKENS.map((token) => {
                          const isSelected =
                            token.symbol === activeToken.symbol;

                          return (
                            <button
                              key={token.symbol}
                              type="button"
                              disabled={!token.available}
                              onClick={() => selectToken(token)}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                                token.available
                                  ? "cursor-pointer hover:bg-white/[0.05]"
                                  : "cursor-not-allowed opacity-60"
                              }`}
                            >
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                                  token.available
                                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                    : "border-white/[0.06] bg-white/[0.025] text-zinc-500"
                                }`}
                              >
                                <span className="text-[10px] font-bold">
                                  {token.symbol === "LINK"
                                    ? "L"
                                    : token.symbol.slice(0, 1)}
                                </span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-medium text-white">
                                    {token.symbol}
                                  </p>

                                  {token.available ? (
                                    isSelected ? (
                                      <Check
                                        size={13}
                                        className="text-blue-400"
                                      />
                                    ) : null
                                  ) : (
                                    <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.08em] text-zinc-600">
                                      Coming soon
                                    </span>
                                  )}
                                </div>

                                <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                                  {token.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Supported token hint */}
                <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-700">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  USDC payments are currently supported
                </div>
              </div>

              {/* Note */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Payment note
                  <span className="ml-1 text-zinc-700">(optional)</span>
                </label>

                <input
                  type="text"
                  placeholder="What is this payment for?"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={120}
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-blue-500/50 focus:bg-black/40"
                />
              </div>

              {/* Create button */}
              <button
                onClick={generateLink}
                disabled={creatingPayment || !activeToken.available}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(37,99,235,0.14)] transition hover:bg-blue-500 hover:shadow-[0_0_35px_rgba(37,99,235,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingPayment ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating payment link...
                  </>
                ) : (
                  <>
                    Create Payment Link
                    <ArrowUpRight size={16} />
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-[10px] text-zinc-700">
                Payment requests are created for your connected Arc Testnet
                wallet.
              </p>
            </div>

            {/* Right - Preview */}
            <div className="bg-[#070a10] p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                    Live Preview
                  </p>

                  <h2 className="mt-1 text-sm font-semibold text-white">
                    Payment request
                  </h2>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-zinc-600">
                  Arc Testnet
                </div>
              </div>

              {!paymentLink ? (
                <div className="flex min-h-[330px] items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-black/20 px-6 text-center">
                  <div>
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/[0.06] text-blue-400">
                      <Link2 size={19} />
                    </div>

                    <p className="mt-4 text-sm font-medium text-zinc-300">
                      Your payment link will appear here
                    </p>

                    <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-zinc-600">
                      Enter an amount and create the request to generate a
                      shareable link and QR code.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.025] p-4">
                  {/* Success */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Check size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Payment link ready
                      </p>

                      <p className="text-[11px] text-zinc-600">
                        Share it with your payer.
                      </p>
                    </div>
                  </div>

                  {/* Amount preview */}
                  <div className="mt-5 rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                      Amount
                    </p>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-white">
                        {amount || "0.00"}
                      </span>

                      <span className="text-xs font-medium text-blue-400">
                        {activeToken.symbol}
                      </span>
                    </div>

                    {note && (
                      <p className="mt-2 truncate text-xs text-zinc-500">
                        {note}
                      </p>
                    )}
                  </div>

                  {/* QR */}
                  <div className="mt-4 flex justify-center">
                    <div className="rounded-xl bg-white p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                      <QRCode value={paymentLink} size={145} />
                    </div>
                  </div>

                  {/* Link */}
                  <div className="mt-4 rounded-lg border border-white/[0.07] bg-black/30 p-3">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.1em] text-zinc-700">
                      Payment URL
                    </p>

                    <p className="break-all font-mono text-[11px] leading-5 text-blue-400">
                      {paymentLink}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                    <button
                      onClick={copyLink}
                      className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] text-xs font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      {copiedLink ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy Link
                        </>
                      )}
                    </button>

                    <a
                      href={paymentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 items-center justify-center rounded-lg border border-blue-500/15 bg-blue-500/[0.06] px-3 text-blue-400 transition hover:bg-blue-500/[0.1]"
                      title="Open payment page"
                    >
                      <ArrowUpRight size={15} />
                    </a>
                  </div>

                  {/* New link */}
                  <button
                    onClick={resetForm}
                    className="mt-3 w-full text-center text-[11px] text-zinc-600 transition hover:text-zinc-300"
                  >
                    Create another payment link
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Small trust row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-zinc-700">
          <span>Real on-chain payment request</span>
          <span className="h-1 w-1 rounded-full bg-zinc-800" />
          <span>Non-custodial</span>
          <span className="h-1 w-1 rounded-full bg-zinc-800" />
          <span>Powered by Arc Testnet</span>
        </div>
      </div>
    </main>
  );
}