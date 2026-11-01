"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HypeMarketData } from "@/lib/types";
import { presetRange, lvForRange, type RangeSel } from "@/lib/range";
import { FAQ_HYPE_EN, FAQ_HYPE_ZH } from "@/lib/faq-hype";
import { DICT_HYPE } from "@/lib/i18n-hype";
import type { Lang } from "@/lib/i18n";
import { PoolCard, RangeControl, fmtInt, fmtPrice, fmtUsd } from "./pool-ui";

const parseNum = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;

/* ---------------- HYPE 标签页（PURR / Hyperliquid Strategies，官方摊薄口径） ---------------- */
interface HypeSettings {
  holdings: string;
  shares: string;
  cash: string;
  deferredTax: string;
  purrPrice: string;
}
const DEFAULT_SETTINGS: HypeSettings = {
  holdings: "38800000", // 38.8M HYPE（公司看板口径，2026-10-22）
  shares: "301100000", // 完全摊薄 301.1M 股（公司看板口径，2026-10-22）
  cash: "132600000", // $132.6M（2026-08-19）
  deferredTax: "194000000", // 递延税负债约 $194M；公司无有息负债
  purrPrice: "11.01", // 纳斯达克收盘价（2026-10-30），可编辑
};
/** 预填的 PURR 收盘价日期（与 DEFAULT_SETTINGS.purrPrice 对应） */
const PREFILL_CLOSE_DATE = "2026-10-30";

