# 每股含币量计算器（BNC + HYPE 双标签）

顶部标签切换 **[BNC] [HYPE]**，一站查询两家数字资产财库公司（DAT）的每股含币量与代币池年化收益率：

- **BNC 标签**：实时计算 **BNB Standard Corp（Nasdaq: BNC）** 每股含 BNB（只按基本口径），并查询其代币化股票 **BNCB** 在 BSC 上四个流动性池的年化收益率。
- **HYPE 标签**：实时计算 **Hyperliquid Strategies Inc（Nasdaq: PURR）** 每股含 HYPE（按**官方摊薄口径**：持仓 38.9M 枚 ÷ 完全摊薄 302.7M 股 ≈ 0.1285 枚/股，公司看板口径 2026-10-29），并查询 HYPE 在 HyperEVM 上四个流动性池的年化收益率。

两页均支持全区间 / 预设区间 / 自定义不对称区间的在价内年化换算与 LP 收益测算；标签状态写入 URL（`/?tab=hype` 可分享），切换不丢失各自的区间与设置。

线上同款为托管版本；本仓库是可独立部署的 Next.js（App Router + TypeScript）复刻版。

## 功能

### BNC（基本口径）

- **每股含币量**：每股含 BNB = 持仓 ÷ 基本股数（默认 515,544 枚 ÷ 41,173,850 股，均为公司披露数据，页面上可编辑、保存在本机浏览器）；辅助显示调整后 NAV/股（扣负债）、mNAV（股价取 BNCB 实时价，BNCB 价格在页面中重点标注为 BNC 的定价基准）。
- **BNCB 池子年化**：PancakeSwap V3 ×3（BNCB/USDT 0.05%、BNCB/USDT 0.25%、BNCB/WBNB 0.25%）+ Uniswap V4 ×1（BNCB/USDT 0.025%），数据在 BSC。

### HYPE（官方摊薄口径）

- **每股含币量**：每股含 HYPE = 持仓 ÷ 完全摊薄股数（默认 38.9M 枚 ÷ 302.7M 股，公司官方看板口径，2026-10-29，看板周更；摊薄股数由看板按库藏股法随股价计算——看板原值：持仓 38.85M、基本股数 300.77M，于 $11.01 时摊薄至 302.66M，页面按看板显示值取 38.9M / 302.7M）；页面明确标注「公司看板口径 + 日期」，并提示 SEC 披露追踪口径为 29.28M 枚（截至 2026-08-27），两口径并存。持仓、股数、现金（$132.6M，2026-08-19）、递延税负债（约 $194M，无有息负债）均可编辑。
- **调整后 NAV/股** =（持仓 × HYPE 实时价 + 现金 − 递延税负债）÷ 摊薄股数；**mNAV** 的取价不用代币价——PURR 没有 BNCB 式的高流动性代币化股票（无 bStocks / xStocks；Ondo 的 PURRon 市值仅约 $1.3K 不可用），故用 **PURR 纳斯达克收盘价**：服务端经 **Yahoo Finance** 自动获取最近一个交易日的收盘价与日期，页面如实标注「收盘价 + 日期」，非实时价；可编辑字段为手动兜底（预填 $11.01 = 2026-10-30 收盘），接口失败或用户手动改过时以手动值为准并标注「手动输入」（Stooq 免费 CSV 保留为第二兜底，实测端点不可用）。
- **HYPE 价格重点标注**：取 GeckoTerminal hyperevm 网络的 WHYPE 池价（WHYPE 合约 `0x5555555555555555555555555555555555555555`）。
- **HYPE 池子年化**：HyperEVM 上 Project X ×2（WHYPE/USDC 0.05%、0.3%）+ HyperSwap V3 ×2（WHYPE/UBTC 0.3%、WHYPE/USDC 0.3%）。注意：HYPE 的主要现货流动性在 HyperCore 原生订单簿，HyperEVM 的 AMM 池只是其中一部分。另附小字参考：HYPE 原生质押年化 ≈ 2.3%（浮动）。
- 消歧：Hyperliquid 链上的同名 meme 代币 PURR 与上市公司 PURR 无关，本页不使用其任何数据。

### 池子年化（两页通用规则）

- 默认显示「±5% 区间在价内年化」（重点年化），卡片小字标注「全池平均」作对照。
- 区间可统一设置也可逐池设置：全区间、±50% / ±30% / ±20% / ±10% / ±5%，或自定义不对称区间（滑块 + 数字输入）；价格出区间收益归零，卡片有明确警告。
- LP 测算器：选池子 + 输入金额 → 估算日/年手续费收入（在价内假设，未计无常损失）。

## 数据与公式

服务端 API 路由（内存缓存约 5 分钟）：

