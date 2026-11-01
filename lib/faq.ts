export interface FaqItem {
  q: string;
  a: string;
}

/** 页面可见的常见问题区块与 JSON-LD（FAQPage）共用文案，中英各一份，保持一致 */
export const FAQ_ITEMS_ZH: FaqItem[] = [
  {
    q: "什么是财库公司？BNC 算财库公司吗？",
    a: "财库公司（数字资产财库公司，Digital Asset Treasury Company，简称 DAT）指把加密资产作为核心财库储备持有的上市公司：这类公司把融资所得或自有资金大量配置为比特币、BNB 等加密资产，并以「每股含币量」作为核心估值指标之一。BNC（BNB Standard Corp，纳斯达克代码 BNC）正是这样一家公司——它以持有 BNB 为核心财库策略，按公司披露持有 515,544 枚 BNB，是目前最大的企业级 BNB 财库公司。",
  },
  {
    q: "全区间年化和全池平均有什么区别？",
    a: "全池平均是整个池子的手续费除以整个池子的总锁仓量（TVL）算出的平均数；全区间年化是把资金按全价格范围提供流动性时、按当前有效流动性换算出的实际在价内年化。由于手续费只分给价格区间内的流动性，全区间头寸在当前价位的有效流动性被摊薄，实际年化通常明显低于全池平均。页面默认显示全区间口径，全池平均只在卡片小字里作对照。",
  },
  {
    q: "为什么没有 BNCB/USDC 池？",
    a: "截至目前，BSC 上的行情索引（GeckoTerminal、DexScreener）里没有任何有规模的 BNCB/USDC 流动性池，BNCB 的链上交易对集中在 USDT 与 WBNB 两个计价币上，所以页面只列这四个真实存在的池子。",
  },
  {
    q: "价格区间怎么自定义？出区间会怎样？",
    a: "在池子板块顶部可以统一选择全区间、±50%、±30%、±20%、±10%、±5%，也可以在每张池子卡片上单独选区间，或点「自定义」用滑块和数字输入拉出不对称区间（例如下方 −10%、上方 +30%）。区间越窄、价格停留在区间内时年化越高，但价格一旦走出区间，该头寸的手续费收益立即归零，真实年化还要乘上价格实际停留在区间内的时间占比。BNCB 跟踪的是美股，美股开盘跳空很容易把价格打出窄区间。",
  },
  {
    q: "基本口径是什么意思？",
    a: "基本口径指分母只算公司已经发行在外的普通股股数（BNC 为 41,173,850 股，披露数据），每股含 BNB = 持仓 515,544 枚 ÷ 基本股数 ≈ 0.012521 枚。它回答的是「今天买一股 BNC，实打实对应多少枚 BNB」，本页面的每股含币量、调整后 NAV 与 mNAV 都按基本口径计算。",
  },
];

export const FAQ_ITEMS_EN: FaqItem[] = [
  {
    q: "What is a treasury company? Is BNC one?",
    a: "A treasury company — a digital asset treasury company (DAT) — is a listed company that holds crypto assets as its core treasury reserve: it allocates raised or own capital heavily into assets such as Bitcoin or BNB, and is valued largely on its crypto per share. BNC (BNB Standard Corp, Nasdaq: BNC) is exactly that: holding BNB is its core treasury strategy, with 515,544 BNB disclosed, making it the largest corporate BNB treasury company today.",
  },
  {
    q: "What is the difference between full-range APY and the pool average?",
    a: "The pool average is simply the pool's total fees divided by its total value locked (TVL). The full-range APY is the actual in-range yield you get when your liquidity is spread across the entire price range, converted using the pool's current active liquidity. Because fees only go to liquidity inside the current price range, a full-range position's effective liquidity at the current price is heavily diluted, so its real APY is usually far below the pool average. This page shows the full-range figure by default; the pool average appears only as a small reference line on each card.",
  },
  {
    q: "Why is there no BNCB/USDC pool?",
    a: "As of now, no BNCB/USDC liquidity pool of any meaningful size exists in the BSC market indexes (GeckoTerminal, DexScreener). BNCB's on-chain pairs are concentrated in USDT and WBNB quotes, so the page lists only these four pools that actually exist.",
  },
  {
    q: "How do I customize the price range? What happens out of range?",
    a: "Use the unified control at the top of the pools section to pick full range, ±50%, ±30%, ±20%, ±10% or ±5% for all pools, or set a range per pool card — including an asymmetric custom range via the sliders and number inputs (e.g. −10% below and +30% above). The narrower the range, the higher the APY while the price stays inside; but once the price leaves your range, fee income drops to zero immediately, and your real APY must be multiplied by the share of time the price actually stays in range. BNCB tracks a US stock, and US market open gaps can easily knock the price out of a narrow range.",
  },
  {
    q: "What does the basic basis mean?",
    a: "The basic basis uses only the common shares actually issued and outstanding as the denominator (41,173,850 shares for BNC, per company disclosure). BNB per share = 515,544 BNB held ÷ basic shares ≈ 0.012521. It answers: 'If I buy one share of BNC today, how much BNB does it actually represent?' Every per-share figure on this page — crypto per share, adjusted NAV and mNAV — uses the basic basis.",
  },
];

/** 默认（中文）FAQ，供 layout 的 JSON-LD 等既有引用使用 */
export const FAQ_ITEMS = FAQ_ITEMS_ZH;
