import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import {
  BarChart3,
  Link2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "Payment Links",
      description:
        "Create a payment request and share one simple link with anyone.",
      href: "/create-link",
      icon: Link2,
    },
    {
      title: "Wallet Integration",
      description:
        "Connect your wallet and receive payments directly on Arc Testnet.",
      href: "/dashboard",
      icon: Wallet,
    },
    {
      title: "On-chain Tracking",
      description:
        "Keep track of payment activity and completed transactions.",
      href: "/history",
      icon: BarChart3,
    },
    {
      title: "Arc Explorer",
      description:
        "View wallet activity and transactions directly through Arc.",
      href: "/explorer",
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="overflow-hidden bg-[#05070b] text-white">
      <Hero />

      {/* Feature section */}
      <section id="features" className="relative px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
              <span className="h-px w-8 bg-blue-500" />
              Everything you need
            </div>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple payments.
              <br />
              <span className="text-zinc-500">Built for on-chain.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
              LinkPay keeps the payment experience simple while your
              transactions remain on-chain and verifiable.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Built for Arc */}
      <section className="relative px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0d14]">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

            <div className="grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:p-16">
              {/* Visual */}
              <div className="relative flex min-h-[280px] items-center justify-center">
                <div className="absolute h-64 w-64 rounded-full border border-blue-500/10" />
                <div className="absolute h-48 w-48 rounded-full border border-blue-500/10" />
                <div className="absolute h-32 w-32 rounded-full border border-blue-500/10" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-blue-400/30 bg-[#0b1220] shadow-[0_0_60px_rgba(37,99,235,0.18)]">
                  <span className="text-5xl font-bold text-blue-500">A</span>
                </div>

                <div className="absolute left-8 top-8 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0d111a] text-blue-400">
                  <Link2 size={18} />
                </div>

                <div className="absolute bottom-10 right-10 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#0d111a] text-blue-400">
                  <Wallet size={18} />
                </div>
              </div>

              {/* Copy */}
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.06] px-3 py-1.5 text-xs font-medium text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  BUILT FOR ARC
                </div>

                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Payments made
                  <br />
                  <span className="text-blue-500">simple on Arc.</span>
                </h2>

                <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
                  LinkPay brings shareable payment requests, wallet
                  connectivity and on-chain transaction visibility together
                  in one simple experience.
                </p>

                <div className="mt-7 space-y-3">
                  {[
                    "USDC payments on Arc Testnet",
                    "Wallet-based payment flows",
                    "Shareable payment requests",
                    "Transparent on-chain activity",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQ />

      <Footer />
    </main>
  );
}