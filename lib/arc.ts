import { defineChain } from "@reown/appkit/networks";

/**
 * Arc Testnet chain definition per official Arc docs:
 * https://docs.arc.io/arc/references/connect-to-arc
 *
 * Must use defineChain from @reown/appkit/networks (not viem) so
 * caipNetworkId and chainNamespace are included for AppKit.
 */
export const arcTestnet = defineChain({
  id: 5042002,
  caipNetworkId: "eip155:5042002",
  chainNamespace: "eip155",
  name: "Arc Testnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.io"],
      webSocket: ["wss://rpc.testnet.arc.io"],
    },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

export const networks = [arcTestnet];
