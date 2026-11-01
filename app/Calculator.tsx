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
import { FAQ_ITEMS } from "@/lib/faq";

/* ---------------- 格式化 ---------------- */
const fmtInt = (n: number) => new Intl.NumberFormat("zh-CN").format(Math.round(n));
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
}) {
  const { sel, onChange } = props;
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
          全区间
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
          自定义
        </button>
      </div>
      {customActive && !sel.full && (
        <div className="custom-box">
          <div className="slider-row">
            <label>
              <span>下限：当前价下方</span>
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
              <span>上限：当前价上方</span>
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
}) {
  const { pool, sel } = props;
  const res =
    pool.rangeBasis && pool.annualFeesUsd !== null && pool.priceUsd !== null
      ? rangeAprFor(pool.annualFeesUsd, pool.priceUsd, pool.rangeBasis, sel)
      : null;

  const headline = res ? res.apr : pool.poolAverageApr;
  const headlineLabel = res
    ? sel.full
      ? "全区间在价内年化"
      : `区间 −${sel.down}% ~ +${sel.up}% · 在价内年化`
    : "全池平均年化（链上读数暂不可用）";

  return (
    <div className="pool-card">
      <div className="pool-head">
        <span className="pair">{pool.pair}</span>
        <span className="dex">{pool.dex}</span>
        <span className="fee">费率 {pool.feePercent}%</span>
      </div>

      <div className="pool-apr">{fmtPct(headline)}</div>
      <div className="pool-apr-label">{headlineLabel}</div>
      {res && pool.poolAverageApr !== null && (
        <div className="pool-avg">
          全池平均 {fmtPct(pool.poolAverageApr)}（对照口径，非全区间收益）
        </div>
      )}

      <div className="pool-meta">
        <div className="row">
          <span className="k">TVL</span>
          <b>{pool.tvlUsd !== null ? fmtUsd0(pool.tvlUsd) : "—"}</b>
        </div>
        <div className="row">
          <span className="k">24h 成交量</span>
          <b>{pool.volume24hUsd !== null ? fmtUsd0(pool.volume24hUsd) : "—"}</b>
        </div>
        <div className="row">
          <span className="k">年化手续费</span>
          <b>{pool.annualFeesUsd !== null ? fmtUsd0(pool.annualFeesUsd) : "—"}</b>
        </div>
        <div className="row">
          <span className="k">BNCB 现价</span>
          <b>{pool.priceUsd !== null ? fmtPrice(pool.priceUsd) : "—"}</b>
        </div>
      </div>

      {res && (
        <>
          <div className="band-line">
            {sel.full ? (
              <>
                价格带：<b>全价格范围</b> · 资金效率 <b>1.0×</b>（基准）
              </>
            ) : (
              <>
                价格带：<b>{fmtPrice(res.bandLowUsd)}</b> –{" "}
                <b>{res.bandHighUsd !== null ? fmtPrice(res.bandHighUsd) : "∞"}</b>{" "}
                · 资金效率 ≈ <b>{res.efficiency.toFixed(1)}×</b>
              </>
            )}
          </div>
          {!sel.full && (
            <div className="warn-line">
              ⚠ 价格走出该区间后手续费收益归零；真实年化需乘上价格停留在区间内的时间占比。
            </div>
          )}
        </>
      )}

      <RangeControl
        label="本池价格区间（只改这个池）"
        sel={sel}
        onChange={props.onRangeChange}
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

  const [unified, setUnified] = useState<RangeSel>(FULL_RANGE);
  const [poolRanges, setPoolRanges] = useState<Record<string, RangeSel>>({});

  const [lpPoolKey, setLpPoolKey] = useState("uni-usdt-0025");
  const [lpAmount, setLpAmount] = useState("10000");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/market");
      const j = (await r.json()) as MarketData & { error?: string };
      if (!r.ok || j.error) throw new Error(j.error ?? "fetch failed");
      setData(j);
      setError(null);
    } catch {
      setError("行情拉取失败，请点刷新重试。");
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

  return (
    <main className="page">
      <div className="topbar">
        <span className="brand">BNC CALCULATOR</span>
        <span className="updated">
          {data
            ? `数据更新于 ${new Date(data.fetchedAt).toLocaleString("zh-CN", { hour12: false })} · 来源 ${data.source}`
            : "正在拉取实时行情…"}
        </span>
        <button type="button" className="btn" onClick={load} disabled={loading}>
          {loading ? "刷新中…" : "刷新"}
        </button>
      </div>

      {/* ---------- 板块一：美股含币量 ---------- */}
      <section className="hero">
        <h1>BNC 每股含币量 · BNB Standard Corp</h1>
        <p className="sub">
          纳斯达克上市的 BNB 财库公司（Nasdaq: BNC）· 本页只按基本口径计算
        </p>

        {hero && data ? (
          <>
            <div className="hero-main">
              <div className="hero-num">
                {hero.perShare.toFixed(6)}
                <small>BNB / 股</small>
              </div>
              <div className="hero-usd">
                ≈ {hero.perShareUsd !== null ? fmtUsd(hero.perShareUsd) : "—"}
                <span> / 股（按 BNB 实时价）</span>
              </div>
            </div>
            <div className="formula">
              <span>每股含 BNB =</span>
              <span className="chip">持仓 {fmtInt(holdings)} BNB</span>
              <span>÷</span>
              <span className="chip">基本股数 {fmtInt(shares)} 股</span>
            </div>
            <div className="stat-grid">
              <div className="stat">
                <div className="k">调整后 NAV / 股（扣负债）</div>
                <div className="v">
                  {hero.adjNav !== null ? fmtUsd(hero.adjNav) : "—"}
                </div>
              </div>
              <div className="stat">
                <div className="k">mNAV（BNCB 价 ÷ 调整后 NAV）</div>
                <div className="v">
                  {hero.mnav !== null ? hero.mnav.toFixed(2) + "×" : "—"}
                  {hero.mnav !== null && (
                    <small>
                      {" "}
                      {hero.mnav < 1
                        ? `折价 ${((1 - hero.mnav) * 100).toFixed(1)}%`
                        : `溢价 ${((hero.mnav - 1) * 100).toFixed(1)}%`}
                    </small>
                  )}
                </div>
              </div>
              <div className="stat">
                <div className="k">BNCB 价格（代币化 BNC）</div>
                <div className="v">
                  {data.bncbPriceUsd !== null ? fmtPrice(data.bncbPriceUsd) : "—"}
                </div>
              </div>
              <div className="stat">
                <div className="k">BNB 价格</div>
                <div className="v">
                  {data.bnbPriceUsd !== null ? fmtUsd(data.bnbPriceUsd) : "—"}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={error ? "error-box" : "loading"}>
            {error ?? "正在拉取实时行情…"}
          </div>
        )}

        <div className="edit-panel">
          <button
            type="button"
            className="btn"
            onClick={() => setEditOpen((v) => !v)}
          >
            {editOpen ? "收起" : "编辑披露数据（持仓 / 股数 / 负债）"}
          </button>
          {editOpen && (
            <>
              <div className="edit-grid" style={{ marginTop: 12 }}>
                <div className="field">
                  <label>BNB 持仓（枚，公司披露）</label>
                  <input
                    value={settings.holdings}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, holdings: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>基本股数（股，公司披露）</label>
                  <input
                    value={settings.shares}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, shares: e.target.value })
                    }
                  />
                </div>
                <div className="field">
                  <label>负债（美元，调整后 NAV 扣除项）</label>
                  <input
                    value={settings.liabilities}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSettings({ ...settings, liabilities: e.target.value })
                    }
                  />
                </div>
              </div>
              <p className="hint">
                默认值：持仓 515,544 枚 BNB、基本股数 41,173,850 股（公司 2026
                年披露）、负债约 $16.8M（2026-07-31
                披露口径）。修改后立即按基本口径重算，并保存在本机浏览器。
              </p>
            </>
          )}
        </div>
      </section>

      {/* ---------- 板块二：池子年化 ---------- */}
      <h2 className="section-title">BNCB 池子年化收益率</h2>
      <p className="section-sub">
        默认显示「全区间在价内年化」：按链上当前有效流动性换算的实际年化，与卡片小字的「全池平均」不是一回事（全池平均
        = 24h 成交量 × 费率 × 365 ÷ TVL）。先用下方统一设置给所有池子选区间，也可以逐张卡片单独改。
      </p>

      {data ? (
        <>
          <div className="panel">
            <RangeControl
              label="统一区间设置（应用到所有池子）"
              sel={unified}
              onChange={applyUnified}
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
              />
            ))}
          </div>

          {/* ---------- LP 测算器 ---------- */}
          <h2 className="section-title">LP 收益测算</h2>
          <div className="panel">
            <div className="lp-grid">
              <div className="field">
                <label>选择池子</label>
                <select
                  value={lp?.pool.key ?? lpPoolKey}
                  onChange={(e) => setLpPoolKey(e.target.value)}
                >
                  {data.pools.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.pair} · {p.dex} · 费率 {p.feePercent}%
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>投入金额（美元）</label>
                <input
                  value={lpAmount}
                  inputMode="decimal"
                  onChange={(e) => setLpAmount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>采用区间</label>
                <div style={{ fontSize: 14, padding: "8px 0" }}>
                  {lp
                    ? lp.sel.full
                      ? "全区间"
                      : `−${lp.sel.down}% ~ +${lp.sel.up}%`
                    : "—"}
                  （跟随该池卡片当前的区间设置）
                </div>
              </div>
            </div>
            {lp && (
              <div className="lp-result">
                <div className="stat">
                  <div className="k">估算日手续费收入</div>
                  <div className="v">
                    {lp.daily !== null ? fmtUsd(lp.daily) : "—"}
                  </div>
                </div>
                <div className="stat">
                  <div className="k">估算年手续费收入</div>
                  <div className="v">
                    {lp.yearly !== null ? fmtUsd(lp.yearly) : "—"}
                  </div>
                </div>
                <div className="stat">
                  <div className="k">占池有效流动性份额</div>
                  <div className="v">
                    {lp.share !== null
                      ? (lp.share * 100).toFixed(3) + "%"
                      : "—"}
                  </div>
                </div>
              </div>
            )}
            <p className="hint">
              按价格停留在所选区间内估算，未计无常损失与滑点；价格出区间期间收入为 0，实际收益低于此估算。
            </p>
          </div>
        </>
      ) : (
        !error && <div className="loading">正在拉取池子数据…</div>
      )}
      {error && !data && (
        <div className="error-box" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}

      {/* ---------- FAQ ---------- */}
      <h2 className="section-title">常见问题</h2>
      <div>
        {FAQ_ITEMS.map((f) => (
          <div className="faq-item" key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>

      <footer className="footer">
        <div>
          数据来源：GeckoTerminal / DexScreener 行情与 BSC
          链上读数（PancakeSwap V3 池合约、Uniswap V4 StateView），服务端缓存约
          5 分钟。官方 BNCB 合约：0x4902C5ebc598265Ed2212b559B042De8a5Eeec3f，请警惕同名假币。
        </div>
        <div>
          口径说明：区间年化为「价格停留在区间内」的理论值，未计无常损失；单日成交量年化波动极大。本页仅供信息参考，不构成投资建议。
        </div>
      </footer>
    </main>
  );
}
