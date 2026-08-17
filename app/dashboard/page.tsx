"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  Wallet,
  Zap,
  ArrowLeftRight,
} from "lucide-react";

import { useAccount, useBalance, useChainId } from "wagmi";
import { formatUnits } from "viem";

const ARC_CHAIN_ID = 5042002;
const ARC_SCAN = "https://testnet.arcscan.app";
const BLOCKSCOUT_API = "https://testnet.arcscan.app/api/v2";

type TokenBalance = {
  token: {
    address?: string;
    address_hash?: string;
    name?: string | null;
    symbol?: string | null;
    decimals?: string | number | null;
    icon_url?: string | null;
    exchange_rate?: string | number | null;
    type?: string | null;
  };
  value?: string | null;
  token_id?: string | null;
};

type TokenTransfer = {
  transaction_hash?: string;
  timestamp?: string;
  from?: {
    hash?: string;
  };
  to?: {
    hash?: string;
  };
  total?: {
    value?: string;
    decimals?: string | number;
  };
  token?: {
    address?: string;
    name?: string;
    symbol?: string;
    decimals?: string | number;
    icon_url?: string | null;
  };
  type?: string;
  method?: string | null;
};

type PortfolioToken = {
  address: string;
  name: string;
  symbol: string;
  balance: string;
  rawBalance: string;
  decimals: number;
  usdValue: number | null;
  iconUrl: string | null;
  isNative?: boolean;
};

type ActivityItem = {
  hash: string;
  timestamp: string;
  direction: "in" | "out" | "self" | "unknown";
  symbol: string;
  amount: string;
  address: string;
  tokenName: string;
  iconUrl: string | null;
};

