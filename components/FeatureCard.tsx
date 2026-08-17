import Link from "next/link";
import { ArrowUpRight, LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export default function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
}: Props) {
  return (
    <Link href={href} className="group">
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#090c12] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/25 hover:bg-[#0b1018]">
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/[0.04] blur-3xl transition group-hover:bg-blue-500/[0.09]" />

        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/[0.07] text-blue-400">
          <Icon size={18} strokeWidth={1.8} />
        </div>

        <div className="relative mt-7">
          <h3 className="text-base font-semibold text-white">
            {title}
          </h3>

          <p className="mt-3 min-h-[72px] text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>

        <div className="relative mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <span className="text-xs font-medium text-zinc-500 transition group-hover:text-blue-400">
            Explore
          </span>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-zinc-500 transition group-hover:border-blue-500/20 group-hover:bg-blue-500/10 group-hover:text-blue-400">
            <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}