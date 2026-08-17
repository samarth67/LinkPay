"use client";

import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { arcTestnet, networks } from "@/lib/arc";
import { PROJECT_ID } from "@/lib/config";
import { wagmiAdapter } from "@/lib/wagmi";

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  networks: [arcTestnet],
  projectId: PROJECT_ID,
  defaultNetwork: arcTestnet,
  metadata: {
    name: "LinkPay",
    description: "Create and share USDC payment links built on Arc Network",
    url:
      process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"),
    icons: [
      process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/icon.png`
        : "http://localhost:3000/icon.png",
    ],
  },
  themeMode: "dark",
  features: {
    analytics: true,
  },
});

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