export default function HypeCalculator(props: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  const { lang, onLangChange } = props;
  const [data, setData] = useState<HypeMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<HypeSettings>(DEFAULT_SETTINGS);
  const [editOpen, setEditOpen] = useState(false);
  const savedFound = useRef(false);
  const apiPriceApplied = useRef(false);

  const [unified, setUnified] = useState<RangeSel>(presetRange(5));
  const [poolRanges, setPoolRanges] = useState<Record<string, RangeSel>>({});

  const [lpPoolKey, setLpPoolKey] = useState("px-usdc-005");
  const [lpAmount, setLpAmount] = useState("10000");

  const t = DICT_HYPE[lang];
  const locale = lang === "en" ? "en-US" : "zh-CN";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/market-hype");
      const j = (await r.json()) as HypeMarketData & { error?: string };
      if (!r.ok || j.error) throw new Error(j.error ?? "fetch failed");
      setData(j);
      setError(null);
    } catch {
      setError("fetch-failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hype-settings");
      if (raw) {
        savedFound.current = true;
        setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as HypeSettings) });
      }
    } catch {
      /* 忽略损坏的本地设置 */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("hype-settings", JSON.stringify(settings));
    } catch {
      /* 忽略 */
    }
  }, [settings]);

  // Stooq 若取到更新的收盘价且用户未保存过自定义设置，用它种子化 PURR 股价字段（仅一次）
  useEffect(() => {
    if (
      data?.purrCloseUsd &&
      !savedFound.current &&
      !apiPriceApplied.current
    ) {
      apiPriceApplied.current = true;
      setSettings((s) => ({ ...s, purrPrice: String(data.purrCloseUsd) }));
    }
  }, [data]);

  const rangeOf = useCallback(
    (key: string): RangeSel => poolRanges[key] ?? unified,
    [poolRanges, unified],
  );
  const applyUnified = (s: RangeSel) => {
    setUnified(s);
    setPoolRanges({});
  };

  const holdings = parseNum(settings.holdings);
  const shares = parseNum(settings.shares);
  const cash = parseNum(settings.cash);
  const deferredTax = parseNum(settings.deferredTax);
  const purrPrice = parseNum(settings.purrPrice);
  const purrDate =
    apiPriceApplied.current && data?.purrCloseDate
      ? data.purrCloseDate
      : PREFILL_CLOSE_DATE;

  const hero = useMemo(() => {
    if (!data || shares <= 0) return null;
    const perShare = holdings / shares;
    const hype = data.hypePriceUsd;
    const perShareUsd = hype !== null ? perShare * hype : null;
    const adjNav =
      hype !== null
        ? (holdings * hype + cash - deferredTax) / shares
        : null;
    const mnav =
      purrPrice > 0 && adjNav !== null && adjNav > 0
        ? purrPrice / adjNav
        : null;
    return { perShare, perShareUsd, adjNav, mnav };
  }, [data, holdings, shares, cash, deferredTax, purrPrice]);

  const lp = useMemo(() => {
    if (!data) return null;
    const pool = data.pools.find((p) => p.key === lpPoolKey) ?? data.pools[0];
    if (!pool) return null;
    const amount = parseFloat(lpAmount) || 0;
    const sel = rangeOf(pool.key);
    let daily: number | null = null;
    let yearly: number | null = null;
    let share: number | null = null;
    if (pool.rangeBasis && pool.annualFeesUsd !== null && amount > 0) {
      const lv = lvForRange(
        pool.rangeBasis.sqrtPrice,
        sel.full ? null : sel.down,
        sel.full ? null : sel.up,
      );
      const lPos = (amount / pool.rangeBasis.token1Usd) * lv;
      share = lPos / (pool.rangeBasis.activeLiquidity + lPos);
      daily = (pool.annualFeesUsd / 365) * share;
      yearly = pool.annualFeesUsd * share;
    } else if (pool.tvlUsd !== null && pool.volume24hUsd !== null && amount > 0) {
      share = amount / (pool.tvlUsd + amount);
      daily = pool.volume24hUsd * (pool.feePercent / 100) * share;
      yearly = daily * 365;
    }
    return { pool, sel, daily, yearly, share };
  }, [data, lpPoolKey, lpAmount, rangeOf]);

  const errorText = error ? t.fetchError : null;
  const faqItems = lang === "en" ? FAQ_HYPE_EN : FAQ_HYPE_ZH;

  return (
    <div>
      <div className="topbar">
        <span className="brand">{t.brand}</span>
        <span className="updated">
          {data
            ? t.updatedAt(
                new Date(data.fetchedAt).toLocaleString(locale, { hour12: false }),
                data.source,
              )
            : t.loadingMarket}
        </span>
        <span className="lang-switch" role="group" aria-label="Language">
          <button
            type="button"
            className={lang === "zh" ? "on" : ""}
            onClick={() => onLangChange("zh")}
          >
            中文
          </button>
          <button
            type="button"
            className={lang === "en" ? "on" : ""}
            onClick={() => onLangChange("en")}
          >
            EN
          </button>
        </span>
        <button type="button" className="btn" onClick={load} disabled={loading}>
          {loading ? t.refreshing : t.refresh}
        </button>
      </div>

      {/* ---------- 板块一：每股含 HYPE（官方摊薄口径） ---------- */}
      <section className="hero">
        <h1>{t.heroTitle}</h1>
        <p className="sub">{t.heroSub}</p>

        {hero && data ? (
          <>
            <div className="hero-main">
              <div className="hero-num">
                {hero.perShareUsd !== null ? fmtUsd(hero.perShareUsd) : "—"}
                <small>{t.usdPerShareUnit}</small>
              </div>
              <div className="hero-bnb">
                ≈ {hero.perShare.toFixed(4)}
                <span>{t.perShareUnit}</span>
              </div>
            </div>
            <div className="formula">
              <span>{t.formulaLabel}</span>
              <span className="chip">{t.formulaHoldings(fmtInt(holdings, locale))}</span>
              <span>÷</span>
              <span className="chip">{t.formulaShares(fmtInt(shares, locale))}</span>
            </div>
            <p className="hint" style={{ marginTop: 10 }}>
              {t.caliberNote}
              <br />
              {t.secNote}
            </p>
            <div className="stat-grid">
              <div className="stat">
                <div className="k">{t.statAdjNav}</div>
                <div className="v">
                  {hero.adjNav !== null ? fmtUsd(hero.adjNav) : "—"}
                </div>
              </div>
              <div className="stat">
                <div className="k">{t.statMnav}</div>
                <div className="v">
                  {hero.mnav !== null ? hero.mnav.toFixed(2) + "×" : "—"}
                  {hero.mnav !== null && (
                    <small>
                      {" "}
                      {hero.mnav < 1
                        ? t.discount(((1 - hero.mnav) * 100).toFixed(1))
                        : t.premium(((hero.mnav - 1) * 100).toFixed(1))}
                    </small>
                  )}
                </div>
              </div>
              <div className="stat stat-bncb">
                <div className="k">{t.statBncbPrice}</div>
                <div className="v">
                  {data.hypePriceUsd !== null ? fmtPrice(data.hypePriceUsd) : "—"}
                </div>
              </div>
              <div className="stat">
                <div className="k">{t.statBnbPrice}</div>
                <div className="v">
                  {purrPrice > 0 ? fmtUsd(purrPrice) : "—"}
                  <small> {purrDate}</small>
                </div>
              </div>
            </div>
            <p className="hint">{t.purrNote}</p>
          </>
        ) : (
          <div className={errorText ? "error-box" : "loading"}>
            {errorText ?? t.loadingMarket}
          </div>
        )}

        <div className="edit-panel">
          <button
            type="button"
            className="btn"
            onClick={() => setEditOpen((v) => !v)}
          >
            {editOpen ? t.editClose : t.editOpen}
          </button>
          {editOpen && (
            <>
              <div className="edit-grid" style={{ marginTop: 12 }}>
                <div className="field">
                  <label>{t.fieldHoldings}</label>
                  <input
                    value={settings.holdings}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, holdings: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>{t.fieldShares}</label>
                  <input
                    value={settings.shares}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, shares: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>{t.fieldCash}</label>
                  <input
                    value={settings.cash}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, cash: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>{t.fieldDeferredTax}</label>
                  <input
                    value={settings.deferredTax}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, deferredTax: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>{t.fieldPurrPrice}</label>
                  <input
                    value={settings.purrPrice}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, purrPrice: e.target.value })
                    }
                  />
                </div>
              </div>
              <p className="hint">{t.editHint}</p>
            </>
          )}
        </div>
      </section>

      {/* ---------- 板块二：HYPE 池子年化（HyperEVM） ---------- */}
      <h2 className="section-title">{t.poolsTitle}</h2>
      <p className="section-sub">{t.poolsSub}</p>
      <p className="hint" style={{ marginTop: -6 }}>{t.stakingNote}</p>

      {data ? (
        <>
          <div className="panel">
            <RangeControl
              label={t.unifiedLabel}
              sel={unified}
              onChange={applyUnified}
              t={t}
            />
          </div>
          <div className="pool-grid">
            {data.pools.map((pool) => (
              <PoolCard
                key={pool.key}
                pool={pool}
                sel={rangeOf(pool.key)}
                onRangeChange={(s) =>
                  setPoolRanges((prev) => ({ ...prev, [pool.key]: s }))
                }
                t={t}
              />
            ))}
          </div>

          {/* ---------- LP 测算器 ---------- */}
          <h2 className="section-title">{t.lpTitle}</h2>
          <div className="panel">
            <div className="lp-grid">
              <div className="field">
                <label>{t.lpSelectPool}</label>
                <select
                  value={lp?.pool.key ?? lpPoolKey}
                  onChange={(e) => setLpPoolKey(e.target.value)}
                >
                  {data.pools.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.pair} · {p.dex} · {t.feeRate(p.feePercent)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t.lpAmount}</label>
                <input
                  value={lpAmount}
                  inputMode="decimal"
                  onChange={(e) => setLpAmount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>{t.lpRangeUsed}</label>
                <div style={{ fontSize: 14, padding: "8px 0" }}>
                  {lp
                    ? lp.sel.full
                      ? t.fullRange
                      : `−${lp.sel.down}% ~ +${lp.sel.up}%`
                    : "—"}
                  {t.lpRangeNote}
                </div>
              </div>
            </div>
            {lp && (
              <div className="lp-result">
                <div className="stat">
                  <div className="k">{t.lpDaily}</div>
                  <div className="v">
                    {lp.daily !== null ? fmtUsd(lp.daily) : "—"}
                  </div>
                </div>
                <div className="stat">
                  <div className="k">{t.lpYearly}</div>
                  <div className="v">
                    {lp.yearly !== null ? fmtUsd(lp.yearly) : "—"}
                  </div>
                </div>
                <div className="stat">
                  <div className="k">{t.lpShare}</div>
                  <div className="v">
                    {lp.share !== null
                      ? (lp.share * 100).toFixed(3) + "%"
                      : "—"}
                  </div>
                </div>
              </div>
            )}
            <p className="hint">{t.lpHint}</p>
          </div>
        </>
      ) : (
        !errorText && <div className="loading">{t.loadingPools}</div>
      )}
      {errorText && !data && (
        <div className="error-box" style={{ marginTop: 12 }}>
          {errorText}
        </div>
      )}

      {/* ---------- FAQ ---------- */}
      <h2 className="section-title">{t.faqTitle}</h2>
      <div>
        {faqItems.map((f) => (
          <div className="faq-item" key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>

      <footer className="footer">
        <div>{t.footerSource}</div>
        <div>{t.footerDisclaimer}</div>
      </footer>
    </div>
  );
}
