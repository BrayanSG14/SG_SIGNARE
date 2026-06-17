// app/pedido/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

const fabricNames = {
  algodon: 'Algodón',
  poliester: 'Poliéster',
  mezcla: 'Mezcla',
  premium: 'Premium'
};

const colorNames = {
  '#ffffff': 'Blanco',
  '#646464ff': 'Gris',
  '#2d2d2dff': 'Grafito',
  '#121212ff': 'Negro',
  '#00162d': 'Azul Noche'
};

const translateSide = (side) => (side === 'front' ? 'Frente' : 'Trasero');

const SCALE_TO_CM = 50;
const getElementDimensionsInCm = (element) => {
  const width = (element.scaleX || element.scale) * SCALE_TO_CM;
  const height = (element.scaleY || element.scale) * SCALE_TO_CM;
  return { width: width.toFixed(1), height: height.toFixed(1) };
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const lgStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ══════════════════════════════════════════
     TOKENS
  ══════════════════════════════════════════ */
  :root {
    --navy:   #00162d;
    --cream:  #faf7f3;

    --text-primary:   #00162d;
    --text-secondary: rgba(0,22,45,0.60);
    --text-muted:     rgba(0,22,45,0.45);

    /* liquid glass surfaces */
    --glass-bg:          rgba(255,255,255,0.52);
    --glass-bg-strong:   rgba(255,255,255,0.72);
    --glass-border:      rgba(255,255,255,0.70);
    --glass-border-top:  rgba(255,255,255,0.96);
    --glass-border-bot:  rgba(0,22,45,0.10);
    --glass-shine:       rgba(255,255,255,0.95);
    --glass-shadow:      rgba(0,22,45,0.10);
    --glass-shadow-deep: rgba(0,22,45,0.16);
    --glass-blur:        blur(22px) saturate(180%) contrast(1.02);

    --field-bg:           rgba(255,255,255,0.48);
    --field-border:       rgba(255,255,255,0.68);
    --field-border-focus: rgba(0,22,45,0.35);

    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 22px;
    --ease: cubic-bezier(0.4,0,0.2,1);
  }

  [data-theme="dark"] {
    --navy:  #f0ebe2;
    --cream: #0f0d0b;

    --text-primary:   rgba(240,238,234,0.95);
    --text-secondary: rgba(220,215,205,0.60);
    --text-muted:     rgba(200,195,185,0.45);

    --glass-bg:          rgba(255,255,255,0.07);
    --glass-bg-strong:   rgba(255,255,255,0.11);
    --glass-border:      rgba(255,255,255,0.11);
    --glass-border-top:  rgba(255,255,255,0.24);
    --glass-border-bot:  rgba(0,0,0,0.55);
    --glass-shine:       rgba(255,255,255,0.18);
    --glass-shadow:      rgba(0,0,0,0.40);
    --glass-shadow-deep: rgba(0,0,0,0.58);
    --glass-blur:        blur(28px) saturate(200%) brightness(1.06);

    --field-bg:           rgba(255,255,255,0.07);
    --field-border:       rgba(255,255,255,0.13);
    --field-border-focus: rgba(255,255,255,0.35);
  }

  /* ══════════════════════════════════════════
     PAGE WRAPPER — fondo transparente,
     hereda del body en global.css
  ══════════════════════════════════════════ */
  .op-page {
    position: relative;
    isolation: isolate;
    min-height: 100vh;
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    padding: 40px 16px 80px;
    transition: color 0.35s;
    background: transparent;
  }

  .op-container {
    max-width: 1180px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* ══════════════════════════════════════════
     LIQUID GLASS — surface mixin
     Reutilizable con modificadores
  ══════════════════════════════════════════ */

  /* Panel grande */
  .lg-panel {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-lg);
    /*background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);*/
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: var(--glass-border-bot);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      inset 0 -1px 0 var(--glass-border-bot),
      0 20px 56px var(--glass-shadow),
      0 4px 12px rgba(0,0,0,0.05);
    transition: box-shadow 0.25s var(--ease), border-color 0.25s var(--ease);
  }

  /* Destello interior (capa superior) */
  .lg-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    border-radius: var(--radius-lg);
    background:
      linear-gradient(140deg, rgba(255,255,255,0.55) 0%, transparent 30%),
      radial-gradient(ellipse at 18% 0%, rgba(255,255,255,0.48), transparent 38%);
    mix-blend-mode: screen;
    opacity: 0.75;
  }

  [data-theme="dark"] .lg-panel::before { opacity: 0.28; }

  /* Línea superior de luz (specular) */
  .lg-panel::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.90) 50%, transparent 95%);
    pointer-events: none;
    z-index: 1;
  }

  [data-theme="dark"] .lg-panel::after {
    background: linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.22) 50%, transparent 95%);
  }

  /* ── Panel header ── */
  .lg-panel-header {
    position: relative;
    z-index: 2;
    padding: 18px 24px;
    border-bottom: 1px solid var(--glass-border);
    background: rgba(0,22,45,0.10);
    backdrop-filter: blur(8px);
  }

  [data-theme="dark"] .lg-panel-header {
    background: rgba(255,255,255,0.04);
    border-bottom-color: rgba(255,255,255,0.08);
  }

  .lg-panel-header h2 {
    font-size: 14px;
    font-weight: 650;
    color: var(--text-primary);
    letter-spacing: -0.01em;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .lg-panel-header p {
    font-size: 11.5px;
    color: var(--text-muted);
    margin: 4px 0 0;
  }

  /* ── Panel body ── */
  .lg-panel-body {
    position: relative;
    z-index: 2;
    padding: 22px;
  }

  /* ── Card interior (superficie secundaria) ── */
  .lg-card {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-md);
    background: var(--glass-bg-strong);
    backdrop-filter: blur(14px) saturate(160%);
    -webkit-backdrop-filter: blur(14px) saturate(160%);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: var(--glass-border-bot);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 6px 20px var(--glass-shadow);
  }

  .lg-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 28%);
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.70;
  }

  [data-theme="dark"] .lg-card::before { opacity: 0.22; }

  /* ══════════════════════════════════════════
     INPUTS — liquid glass
  ══════════════════════════════════════════ */
  .lg-input {
    width: 100%;
    padding: 11px 14px;
    background: var(--field-bg);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    border: 1px solid var(--field-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: var(--glass-border-bot);
    border-radius: var(--radius-sm);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      inset 0 -1px 0 var(--glass-border-bot),
      0 4px 12px rgba(0,22,45,0.05);
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }

  .lg-input::placeholder { color: var(--text-muted); }

  .lg-input:focus {
    border-color: var(--field-border-focus);
    border-top-color: var(--field-border-focus);
    background: rgba(255,255,255,0.70);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.98),
      0 0 0 3px rgba(0,22,45,0.06),
      0 6px 18px rgba(0,22,45,0.08);
  }

  [data-theme="dark"] .lg-input:focus {
    border-color: var(--field-border-focus);
    background: rgba(255,255,255,0.11);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.22),
      0 0 0 3px rgba(255,255,255,0.05),
      0 6px 18px rgba(0,0,0,0.35);
  }

  .lg-input.error { border-color: rgba(220,38,38,0.55); }
  .lg-input.error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.09); }

  .lg-label {
    display: block;
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 7px;
  }

  .lg-error-msg {
    font-size: 11.5px;
    color: rgb(185,28,28);
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* ══════════════════════════════════════════
     DELIVERY CARDS — liquid glass seleccionable
  ══════════════════════════════════════════ */
  .lg-delivery-card {
    position: relative;
    overflow: hidden;
    padding: 18px;
    border-radius: var(--radius-md);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: var(--glass-border-bot);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 8px 24px var(--glass-shadow);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    text-align: center;
    transition: all 0.25s var(--ease);
  }

  .lg-delivery-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(140deg, rgba(255,255,255,0.42) 0%, transparent 30%);
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.65;
    transition: opacity 0.25s;
  }

  .lg-delivery-card:hover:not(.active) {
    transform: translateY(-3px);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 18px 44px var(--glass-shadow-deep);
  }

  .lg-delivery-card:hover:not(.active)::before { opacity: 0.85; }

  .lg-delivery-card.active {
    border-color: rgba(0,22,45,0.28);
    border-top-color: rgba(0,22,45,0.38);
    background: rgba(0,22,45,0.07);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.60),
      0 10px 30px rgba(0,22,45,0.14),
      0 0 0 1.5px rgba(0,22,45,0.12);
  }

  [data-theme="dark"] .lg-delivery-card.active {
    border-color: rgba(255,255,255,0.28);
    background: rgba(255,255,255,0.10);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.28),
      0 10px 32px rgba(0,0,0,0.45),
      0 0 0 1.5px rgba(255,255,255,0.16);
  }

  .lg-delivery-icon {
    width: 42px;
    height: 42px;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--glass-bg-strong);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 4px 12px var(--glass-shadow);
    color: var(--text-muted);
    transition: all 0.22s var(--ease);
    position: relative;
    z-index: 1;
  }

  .lg-delivery-card.active .lg-delivery-icon {
    background: rgba(0,22,45,0.90);
    color: #faf7f3;
    border-color: transparent;
    box-shadow: 0 6px 18px rgba(0,22,45,0.28), inset 0 1px 0 rgba(255,255,255,0.18);
  }

  [data-theme="dark"] .lg-delivery-card.active .lg-delivery-icon {
    background: rgba(240,238,234,0.15);
    color: rgba(240,238,234,0.95);
    box-shadow: 0 6px 18px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.18);
  }

  /* ══════════════════════════════════════════
     SUMMARY ROWS
  ══════════════════════════════════════════ */
  .lg-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 11px;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: var(--glass-border-bot);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 2px 8px rgba(0,22,45,0.04);
    margin-bottom: 6px;
    transition: background 0.15s;
  }

  .lg-summary-row:last-child { margin-bottom: 0; }

  /* ══════════════════════════════════════════
     TABS
  ══════════════════════════════════════════ */
  .lg-tab-group {
    display: flex;
    gap: 3px;
    padding: 3px;
    border-radius: 13px;
    background: rgba(0,22,45,0.05);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      inset 0 2px 6px rgba(0,22,45,0.06);
    backdrop-filter: blur(10px);
    margin-bottom: 14px;
  }

  [data-theme="dark"] .lg-tab-group {
    background: rgba(255,255,255,0.04);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.08),
      inset 0 2px 6px rgba(0,0,0,0.20);
  }

  .lg-tab {
    flex: 1;
    padding: 8px 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.18s var(--ease);
  }

  .lg-tab.active {
    background: var(--glass-bg-strong);
    backdrop-filter: blur(14px);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    color: var(--text-primary);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 4px 14px var(--glass-shadow);
  }

  .lg-tab:hover:not(.active) {
    color: var(--text-primary);
    background: rgba(255,255,255,0.30);
  }

  [data-theme="dark"] .lg-tab.active {
    background: rgba(255,255,255,0.11);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.20),
      0 4px 14px rgba(0,0,0,0.30);
  }

  /* ══════════════════════════════════════════
     IMAGE PREVIEW CONTAINER
  ══════════════════════════════════════════ */
  .lg-preview-box {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-md);
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: var(--glass-border-bot);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 6px 20px var(--glass-shadow);
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .lg-preview-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(140deg, rgba(255,255,255,0.30) 0%, transparent 28%);
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.60;
  }

  /* ══════════════════════════════════════════
     DOWNLOAD BUTTON
  ══════════════════════════════════════════ */
  .lg-download-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: var(--glass-border-bot);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 4px 14px var(--glass-shadow);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 550;
    color: var(--text-secondary);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.22s var(--ease);
    position: relative;
    overflow: hidden;
  }

  .lg-download-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 28%);
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.60;
    transition: opacity 0.22s;
  }

  .lg-download-btn:hover {
    transform: translateY(-2px);
    color: var(--text-primary);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 12px 32px var(--glass-shadow-deep);
  }

  .lg-download-btn:hover::before { opacity: 0.90; }

  /* ══════════════════════════════════════════
     NOTICE BOX
  ══════════════════════════════════════════ */
  .lg-notice {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-md);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    border-bottom-color: var(--glass-border-bot);
    border-left: 3px solid rgba(0,22,45,0.45);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 8px 28px var(--glass-shadow);
    padding: 18px 20px;
  }

  [data-theme="dark"] .lg-notice {
    border-left-color: rgba(240,235,226,0.40);
  }

  .lg-notice::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.30) 0%, transparent 28%);
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.60;
  }

  .lg-notice-title {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 7px;
    position: relative;
    z-index: 1;
  }

  .lg-notice-step {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.55;
    position: relative;
    z-index: 1;
  }

  .lg-notice-step:last-child { margin-bottom: 0; }

  .lg-step-num {
    min-width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--glass-bg-strong);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    box-shadow: inset 0 1px 0 var(--glass-shine), 0 2px 6px rgba(0,22,45,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: var(--text-primary);
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ══════════════════════════════════════════
     SECTION LABEL
  ══════════════════════════════════════════ */
  .lg-section-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(0,22,45,0.08);
    display: flex;
    align-items: center;
    gap: 7px;
  }

  [data-theme="dark"] .lg-section-label {
    border-bottom-color: rgba(255,255,255,0.07);
  }

  /* ══════════════════════════════════════════
     CTA BUTTON — liquid glass oscuro
  ══════════════════════════════════════════ */
  .lg-cta-btn {
    width: 100%;
    padding: 16px 24px;
    border-radius: 100px;
    background: rgba(0,22,45,0.88);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    color: #faf7f3;
    border: 1px solid rgba(255,255,255,0.14);
    border-top-color: rgba(255,255,255,0.22);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 650;
    letter-spacing: 0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.18),
      inset 0 -1px 0 rgba(0,0,0,0.28),
      0 12px 32px rgba(0,22,45,0.30);
    transition: transform 0.22s var(--ease), box-shadow 0.22s var(--ease), background 0.22s;
  }

  .lg-cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg, rgba(255,255,255,0.55) 0%, transparent 26% 62%, rgba(255,255,255,0.14)),
      radial-gradient(circle at 18% 0%, rgba(255,255,255,0.60), transparent 32%);
    opacity: 0.60;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .lg-cta-btn:hover:not(:disabled) {
    background: rgba(0,22,45,0.96);
    transform: translateY(-2px);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.22),
      0 18px 44px rgba(0,22,45,0.36);
  }

  .lg-cta-btn:active:not(:disabled) { transform: scale(0.985); }

  .lg-cta-btn:disabled {
    background: rgba(0,22,45,0.30);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  [data-theme="dark"] .lg-cta-btn {
    background: rgba(240,238,234,0.90);
    color: #0f0d0b;
    border-color: rgba(255,255,255,0.20);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.55),
      0 12px 34px rgba(0,0,0,0.45);
  }

  [data-theme="dark"] .lg-cta-btn:hover:not(:disabled) {
    background: #fff;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.70),
      0 18px 48px rgba(0,0,0,0.55);
  }

  /* ══════════════════════════════════════════
     SUCCESS ALERT
  ══════════════════════════════════════════ */
  .lg-success-alert {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-md);
    background: rgba(16,185,129,0.10);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(16,185,129,0.25);
    border-top-color: rgba(255,255,255,0.55);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.75),
      0 8px 28px rgba(16,185,129,0.10);
    padding: 16px 20px;
    display: flex;
    align-items: flex-start;
    gap: 13px;
    margin-bottom: 24px;
    animation: slideDown 0.3s var(--ease);
  }

  .lg-success-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(16,185,129,0.15);
    border: 1px solid rgba(16,185,129,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: rgb(6,120,83);
  }

  /* ══════════════════════════════════════════
     COLOR DOT
  ══════════════════════════════════════════ */
  .lg-color-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.55);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.55),
      0 2px 6px rgba(0,22,45,0.12);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .lg-color-dot::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.40) 0%, transparent 55%);
  }

  /* ══════════════════════════════════════════
     BACK LINK
  ══════════════════════════════════════════ */
  .lg-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.18s;
    padding: 8px 0;
  }

  .lg-back-link:hover { color: var(--text-primary); }

  /* ══════════════════════════════════════════
     LOADING
  ══════════════════════════════════════════ */
  .lg-loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: transparent;
    gap: 16px;
  }

  .lg-spinner {
    width: 42px;
    height: 42px;
    border: 2.5px solid rgba(0,22,45,0.10);
    border-top-color: rgba(0,22,45,0.65);
    border-radius: 50%;
    animation: spin 0.85s linear infinite;
  }

  [data-theme="dark"] .lg-spinner {
    border-color: rgba(255,255,255,0.08);
    border-top-color: rgba(240,238,234,0.65);
  }

  /* ══════════════════════════════════════════
     HERO
  ══════════════════════════════════════════ */
  .op-hero {
    text-align: center;
    margin-bottom: 36px;
  }

  .op-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.68rem;
    font-weight: 650;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 1rem;
    padding: 0.36rem 1rem;
    border-radius: 100px;
    background: var(--glass-bg-strong);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-top-color: var(--glass-border-top);
    box-shadow:
      inset 0 1px 0 var(--glass-shine),
      0 8px 28px var(--glass-shadow);
  }

  .op-hero-eyebrow::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.65;
  }

  .op-hero h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    line-height: 1.04;
    color: var(--text-primary);
    letter-spacing: -0.03em;
    margin: 0 0 0.75rem;
  }

  .op-hero p {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-secondary);
    max-width: 480px;
    margin: 0 auto;
  }

  /* ══════════════════════════════════════════
     DIVIDER
  ══════════════════════════════════════════ */
  .sg-divider {
    height: 1px;
    max-width: 960px;
    margin: 0 auto 36px;
    background: linear-gradient(to right, transparent, rgba(0,22,45,0.12), transparent);
  }

  [data-theme="dark"] .sg-divider {
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent);
  }

  /* ══════════════════════════════════════════
     LAYOUT GRID
  ══════════════════════════════════════════ */
  .op-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  @media (min-width: 1024px) {
    .op-grid { grid-template-columns: 360px 1fr; }
  }

  .op-sidebar { display: flex; flex-direction: column; gap: 20px; }
  .op-main    { display: flex; flex-direction: column; gap: 20px; }

  .lg-form-section { display: flex; flex-direction: column; gap: 14px; }

  .op-footer {
    text-align: center;
    margin-top: 44px;
    font-size: 11.5px;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  /* ══════════════════════════════════════════
     ANIMATIONS
  ══════════════════════════════════════════ */
  @keyframes spin     { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }

  input:focus, textarea:focus, select:focus { outline: none; }
  button:disabled { cursor: not-allowed; }
`;

// ─── SVG ICON HELPER ─────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, style = {} }) => {
  const icons = {
    shirt:    (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 1.5L1 5l3 1.5V14h8V6.5L15 5l-2-3.5-2 1.5C10.5 2.5 9 2 8 2s-2.5.5-3 1.5L3 1.5z"/></svg>),
    user:     (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5"/></svg>),
    truck:    (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h9v8H1zM10 6l3 2v3h-3V6z"/><circle cx="3.5" cy="12" r="1.2"/><circle cx="11.5" cy="12" r="1.2"/></svg>),
    pin:      (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5a4 4 0 00-4 4c0 3 4 9 4 9s4-6 4-9a4 4 0 00-4-4z"/><circle cx="8" cy="5.5" r="1.5"/></svg>),
    note:     (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="1.5" width="12" height="13" rx="1.5"/><path d="M5 5h6M5 8h6M5 11h4"/></svg>),
    eye:      (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 8S4 3 8 3s6.5 5 6.5 5S14 13 8 13 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>),
    download: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v9M5 8l3 3 3-3"/><path d="M2 13h12"/></svg>),
    check:    (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8.5l3.5 3.5 7-7"/></svg>),
    info:     (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 7.5V11M8 5.5v.5"/></svg>),
    whatsapp: (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>),
    spinner:  (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 1.5v2M8 12.5v2M12.7 3.3l-1.4 1.4M4.7 11.3l-1.4 1.4M14.5 8h-2M3.5 8h-2M12.7 12.7l-1.4-1.4M4.7 4.7L3.3 3.3"/></svg>),
    back:     (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4"/></svg>),
    image:    (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="2.5" width="13" height="11" rx="2"/><circle cx="5.5" cy="6" r="1.2"/><path d="M1.5 11l3.5-3.5 2.5 2.5 2-2 4 4"/></svg>),
    text:     (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12M8 4v9M5 13h6"/></svg>),
    warn:     (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5L1.5 13.5h13L8 1.5z"/><path d="M8 6.5v3M8 11v.5"/></svg>),
  };
  return (
    <span style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
      {React.cloneElement(icons[name] || icons.info, { width: size, height: size })}
    </span>
  );
};

// ─── ORDER PAGE ───────────────────────────────────────────────────────────────
const OrderPage = () => {
  const [design, setDesign]                       = useState(null);
  const [clientName, setClientName]               = useState('');
  const [shippingAddress, setShippingAddress]     = useState('');
  const [additionalNotes, setAdditionalNotes]     = useState('');
  const [preferredDelivery, setPreferredDelivery] = useState('delivery');
  const [isLoading, setIsLoading]                 = useState(true);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [showImagePreview, setShowImagePreview]   = useState('front');
  const [formErrors, setFormErrors]               = useState({});

  useEffect(() => {
    try {
      const storedDesign = localStorage.getItem('currentDesign');
      if (storedDesign) setDesign(JSON.parse(storedDesign));
      else window.location.href = '/';
    } catch { window.location.href = '/'; }
    finally  { setIsLoading(false); }
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!clientName.trim()) errors.clientName = 'El nombre es obligatorio';
    if (preferredDelivery === 'delivery' && !shippingAddress.trim())
      errors.shippingAddress = 'La dirección es obligatoria para envío a domicilio';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    if (!design) { setIsSubmitting(false); return; }

    let message = `*NUEVO PEDIDO DE PLAYERA PERSONALIZADA*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `*DATOS DEL CLIENTE*\n• Nombre: ${clientName}\n\n`;
    message += `*DETALLES DE ENTREGA*\n• Método: ${preferredDelivery === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}\n`;
    if (preferredDelivery === 'delivery' && shippingAddress) message += `• Dirección: ${shippingAddress}\n`;
    message += `\n*ESPECIFICACIONES DEL DISEÑO*\n`;
    message += `• Color: ${colorNames[design.shirtColor] || design.shirtColor}\n`;
    message += `• Tela: ${fabricNames[design.fabricType] || 'No especificada'}\n`;
    message += `• Talla: ${design.size || 'M'}\n`;
    message += `• Cantidad: ${design.quantity || 1} pieza(s)\n\n`;

    if (design.imageElements?.length > 0) {
      message += `*IMÁGENES* (${design.imageElements.length})\n`;
      design.imageElements.forEach((img, i) => {
        const d = getElementDimensionsInCm(img);
        message += `   ${i+1}. Imagen en *${translateSide(img.side)}* — *${d.width} x ${d.height} cm*\n`;
      });
      message += '\n';
    }

    if (design.textElements?.length > 0) {
      message += `*TEXTOS* (${design.textElements.length})\n`;
      design.textElements.forEach((t, i) => {
        const d = getElementDimensionsInCm(t);
        message += `   ${i+1}. "${t.text}" en *${translateSide(t.side)}* — *${d.width} x ${d.height} cm*\n`;
        message += `      Fuente: ${t.fontFamily} · Color: ${t.color}\n`;
      });
      message += '\n';
    }

    if (additionalNotes) message += `*NOTAS*\n${additionalNotes}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\nEnvía las *2 capturas* (frente y trasero) a este chat para completar el pedido.\n¡Gracias!`;

    window.open(`https://wa.me/524622125407?text=${encodeURIComponent(message)}`, '_blank');
    setSubmissionSuccess(true);
    setIsSubmitting(false);

    try {
      const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orders.push({ id: Date.now(), date: new Date().toISOString(), clientName, design: { color: design.shirtColor, fabric: design.fabricType, size: design.size, quantity: design.quantity } });
      localStorage.setItem('orderHistory', JSON.stringify(orders));
    } catch {}
  };

  // ── LOADING ──
  if (isLoading) return (
    <>
      <style>{lgStyles}</style>
      <div className="lg-loading">
        <div className="lg-spinner" />
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
          Cargando tu diseño…
        </p>
      </div>
    </>
  );

  // ── NO DESIGN ──
  if (!design) return (
    <>
      <style>{lgStyles}</style>
      <div className="lg-loading">
        <div className="lg-panel" style={{ maxWidth: 380, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text-muted)' }}>
            <Icon name="warn" size={26} />
          </div>
          <h2 style={{ fontFamily: 'Inter,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Diseño no encontrado
          </h2>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            No se encontró ningún diseño. Por favor, crea uno primero.
          </p>
          <a href="/" className="lg-cta-btn" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            <Icon name="back" size={14} /> Volver al Diseñador
          </a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{lgStyles}</style>
      <div className="op-page">
        <div className="op-container">

          {/* Hero */}
          <div className="op-hero">
            <div className="op-hero-eyebrow">Resumen del pedido</div>
            <h1>Casi listo</h1>
            <p>Revisa tu diseño, completa los datos y finaliza el pedido vía WhatsApp.</p>
          </div>

          <div className="sg-divider" />

          {/* Success alert */}
          {submissionSuccess && (
            <div className="lg-success-alert">
              <div className="lg-success-icon"><Icon name="check" size={16} /></div>
              <div>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13.5, fontWeight: 700, color: 'rgb(6,120,83)', margin: '0 0 4px' }}>
                  WhatsApp abierto correctamente
                </p>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  No olvides adjuntar las capturas y archivos de tu diseño para procesar el pedido.
                </p>
              </div>
            </div>
          )}

          <div className="op-grid">

            {/* ── SIDEBAR ── */}
            <div className="op-sidebar">

              {/* Vista previa */}
              <div className="lg-panel">
                <div className="lg-panel-header">
                  <h2><Icon name="eye" size={15} /> Vista del diseño</h2>
                </div>
                <div className="lg-panel-body">
                  <div className="lg-tab-group">
                    {['front','back'].map(v => (
                      <button key={v} onClick={() => setShowImagePreview(v)} className={`lg-tab ${showImagePreview === v ? 'active' : ''}`}>
                        {v === 'front' ? 'Frente' : 'Trasero'}
                      </button>
                    ))}
                  </div>

                  <div className="lg-preview-box">
                    {design[`${showImagePreview}Image`] ? (
                      <img
                        src={design[`${showImagePreview}Image`]}
                        alt={`Diseño ${showImagePreview}`}
                        style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: 12, display: 'block', position: 'relative', zIndex: 1 }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
                        <Icon name="image" size={36} style={{ marginBottom: 8 }} />
                        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, margin: 0 }}>Sin diseño para esta vista</p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={design.frontImage} download="diseño_frente.png" className="lg-download-btn">
                      <Icon name="download" size={13} /><span>Frente</span>
                    </a>
                    <a href={design.backImage} download="diseño_trasero.png" className="lg-download-btn">
                      <Icon name="download" size={13} /><span>Trasero</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Resumen diseño */}
              <div className="lg-panel">
                <div className="lg-panel-header">
                  <h2><Icon name="shirt" size={15} /> Resumen del diseño</h2>
                </div>
                <div className="lg-panel-body">
                  {[
                    { label: 'Color', value: (
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div className="lg-color-dot" style={{ background: design.shirtColor }} />
                        <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>
                          {colorNames[design.shirtColor] || design.shirtColor}
                        </span>
                      </div>
                    )},
                    { label: 'Tela',     value: fabricNames[design.fabricType] || 'No especificada' },
                    { label: 'Talla',    value: design.size || 'M' },
                    { label: 'Cantidad', value: `${design.quantity || 1} pieza(s)` },
                    { label: 'Imágenes', value: (
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <Icon name="image" size={13} style={{ color:'var(--text-muted)' }} />
                        <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{design.imageElements?.length || 0}</span>
                      </div>
                    )},
                    { label: 'Textos', value: (
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <Icon name="text" size={13} style={{ color:'var(--text-muted)' }} />
                        <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{design.textElements?.length || 0}</span>
                      </div>
                    )},
                  ].map(item => (
                    <div key={item.label} className="lg-summary-row">
                      <span style={{ fontFamily:'Inter,sans-serif', fontSize:12.5, color:'var(--text-muted)', fontWeight:500 }}>{item.label}</span>
                      {typeof item.value === 'string'
                        ? <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{item.value}</span>
                        : item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── MAIN ── */}
            <div className="op-main">
              <div className="lg-panel">
                <div className="lg-panel-header">
                  <h2><Icon name="user" size={15} /> Completa tu información</h2>
                  <p>Los campos marcados con * son obligatorios</p>
                </div>
                <div className="lg-panel-body">
                  <form onSubmit={handleSubmitOrder} style={{ display:'flex', flexDirection:'column', gap:24 }}>

                    {/* Personal */}
                    <div className="lg-form-section">
                      <div className="lg-section-label"><Icon name="user" size={13} />Información personal</div>
                      <div>
                        <span className="lg-label">Nombre completo *</span>
                        <input
                          type="text"
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          className={`lg-input ${formErrors.clientName ? 'error' : ''}`}
                          placeholder="Ingresar aquí su nombre…"
                          disabled={isSubmitting}
                        />
                        {formErrors.clientName && (
                          <p className="lg-error-msg"><Icon name="warn" size={11} />{formErrors.clientName}</p>
                        )}
                      </div>
                    </div>

                    {/* Entrega */}
                    <div className="lg-form-section">
                      <div className="lg-section-label"><Icon name="truck" size={13} />Información de entrega</div>
                      <div>
                        <span className="lg-label">Método de entrega *</span>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
                          <button
                            type="button"
                            onClick={() => setPreferredDelivery('delivery')}
                            className={`lg-delivery-card ${preferredDelivery === 'delivery' ? 'active' : ''}`}
                            disabled={isSubmitting}
                          >
                            <div className="lg-delivery-icon"><Icon name="truck" size={18} /></div>
                            <span style={{ fontFamily:'Inter,sans-serif', fontSize:13, fontWeight:600, color:'var(--text-primary)', position:'relative', zIndex:1 }}>Envío a domicilio</span>
                            <span style={{ fontFamily:'Inter,sans-serif', fontSize:11, color:'var(--text-muted)', position:'relative', zIndex:1 }}>Coordinar con el equipo</span>
                          </button>
                        </div>
                      </div>

                      {preferredDelivery === 'delivery' && (
                        <div style={{ animation:'slideDown 0.22s ease' }}>
                          <span className="lg-label">Dirección de envío *</span>
                          <textarea
                            value={shippingAddress}
                            onChange={e => setShippingAddress(e.target.value)}
                            rows={3}
                            className={`lg-input ${formErrors.shippingAddress ? 'error' : ''}`}
                            style={{ resize:'vertical', lineHeight:1.55 }}
                            placeholder="Calle, número, colonia, código postal, ciudad"
                            disabled={isSubmitting}
                          />
                          {formErrors.shippingAddress && (
                            <p className="lg-error-msg"><Icon name="warn" size={11} />{formErrors.shippingAddress}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notas */}
                    <div className="lg-form-section">
                      <div className="lg-section-label"><Icon name="note" size={13} />Notas adicionales</div>
                      <div>
                        <span className="lg-label">¿Algo más que debamos saber? (opcional)</span>
                        <textarea
                          value={additionalNotes}
                          onChange={e => setAdditionalNotes(e.target.value)}
                          rows={4}
                          className="lg-input"
                          style={{ resize:'vertical', lineHeight:1.55 }}
                          placeholder="Ej: referencias de su casa, horarios de entrega, preferencias especiales…"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Instrucciones */}
                    <div className="lg-notice">
                      <div className="lg-notice-title"><Icon name="info" size={13} style={{ color:'var(--text-muted)' }} />Instrucciones importantes</div>
                      {[
                        'Al confirmar, se abrirá WhatsApp con tu pedido pre-cargado.',
                        <span key="2"><strong>Adjunta las 2 capturas</strong> (frente y trasero) en el chat.</span>,
                        ...(design.imageElements?.length > 0
                          ? [<span key="3">Además, <strong>envía los archivos originales</strong> de las imágenes que subiste.</span>]
                          : []),
                        'El precio final se confirmará por WhatsApp al revisar tu diseño.',
                      ].map((step, i) => (
                        <div key={i} className="lg-notice-step">
                          <div className="lg-step-num">{i + 1}</div>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Submit */}
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      <button type="submit" className="lg-cta-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <><div className="lg-spinner" style={{ width:20, height:20, borderWidth:2 }} /><span>Procesando…</span></>
                        ) : (
                          <><Icon name="whatsapp" size={18} /><span>Confirmar pedido por WhatsApp</span></>
                        )}
                      </button>
                      <div style={{ textAlign:'center' }}>
                        <a href="/designer" className="lg-back-link">
                          <Icon name="back" size={13} />Volver al diseñador
                        </a>
                      </div>
                    </div>

                  </form>
                </div>
              </div>
            </div>

          </div>

          <p className="op-footer">
            Diseñador de Playeras 3D &nbsp;·&nbsp; Todos los diseños son revisados antes de producción
          </p>
        </div>
      </div>
    </>
  );
};

export default OrderPage;