- `GET /api/market`（BNC）：BNCB 价、BNB 价、各池 TVL 与 24h 成交量——GeckoTerminal 优先，DexScreener 兜底；链上当前有效流动性与 sqrtPrice 走 BSC 公共 RPC `eth_call`——V3 读池合约 `liquidity()` / `slot0()`；V4 读 StateView（`0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4`）的 `getLiquidity(poolId)` / `getSlot0(poolId)`。
- `GET /api/market-hype`（HYPE）：WHYPE 价与各池 TVL/成交量走 GeckoTerminal hyperevm 网络（DexScreener 兜底）；链上读数走 HyperEVM RPC（`https://rpc.hyperliquid.xyz/evm`）批量 `eth_call` 读各池 `liquidity()` / `slot0()`。四个候选池已于 2026-11-01 逐一实测标准 V3 接口（token0 均为 WHYPE、费率与标注一致、读数全部成功），故全部纳入区间换算。PURR 收盘价经 Yahoo Finance chart 接口（query1/query2）获取最近交易日收盘价与纽约交易日期（2026-11-01 实测可用：$11.01 @ 2026-10-30，与纳斯达克收盘一致），Stooq 免费 CSV 为第二兜底（实测端点不可用），都取不到返回 null、页面用可编辑手动值。
- 全池平均 APR = 24h 成交量 × 费率 × 365 ÷ TVL。
- 区间在价内 APR = 年化手续费（计价代币）× (L/V) ÷ L_active，其中区间 [Pa, Pb] 在当前价 P 下的 L/V = 1 / (2√P − √Pa − P/√Pb)，全区间为 Pa→0、Pb→∞ 的极限。人类价格按 sqrtPrice² × 10^(token0 小数位 − token1 小数位) 换算（HyperEVM 上 USDC 为 6 位、UBTC 为 8 位、WHYPE 为 18 位，不能假设全是 18 位）。

无需任何 API Key。官方 BNCB 合约：`0x4902C5ebc598265Ed2212b559B042De8a5Eeec3f`（警惕同名假币）。

## SEO

关键词体系（2026-11-01 按调研结论调整）：站级主词只有一个「每股含币量」，标的支柱词为「BNC 财库公司」「BNB 财库公司」「HYPE 财库公司」「PURR 财库公司」；「财库公司」裸词与数字资产财库公司 / DAT 降为背景语义，只在正文与 FAQ 中自然出现。英文侧改走长尾（BNB treasury company / HYPE treasury company / BNC mNAV / PURR mNAV / mNAV calculator for BNC and PURR），并埋 BNB per share / HYPE per share 表述；副词含每股含 BNB / 每股含 HYPE、财库公司折价、BNCB 池子年化收益率 / HYPE 池子年化收益率等。以上已写入 title / description / keywords（中英）与 JSON-LD（WebApplication + BNC、HYPE 两套中英 FAQPage，与页面可见 FAQ 一致）；document.title 随标签切换更新。

## 本地运行

```bash
npm install
npm run dev     # http://localhost:3000（HYPE 页：http://localhost:3000/?tab=hype）
npm run build   # 生产构建
npm run start   # 生产模式启动
```

环境要求：Node.js ≥ 18.18，可访问 GeckoTerminal / DexScreener API、BSC 公共 RPC（`https://bsc-dataseed.binance.org`）与 HyperEVM RPC（`https://rpc.hyperliquid.xyz/evm`）。无必填环境变量。

## 部署到 Vercel

1. 把本仓库推到 GitHub。
2. 打开 [vercel.com/new](https://vercel.com/new) 导入该仓库，Framework Preset 自动识别为 Next.js，其余保持默认（Build Command `next build`、Output 自动），点 Deploy。
3. 正式域名为 **https://pershare.cc**（www 版重定向到主域名）：已写入 `lib/i18n.ts` 的 `SITE_URL`，canonical、og:url、JSON-LD、sitemap（`app/sitemap.ts`）与 robots 均以此为准；在 Vercel 项目 Settings → Domains 添加 pershare.cc 并按提示改 DNS。

也可以用 CLI：`npm i -g vercel && vercel --prod`。

> 提示：API 的 5 分钟缓存是进程内内存缓存，Serverless 环境下为单实例尽力而为，不影响正确性。

## 目录结构

```
app/
  layout.tsx        # SEO 元数据（双标的标题/描述/关键词/OG/Twitter/robots）+ JSON-LD
  page.tsx          # 入口页（渲染 Shell）
  Shell.tsx         # 标签切换 [BNC]/[HYPE] + 语言状态 + URL 参数/标题联动
  Calculator.tsx    # BNC 标签页（基本口径、两大板块）
  HypeCalculator.tsx# HYPE 标签页（官方摊薄口径、两大板块）
  pool-ui.tsx       # 两页共用：区间选择器 + 池子卡片 + 格式化
  globals.css       # 样式（白色主题）
  robots.ts         # robots.txt
  api/market/route.ts       # BNC 行情 API（缓存 5 分钟）
  api/market-hype/route.ts  # HYPE 行情 API（缓存 5 分钟）
lib/
  market.ts         # BNC 行情抓取（GT/DS）+ BSC 链上读数
  hype-market.ts    # HYPE 行情抓取（GT hyperevm/DS）+ HyperEVM 链上读数 + PURR 收盘价尝试
  range.ts          # 区间年化数学（L/V、资金效率）
  faq.ts            # BNC FAQ 文案（页面与 JSON-LD 共用）
  faq-hype.ts       # HYPE FAQ 文案（页面与 JSON-LD 共用）
  i18n.ts           # 站点级标题/描述（双标的）+ BNC 页双语字典
  i18n-hype.ts      # HYPE 页双语字典
  types.ts          # 类型定义
```

## 免责声明

本页数据来自公开行情接口与链上读数，单日成交量年化波动极大，区间年化为「价格停留在区间内」的理论值，未计无常损失；PURR 股价为纳斯达克收盘价而非实时价格，持仓数据存在看板口径与 SEC 披露口径的时点差异；仅供信息参考，不构成投资建议。