function shortenAddress(address?: string, chars = 6) {
  if (!address) return "—";
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

function formatNumber(value: number, maximumFractionDigits = 4) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

function formatRelativeTime(timestamp?: string) {
  if (!timestamp) return "—";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "—";

  const diff = Date.now() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

function getTokenDecimals(token: TokenBalance["token"]) {
  const decimals = Number(token.decimals ?? 18);
  return Number.isFinite(decimals) ? decimals : 18;
}

function safeUsdValue(
  balance: number,
  exchangeRate: string | number | null | undefined
) {
  if (exchangeRate === null || exchangeRate === undefined) {
    return null;
  }

  const rate = Number(exchangeRate);

  if (!Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  return balance * rate;
}

function TokenIcon({
  token,
  size = 42,
}: {
  token: PortfolioToken;
  size?: number;
}) {
  if (token.iconUrl) {
    return (
      <img
        src={token.iconUrl}
        alt={token.symbol}
        width={size}
        height={size}
        className="rounded-full border border-white/[0.08] bg-black/30 object-cover"
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 font-semibold text-blue-400"
      style={{ width: size, height: size }}
    >
      {token.symbol.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    data: nativeBalance,
    refetch: refetchNativeBalance,
  } = useBalance({
    address,
  });

  const [tokens, setTokens] = useState<PortfolioToken[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");

  const [copiedAddress, setCopiedAddress] = useState(false);

  const nativeUsdcBalance = useMemo(() => {
    if (!nativeBalance) return 0;

    try {
      return Number(
        formatUnits(nativeBalance.value, nativeBalance.decimals)
      );
    } catch {
      return 0;
    }
  }, [nativeBalance]);

  const portfolioTokens = useMemo<PortfolioToken[]>(() => {
    const nativeToken: PortfolioToken = {
      address: "0x3600000000000000000000000000000000000000",
      name: "USD Coin",
      symbol: "USDC",
      balance: formatNumber(nativeUsdcBalance),
      rawBalance: nativeBalance?.value?.toString() ?? "0",
      decimals: nativeBalance?.decimals ?? 18,
      usdValue: nativeUsdcBalance,
      iconUrl: null,
      isNative: true,
    };

    return [nativeToken, ...tokens];
  }, [nativeBalance, nativeUsdcBalance, tokens]);

  const totalPortfolioValue = useMemo(() => {
    return portfolioTokens.reduce((total, token) => {
      if (token.usdValue === null) return total;
      return total + token.usdValue;
    }, 0);
  }, [portfolioTokens]);

  const assetsWithValue = useMemo(() => {
    return portfolioTokens.filter(
      (token) => token.usdValue !== null && token.usdValue > 0
    );
  }, [portfolioTokens]);

  const knownValuePercentage = useMemo(() => {
    if (totalPortfolioValue <= 0) return [];

    return assetsWithValue.map((token) => ({
      ...token,
      percentage: ((token.usdValue ?? 0) / totalPortfolioValue) * 100,
    }));
  }, [assetsWithValue, totalPortfolioValue]);

  async function loadPortfolio() {
    if (!address) {
      setTokens([]);
      return;
    }

    setLoadingPortfolio(true);
    setPortfolioError("");

    try {
      const allItems: TokenBalance[] = [];
      let nextPageParams: Record<
        string,
        string | number | null
      > | null = null;

      do {
        const params = new URLSearchParams();

        if (!nextPageParams) {
          params.set("type", "ERC-20");
        } else {
          Object.entries(nextPageParams).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              params.set(key, String(value));
            }
          });
        }

        const response = await fetch(
          `${BLOCKSCOUT_API}/addresses/${address}/tokens?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Token balance request failed: ${response.status}`
          );
        }

        const data = await response.json();

        const items: TokenBalance[] = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [];

        allItems.push(...items);

        nextPageParams = data?.next_page_params ?? null;
      } while (nextPageParams);

      const parsed: PortfolioToken[] = allItems
        .filter((item) => {
          const token = item?.token;

          const tokenAddress =
            token?.address_hash ?? token?.address;

          const tokenType = (
            token?.type ?? "ERC-20"
          ).toUpperCase();

          return (
            Boolean(tokenAddress) &&
            tokenType === "ERC-20"
          );
        })
        .map((item) => {
          const token = item.token;

          const tokenAddress =
            token.address_hash ??
            token.address ??
            "";

          const decimals = getTokenDecimals(token);

          let balanceNumber = 0;

          try {
            balanceNumber = Number(
              formatUnits(
                BigInt(item.value ?? "0"),
                decimals
              )
            );
          } catch {
            balanceNumber = 0;
          }

          return {
            address: tokenAddress,
            name:
              token.name ||
              token.symbol ||
              "Unknown Token",
            symbol:
              token.symbol ||
              "TOKEN",
            balance: formatNumber(balanceNumber),
            rawBalance: item.value ?? "0",
            decimals,
            usdValue: safeUsdValue(
              balanceNumber,
              token.exchange_rate ?? null
            ),
            iconUrl: token.icon_url ?? null,
            isNative: false,
          };
        })
        .filter((token) => {
          try {
            return BigInt(
  token.rawBalance || "0"
) > BigInt(0);
          } catch {
            return false;
          }
        })
        .sort((a, b) => {
          const aValue = a.usdValue ?? 0;
          const bValue = b.usdValue ?? 0;

          return bValue - aValue;
        });

      const nativeUsdcAddress =
        "0x3600000000000000000000000000000000000000";

      const uniqueTokens = Array.from(
        new Map(
          parsed
            .filter(
              (token) =>
                token.address.toLowerCase() !==
                nativeUsdcAddress
            )
            .map((token) => [
              token.address.toLowerCase(),
              token,
            ])
        ).values()
      );

      setTokens(uniqueTokens);
    } catch (error) {
      console.error(
        "Failed to load portfolio:",
        error
      );

      setPortfolioError(
        "Unable to load token balances from ArcScan right now."
      );

      setTokens([]);
    } finally {
      setLoadingPortfolio(false);
    }
  }

  async function loadActivity() {
    if (!address) {
      setActivities([]);
      return;
    }

    setLoadingActivity(true);

    const currentAddress =
      address.toLowerCase();

    function getHash(value: any) {
      return (
        value?.hash ??
        value?.address_hash ??
        value?.address ??
        ""
      );
    }

    async function fetchTokenTransferPages(
      query: string
    ) {
      const collected: TokenTransfer[] = [];

      let nextPageParams: Record<
        string,
        string | number | null
      > | null = null;

      let pageCount = 0;

      do {
        const params = new URLSearchParams(query);

        if (nextPageParams) {
          Object.entries(nextPageParams).forEach(
            ([key, value]) => {
              if (
                value !== null &&
                value !== undefined
              ) {
                params.set(
                  key,
                  String(value)
                );
              }
            }
          );
        }

        const response = await fetch(
          `${BLOCKSCOUT_API}/addresses/${address}/token-transfers?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Token activity request failed: ${response.status}`
          );
        }

        const data = await response.json();

        const items: TokenTransfer[] =
          Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [];

        collected.push(...items);

        nextPageParams =
          data?.next_page_params ?? null;

        pageCount += 1;
      } while (
        nextPageParams &&
        pageCount < 5
      );

      return collected;
    }

    function normalizeTransfers(
      items: TokenTransfer[]
    ) {
      return items
        .filter(
          (item) =>
            item?.transaction_hash
        )
        .map(
          (item): ActivityItem => {
            const from =
              getHash(item.from).toLowerCase();

            const to =
              getHash(item.to).toLowerCase();

            let direction:
              ActivityItem["direction"] =
              "unknown";

            if (
              to === currentAddress &&
              from !== currentAddress
            ) {
              direction = "in";
            } else if (
              from === currentAddress &&
              to !== currentAddress
            ) {
              direction = "out";
            } else if (
              from === currentAddress &&
              to === currentAddress
            ) {
              direction = "self";
            }

            const decimals = Number(
              item.total?.decimals ??
                item.token?.decimals ??
                18
            );

            let amount = "0";

            try {
              amount = formatNumber(
                Number(
                  formatUnits(
                    BigInt(
                      item.total?.value ??
                        "0"
                    ),
                    Number.isFinite(
                      decimals
                    )
                      ? decimals
                      : 18
                  )
                )
              );
            } catch {
              amount = "0";
            }

            return {
              hash:
                item.transaction_hash!,
              timestamp:
                item.timestamp ?? "",
              direction,
              symbol:
                item.token?.symbol ??
                "TOKEN",
              amount,
              address:
                direction === "in"
                  ? from
                  : direction === "out"
                    ? to
                    : to || from,
              tokenName:
                item.token?.name ??
                item.token?.symbol ??
                "Token",
              iconUrl:
                item.token?.icon_url ??
                null,
            };
          }
        );
    }

    try {
      let transferItems: TokenTransfer[] = [];

      try {
        transferItems =
          await fetchTokenTransferPages(
            "type=ERC-20"
          );
      } catch (primaryError) {
        console.warn(
          "Primary token activity request failed:",
          primaryError
        );
      }

      if (
        transferItems.length === 0
      ) {
        try {
          transferItems =
            await fetchTokenTransferPages(
              "type=ERC-20&filter=to%20%7C%20from"
            );
        } catch (filteredError) {
          console.warn(
            "Filtered token activity request failed:",
            filteredError
          );
        }
      }

      let normalized =
        normalizeTransfers(
          transferItems
        );

      if (
        normalized.length === 0
      ) {
        try {
          let txResponse =
            await fetch(
              `${BLOCKSCOUT_API}/addresses/${address}/transactions`,
              {
                cache: "no-store",
              }
            );

          if (!txResponse.ok) {
            txResponse =
              await fetch(
                `${BLOCKSCOUT_API}/addresses/${address}/transactions?filter=to%20%7C%20from`,
                {
                  cache: "no-store",
                }
              );
          }

          if (txResponse.ok) {
            const txData =
              await txResponse.json();

            const transactions =
              Array.isArray(
                txData?.items
              )
                ? txData.items.slice(
                    0,
                    12
                  )
                : [];

            const transferResults =
              await Promise.all(
                transactions
                  .map(
                    (tx: any) =>
                      tx?.hash ??
                      tx?.transaction_hash
                  )
                  .filter(Boolean)
                  .slice(0, 12)
                  .map(
                    async (
                      hash: string
                    ) => {
                      try {
                        const response =
                          await fetch(
                            `${BLOCKSCOUT_API}/transactions/${hash}/token-transfers`,
                            {
                              cache:
                                "no-store",
                            }
                          );

                        if (
                          !response.ok
                        ) {
                          return [];
                        }

                        const data =
                          await response.json();

                        return Array.isArray(
                          data?.items
                        )
                          ? data.items
                          : [];
                      } catch {
                        return [];
                      }
                    }
                  )
              );

            transferItems =
              transferResults.flat();

            normalized =
              normalizeTransfers(
                transferItems
              );
          }
        } catch (fallbackError) {
          console.warn(
            "Transaction activity fallback failed:",
            fallbackError
          );
        }
      }

      const unique =
        Array.from(
          new Map(
            normalized
              .sort(
                (a, b) =>
                  new Date(
                    b.timestamp
                  ).getTime() -
                  new Date(
                    a.timestamp
                  ).getTime()
              )
              .map((item) => [
                `${item.hash}-${item.symbol}-${item.amount}-${item.direction}`,
                item,
              ])
          ).values()
        );

      setActivities(
        unique.slice(0, 8)
      );
    } catch (error) {
      console.error(
        "Failed to load activity:",
        error
      );

      setActivities([]);
    } finally {
      setLoadingActivity(false);
    }
  }

  async function refreshDashboard() {
    await Promise.all([
      loadPortfolio(),
      loadActivity(),
      refetchNativeBalance(),
    ]);
  }

  useEffect(() => {
    if (
      !isConnected ||
      !address
    ) {
      setTokens([]);
      setActivities([]);
      return;
    }

    loadPortfolio();
    loadActivity();

    const interval =
      setInterval(() => {
        loadPortfolio();
        loadActivity();
        refetchNativeBalance();
      }, 30000);

    return () =>
      clearInterval(interval);
  }, [
    address,
    isConnected,
  ]);

  async function copyAddress() {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(
        address
      );

      setCopiedAddress(true);

      setTimeout(
        () =>
          setCopiedAddress(false),
        1800
      );
    } catch {
      alert("Unable to copy");
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-[calc(100vh-72px)] px-6 py-20 text-white">
        <div className="mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/[0.07] bg-[#080c14]/90 p-10 text-center shadow-2xl">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Wallet size={28} />
              </div>

              <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
                LinkPay Portfolio
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Connect your wallet
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
                Connect your Arc Testnet wallet
                to view your real balances,
                tokens and on-chain activity.
              </p>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                No portfolio data is shown until
                a wallet is connected.
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const networkIsCorrect =
    chainId === ARC_CHAIN_ID;

  return (
    <main className="min-h-[calc(100vh-72px)] overflow-hidden text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[18%] top-20 h-[500px] w-[500px] rounded-full bg-blue-600/[0.045] blur-[130px]" />

        <div className="absolute right-[5%] top-[35%] h-[450px] w-[450px] rounded-full bg-indigo-600/[0.035] blur-[130px]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />

              <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Portfolio
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Your complete Arc Testnet wallet
              overview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs ${
                networkIsCorrect
                  ? "border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400"
                  : "border-amber-500/15 bg-amber-500/[0.06] text-amber-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  networkIsCorrect
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />

              {networkIsCorrect
                ? "Arc Testnet"
                : `Chain ${chainId}`}
            </div>

            <button
              onClick={refreshDashboard}
              disabled={
                loadingPortfolio ||
                loadingActivity
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-white/[0.14] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  loadingPortfolio ||
                  loadingActivity
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>

        {/* Overview cards */}
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_0.8fr_0.8fr]">
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-600/[0.10] via-[#0a101d] to-[#080c14] p-6">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/10 blur-[55px]" />

            <div className="relative flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-blue-300/70">
                  Total Portfolio Value
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <h2 className="text-4xl font-semibold tracking-tight text-white">
                    $
                    {formatNumber(
                      totalPortfolioValue,
                      2
                    )}
                  </h2>
                </div>

                <p className="mt-2 text-sm text-zinc-500">
                  Based only on assets with an
                  available explorer exchange rate.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <CircleDollarSign size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#090d15]/80 p-6">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              Total Assets
            </p>

            <p className="mt-3 text-3xl font-semibold text-white">
              {portfolioTokens.length}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              {portfolioTokens.length === 1
                ? "Token"
                : "Tokens"}{" "}
              with non-zero balance
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#090d15]/80 p-6">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              Wallet
            </p>

            <div className="mt-3 flex items-center gap-2">
              <p className="truncate font-mono text-sm text-zinc-200">
                {shortenAddress(
                  address,
                  8
                )}
              </p>

              <button
                onClick={copyAddress}
                className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                title="Copy wallet address"
              >
                {copiedAddress ? (
                  <Check
                    size={14}
                    className="text-emerald-400"
                  />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  networkIsCorrect
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />

              <span className="text-zinc-500">
                {networkIsCorrect
                  ? "Connected"
                  : "Wrong network"}
              </span>
            </div>
          </div>
        </div>

        {/* Middle section */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr_0.95fr]">
          {/* Allocation */}
          <section className="rounded-2xl border border-white/[0.07] bg-[#090d15]/80 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Portfolio Allocation
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Distribution of assets with known
                  value.
                </p>
              </div>
            </div>

            {portfolioTokens.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center text-center">
                <div>
                  <p className="text-sm text-zinc-400">
                    No assets found.
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Your connected wallet has no
                    non-zero token balances.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
                <div
                  className="relative flex h-52 w-52 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      knownValuePercentage.length >
                      0
                        ? `conic-gradient(${knownValuePercentage
                            .map(
                              (
                                token,
                                index
                              ) => {
                                const start =
                                  knownValuePercentage
                                    .slice(
                                      0,
                                      index
                                    )
                                    .reduce(
                                      (
                                        sum,
                                        item
                                      ) =>
                                        sum +
                                        item.percentage,
                                      0
                                    );

                                const end =
                                  start +
                                  token.percentage;

                                const colors =
                                  [
                                    "#2563eb",
                                    "#8b5cf6",
                                    "#06b6d4",
                                    "#10b981",
                                    "#f59e0b",
                                    "#ec4899",
                                    "#ef4444",
                                    "#14b8a6",
                                  ];

                                return `${colors[index % colors.length]} ${start}% ${end}%`;
                              }
                            )
                            .join(", ")})`
                        : "conic-gradient(#27272a 0% 100%)",
                  }}
                >
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/[0.06] bg-[#080c14]">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                      Total
                    </span>

                    <span className="mt-1 text-xl font-semibold text-white">
                      $
                      {formatNumber(
                        totalPortfolioValue,
                        2
                      )}
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  {portfolioTokens.map(
                    (
                      token,
                      index
                    ) => {
                      const colors = [
                        "#2563eb",
                        "#8b5cf6",
                        "#06b6d4",
                        "#10b981",
                        "#f59e0b",
                        "#ec4899",
                        "#ef4444",
                        "#14b8a6",
                      ];

                      const percentage =
                        token.usdValue !==
                          null &&
                        token.usdValue > 0 &&
                        totalPortfolioValue >
                          0
                          ? (token.usdValue /
                              totalPortfolioValue) *
                            100
                          : null;

                      return (
                        <div
                          key={`${token.address}-${token.symbol}`}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                percentage ===
                                null
                                  ? "border border-zinc-600 bg-transparent"
                                  : ""
                              }`}
                              style={
                                percentage !==
                                null
                                  ? {
                                      backgroundColor:
                                        colors[
                                          index %
                                            colors.length
                                        ],
                                    }
                                  : undefined
                              }
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm text-zinc-300">
                                {
                                  token.symbol
                                }
                              </p>

                              <p className="truncate text-[10px] text-zinc-600">
                                {
                                  token.balance
                                }{" "}
                                {
                                  token.symbol
                                }
                              </p>
                            </div>
                          </div>

                          {percentage !==
                          null ? (
                            <span className="shrink-0 text-sm text-zinc-500">
                              {percentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          ) : (
                            <span className="shrink-0 text-[11px] text-zinc-600">
                              Price unavailable
                            </span>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section className="rounded-2xl border border-white/[0.07] bg-[#090d15]/80 p-6">
            <h2 className="text-lg font-semibold text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Core LinkPay actions.
            </p>

            <div className="mt-6 space-y-3">
              {/* CREATE LINK */}
              <Link
                href="/create-link"
                className="group flex w-full items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/[0.07] p-4 text-left transition hover:border-blue-500/40 hover:bg-blue-500/[0.11]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Link2 size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      Create Payment Link
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Create and share a payment request
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                />
              </Link>

              {/* SWAP */}
              <Link
                href="/swap"
                className="group flex w-full items-center justify-between rounded-xl border border-purple-500/15 bg-purple-500/[0.04] p-4 text-left transition hover:border-purple-500/30 hover:bg-purple-500/[0.08]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <ArrowLeftRight size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        Swap Assets
                      </p>

                      <span className="rounded-md border border-purple-500/15 bg-purple-500/[0.06] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-purple-400">
                        New
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-zinc-500">
                      Exchange supported assets on Arc
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-purple-400"
                />
              </Link>

              {/* FAUCET */}
              <Link
                href="/faucet"
                className="group flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-blue-500/25 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Zap size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      Get Faucet USDC
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      Open the Arc Testnet faucet
                    </p>
                  </div>
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                />
              </Link>
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-2xl border border-white/[0.07] bg-[#090d15]/80 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Recent Activity
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Real on-chain token transfers.
                </p>
              </div>

              <Link
                href="/history"
                className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
              >
                View All
              </Link>
            </div>

            <div className="mt-5 divide-y divide-white/[0.05]">
              {loadingActivity ? (
                <div className="flex items-center justify-center py-10 text-zinc-500">
                  <Loader2
                    size={18}
                    className="mr-2 animate-spin"
                  />
                  Loading activity...
                </div>
              ) : activities.length ===
                0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-zinc-400">
                    No token transfers found.
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Activity will appear after
                    on-chain transfers.
                  </p>
                </div>
              ) : (
                activities
                  .slice(0, 5)
                  .map(
                    (activity) => {
                      const isIncoming =
                        activity.direction ===
                        "in";

                      return (
                        <a
                          key={`${activity.hash}-${activity.timestamp}`}
                          href={`${ARC_SCAN}/tx/${activity.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 py-4 transition hover:bg-white/[0.015]"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isIncoming
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {isIncoming ? (
                              <ArrowDownLeft
                                size={17}
                              />
                            ) : (
                              <ArrowUpRight
                                size={17}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-white">
                                {isIncoming
                                  ? "Received"
                                  : "Sent"}
                              </p>

                              <p
                                className={`text-sm font-medium ${
                                  isIncoming
                                    ? "text-emerald-400"
                                    : "text-zinc-300"
                                }`}
                              >
                                {isIncoming
                                  ? "+"
                                  : "-"}
                                {
                                  activity.amount
                                }{" "}
                                {
                                  activity.symbol
                                }
                              </p>
                            </div>

                            <div className="mt-1 flex items-center justify-between gap-2">
                              <p className="truncate text-[11px] text-zinc-600">
                                {shortenAddress(
                                  activity.address
                                )}
                              </p>

                              <p className="shrink-0 text-[11px] text-zinc-600">
                                {formatRelativeTime(
                                  activity.timestamp
                                )}
                              </p>
                            </div>
                          </div>
                        </a>
                      );
                    }
                  )
              )}
            </div>
          </section>
        </div>

        {/* Assets */}
        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-[#090d15]/80">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Your Assets
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Assets currently held by your
                connected wallet.
              </p>
            </div>

            <a
              href={`${ARC_SCAN}/address/${address}?tab=tokens`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 transition hover:text-blue-300"
            >
              View on ArcScan
              <ExternalLink size={13} />
            </a>
          </div>

          {loadingPortfolio ? (
            <div className="flex min-h-[180px] items-center justify-center text-sm text-zinc-500">
              <Loader2
                size={18}
                className="mr-2 animate-spin"
              />
              Loading real wallet assets...
            </div>
          ) : portfolioError ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-400">
                {portfolioError}
              </p>

              <button
                onClick={loadPortfolio}
                className="mt-4 rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-zinc-300 transition hover:bg-white/[0.05]"
              >
                Try Again
              </button>
            </div>
          ) : portfolioTokens.length ===
            0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-zinc-400">
                No assets found in this wallet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.4fr_1fr_0.8fr_1fr_40px] gap-4 border-b border-white/[0.05] px-6 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-600">
                  <span>Asset</span>
                  <span>Balance</span>
                  <span>Value</span>
                  <span>Contract</span>
                  <span />
                </div>

                <div className="divide-y divide-white/[0.05]">
                  {portfolioTokens.map(
                    (token) => (
                      <div
                        key={`${token.address}-${token.symbol}`}
                        className="grid grid-cols-[1.4fr_1fr_0.8fr_1fr_40px] items-center gap-4 px-6 py-4 transition hover:bg-white/[0.015]"
                      >
                        <div className="flex items-center gap-3">
                          <TokenIcon
                            token={token}
                            size={40}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {
                                token.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-zinc-600">
                              {
                                token.symbol
                              }
                              {token.isNative
                                ? " • Native"
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-zinc-200">
                            {
                              token.balance
                            }{" "}
                            {
                              token.symbol
                            }
                          </p>
                        </div>

                        <div>
                          {token.usdValue !==
                          null ? (
                            <p className="text-sm text-zinc-200">
                              $
                              {formatNumber(
                                token.usdValue,
                                2
                              )}
                            </p>
                          ) : (
                            <p className="text-sm text-zinc-600">
                              —
                            </p>
                          )}
                        </div>

                        <div className="min-w-0">
                          {token.isNative ? (
                            <span className="text-xs text-zinc-600">
                              Native asset
                            </span>
                          ) : (
                            <a
                              href={`${ARC_SCAN}/address/${token.address}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs text-zinc-500 transition hover:text-blue-400"
                            >
                              {shortenAddress(
                                token.address,
                                8
                              )}
                            </a>
                          )}
                        </div>

                        <div>
                          {!token.isNative && (
                            <a
                              href={`${ARC_SCAN}/address/${token.address}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/[0.05] hover:text-blue-400"
                              title="Open contract on ArcScan"
                            >
                              <ExternalLink
                                size={14}
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}