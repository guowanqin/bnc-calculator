/**
 * 轻量双语文案字典（手写，无 i18n 框架）。
 * 数字、公式符号、币种与代币符号（BNB、BNCB、USDT）不翻译。
 */
export type Lang = "zh" | "en";

export const SITE_TITLE: Record<Lang, string> = {
  zh: "BNC 每股含币量计算器｜财库公司 BNB 持仓与 BNCB 池子年化收益率",
  en: "BNC Crypto-per-Share Calculator | Treasury Company BNB Holdings & BNCB Pool APY",
};

export const SITE_DESCRIPTION: Record<Lang, string> = {
  zh: "BNC 每股含币量计算器：实时查询 BNC 财库公司（BNB Standard Corp，Nasdaq: BNC）的每股含 BNB 数量（基本口径）与 mNAV，透视这家 BNB 财库、数字资产财库公司（DAT）的持仓；同时提供 BNCB 池子年化收益率查询（PancakeSwap V3 与 Uniswap V4），支持全区间与自定义价格区间换算、LP 收益测算。",
  en: "BNC crypto-per-share calculator: live BNB per share (basic basis) and mNAV for BNC, the BNB treasury company (BNB Standard Corp, Nasdaq: BNC) — a digital asset treasury company (DAT) — plus BNCB pool APY across PancakeSwap V3 and Uniswap V4, with full-range and custom-range conversion and an LP earnings estimator.",
};

export interface Dict {
  updatedAt: (time: string, source: string) => string;
  loadingMarket: string;
  refreshing: string;
  refresh: string;
  fetchError: string;
  heroTitle: string;
  heroSub: string;
  perShareUnit: string;
  perShareUsdSuffix: string;
  formulaLabel: string;
  formulaHoldings: (n: string) => string;
  formulaShares: (n: string) => string;
  statAdjNav: string;
  statMnav: string;
  discount: (p: string) => string;
  premium: (p: string) => string;
  statBncbPrice: string;
  statBnbPrice: string;
  editOpen: string;
  editClose: string;
  fieldHoldings: string;
  fieldShares: string;
  fieldLiabilities: string;
  editHint: string;
  poolsTitle: string;
  poolsSub: string;
  unifiedLabel: string;
  poolRangeLabel: string;
  fullRange: string;
  custom: string;
  downLabel: string;
  upLabel: string;
  feeRate: (p: number) => string;
  headlineFull: string;
  headlineRange: (down: number, up: number) => string;
  headlineAvgFallback: string;
  poolAvgLine: (pct: string) => string;
  vol24h: string;
  annualFees: string;
  bncbSpot: string;
  bandLabel: string;
  fullPriceRangeText: string;
  effLabel: string;
  baselineNote: string;
  warnOutOfRange: string;
  lpTitle: string;
  lpSelectPool: string;
  lpAmount: string;
  lpRangeUsed: string;
  lpRangeNote: string;
  lpDaily: string;
  lpYearly: string;
  lpShare: string;
  lpHint: string;
  loadingPools: string;
  faqTitle: string;
  footerSource: string;
  footerDisclaimer: string;
}

