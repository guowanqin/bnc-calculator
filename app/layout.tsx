import type { Metadata } from "next";
import "./globals.css";
import { FAQ_ITEMS_EN, FAQ_ITEMS_ZH } from "@/lib/faq";
import { FAQ_HYPE_EN, FAQ_HYPE_ZH } from "@/lib/faq-hype";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/i18n";

// TODO: 上线后把占位域名换成正式域名
const SITE_URL = "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE.zh,
  description: SITE_DESCRIPTION.zh,
  keywords: [
    // 站点级主词（只有一个）
    "每股含币量",
    "每股含币量计算器",
    // 标的支柱词
    "BNC 财库公司",
    "BNB 财库公司",
    "HYPE 财库公司",
    "PURR 财库公司",
    // 副词：每股口径与折溢价指标
    "每股含 BNB",
    "每股含 HYPE",
    "mNAV",
    "财库公司折价",
    // 副词：池子年化
    "BNCB 池子年化收益率",
    "HYPE 池子年化收益率",
    // 实体词
    "BNCB",
    "Hyperliquid Strategies",
    "BNB Standard Corp",
    // 英文长尾（不再以 crypto / digital asset treasury companies 大词为目标）
    "BNB treasury company",
    "HYPE treasury company",
    "BNC mNAV",
    "PURR mNAV",
    "mNAV calculator for BNC and PURR",
    "BNB per share",
    "HYPE per share",
    "BNCB pool APR",
    "BNCB pool APY",
    "HYPE pool APY",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    url: SITE_URL + "/",
    siteName: "每股含币量计算器",
    title: SITE_TITLE.zh,
    description:
      "BNC 每股含多少 BNB？PURR 每股含多少 HYPE？两家财库公司持仓、mNAV 与 BNCB / HYPE 池子年化收益率实时数据一目了然，区间可自定义换算。",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE.zh,
    description:
      "实时计算 BNC 财库公司每股含 BNB（基本口径）与 PURR 财库公司每股含 HYPE（官方摊薄口径），及 BNCB、HYPE 流动性池的区间年化收益率。",
  },
  robots: { index: true, follow: true },
};

const faqPage = (inLanguage: string, items: typeof FAQ_ITEMS_ZH) => ({
  "@type": "FAQPage",
  inLanguage,
  mainEntity: items.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "每股含币量计算器",
      url: SITE_URL + "/",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: ["zh-CN", "en"],
      description: SITE_DESCRIPTION.zh,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    faqPage("zh-CN", FAQ_ITEMS_ZH),
    faqPage("en", FAQ_ITEMS_EN),
    faqPage("zh-CN", FAQ_HYPE_ZH),
    faqPage("en", FAQ_HYPE_EN),
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
