"use client";

import { useEffect, useState } from "react";
import Calculator from "./Calculator";
import HypeCalculator from "./HypeCalculator";
import { TAB_TITLES, type AssetTab, type Lang } from "@/lib/i18n";

const TAB_LABELS: Record<AssetTab, Record<Lang, string>> = {
  bnc: { zh: "BNC · BNB 财库公司", en: "BNC · BNB Treasury" },
  hype: { zh: "HYPE · PURR 财库公司", en: "HYPE · PURR Treasury" },
};

/**
 * 全站外壳：标的标签切换 [BNC] [HYPE] + 语言状态。
 * 两个标签页都保持挂载（隐藏而非卸载），切换不丢失各自的区间与设置状态；
 * 当前标签写入 URL 查询参数（/?tab=hype 可分享），document.title 随标签与语言更新。
 */
export default function Shell() {
  const [tab, setTab] = useState<AssetTab>("bnc");
  const [lang, setLang] = useState<Lang>("zh");

  /* 语言初始化：localStorage 记忆优先，否则按浏览器语言（与原单页逻辑一致） */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bnc-lang");
      if (saved === "zh" || saved === "en") {
        setLang(saved);
      } else if (
        typeof navigator !== "undefined" &&
        navigator.language.toLowerCase().startsWith("en")
      ) {
        setLang("en");
      }
    } catch {
      /* 忽略 */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bnc-lang", lang);
    } catch {
      /* 忽略 */
    }
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }, [lang]);

  /* 标签初始化：读 URL 查询参数 ?tab=hype */
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("tab");
      if (q === "hype" || q === "bnc") setTab(q);
    } catch {
      /* 忽略 */
    }
  }, []);

  useEffect(() => {
    document.title = TAB_TITLES[tab][lang];
  }, [tab, lang]);

  const switchTab = (next: AssetTab) => {
    setTab(next);
    try {
      const url = next === "hype" ? "/?tab=hype" : "/";
      window.history.replaceState(null, "", url);
    } catch {
      /* 忽略 */
    }
  };

  return (
    <main className="page">
      <div className="tabbar" role="tablist" aria-label="Asset">
        {(["bnc", "hype"] as AssetTab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={"tab-btn" + (tab === key ? " on" : "")}
            onClick={() => switchTab(key)}
          >
            {TAB_LABELS[key][lang]}
          </button>
        ))}
      </div>

      <div style={{ display: tab === "bnc" ? undefined : "none" }}>
        <Calculator lang={lang} onLangChange={setLang} />
      </div>
      <div style={{ display: tab === "hype" ? undefined : "none" }}>
        <HypeCalculator lang={lang} onLangChange={setLang} />
      </div>
    </main>
  );
}
