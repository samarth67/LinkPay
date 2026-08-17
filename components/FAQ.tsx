"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is LinkPay?",
    answer:
      "LinkPay lets you create shareable crypto payment requests so someone can pay you through a simple link.",
  },
  {
    question: "What network does LinkPay use?",
    answer:
      "The current version of LinkPay runs on Arc Testnet for wallet connectivity and payment flows.",
  },
  {
    question: "How does a payment link work?",
    answer:
      "You create a payment request from the dashboard, share the generated link, and the payer can complete the payment through their connected wallet.",
  },
  {
    question: "Where can I track my payments?",
    answer:
      "Payment activity can be viewed through LinkPay's History page and on-chain activity can be checked through the Explorer.",
  },
  {
    question: "What asset does LinkPay currently use?",
    answer:
      "The current payment flow is built around USDC on Arc Testnet.",
  },
  {
    question: "Is LinkPay production-ready?",
    answer:
      "The current version is a working Arc Testnet build. Production features and deeper ecosystem integrations are planned as the project evolves.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
            FAQ
          </div>

          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>

          <p className="mt-4 text-sm text-zinc-500">
            A few things you might want to know about LinkPay.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#090c12]">
          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div
                key={faq.question}
                className="border-b border-white/[0.06] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition hover:bg-white/[0.02] sm:px-6"
                >
                  <span className="text-sm font-medium text-zinc-200">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] text-zinc-500 transition ${
                      isOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  >
                    <ChevronDown size={15} />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-6 text-zinc-500 sm:px-6">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}