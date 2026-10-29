'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  ScanLine,
  RotateCcw,
} from 'lucide-react';

// A single clock keeps each illustrative showcase in sync. No portfolio calculations run here.
export function useShowcaseTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(10000);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let visible = false;
    let start = 0;
    let lastFrame = 0;
    function animate(now: number) {
      if (!visible || media.matches) return;
      if (now - lastFrame >= 32) {
        setElapsed((now - start) % 10000);
        lastFrame = now;
      }
      frame = requestAnimationFrame(animate);
    }
    function update() {
      cancelAnimationFrame(frame);
      if (media.matches) {
        setElapsed(10000);
        return;
      }
      if (visible) {
        start = performance.now();
        lastFrame = 0;
        setElapsed(0);
        frame = requestAnimationFrame(animate);
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    media.addEventListener('change', update);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', update);
      cancelAnimationFrame(frame);
    };
  }, [replay]);
  return { ref, elapsed, restart: () => setReplay((v) => v + 1) };
}
export function progressAt(elapsed: number, delay = 0, duration = 2600) {
  const progress = Math.max(0, Math.min(1, (elapsed - delay) / duration));
  return 1 - (1 - progress) ** 3;
}
export function CountUp({
  value,
  elapsed,
  delay = 0,
  duration = 2600,
}: {
  value: number;
  elapsed: number;
  delay?: number;
  duration?: number;
}) {
  const formatted = (number: number) => '$' + Math.round(number).toLocaleString('en-AU');
  return (
    <span className="count-up" aria-label={formatted(value)}>
      <span aria-hidden="true">{formatted(value * progressAt(elapsed, delay, duration))}</span>
    </span>
  );
}
const stages = [
  { label: 'Reviewing income', done: 'Income reviewed', value: 31200, icon: ArrowDownLeft },
  { label: 'Comparing expenses', done: 'Expenses compared', value: 24480, icon: ArrowUpRight },
  {
    label: 'Calculating equity',
    done: 'Equity calculated',
    value: 320000,
    icon: ChartNoAxesCombined,
  },
];
export function AnalysisDemo() {
  const { ref, elapsed, restart } = useShowcaseTimeline();
  const complete = elapsed >= 6800;
  return (
    <div
      ref={ref}
      className="detail-visual analysis-demo"
      aria-label="Illustrative portfolio analysis animation"
    >
      <div className="analysis-heading">
        <span>
          <ScanLine size={14} /> PORTFOLIO REVIEW
        </span>
        <button
          type="button"
          onClick={restart}
          aria-label="Replay analysis animation"
          title="Replay analysis"
        >
          <RotateCcw size={12} />
        </button>
      </div>
      <div className="analysis-caption">
        Illustrative analysis <span>{complete ? 'Complete' : 'In progress'}</span>
      </div>
      <div className="analysis-stages">
        {stages.map((stage, index) => {
          const starts = index * 1800;
          const done = elapsed >= starts + 1700;
          const active = elapsed >= starts && !done;
          return (
            <div
              key={stage.done}
              className={`analysis-stage ${done ? 'done' : active ? 'analysing' : 'waiting'}`}
            >
              <span className="analysis-stage-icon">
                {done ? <Check size={13} /> : <stage.icon size={13} />}
              </span>
              <span className="analysis-stage-label">{done ? stage.done : stage.label}</span>
              <b>
                <CountUp value={stage.value} elapsed={elapsed} delay={starts} duration={1700} />
              </b>
              {active && <i className="analysis-scan" />}
            </div>
          );
        })}
      </div>
      <div className={`analysis-result ${complete ? 'complete' : ''}`}>
        <span>
          {complete ? <Check size={12} /> : <span className="analysis-pulse" />}
          {complete ? 'Sample annualised net' : 'Bringing the picture together'}
        </span>
        <strong>
          <CountUp value={6720} elapsed={elapsed} delay={5400} duration={1400} />
        </strong>
      </div>
      <div className="analysis-track">
        <i style={{ width: `${Math.min(100, elapsed / 68)}%` }} />
      </div>
    </div>
  );
}
