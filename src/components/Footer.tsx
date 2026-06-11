'use client';

import Link from 'next/link';
import { useLang } from '@/context/LangContext';

export default function Footer() {
  const { t } = useLang();

  return (
    <>
      <style>{`
        .sg-footer {
          display: flex;
          justify-content: center;
          padding: 1.8rem 1.5rem;
        }

        .sg-footer-inner {
          position: relative;
          width: 100%;
          max-width: 800px;
          overflow: hidden;
          border-radius: 18px;
          padding: 1.5rem 1.8rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.50), rgba(255, 255, 255, 0.20) 52%, rgba(226, 236, 246, 0.26));
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-top-color: rgba(255, 255, 255, 0.96);
          border-bottom-color: rgba(0, 22, 45, 0.10);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            inset 0 -1px 0 rgba(0, 22, 45, 0.055),
            0 14px 42px rgba(0, 22, 45, 0.09),
            0 2px 8px rgba(0, 22, 45, 0.04);
          -webkit-backdrop-filter: blur(28px) saturate(185%) contrast(1.03);
          backdrop-filter: blur(28px) saturate(185%) contrast(1.03);
        }

        .sg-footer-inner::before,
        .sg-footer-inner::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .sg-footer-inner::before {
          background:
            linear-gradient(115deg, rgba(255, 255, 255, 0.68), transparent 28% 64%, rgba(255, 255, 255, 0.16)),
            radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.70), transparent 34%);
          opacity: 0.64;
          mix-blend-mode: screen;
        }

        .sg-footer-inner::after {
          inset: 1px;
          border-radius: 17px;
          background:
            linear-gradient(to bottom, rgba(255, 255, 255, 0.38), transparent 48%),
            linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent);
          opacity: 0.52;
        }

        [data-theme="dark"] .sg-footer-inner {
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.035) 52%, rgba(157, 184, 220, 0.05));
          border-color: rgba(255, 255, 255, 0.11);
          border-top-color: rgba(255, 255, 255, 0.24);
          border-bottom-color: rgba(0, 0, 0, 0.58);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.17),
            inset 0 -1px 0 rgba(0, 0, 0, 0.50),
            0 14px 44px rgba(0, 0, 0, 0.52),
            0 2px 8px rgba(0, 0, 0, 0.34);
        }

        [data-theme="dark"] .sg-footer-inner::before {
          opacity: 0.34;
        }

        .sg-footer-brand,
        .sg-footer-links,
        .sg-footer-copy {
          position: relative;
          z-index: 1;
        }

        .sg-footer-brand {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sg-text);
          text-decoration: none;
          transition: color 0.3s;
        }

        .sg-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.15rem;
        }

        .sg-footer-link {
          font-size: 1rem;
          color: var(--sg-muted);
          text-decoration: none;
          padding: 0.26rem 0.68rem;
          border-radius: 100px;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
        }

        .sg-footer-link:hover {
          color: var(--sg-text);
          background: rgba(255, 255, 255, 0.36);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.72),
            inset 0 -1px 0 rgba(0, 22, 45, 0.04);
        }

        [data-theme="dark"] .sg-footer-link:hover {
          color: rgba(240, 235, 230, 0.88);
          background: rgba(255, 255, 255, 0.09);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .sg-footer-copy {
          width: 100%;
          margin: 0.3rem 0 0;
          padding-top: 0.9rem;
          border-top: 1px solid rgba(0, 22, 45, 0.08);
          color: var(--sg-muted);
          font-size: 0.69rem;
          text-align: center;
          transition: border-color 0.4s, color 0.4s;
        }

        [data-theme="dark"] .sg-footer-copy {
          border-top-color: rgba(255, 255, 255, 0.07);
        }

        @media (max-width: 640px) {
          .sg-footer {
            padding: 1.2rem 1rem;
          }

          .sg-footer-inner {
            padding: 1.4rem 1.2rem;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            gap: 0.7rem;
            border-radius: 16px;
          }

          .sg-footer-brand {
            font-size: 1.15rem;
          }

          .sg-footer-links {
            justify-content: center;
            gap: 0.1rem;
          }

          .sg-footer-link {
            font-size: 0.85rem;
            padding: 0.32rem 0.7rem;
          }

          .sg-footer-copy {
            font-size: 0.65rem;
            padding-top: 0.7rem;
          }
        }
      `}</style>

      <footer className="sg-footer">
        <div className="sg-footer-inner">
          <Link href="/" className="sg-footer-brand">
            SG Signare
          </Link>
          <nav className="sg-footer-links">
            <Link href="/galeria" className="sg-footer-link">
              {t.footer.links.gallery}
            </Link>
            <Link href="/faq" className="sg-footer-link">
              {t.footer.links.faq}
            </Link>
          </nav>
          <p className="sg-footer-copy">
            © {new Date().getFullYear()} SG SIGNARE — {t.footer.tagline}
          </p>
        </div>
      </footer>
    </>
  );
}