export const DICT: Record<Lang, Dict> = {
  zh: {
    updatedAt: (time, source) => `数据更新于 ${time} · 来源 ${source}`,
    loadingMarket: "正在拉取实时行情…",
    refreshing: "刷新中…",
    refresh: "刷新",
    fetchError: "行情拉取失败，请点刷新重试。",
    heroTitle: "BNC 每股含币量 · BNB Standard Corp",
    heroSub:
      "纳斯达克上市的 BNB 财库公司（Nasdaq: BNC），数字资产财库公司（DAT）代表之一 · 本页只按基本口径计算",
    perShareUnit: "BNB / 股",
    perShareUsdSuffix: " / 股（按 BNB 实时价）",
    formulaLabel: "每股含 BNB =",
    formulaHoldings: (n) => `持仓 ${n} BNB`,
    formulaShares: (n) => `基本股数 ${n} 股`,
    statAdjNav: "调整后 NAV / 股（扣负债）",
    statMnav: "mNAV（BNCB 价 ÷ 调整后 NAV）",
    discount: (p) => `折价 ${p}%`,
    premium: (p) => `溢价 ${p}%`,
    statBncbPrice: "BNCB 价格（代币化 BNC）",
    statBnbPrice: "BNB 价格",
    editOpen: "编辑披露数据（持仓 / 股数 / 负债）",
    editClose: "收起",
    fieldHoldings: "BNB 持仓（枚，公司披露）",
    fieldShares: "基本股数（股，公司披露）",
    fieldLiabilities: "负债（美元，调整后 NAV 扣除项）",
    editHint:
      "默认值：持仓 515,544 枚 BNB、基本股数 41,173,850 股（公司 2026 年披露）、负债约 $16.8M（2026-07-31 披露口径）。修改后立即按基本口径重算，并保存在本机浏览器。",
    poolsTitle: "BNCB 池子年化收益率",
    poolsSub:
      "默认显示「全区间在价内年化」：按链上当前有效流动性换算的实际年化，与卡片小字的「全池平均」不是一回事（全池平均 = 24h 成交量 × 费率 × 365 ÷ TVL）。先用下方统一设置给所有池子选区间，也可以逐张卡片单独改。",
    unifiedLabel: "统一区间设置（应用到所有池子）",
    poolRangeLabel: "本池价格区间（只改这个池）",
    fullRange: "全区间",
    custom: "自定义",
    downLabel: "下限：当前价下方",
    upLabel: "上限：当前价上方",
    feeRate: (p) => `费率 ${p}%`,
    headlineFull: "全区间在价内年化",
    headlineRange: (down, up) => `区间 −${down}% ~ +${up}% · 在价内年化`,
    headlineAvgFallback: "全池平均年化（链上读数暂不可用）",
    poolAvgLine: (pct) => `全池平均 ${pct}（对照口径，非全区间收益）`,
    vol24h: "24h 成交量",
    annualFees: "年化手续费",
    bncbSpot: "BNCB 现价",
    bandLabel: "价格带：",
    fullPriceRangeText: "全价格范围",
    effLabel: "资金效率",
    baselineNote: "基准",
    warnOutOfRange:
      "价格走出该区间后手续费收益归零；真实年化需乘上价格停留在区间内的时间占比。",
    lpTitle: "LP 收益测算",
    lpSelectPool: "选择池子",
    lpAmount: "投入金额（美元）",
    lpRangeUsed: "采用区间",
    lpRangeNote: "（跟随该池卡片当前的区间设置）",
    lpDaily: "估算日手续费收入",
    lpYearly: "估算年手续费收入",
    lpShare: "占池有效流动性份额",
    lpHint:
      "按价格停留在所选区间内估算，未计无常损失与滑点；价格出区间期间收入为 0，实际收益低于此估算。",
    loadingPools: "正在拉取池子数据…",
    faqTitle: "常见问题",
    footerSource:
      "数据来源：GeckoTerminal / DexScreener 行情与 BSC 链上读数（PancakeSwap V3 池合约、Uniswap V4 StateView），服务端缓存约 5 分钟。官方 BNCB 合约：0x4902C5ebc598265Ed2212b559B042De8a5Eeec3f，请警惕同名假币。",
    footerDisclaimer:
      "口径说明：区间年化为「价格停留在区间内」的理论值，未计无常损失；单日成交量年化波动极大。本页仅供信息参考，不构成投资建议。",
  },
  en: {
    updatedAt: (time, source) => `Updated ${time} · Source: ${source}`,
    loadingMarket: "Loading live market data…",
    refreshing: "Refreshing…",
    refresh: "Refresh",
    fetchError: "Failed to load market data. Please refresh and try again.",
    heroTitle: "BNC Crypto per Share · BNB Standard Corp",
    heroSub:
      "Nasdaq-listed BNB treasury company (Nasdaq: BNC), a digital asset treasury company (DAT) · Basic-basis figures only on this page",
    perShareUnit: "BNB / share",
    perShareUsdSuffix: " / share (at live BNB price)",
    formulaLabel: "BNB per share =",
    formulaHoldings: (n) => `Holdings ${n} BNB`,
    formulaShares: (n) => `Basic shares ${n}`,
    statAdjNav: "Adjusted NAV / share (net of liabilities)",
    statMnav: "mNAV (BNCB price ÷ adjusted NAV)",
    discount: (p) => `${p}% discount`,
    premium: (p) => `${p}% premium`,
    statBncbPrice: "BNCB price (tokenized BNC)",
    statBnbPrice: "BNB price",
    editOpen: "Edit disclosed figures (holdings / shares / liabilities)",
    editClose: "Collapse",
    fieldHoldings: "BNB holdings (company-disclosed)",
    fieldShares: "Basic shares outstanding (company-disclosed)",
    fieldLiabilities: "Liabilities (USD, deducted in adjusted NAV)",
    editHint:
      "Defaults: 515,544 BNB held, 41,173,850 basic shares (company disclosures, 2026), liabilities ≈ $16.8M (as of 2026-07-31). Edits recalculate on the basic basis immediately and are saved in this browser.",
    poolsTitle: "BNCB Pool APY",
    poolsSub:
      "Shown by default: the full-range in-range APY — the actual yield converted from current on-chain active liquidity. It is not the same as the 'pool average' in small print on each card (pool average = 24h volume × fee rate × 365 ÷ TVL). Set one range for all pools below, or adjust each card individually.",
    unifiedLabel: "Unified range (applies to all pools)",
    poolRangeLabel: "This pool's range (this pool only)",
    fullRange: "Full range",
    custom: "Custom",
    downLabel: "Lower: below current price",
    upLabel: "Upper: above current price",
    feeRate: (p) => `Fee ${p}%`,
    headlineFull: "Full-range in-range APY",
    headlineRange: (down, up) => `Range −${down}% ~ +${up}% · in-range APY`,
    headlineAvgFallback: "Pool-average APY (on-chain data unavailable)",
    poolAvgLine: (pct) => `Pool average ${pct} (reference only, not full-range yield)`,
    vol24h: "24h volume",
    annualFees: "Annualized fees",
    bncbSpot: "BNCB price",
    bandLabel: "Price band: ",
    fullPriceRangeText: "Full price range",
    effLabel: "Capital efficiency",
    baselineNote: "baseline",
    warnOutOfRange:
      "Once the price leaves this range, fee income drops to zero; your real APY must be multiplied by the share of time the price stays in range.",
    lpTitle: "LP Earnings Estimator",
    lpSelectPool: "Select pool",
    lpAmount: "Amount (USD)",
    lpRangeUsed: "Range applied",
    lpRangeNote: "(follows this pool card's current range setting)",
    lpDaily: "Est. daily fee income",
    lpYearly: "Est. annual fee income",
    lpShare: "Share of pool's active liquidity",
    lpHint:
      "Estimated assuming the price stays inside the selected range, before impermanent loss and slippage; income is zero while the price is out of range, so actual earnings will be lower.",
    loadingPools: "Loading pool data…",
    faqTitle: "FAQ",
    footerSource:
      "Data sources: GeckoTerminal / DexScreener market data and BSC on-chain reads (PancakeSwap V3 pool contracts, Uniswap V4 StateView), cached server-side for about 5 minutes. Official BNCB contract: 0x4902C5ebc598265Ed2212b559B042De8a5Eeec3f — beware of fake tokens with the same name.",
    footerDisclaimer:
      "Methodology: range APYs are theoretical values assuming the price stays in range, before impermanent loss; annualizing a single day's volume is highly volatile. For information only — not investment advice.",
  },
};
