'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useLang } from '@/context/LangContext';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const { lang, t, toggleLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const navItems = [
    { href: '/galeria', label: t.nav.gallery },
    { href: '/faq', label: t.nav.faq },
  ];

  return (
    <>
      <style>{`
        .sg-nav-outer {
          position: sticky;
          top: 1.1rem;
          z-index: 100;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.1rem 2rem 0;
          pointer-events: none;
        }

        .sg-nav-logo-float {
          pointer-events: all;
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 15px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          /*background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.50), rgba(255, 255, 255, 0.16));
          border: 1px solid rgba(255, 255, 255, 0.74);
          border-top-color: rgba(255, 255, 255, 0.96);
          border-bottom-color: rgba(0, 22, 45, 0.08);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.94),
            inset 0 -1px 0 rgba(0, 22, 45, 0.04),
            0 12px 34px rgba(0, 22, 45, 0.12);
          -webkit-backdrop-filter: blur(24px) saturate(190%) contrast(1.03);
          backdrop-filter: blur(24px) saturate(190%) contrast(1.03);*/
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }

        .sg-nav-logo-float:hover {
          transform: translateY(-2px) rotate(3deg);
          /*box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.98),
            0 18px 46px rgba(0, 22, 45, 0.16);*/
        }

        [data-theme="dark"] .sg-nav-logo-float {
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.035));
          border-color: rgba(255, 255, 255, 0.12);
          border-top-color: rgba(255, 255, 255, 0.24);
          border-bottom-color: rgba(0, 0, 0, 0.58);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.17),
            0 12px 36px rgba(0, 0, 0, 0.48);
        }

        .sg-navbar {
          position: relative;
          pointer-events: all;
          display: flex;
          align-items: center;
          gap: 0.2rem;
          padding: 0.43rem 0.56rem;
          border-radius: 100px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0.22) 48%, rgba(226, 236, 246, 0.30));
          border: 1px solid rgba(255, 255, 255, 0.74);
          border-top-color: rgba(255, 255, 255, 0.98);
          border-bottom-color: rgba(0, 22, 45, 0.10);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.96),
            inset 0 -1px 0 rgba(0, 22, 45, 0.055),
            0 14px 42px rgba(0, 22, 45, 0.13),
            0 2px 8px rgba(0, 22, 45, 0.06);
          -webkit-backdrop-filter: blur(30px) saturate(190%) contrast(1.04);
          backdrop-filter: blur(9px) saturate(190%) contrast(1.04);
          transform: translateZ(0);
          transition: background 0.35s, box-shadow 0.35s, border-color 0.35s, padding 0.3s;
        }

        .sg-navbar::before,
        .sg-navbar::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .sg-navbar::before {
          background:
            linear-gradient(115deg, rgba(255, 255, 255, 0.76), transparent 26% 62%, rgba(255, 255, 255, 0.18)),
            radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.72), transparent 35%);
          opacity: 0.72;
          mix-blend-mode: screen;
        }

        .sg-navbar::after {
          inset: 1px;
          border-radius: 999px;
          background:
            linear-gradient(to bottom, rgba(255, 255, 255, 0.48), transparent 46%),
            linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.20), transparent);
          opacity: 0.58;
        }

        .sg-navbar.scrolled {
          padding: 0.31rem 0.5rem;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.98),
            inset 0 -1px 0 rgba(0, 22, 45, 0.06),
            0 18px 54px rgba(0, 22, 45, 0.16),
            0 3px 10px rgba(0, 22, 45, 0.08);
        }

        [data-theme="dark"] .sg-navbar {
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04) 48%, rgba(157, 184, 220, 0.06));
          border-color: rgba(255, 255, 255, 0.12);
          border-top-color: rgba(255, 255, 255, 0.28);
          border-bottom-color: rgba(0, 0, 0, 0.62);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.20),
            inset 0 -1px 0 rgba(0, 0, 0, 0.50),
            0 14px 46px rgba(0, 0, 0, 0.56),
            0 2px 8px rgba(0, 0, 0, 0.36);
        }

        [data-theme="dark"] .sg-navbar::before {
          opacity: 0.35;
        }

        [data-theme="dark"] .sg-navbar.scrolled {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.24),
            0 16px 54px rgba(0, 0, 0, 0.68),
            0 2px 8px rgba(0, 0, 0, 0.48);
        }

        .sg-logo,
        .sg-sep,
        .sg-links,
        .sg-controls,
        .sg-hamburger {
          position: relative;
          z-index: 1;
        }

        .sg-logo {
          font-size: 1rem;
          font-weight: 700;
          color: var(--sg-text);
          letter-spacing: 0.05em;
          padding: 0.36rem 0.68rem;
          white-space: nowrap;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.3s;
        }

        .sg-sep {
          width: 1px;
          height: 14px;
          flex-shrink: 0;
          margin: 0 0.12rem;
          background: linear-gradient(to bottom, transparent, rgba(0, 22, 45, 0.18), transparent);
        }

        [data-theme="dark"] .sg-sep {
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.18), transparent);
        }

        .sg-links {
          display: flex;
          gap: 0.04rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .sg-link {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--sg-muted);
          padding: 0.36rem 0.80rem;
          border-radius: 100px;
          white-space: nowrap;
          text-decoration: none;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
        }

        .sg-link:hover,
        .sg-link.active {
          color: var(--sg-text);
          background: rgba(255, 255, 255, 0.36);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.72),
            inset 0 -1px 0 rgba(0, 22, 45, 0.04);
        }

        [data-theme="dark"] .sg-link:hover,
        [data-theme="dark"] .sg-link.active {
          color: rgba(240, 235, 230, 0.94);
          background: rgba(255, 255, 255, 0.10);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .sg-controls {
          display: flex;
          align-items: center;
          gap: 0.32rem;
          padding-left: 0.12rem;
        }

        .sg-ctrl {
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.64);
          border-top-color: rgba(255, 255, 255, 0.88);
          border-bottom-color: rgba(0, 22, 45, 0.08);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.16));
          color: var(--sg-muted);
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.26rem;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.76),
            0 1px 3px rgba(0, 22, 45, 0.07);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          backdrop-filter: blur(18px) saturate(170%);
          transition: background 0.18s, color 0.18s, transform 0.2s, border-color 0.18s;
        }

        .sg-ctrl:hover {
          color: var(--sg-text);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.64), rgba(255, 255, 255, 0.22));
        }

        [data-theme="dark"] .sg-ctrl {
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.035));
          border-color: rgba(255, 255, 255, 0.11);
          border-top-color: rgba(255, 255, 255, 0.22);
          border-bottom-color: rgba(0, 0, 0, 0.52);
          color: rgba(200, 210, 220, 0.70);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.13),
            0 1px 3px rgba(0, 0, 0, 0.30);
        }

        [data-theme="dark"] .sg-ctrl:hover {
          color: rgba(240, 235, 230, 0.95);
          background: rgba(255, 255, 255, 0.12);
        }

        .sg-ctrl-lang {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 0.28rem 0.55rem;
        }

        .sg-ctrl-lang .flag {
          font-size: 0.70rem;
          line-height: 1;
        }

        .sg-ctrl-theme {
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .sg-ctrl-theme:hover {
          transform: rotate(18deg);
        }

        [data-theme="dark"] .sg-ctrl-theme:hover {
          transform: rotate(-18deg);
        }

        .sg-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.36rem 0.52rem;
        }

        .sg-hamburger span {
          display: block;
          width: 16px;
          height: 1.5px;
          background: var(--sg-muted);
          transition: transform 0.3s, opacity 0.3s;
        }

        .sg-hamburger.open span:nth-child(1) {
          transform: translateY(6.5px) rotate(45deg);
        }

        .sg-hamburger.open span:nth-child(2) {
          transform: translateY(-6.5px) rotate(-45deg);
        }

        @media (max-width: 640px) {
          .sg-nav-outer {
            top: 0.65rem;
            gap: 0.5rem;
            padding-inline: 1rem;
            position: relative; /* added */
          }

          .sg-nav-logo-float {
            width: 40px;
            height: 40px;
            border-radius: 13px;
          }

          .sg-hamburger {
            display: flex;
          }

          .sg-links {
            display: none;
            position: absolute;     /* changed from fixed */
            top: 66px;
            left: 50%;
            transform: translateX(-50%);
            flex-direction: column;
            min-width: 165px;
            padding: 0.42rem;
            border-radius: 18px;
            z-index: 200;            /* added, to sit above other content */
            background:
              linear-gradient(145deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.22));
            border: 1px solid rgba(255, 255, 255, 0.74);
            border-top-color: rgba(255, 255, 255, 0.96);
            border-bottom-color: rgba(0, 22, 45, 0.08);
            box-shadow:
              inset 0 1px 0 rgba(255, 255, 255, 0.92),
              0 14px 42px rgba(0, 22, 45, 0.14);
            -webkit-backdrop-filter: blur(28px) saturate(190%);
            backdrop-filter: blur(28px) saturate(190%);
          }

          [data-theme="dark"] .sg-links {
            background:
              linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04));
            border-color: rgba(255, 255, 255, 0.11);
            border-top-color: rgba(255, 255, 255, 0.24);
            border-bottom-color: rgba(0, 0, 0, 0.58);
            box-shadow:
              inset 0 1px 0 rgba(255, 255, 255, 0.16),
              0 16px 48px rgba(0, 0, 0, 0.62);
          }

          .sg-links.open {
            display: flex;
          }

          .sg-link {
            text-align: center;
            padding: 0.58rem 1rem;
            border-radius: 12px;
            font-size: 0.80rem;
          }
        }

        /* Desktop links — inside the navbar pill */
        .sg-links-desktop {
          display: flex;
          gap: 0.04rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        /* Mobile dropdown — outside the navbar */
        .sg-links-mobile {
          display: none;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        @media (max-width: 640px) {
          .sg-nav-outer {
            top: 0.65rem;
            gap: 0.5rem;
            padding-inline: 1rem;
            position: relative;
          }

          .sg-nav-logo-float {
            width: 40px;
            height: 40px;
            border-radius: 13px;
          }

          .sg-hamburger {
            display: flex;
          }

          .sg-links-desktop {
            display: none; /* hide desktop links on mobile */
          }

          .sg-links-mobile.open {
            display: flex;
            position: absolute;
            top: 66px;
            left: 50%;
            transform: translateX(-50%);
            flex-direction: column;
            min-width: 165px;
            padding: 0.42rem;
            border-radius: 18px;
            z-index: 200;
            background:
              linear-gradient(145deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.22));
            border: 1px solid rgba(255, 255, 255, 0.74);
            border-top-color: rgba(255, 255, 255, 0.96);
            border-bottom-color: rgba(0, 22, 45, 0.08);
            box-shadow:
              inset 0 1px 0 rgba(255, 255, 255, 0.92),
              0 14px 42px rgba(0, 22, 45, 0.14);
            -webkit-backdrop-filter: blur(28px) saturate(190%);
            backdrop-filter: blur(28px) saturate(190%);
          }

          [data-theme="dark"] .sg-links-mobile.open {
            background:
              linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.04));
            border-color: rgba(255, 255, 255, 0.11);
            border-top-color: rgba(255, 255, 255, 0.24);
            border-bottom-color: rgba(0, 0, 0, 0.58);
            box-shadow:
              inset 0 1px 0 rgba(255, 255, 255, 0.16),
              0 16px 48px rgba(0, 0, 0, 0.62);
          }

          .sg-links-mobile .sg-link {
            text-align: center;
            padding: 0.58rem 1rem;
            border-radius: 12px;
            font-size: 0.80rem;
          }
        }

        @media (min-width: 641px) {
          .sg-hamburger {
            display: none !important;
          }

          .sg-links-mobile {
            display: none !important;
          }
        }
      `}</style>

      <div className="sg-nav-outer">
        <Link href="/" className="sg-nav-logo-float" aria-label={lang === 'es' ? 'Ir a inicio' : 'Go home'}>
          <Image src="/models/logo-sg.png" alt="SG Signare" width={55} height={55} priority style={{ objectFit: 'contain' }} />
        </Link>

        <nav className={`sg-navbar${scrolled ? ' scrolled' : ''}`}>
          <Link href="/" className="sg-logo">SG Signare</Link>

          <div className="sg-sep" />

          {/* Desktop links */}
          <ul className="sg-links-desktop">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sg-link${pathname === item.href ? ' active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="sg-sep" />

          <div className="sg-controls">
            <button className="sg-ctrl sg-ctrl-lang" onClick={toggleLang} aria-label="Toggle language">
              <span className="flag">{lang === 'es' ? 'MX' : 'US'}</span>
              {lang.toUpperCase()}
            </button>

            <button
              className="sg-ctrl sg-ctrl-theme"
              onClick={() => setIsDark((dark) => !dark)}
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          <button
            className={`sg-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={lang === 'es' ? 'Menú' : 'Menu'}
          >
            <span />
            <span />
          </button>
        </nav>

        {/* Mobile dropdown links */}
        <ul className={`sg-links-mobile${menuOpen ? ' open' : ''}`}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`sg-link${pathname === item.href ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
