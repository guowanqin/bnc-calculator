# BNC 每股含币量计算器

实时计算 **BNB Standard Corp（Nasdaq: BNC）** 每股含 BNB 数量（只按基本口径），并查询其代币化股票 **BNCB** 在 BSC 上四个流动性池的年化收益率，支持全区间 / 预设区间 / 自定义不对称区间的在价内年化换算与 LP 收益测算。

线上同款为托管版本；本仓库是可独立部署的 Next.js（App Router + TypeScript）复刻版。

## 功能

- **美股含币量（基本口径）**：每股含 BNB = 持仓 ÷ 基本股数（默认 515,544 枚 ÷ 41,173,850 股，均为公司披露数据，页面上可编辑、保存在本机浏览器）；辅助显示调整后 NAV/股（扣负债）、mNAV（股价取 BNCB 实时价）。
- **BNCB 池子年化**：PancakeSwap V3 ×3（BNCB/USDT 0.05%、BNCB/USDT 0.25%、BNCB/WBNB 0.25%）+ Uniswap V4 ×1（BNCB/USDT 0.025%）。
  - 默认显示「±5% 区间在价内年化」（重点年化），卡片小字标注「全池平均」作对照；BNCB 价格在页面中重点标注为 BNC 的定价基准。
  - 区间可统一设置也可逐池设置：全区间、±50% / ±30% / ±20% / ±10% / ±5%，或自定义不对称区间（滑块 + 数字输入）。
  - LP 测算器：选池子 + 输入金额 → 估算日/年手续费收入（在价内假设，未计无常损失）。

## 数据与公式

服务端 API 路由 `GET /api/market`（内存缓存约 5 分钟）：

- BNCB 价、BNB 价、各池 TVL 与 24h 成交量：GeckoTerminal 优先，DexScreener 兜底。
- 链上当前有效流动性与 sqrtPrice：BSC 公共 RPC `eth_call`——V3 读池合约 `liquidity()` / `slot0()`；V4 读 StateView（`0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4`）的 `getLiquidity(poolId)` / `getSlot0(poolId)`。
- 全池平均 APR = 24h 成交量 × 费率 × 365 ÷ TVL。
- 区间在价内 APR = 年化手续费 × (L/V) ÷ L_active，其中区间 [Pa, Pb] 在当前价 P 下的 L/V = 1 / (2√P − √Pa − P/√Pb)，全区间为 Pa→0、Pb→∞ 的极限。

无需任何 API Key。官方 BNCB 合约：`0x4902C5ebc598265Ed2212b559B042De8a5Eeec3f`（警惕同名假币）。

## 本地运行

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 生产构建
npm run start   # 生产模式启动
```

环境要求：Node.js ≥ 18.18，可访问 GeckoTerminal / DexScreener API 与 BSC 公共 RPC（`https://bsc-dataseed.binance.org`）。无必填环境变量。

## 部署到 Vercel

1. 把本仓库推到 GitHub。
2. 打开 [vercel.com/new](https://vercel.com/new) 导入该仓库，Framework Preset 自动识别为 Next.js，其余保持默认（Build Command `next build`、Output 自动），点 Deploy。
3. 部署完成后把正式域名填回 `app/layout.tsx` 顶部的 `SITE_URL`（目前为占位 `https://example.com`），og:url 等元数据即生效；如绑定自定义域名，在 Vercel 项目 Settings → Domains 添加并按提示改 DNS。

也可以用 CLI：`npm i -g vercel && vercel --prod`。

> 提示：`/api/market` 的 5 分钟缓存是进程内内存缓存，Serverless 环境下为单实例尽力而为，不影响正确性。

## 目录结构

```
app/
  layout.tsx        # SEO 元数据（标题/描述/OG/Twitter/robots）+ JSON-LD
  page.tsx          # 入口页
  Calculator.tsx    # 全部客户端交互（两大板块、区间选择、LP 测算）
  globals.css       # 样式
  robots.ts         # robots.txt
  api/market/route.ts  # 行情 API（缓存 5 分钟）
lib/
  market.ts         # 行情抓取（GT/DS）+ BSC 链上读数
  range.ts          # 区间年化数学（L/V、资金效率）
  faq.ts            # FAQ 文案（页面区块与 JSON-LD 共用）
  types.ts          # 类型定义
```

## 免责声明

本页数据来自公开行情接口与链上读数，单日成交量年化波动极大，区间年化为「价格停留在区间内」的理论值，未计无常损失；仅供信息参考，不构成投资建议。
