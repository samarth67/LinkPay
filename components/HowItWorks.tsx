import { Link2, Share2, Wallet } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Connect your Arc wallet to get started.",
    icon: Wallet,
  },
  {
    number: "02",
    title: "Create Link",
    description: "Enter the payment details and create your request.",
    icon: Link2,
  },
  {
    number: "03",
    title: "Share & Get Paid",
    description: "Share the link and receive the payment on-chain.",
    icon: Share2,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-y border-white/[0.05] bg-[#070a10] px-6 py-24 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.05] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-400">
            How it works
          </div>

          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From link to payment
            <br />
            <span className="text-zinc-500">in three simple steps.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-500">
            No complicated payment flow. Create a request, share it and let
            the blockchain handle the rest.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-0">
          {/* Connecting line */}
          <div className="absolute left-[16.66%] right-[16.66%] top-8 hidden h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent md:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/20 bg-[#0b1018] text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.08)]">
                  <Icon size={21} strokeWidth={1.7} />
                </div>

                <span className="mt-5 text-[10px] font-medium tracking-[0.2em] text-blue-500">
                  {step.number}
                </span>

                <h3 className="mt-2 text-base font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-2 max-w-[230px] text-sm leading-6 text-zinc-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}