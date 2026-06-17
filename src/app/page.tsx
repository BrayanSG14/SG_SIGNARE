'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brush, Cuboid, CheckCircle, Truck } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function HomePage() {
  const { t } = useLang();

  const icons = [
    <Brush className="w-8 h-8" key="brush" />,
    <Cuboid className="w-8 h-8" key="cuboid" />,
    <CheckCircle className="w-8 h-8" key="check" />,
    <Truck className="w-8 h-8" key="truck" />,
  ];

  return (
    <>
      <style>{`
        .sg-page {
          position: relative;
          isolation: isolate;
          min-height: 100%;
          overflow: hidden;
          color: var(--sg-text);
          transition: color 0.4s;
        }

        .sg-page::before,
        .sg-page::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: -1;
        }

        .sg-page::before {
          background:
            linear-gradient(115deg, transparent 0 18%, rgba(120, 101, 77, 0.08) 18.1% 18.35%, transparent 18.45% 100%),
            linear-gradient(74deg, transparent 0 47%, rgba(0, 22, 45, 0.055) 47.1% 47.28%, transparent 47.38% 100%),
            radial-gradient(ellipse at 82% 18%, rgba(174, 153, 118, 0.08), transparent 28rem),
            radial-gradient(ellipse at 18% 72%, rgba(112, 139, 146, 0.13), transparent 30rem);
        }

        .sg-page::after {
          opacity: 0.46;
          background-image:
            repeating-linear-gradient(90deg, rgba(0, 22, 45, 0.035) 0 1px, transparent 1px 42px),
            repeating-linear-gradient(0deg, rgba(0, 22, 45, 0.026) 0 1px, transparent 1px 42px),
            linear-gradient(135deg, transparent 0 45%, rgba(0, 22, 45, 0.035) 45.1% 45.35%, transparent 45.45% 100%);
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.28) 72%, transparent);
        }

        [data-theme="dark"] .sg-page::before {
          background:
            linear-gradient(115deg, transparent 0 18%, rgba(255, 255, 255, 0.055) 18.1% 18.35%, transparent 18.45% 100%),
            linear-gradient(74deg, transparent 0 47%, rgba(185, 204, 220, 0.05) 47.1% 47.28%, transparent 47.38% 100%),
            radial-gradient(ellipse at 82% 18%, rgba(180, 160, 125, 0), transparent 28rem),
            radial-gradient(ellipse at 18% 72%, rgba(110, 145, 160, 0.10), transparent 30rem);
        }

        [data-theme="dark"] .sg-page::after {
          opacity: 0.34;
          background-image:
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 42px),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 42px),
            linear-gradient(135deg, transparent 0 45%, rgba(255, 255, 255, 0.04) 45.1% 45.35%, transparent 45.45% 100%);
        }

        .sg-hero {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 7.4rem 1.5rem 5.2rem;
        }

        .sg-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 720px;
        }

        .sg-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--sg-muted);
          margin-bottom: 1.5rem;
          padding: 0.34rem 0.95rem;
          border-radius: 100px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.54), rgba(255, 255, 255, 0.18));
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.95),
            0 8px 28px rgba(0, 22, 45, 0.07);
          -webkit-backdrop-filter: blur(18px) saturate(180%);
          backdrop-filter: blur(18px) saturate(180%);
        }

        [data-theme="dark"] .sg-hero-eyebrow {
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.035));
          border-color: rgba(255, 255, 255, 0.13);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            0 10px 34px rgba(0, 0, 0, 0.40);
        }

        .sg-hero-eyebrow::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.72;
        }

        .sg-hero-title {
          font-size: clamp(2.7rem, 6vw, 4.35rem);
          font-weight: 700;
          line-height: 1.04;
          margin: 0 0 1.35rem;
          color: var(--sg-text);
        }

        .sg-hero-sub {
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--sg-muted);
          margin: 0 auto 2.6rem;
          max-width: 580px;
        }

        .sg-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }

        .sg-btn-primary,
        .sg-btn-ghost {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 42px;
          padding: 0.74rem 1.72rem;
          border-radius: 100px;
          font-size: 0.88rem;
          text-decoration: none;
          overflow: hidden;
          transition: transform 0.22s, box-shadow 0.22s, background 0.22s, color 0.22s;
        }

        .sg-btn-primary::before,
        .sg-btn-ghost::before,
        .sg-card::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(115deg, rgba(255, 255, 255, 0.68), transparent 28% 62%, rgba(255, 255, 255, 0.18)),
            radial-gradient(circle at 22% 0%, rgba(255, 255, 255, 0.72), transparent 34%);
          opacity: 0.72;
          mix-blend-mode: screen;
        }

        .sg-btn-primary {
          font-weight: 650;
          background: #00162d73;
          color: #faf7f3;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.20),
            inset 0 -1px 0 rgba(0, 0, 0, 0.24),
            0 10px 30px rgba(0, 22, 45, 0.24);
        }

        .sg-btn-primary:hover,
        .sg-btn-ghost:hover {
          transform: translateY(-2px);
        }

        .sg-btn-primary:hover {
          background: #002344;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 16px 42px rgba(0, 22, 45, 0.32);
        }

        .sg-btn-ghost {
          font-weight: 550;
          color: var(--sg-text);
          background:
            linear-gradient(135deg, rgba(0, 52, 135, 0.14), rgba(25, 48, 104, 0.10));
          border: 1px solid rgba(255, 255, 255, 0.70);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.92),
            inset 0 -1px 0 rgba(0, 22, 45, 0.06),
            0 9px 28px rgba(0, 22, 45, 0.08);
          -webkit-backdrop-filter: blur(22px) saturate(175%);
          backdrop-filter: blur(22px) saturate(175%);
        }

        .sg-btn-ghost:hover {
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.28));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.96),
            0 16px 40px rgba(0, 22, 45, 0.12);
        }

        [data-theme="dark"] .sg-btn-primary {
          background: rgba(240, 235, 230, 0.94);
          color: #0f0d0b;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.55),
            0 12px 34px rgba(0, 0, 0, 0.42);
        }

        [data-theme="dark"] .sg-btn-primary:hover {
          background: #fff;
        }

        [data-theme="dark"] .sg-btn-ghost {
          color: rgba(240, 235, 230, 0.90);
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.035));
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -1px 0 rgba(0, 0, 0, 0.45),
            0 10px 34px rgba(0, 0, 0, 0.42);
        }

        .sg-divider {
          height: 1px;
          max-width: 960px;
          margin: 0 auto;
          background: linear-gradient(to right, transparent, var(--sg-border), transparent);
        }

        .sg-features {
          padding: 5rem 1.5rem 6.4rem;
        }

        .sg-features-head {
          text-align: center;
          margin-bottom: 3.4rem;
        }

        .sg-section-title {
          font-size: clamp(1.65rem, 3.5vw, 2.42rem);
          font-weight: 700;
          line-height: 1.14;
          margin: 0 0 0.9rem;
          color: var(--sg-text);
        }

        .sg-section-sub {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--sg-muted);
          max-width: 480px;
          margin: 0 auto;
        }

        .sg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1rem;
          max-width: 980px;
          margin: 0 auto;
        }

        .sg-card {
          position: relative;
          min-height: 225px;
          padding: 1.85rem 1.6rem;
          border-radius: 18px;
          overflow: hidden;
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.22) 54%, rgba(226, 235, 244, 0.30) 100%);
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-top-color: rgba(255, 255, 255, 0.96);
          border-bottom-color: rgba(0, 22, 45, 0.11);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.96),
            inset 0 -1px 0 rgba(0, 22, 45, 0.06),
            0 18px 50px rgba(0, 22, 45, 0.10),
            0 2px 8px rgba(0, 22, 45, 0.05);
          -webkit-backdrop-filter: blur(10px) saturate(90%) contrast(1.04);
          backdrop-filter: blur(1px) saturate(90%) contrast(1.04);
          transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
        }

        .sg-card::after {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 17px;
          pointer-events: none;
          background:
            linear-gradient(155deg, rgba(255, 255, 255, 0.62), transparent 24%),
            linear-gradient(335deg, transparent 0 68%, rgba(255, 255, 255, 0.26) 78%, transparent 100%);
          opacity: 0.78;
        }

        .sg-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 255, 255, 0.84);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.98),
            inset 0 -1px 0 rgba(0, 22, 45, 0.07),
            0 26px 64px rgba(0, 22, 45, 0.15),
            0 4px 12px rgba(0, 22, 45, 0.08);
        }

        [data-theme="dark"] .sg-card {
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.045) 52%, rgba(156, 178, 208, 0.06) 100%);
          border-color: rgba(255, 255, 255, 0.11);
          border-top-color: rgba(255, 255, 255, 0.25);
          border-bottom-color: rgba(0, 0, 0, 0.58);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -1px 0 rgba(0, 0, 0, 0.50),
            0 18px 52px rgba(0, 0, 0, 0.58),
            0 2px 8px rgba(0, 0, 0, 0.34);
        }

        [data-theme="dark"] .sg-card:hover {
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.24),
            0 28px 72px rgba(0, 0, 0, 0.68),
            0 4px 14px rgba(0, 0, 0, 0.42);
        }

        .sg-card-icon,
        .sg-card-title,
        .sg-card-desc {
          position: relative;
          z-index: 1;
        }

        .sg-card-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sg-text);
          margin-bottom: 1.15rem;
          /*background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0.16));
          border: 1px solid rgba(255, 255, 255, 0.64);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.90),
            0 6px 18px rgba(0, 22, 45, 0.08);
          -webkit-backdrop-filter: blur(18px) saturate(170%);
          backdrop-filter: blur(18px) saturate(170%);*/
        }

        [data-theme="dark"] .sg-card-icon {
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.035));
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 8px 22px rgba(0, 0, 0, 0.32);
        }

        .sg-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 0.52rem;
          color: var(--sg-text);
        }

        .sg-card-desc {
          font-size: 0.83rem;
          line-height: 1.68;
          color: var(--sg-muted);
          margin: 0;
        }

        @media (max-width: 640px) {
          .sg-hero {
            padding: 5.4rem 1.25rem 4.2rem;
          }

          .sg-features {
            padding: 3.7rem 1.25rem 4.8rem;
          }

          .sg-card {
            min-height: auto;
          }
        }
      `}</style>

      <div className="sg-page">
        <section className="sg-hero">
          <motion.div
            className="sg-hero-inner"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sg-hero-eyebrow">{t.hero.eyebrow}</div>

            <h1 className="sg-hero-title">{t.hero.title}</h1>

            <p className="sg-hero-sub">{t.hero.sub}</p>

            <div className="sg-hero-actions">
              <Link href="/designer" className="sg-btn-primary">
                {t.hero.cta1}
              </Link>
              <Link href="/galeria" className="sg-btn-ghost">
                {t.hero.cta2}
              </Link>
            </div>
          </motion.div>
        </section>

        <div className="sg-divider" />

        <section className="sg-features">
          <motion.div
            className="sg-features-head"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="sg-section-title">{t.features.title}</h2>
            <p className="sg-section-sub">{t.features.sub}</p>
          </motion.div>

          <div className="sg-grid">
            {t.features.items.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="sg-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <div className="sg-card-icon">{icons[index]}</div>
                <h3 className="sg-card-title">{feature.title}</h3>
                <p className="sg-card-desc">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
