"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MarketData, PoolMarket } from "@/lib/types";
import {
  FULL_RANGE,
  PRESET_PCTS,
  presetRange,
  rangeAprFor,
  lvForRange,
  type RangeSel,
} from "@/lib/range";
import { FAQ_ITEMS_EN, FAQ_ITEMS_ZH } from "@/lib/faq";
import { DICT, SITE_TITLE, type Dict, type Lang } from "@/lib/i18n";

/* ---------------- 格式化 ---------------- */
const fmtInt = (n: number, locale: string) =>
  new Intl.NumberFormat(locale).format(Math.round(n));
const fmtUsd = (n: number, d = 2) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtUsd0 = (n: number) => {
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(0);
};
const fmtPct = (frac: number | null, d = 1) =>
  frac === null || !Number.isFinite(frac) ? "—" : (frac * 100).toFixed(d) + "%";
const fmtPrice = (n: number) => fmtUsd(n, n < 10 ? 3 : 2);

/* ---------------- 区间选择器 ---------------- */
function isPreset(sel: RangeSel) {
  return !sel.full && sel.down === sel.up && PRESET_PCTS.includes(sel.down);
}

function RangeControl(props: {
  label: string;
  sel: RangeSel;
  onChange: (s: RangeSel) => void;
  t: Dict;
}) {
  const { sel, onChange, t } = props;
  const [customOpen, setCustomOpen] = useState(false);
  const customActive = customOpen || (!sel.full && !isPreset(sel));

  const openCustom = () => {
    setCustomOpen(true);
    if (sel.full) onChange({ full: false, down: 10, up: 10 });
  };
  const setSide = (side: "down" | "up", v: number) => {
    const nv = Number.isFinite(v) ? v : 0;
    onChange({
      full: false,
      down: side === "down" ? Math.min(95, Math.max(1, nv)) : sel.down,
      up: side === "up" ? Math.min(300, Math.max(1, nv)) : sel.up,
    });
  };

  return (
    <div className="range-ctl">
      <div className="r-label">{props.label}</div>
      <div className="chips">
        <button
          type="button"
          className={"chip-btn" + (sel.full ? " on" : "")}
          onClick={() => {
            setCustomOpen(false);
            onChange(FULL_RANGE);
          }}
        >
          {t.fullRange}
        </button>
        {PRESET_PCTS.map((p) => (
          <button
            key={p}
            type="button"
            className={
              "chip-btn" + (!sel.full && sel.down === p && sel.up === p ? " on" : "")
            }
            onClick={() => {
              setCustomOpen(false);
              onChange(presetRange(p));
            }}
          >
            ±{p}%
          </button>
        ))}
        <button
          type="button"
          className={"chip-btn" + (customActive && !sel.full ? " on" : "")}
          onClick={openCustom}
        >
          {t.custom}
        </button>
      </div>
      {customActive && !sel.full && (
        <div className="custom-box">
          <div className="slider-row">
            <label>
              <span>{t.downLabel}</span>
              <span className="numin">
                −
                <input
                  type="number"
                  min={1}
                  max={95}
                  value={sel.down}
                  onChange={(e) => setSide("down", parseFloat(e.target.value))}
                />
                %
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={95}
              step={1}
              value={sel.down}
              onChange={(e) => setSide("down", parseFloat(e.target.value))}
            />
          </div>
          <div className="slider-row">
            <label>
              <span>{t.upLabel}</span>
              <span className="numin">
                +
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={sel.up}
                  onChange={(e) => setSide("up", parseFloat(e.target.value))}
                />
                %
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={300}
              step={1}
              value={sel.up}
              onChange={(e) => setSide("up", parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- 池子卡片 ---------------- */
function PoolCard(props: {
  pool: PoolMarket;
  sel: RangeSel;
  onRangeChange: (s: RangeSel) => void;
  t: Dict;
}) {
  const { pool, sel, t } = props;
  const res =
    pool.rangeBasis && pool.annualFeesUsd !== null && pool.priceUsd !== null
      ? rangeAprFor(pool.annualFeesUsd, pool.priceUsd, pool.rangeBasis, sel)
      : null;

  const headline = res ? res.apr : pool.poolAverageApr;
  const headlineLabel = res
    ? sel.full
      ? t.headlineFull
      : t.headlineRange(sel.down, sel.up)
    : t.headlineAvgFallback;

  return (
    <div className="pool-card">
      <div className="pool-head">
        <span className="pair">{pool.pair}</span>
        <span className="dex">{pool.dex}</span>
        <span className="fee">{t.feeRate(pool.feePercent)}</span>
      </div>

      <div className="pool-apr">{fmtPct(headline)}</div>
      <div className="pool-apr-label">{headlineLabel}</div>
      {res && pool.poolAverageApr !== null && (
        <div className="pool-avg">{t.poolAvgLine(fmtPct(pool.poolAverageApr))}</div>
      )}

      <div className="pool-meta">
        <div className="row">
          <span className="k">TVL</span>
          <b>{pool.tvlUsd !== null ? fmtUsd0(pool.tvlUsd) : "—"}</b>
        </div>
        <div className="row">
          <span className="k">{t.vol24h}</span>
          <b>{pool.volume24hUsd !== null ? fmtUsd0(pool.volume24hUsd) : "—"}</b>
        </div>
        <div className="row">
          <span className="k">{t.annualFees}</span>
          <b>{pool.annualFeesUsd !== null ? fmtUsd0(pool.annualFeesUsd) : "—"}</b>
        </div>
        <div className="row row-bncb">
          <span className="k">{t.bncbSpot}</span>
          <b>{pool.priceUsd !== null ? fmtPrice(pool.priceUsd) : "—"}</b>
        </div>
      </div>

      {res && (
        <>
          <div className="band-line">
            {sel.full ? (
              <>
                {t.bandLabel}
                <b>{t.fullPriceRangeText}</b> · {t.effLabel} <b>1.0×</b>（
                {t.baselineNote}）
              </>
            ) : (
              <>
                {t.bandLabel}
                <b>{fmtPrice(res.bandLowUsd)}</b> –{" "}
                <b>{res.bandHighUsd !== null ? fmtPrice(res.bandHighUsd) : "∞"}</b>{" "}
                · {t.effLabel} ≈ <b>{res.efficiency.toFixed(1)}×</b>
              </>
            )}
          </div>
          {!sel.full && (
            <div className="warn-line">⚠ {t.warnOutOfRange}</div>
          )}
        </>
      )}

      <RangeControl
        label={t.poolRangeLabel}
        sel={sel}
        onChange={props.onRangeChange}
        t={t}
      />
    </div>
  );
}

/* ---------------- 主组件 ---------------- */
interface Settings {
  holdings: string;
  shares: string;
  liabilities: string;
}
const DEFAULT_SETTINGS: Settings = {
  holdings: "515544",
  shares: "41173850",
  liabilities: "16800000",
};
const parseNum = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;

export default function Calculator() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [editOpen, setEditOpen] = useState(false);

  const [unified, setUnified] = useState<RangeSel>(presetRange(5));
  const [poolRanges, setPoolRanges] = useState<Record<string, RangeSel>>({});

  const [lpPoolKey, setLpPoolKey] = useState("uni-usdt-0025");
  const [lpAmount, setLpAmount] = useState("10000");

  /* ---------- 语言：localStorage 记忆，首次按浏览器语言 ---------- */
  const [lang, setLang] = useState<Lang>("zh");
  const t = DICT[lang];
  const locale = lang === "en" ? "en-US" : "zh-CN";

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
    document.title = SITE_TITLE[lang];
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  }, [lang]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/market");
      const j = (await r.json()) as MarketData & { error?: string };
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
      const raw = localStorage.getItem("bnc-settings");
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Settings) });
    } catch {
      /* 忽略损坏的本地设置 */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bnc-settings", JSON.stringify(settings));
    } catch {
      /* 忽略 */
    }
  }, [settings]);

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
  const liabilities = parseNum(settings.liabilities);

  const hero = useMemo(() => {
    if (!data || shares <= 0) return null;
    const perShare = holdings / shares;
    const bnb = data.bnbPriceUsd;
    const perShareUsd = bnb !== null ? perShare * bnb : null;
    const adjNav =
      bnb !== null ? (holdings * bnb - liabilities) / shares : null;
    const mnav =
      data.bncbPriceUsd !== null && adjNav !== null && adjNav > 0
        ? data.bncbPriceUsd / adjNav
        : null;
    return { perShare, perShareUsd, adjNav, mnav };
  }, [data, holdings, shares, liabilities]);

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
  const faqItems = lang === "en" ? FAQ_ITEMS_EN : FAQ_ITEMS_ZH;

  return (
    <main className="page">
      <div className="topbar">
        <span className="brand">BNC CALCULATOR</span>
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
            onClick={() => setLang("zh")}
          >
            中文
          </button>
          <button
            type="button"
            className={lang === "en" ? "on" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </span>
        <button type="button" className="btn" onClick={load} disabled={loading}>
          {loading ? t.refreshing : t.refresh}
        </button>
      </div>

      {/* ---------- 板块一：美股含币量 ---------- */}
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
                ≈ {hero.perShare.toFixed(6)}
                <span>{t.perShareUnit}</span>
              </div>
            </div>
            <div className="formula">
              <span>{t.formulaLabel}</span>
              <span className="chip">{t.formulaHoldings(fmtInt(holdings, locale))}</span>
              <span>÷</span>
              <span className="chip">{t.formulaShares(fmtInt(shares, locale))}</span>
            </div>
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
                  {data.bncbPriceUsd !== null ? fmtPrice(data.bncbPriceUsd) : "—"}
                </div>
              </div>
              <div className="stat">
                <div className="k">{t.statBnbPrice}</div>
                <div className="v">
                  {data.bnbPriceUsd !== null ? fmtUsd(data.bnbPriceUsd) : "—"}
                </div>
              </div>
            </div>
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
                  <label>{t.fieldLiabilities}</label>
                  <input
                    value={settings.liabilities}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, liabilities: e.target.value })
                    }
                  />
                </div>
              </div>
              <p className="hint">{t.editHint}</p>
            </>
          )}
        </div>
      </section>

      {/* ---------- 板块二：池子年化 ---------- */}
      <h2 className="section-title">{t.poolsTitle}</h2>
      <p className="section-sub">{t.poolsSub}</p>

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
    </main>
  );
}
