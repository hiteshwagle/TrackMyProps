'use client';
import {
  ArrowUpRight,
  Building2,
  TrendingUp,
  CircleDollarSign,
  LayoutDashboard,
  House,
  ChartNoAxesCombined,
  Settings2,
  ArrowDownLeft,
  RotateCcw,
} from 'lucide-react';
import { CountUp, progressAt, useShowcaseTimeline } from './home-motion';
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-icon">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M5 16 16 6l11 10v12H5V16Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="m11 23 5-5 4 3 8-9M23 12h5v5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      trackmyprops<span className="brand-dot">.</span>
    </span>
  );
}
export function HouseArt({ variant = 0 }: { variant?: number }) {
  const colours = [
    ['#deded0', '#f7f5e9', '#e0c7a8'],
    ['#cdd8cb', '#f0f0e5', '#bcc8af'],
    ['#d9d6ce', '#f1ebe1', '#c5b8a4'],
  ][variant % 3];
  return (
    <svg
      viewBox="0 0 400 240"
      className="house-art"
      role="img"
      aria-label="Illustration of an Australian home"
    >
      <defs>
        <linearGradient id={`sky${variant}`} x2="0" y2="1">
          <stop stopColor={colours[0]} />
          <stop offset="1" stopColor={colours[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#sky${variant})`} />
      <circle cx="326" cy="47" r="27" fill="#fff9dc" opacity=".65" />
      <path d="M0 191Q85 169 184 185T400 173V240H0Z" fill="#a6b49a" />
      <path d="m63 143 125-44 139 51-128 46Z" fill="#bbc1aa" />
      <path d="M93 112h197v83H93z" fill={colours[1]} />
      <path d="m78 114 112-66 115 66Z" fill="#486257" />
      <path d="m188 48 84 14 75 53H300Z" fill="#344f44" />
      <path d="M290 114h47v81h-47z" fill={colours[2]} />
      <path d="M128 139h38v37h-38zM211 139h39v37h-39z" fill="#426357" />
      <path d="M145 139v37m-17-18h38m64-19v37m-19-18h39" stroke="#d8dfd1" strokeWidth="3" />
      <path d="M177 142h24v53h-24z" fill="#c6ad87" />
      <path d="m170 195 43 0 43 45h-84Z" fill="#d3d2bf" />
      <g fill="#566d50">
        <circle cx="62" cy="163" r="22" />
        <circle cx="42" cy="178" r="20" />
        <circle cx="330" cy="179" r="16" />
      </g>
      <path d="M0 220h120m180-6h100" stroke="#e7e6da" strokeWidth="3" />
      <path d="M367 77v113" stroke="#81795f" strokeWidth="5" />
      <g fill="#7f9775">
        <circle cx="367" cy="85" r="29" />
        <circle cx="347" cy="110" r="25" />
        <circle cx="380" cy="115" r="23" />
      </g>
      <g fill="#67805d">
        <circle cx="17" cy="117" r="30" />
        <circle cx="9" cy="149" r="27" />
      </g>
    </svg>
  );
}
export function TrendChart({
  simple = false,
  progress = 1,
}: {
  simple?: boolean;
  progress?: number;
}) {
  return (
    <svg
      className="trend-chart"
      viewBox="0 0 600 170"
      aria-label="Illustrative portfolio value chart"
      role="img"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#a7c5a3" stopOpacity=".42" />
          <stop offset="1" stopColor="#a7c5a3" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 75, 120, 165].map((y) => (
        <path key={y} d={`M0 ${y}H600`} stroke="#e6e9df" strokeDasharray="4 5" />
      ))}
      <path
        d="M0 139C22 139 33 127 54 131S85 114 110 120 141 99 166 104 202 85 228 96 259 72 287 80 323 57 350 63 385 46 410 52 446 31 473 37 510 21 540 28 573 9 600 13V170H0Z"
        fill="url(#chartFill)"
        opacity={progress}
      />
      <path
        className="draw-line"
        pathLength={100}
        style={{ animation: 'none', strokeDasharray: 100, strokeDashoffset: 100 * (1 - progress) }}
        d="M0 139C22 139 33 127 54 131S85 114 110 120 141 99 166 104 202 85 228 96 259 72 287 80 323 57 350 63 385 46 410 52 446 31 473 37 510 21 540 28 573 9 600 13"
        fill="none"
        stroke="#2c654c"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {!simple && progress > 0.98 && <circle cx="600" cy="13" r="5" fill="#2c654c" />}
    </svg>
  );
}
export function PortfolioPreview({ mode = 'overview' }: { mode?: string }) {
  const { ref, elapsed, restart } = useShowcaseTimeline();
  const progress = progressAt(elapsed, 180, 2600);
  return (
    <div ref={ref} className="preview-shell">
      <div className="preview-sidebar">
        <span className="mini-mark">
          <House size={18} />
        </span>
        <LayoutDashboard size={17} />
        <Building2 size={17} />
        <ChartNoAxesCombined size={17} />
        <span className="sidebar-end">
          <Settings2 size={17} />
        </span>
      </div>
      <div className="preview-main">
        <div className="preview-top">
          <span>
            My portfolio <span className="tiny-muted">/ Overview</span>
          </span>
          <span className="avatar-mini">JD</span>
        </div>
        <div className="preview-greeting">
          <div>
            <p>YOUR NEXT CHAPTER, IN VIEW</p>
            <h3>Looking good, Jamie.</h3>
          </div>
          <span className="demo-badge">Illustrative demo</span>
        </div>
        <div className="preview-metrics">
          <div>
            <span>Portfolio value</span>
            <strong>
              <CountUp value={2450000} elapsed={elapsed} />
              <span className="green-dot" />
            </strong>
            <small>User-entered values</small>
          </div>
          <div>
            <span>Total equity</span>
            <strong>
              <CountUp value={920000} elapsed={elapsed} delay={150} />
            </strong>
            <small>Across 3 properties</small>
          </div>
          <div>
            <span>Annualised net</span>
            <strong>
              <CountUp value={18720} elapsed={elapsed} delay={300} />
            </strong>
            <small>Entered income − expenses</small>
          </div>
        </div>
        {mode === 'properties' ? (
          <div className="preview-properties">
            <div>
              <HouseArt />
              <b>Parkside House</b>
              <span>Brisbane, QLD · House</span>
            </div>
            <div>
              <HouseArt variant={1} />
              <b>The Richmond</b>
              <span>Melbourne, VIC · Townhouse</span>
            </div>
          </div>
        ) : mode === 'cashflow' ? (
          <div className="preview-cashflow">
            <p>
              <span>
                <ArrowDownLeft size={16} /> Rental income
              </span>
              <b>
                <CountUp value={84240} elapsed={elapsed} />
              </b>
            </p>
            <p>
              <span>
                <ArrowUpRight size={16} /> Recorded expenses
              </span>
              <b>
                <CountUp value={65520} elapsed={elapsed} delay={250} />
              </b>
            </p>
            <p>
              <span>
                <CircleDollarSign size={16} /> Annualised net
              </span>
              <b className="green-text">
                <CountUp value={18720} elapsed={elapsed} delay={500} />
              </b>
            </p>
            <div className="cash-bars">
              <i style={{ width: `${82 * progress}%` }} />
              <i style={{ width: `${64 * progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="preview-chart">
            <div>
              <b>Your portfolio, at a glance</b>
              <span>Sample data · not a valuation</span>
            </div>
            <TrendChart progress={progress} />
            <div className="chart-months">
              {'Jan Feb Mar Apr May Jun'.split(' ').map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        )}
        <div className="preview-bottom">
          <span>
            <span className="green-dot" /> All your properties. One clear view.
          </span>
          <button
            className="preview-replay"
            type="button"
            onClick={restart}
            aria-label="Replay portfolio animation"
            title="Replay animation"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
export function MetricIcon({ kind }: { kind: string }) {
  const I = kind === 'income' ? CircleDollarSign : kind === 'analytics' ? TrendingUp : Building2;
  return <I size={21} />;
}
