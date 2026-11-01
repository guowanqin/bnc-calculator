import type { Metadata } from "next";
import "./globals.css";
import { FAQ_ITEMS } from "@/lib/faq";

// TODO: 上线后把占位域名换成正式域名
const SITE_URL = "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "BNC 每股含币量计算器｜BNCB 池子年化收益率实时查询",
  description:
    "实时计算 BNB Standard Corp（Nasdaq: BNC）每股含 BNB 数量（基本口径），并查询 BNCB 在 PancakeSwap V3 与 Uniswap V4 流动性池的年化收益率，支持全区间与自定义价格区间换算、LP 收益测算。",
  keywords: [
    "BNC",
    "BNCB",
    "BNB Standard",
    "每股含币量",
    "每股含 BNB",
    "池子年化",
    "流动性池收益率",
    "PancakeSwap",
    "Uniswap V4",
    "BNB 财库公司",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL + "/",
    siteName: "BNC 每股含币量计算器",
    title: "BNC 每股含币量计算器｜BNCB 池子年化收益率",
    description:
      "BNC 每股含多少 BNB？BNCB 池子年化多少？实时数据一目了然，区间可自定义换算。",
  },
  twitter: {
    card: "summary",
    title: "BNC 每股含币量计算器｜BNCB 池子年化收益率",
    description:
      "实时计算 BNC 每股含 BNB（基本口径）与 BNCB 四个流动性池的区间年化收益率。",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "BNC 每股含币量计算器",
      url: SITE_URL + "/",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: "zh-CN",
      description:
        "实时计算 BNB Standard Corp（Nasdaq: BNC）每股含 BNB 数量（基本口径），并按全区间或自定义价格区间换算 BNCB 流动性池年化收益率。",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
