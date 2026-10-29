'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Layers3,
  Building2,
  ChartNoAxesCombined,
  Wallet,
  Check,
  ChevronDown,
  Menu,
  X,
  MousePointer2,
  LockKeyhole,
  SlidersHorizontal,
  CircleDollarSign,
} from 'lucide-react';
import { Brand, PortfolioPreview, HouseArt } from './visuals';
const features = [
  {
    id: 'overview',
    number: '01',
    title: 'See the bigger picture',
    description:
      'Bring property values, outstanding loans and equity into one considered view. See what you know, and what still needs updating.',
    icon: ChartNoAxesCombined,
  },
  {
    id: 'properties',
    number: '02',
    title: 'Give every property a home',
    description:
      'Keep purchase details, property attributes and loan information together. Add, edit, archive and restore as your portfolio evolves.',
    icon: Building2,
  },
  {
    id: 'cashflow',
    number: '03',
    title: 'Make sense of the money',
    description:
      'Record rent and other income alongside recurring and one-off expenses. Compare annualised totals without a spreadsheet shuffle.',
    icon: Wallet,
  },
];
const faqs = [
  [
    'Who is TrackMyProps for?',
    'Australian property owners who want a private, organised view of their properties and entered financial information. Start with one property and add others as your portfolio grows.',
  ],
  [
    'Where do the property values come from?',
    'You enter your property values and their as-of dates. TrackMyProps does not provide automated valuations or live market estimates in this release.',
  ],
  [
    'How are income and expenses calculated?',
    'Recurring entries are normalised to annual totals using their frequency. One-off entries are included in their calendar year. Monthly figures are annual totals divided by 12. These are estimates based on entered records, not a bank transaction ledger.',
  ],
  [
    'How do I sign in?',
    'Use your ChatGPT account. Each signed-in user has a separate private portfolio. Your property records are checked against your identity on the server.',
  ],
];
export default function Home({ signInHref }: { signInHref: string }) {
  const [active, setActive] = useState('overview');
  const [menu, setMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <div className="landing">
      <header className="site-header">
        <a className="brand-link" href="/" aria-label="TrackMyProps home">
          <Brand />
        </a>
        <nav className={menu ? 'header-nav open' : 'header-nav'} aria-label="Main navigation">
          <a href="#features" onClick={() => setMenu(false)}>
            Features
          </a>
          <a href="#how-it-works" onClick={() => setMenu(false)}>
            How it works
          </a>
          <a href="#questions" onClick={() => setMenu(false)}>
            FAQs
          </a>
        </nav>
        <div className="header-actions">
          <a href={signInHref} target="_top" className="login-link">
            Log in <ArrowUpRight size={14} />
          </a>
          <a href={signInHref} target="_top" className="button button-small">
            Start your portfolio <ArrowRight size={15} />
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? 'Close navigation' : 'Open navigation'}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="green-dot" /> A LITTLE CLARITY GOES A LONG WAY
            </div>
            <h1>
              Your properties.
              <br />
              Your numbers.
              <br />
              <em>In perspective.</em>
            </h1>
            <p className="hero-description">
              Less scattered information. More understanding.
              <br className="desktop-break" /> A thoughtful home for your property portfolio.
            </p>
            <div className="hero-ctas">
              <a href={signInHref} target="_top" className="button">
                Bring your portfolio together <ArrowUpRight size={18} />
              </a>
              <a href="#features" className="text-link">
                Take a closer look <ArrowRight size={16} />
              </a>
            </div>
            <div className="hero-notes">
              <span>
                <Check size={14} /> Built for Australian property
              </span>
              <span>
                <LockKeyhole size={13} /> Your own private portfolio
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="floating-note note-top">
              <span className="note-icon">
                <Layers3 size={18} />
              </span>
              <div>
                From scattered to sorted.<small>One home for the whole portfolio.</small>
              </div>
              <span className="note-check">
                <Check size={12} />
              </span>
            </div>
            <div className="hero-preview">
              <PortfolioPreview />
            </div>
            <div className="floating-note note-bottom">
              <span className="note-icon lime">
                <ChartNoAxesCombined size={18} />
              </span>
              <div>
                A clearer view of equity<small>Property value, minus remaining debt.</small>
              </div>
              <svg width="70" height="30" viewBox="0 0 70 30">
                <path
                  d="m2 27 12-8 10 3 12-13 10 5L68 2"
                  fill="none"
                  stroke="#387258"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className="visual-caption">
              A glimpse of what clarity looks like. Illustrative sample data.
            </span>
          </div>
        </section>
        <div className="principles-strip">
          <span>MADE FOR YOUR PROPERTY JOURNEY</span>
          <p>
            <Building2 size={17} /> One property or a growing portfolio
          </p>
          <p>
            <ShieldCheck size={17} /> Private by design
          </p>
          <p>
            <CircleDollarSign size={17} /> Australian dollars. Clear numbers.
          </p>
        </div>
        <section id="features" className="section features-section">
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">EVERY DETAIL. A BETTER PICTURE.</span>
              <h2>
                A portfolio that makes
                <br />
                <em>sense at a glance.</em>
              </h2>
            </div>
            <p>
              You shouldn’t need five tabs and three spreadsheets
              <br className="desktop-break" /> to understand where things stand.
            </p>
          </div>
          <div className="feature-workspace reveal">
            <div className="feature-options" role="tablist" aria-label="Explore features">
              {features.map((f) => (
                <button
                  key={f.id}
                  id={`tab-${f.id}`}
                  role="tab"
                  aria-selected={active === f.id}
                  aria-controls="feature-preview"
                  className={`feature-option ${active === f.id ? 'selected' : ''}`}
                  onClick={() => setActive(f.id)}
                >
                  <span className="feature-number">{f.number}</span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.description}</p>
                  </div>
                  <ArrowUpRight size={19} />
                </button>
              ))}
            </div>
            <div
              className="feature-stage"
              id="feature-preview"
              role="tabpanel"
              aria-labelledby={`tab-${active}`}
            >
              <div className="stage-label">
                <span className="green-dot" />{' '}
                {active === 'overview'
                  ? 'THE BIG PICTURE'
                  : active === 'properties'
                    ? 'A PLACE FOR EVERY DETAIL'
                    : 'FOLLOW THE MONEY'}
              </div>
              <div className="stage-preview" key={active}>
                <PortfolioPreview mode={active} />
              </div>
              <div className="stage-footer">
                <ShieldCheck size={14} /> Illustrative preview · Your dashboard starts with your
                data
              </div>
            </div>
          </div>
        </section>
        <section className="details-section section">
          <div className="detail-card reveal">
            <div className="detail-visual mini-property">
              <HouseArt variant={1} />
              <div className="property-detail-tags">
                <span>3 bedrooms</span>
                <span>2 bathrooms</span>
                <span>540 m²</span>
              </div>
              <div className="mini-property-caption">
                <span>Every property has a story.</span>
                <b>Keep the details together.</b>
              </div>
            </div>
            <div className="detail-card-copy">
              <span className="small-icon">
                <Building2 size={20} />
              </span>
              <h3>More than an address.</h3>
              <p>
                Purchase dates, property attributes, notes and financial details. The important
                things, all in the right place.
              </p>
            </div>
          </div>
          <div className="detail-card reveal">
            <div className="detail-visual equity-visual">
              <span className="equity-label">UNDERSTAND WHAT YOU OWN</span>
              <div className="equity-ring">
                <div>
                  <small>Illustrative equity</small>
                  <strong>$320,000</strong>
                  <span>Value − remaining debt</span>
                </div>
              </div>
              <div className="equity-legend">
                <span>
                  <i /> Loan balance
                </span>
                <span>
                  <i /> Equity
                </span>
              </div>
            </div>
            <div className="detail-card-copy">
              <span className="small-icon">
                <SlidersHorizontal size={20} />
              </span>
              <h3>Your inputs. Clearer insights.</h3>
              <p>
                See values, loans and equity side by side. Missing information stays visible, so
                incomplete totals never masquerade as the full picture.
              </p>
            </div>
          </div>
          <div className="detail-card reveal">
            <div className="detail-visual ledger-visual">
              <div className="ledger-title">
                A little less guesswork.<span>Illustrative entries</span>
              </div>
              {[
                { name: 'Rental income', amount: '+$2,600', colour: 'green' },
                { name: 'Council rates', amount: '−$180', colour: 'amber' },
                { name: 'Property management', amount: '−$170', colour: 'amber' },
              ].map((r, i) => (
                <div className={`ledger-row ledger-${i}`} key={r.name}>
                  <span className={`ledger-icon ${r.colour}`}>
                    {i === 0 ? <ArrowUpRight size={17} /> : <Wallet size={16} />}
                  </span>
                  <span>
                    {r.name}
                    <small>Monthly example</small>
                  </span>
                  <b>{r.amount}</b>
                </div>
              ))}
            </div>
            <div className="detail-card-copy">
              <span className="small-icon">
                <Wallet size={20} />
              </span>
              <h3>Know what comes and goes.</h3>
              <p>
                Give every income and expense a name. Set its frequency, add its dates and
                understand your annualised position.
              </p>
            </div>
          </div>
        </section>
        <section className="how-section section" id="how-it-works">
          <div className="section-heading reveal">
            <div>
              <span className="eyebrow">A SIMPLE START</span>
              <h2>
                A little setup.
                <br />
                <em>A lot more perspective.</em>
              </h2>
            </div>
            <a href={signInHref} target="_top" className="text-link">
              Let’s get you organised <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="steps">
            {[
              {
                n: '01',
                title: 'Make yourself at home',
                text: 'Sign in with ChatGPT and open your own private property workspace.',
                icon: MousePointer2,
              },
              {
                n: '02',
                title: 'Bring in your properties',
                text: 'Enter your property details, purchase information and optional loan summary.',
                icon: HouseIcon,
              },
              {
                n: '03',
                title: 'See it all come together',
                text: 'Add income and expenses. Explore the numbers across your portfolio.',
                icon: ChartNoAxesCombined,
              },
            ].map((s) => (
              <div className="step reveal" key={s.n}>
                <div className="step-top">
                  <span>{s.n}</span>
                  <s.icon size={23} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="faq-section section" id="questions">
          <div className="faq-intro reveal">
            <span className="eyebrow">A FEW GOOD QUESTIONS</span>
            <h2>
              A little more
              <br />
              <em>peace of mind.</em>
            </h2>
            <p>Clear expectations, from the start.</p>
          </div>
          <div className="faqs reveal">
            {faqs.map(([q, a], i) => (
              <div className={`faq ${openFaq === i ? 'expanded' : ''}`} key={q}>
                <button
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {q}
                  <ChevronDown size={18} />
                </button>
                <div id={`faq-${i}`} hidden={openFaq !== i}>
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="cta-section reveal">
          <div className="cta-orbit orbit-a" />
          <div className="cta-orbit orbit-b" />
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS WITH CLARITY</span>
          <h2>
            Make room for
            <br />
            <em>the bigger picture.</em>
          </h2>
          <p>Your properties. Your progress. One thoughtful place.</p>
          <a href={signInHref} target="_top" className="button button-lime">
            Start your portfolio <ArrowUpRight size={18} />
          </a>
          <small>Sign in with your ChatGPT account.</small>
        </section>
      </main>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>A considered home for your property portfolio.</p>
        </div>
        <div className="footer-right">
          <a href="#features">Features</a>
          <a href="#questions">FAQs</a>
          <span>Made for Australian property owners.</span>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TrackMyProps</span>
          <span>
            Organisational tools and entered-data estimates. Not financial, tax or valuation advice.
          </span>
        </div>
      </footer>
    </div>
  );
}
function HouseIcon(props: { size?: number }) {
  return <Building2 {...props} />;
}
