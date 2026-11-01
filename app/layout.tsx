import type { Metadata } from "next";
import "./globals.css";
import { FAQ_ITEMS_EN, FAQ_ITEMS_ZH } from "@/lib/faq";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/i18n";

// TODO: 上线后把占位域名换成正式域名
const SITE_URL = "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE.zh,
  description: SITE_DESCRIPTION.zh,
  keywords: [
    // 主关键词
    "每股含币量",
    "BNC 财库公司",
    // 副关键词
    "财库公司",
    "BNB 财库",
    "数字资产财库公司",
    "DAT",
    "BNCB",
    "BNCB 池子年化收益率",
    "mNAV",
    "BNB Standard",
    // 英文与补充
    "BNC",
    "crypto per share",
    "BNB treasury company",
    "digital asset treasury company",
    "BNCB pool APY",
    "每股含 BNB",
    "PancakeSwap",
    "Uniswap V4",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    url: SITE_URL + "/",
    siteName: "BNC 每股含币量计算器",
    title: SITE_TITLE.zh,
    description:
      "BNC 每股含多少 BNB？BNCB 池子年化多少？财库公司持仓与池子收益率实时数据一目了然，区间可自定义换算。",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE.zh,
    description:
      "实时计算 BNC 财库公司每股含 BNB（基本口径）与 BNCB 四个流动性池的区间年化收益率。",
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
      inLanguage: ["zh-CN", "en"],
      description: SITE_DESCRIPTION.zh,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      inLanguage: "zh-CN",
      mainEntity: FAQ_ITEMS_ZH.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "FAQPage",
      inLanguage: "en",
      mainEntity: FAQ_ITEMS_EN.map((f) => ({
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
