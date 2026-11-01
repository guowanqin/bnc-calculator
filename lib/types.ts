export interface PoolDef {
  key: string;
  dex: string;
  pair: string;
  quote: "USDT" | "WBNB";
  feePercent: number;
  /** V3: 池合约地址；V4: poolId（bytes32） */
  address: string;
  kind: "v3" | "v4";
}

export interface RangeBasis {
  /** 当前有效流动性 L_active（按 18 位小数折算到整代币尺度） */
  activeLiquidity: number;
  /** sqrt(当前价)，价格以计价代币（token1）计 */
  sqrtPrice: number;
  /** 当前价（token1 / BNCB） */
  priceToken1: number;
  /** 1 单位 token1 折合美元（USDT=1，WBNB=BNB 价） */
  token1Usd: number;
}

export interface PoolMarket extends PoolDef {
  tvlUsd: number | null;
  volume24hUsd: number | null;
  /** 年化手续费（美元）= 24h 成交量 × 费率 × 365 */
  annualFeesUsd: number | null;
  /** 全池平均 APR（小数，如 0.383 = 38.3%） */
  poolAverageApr: number | null;
  /** BNCB 现价（美元，由链上价格 × token1 美元价换算，与区间价格带同口径） */
  priceUsd: number | null;
  rangeBasis: RangeBasis | null;
  dataSource: string | null;
}

export interface MarketData {
  fetchedAt: string;
  source: string;
  bnbPriceUsd: number | null;
  bncbPriceUsd: number | null;
  pools: PoolMarket[];
}
