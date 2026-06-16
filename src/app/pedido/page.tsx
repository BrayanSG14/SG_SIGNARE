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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ── TOKENS ── */
  :root {
    --navy: #00162d;
    --cream: #faf7f3;
    --sg-text: #00162d;
    --sg-muted: rgba(0,22,45,0.55);
    --sg-border: rgba(0,22,45,0.13);
    --glass-bg: rgba(250,247,243,0.55);
    --glass-bg-strong: rgba(250,247,243,0.80);
    --glass-border: rgba(255,255,255,0.42);
    --glass-border-strong: rgba(255,255,255,0.68);
    --shadow-sm: 0 4px 18px rgba(0,22,45,0.07), 0 1px 4px rgba(0,22,45,0.04);
    --shadow-md: 0 8px 32px rgba(0,22,45,0.10), 0 2px 6px rgba(0,22,45,0.06);
    --shadow-lg: 0 16px 48px rgba(0,22,45,0.13), 0 4px 12px rgba(0,22,45,0.07);
    --text-primary: #00162d;
    --text-secondary: rgba(0,22,45,0.55);
    --text-muted: rgba(0,22,45,0.55);
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 22px;
    --radius-xl: 30px;
    --ease: cubic-bezier(0.4,0,0.2,1);
  }

  [data-theme="dark"] {
    --sg-text: #f0ebe2;
    --sg-muted: rgba(240,235,226,0.55);
    --sg-border: rgba(255,255,255,0.10);
    --glass-bg: rgba(18,14,10,0.55);
    --glass-bg-strong: rgba(22,18,12,0.80);
    --glass-border: rgba(255,255,255,0.10);
    --glass-border-strong: rgba(255,255,255,0.16);
    --shadow-sm: 0 4px 18px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.18);
    --shadow-md: 0 8px 32px rgba(0,0,0,0.38), 0 2px 6px rgba(0,0,0,0.22);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.52), 0 4px 12px rgba(0,0,0,0.30);
    --text-primary: #f0ebe2;
    --text-secondary: rgba(240,235,226,0.55);
    --text-muted: rgba(240,235,226,0.50);
    --navy: #f0ebe2;
    --cream: #0f0d0b;
  }

  /* ── PAGE WRAPPER — mirrors sg-page from HomePage ── */
  .op-page {
    position: relative;
    isolation: isolate;
    min-height: 100vh;
    overflow: hidden;
    color: var(--sg-text);
    transition: color 0.4s;
    font-family: 'Inter', sans-serif;
    padding: 40px 16px 64px;
  }

  /* Light-mode layered background */
  .op-page::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    background:
      linear-gradient(135deg, #e8e4dd 0%, #f5f2ed 45%, #ede9e2 100%),
      linear-gradient(115deg, transparent 0 18%, rgba(120,101,77,0.08) 18.1% 18.35%, transparent 18.45% 100%),
      linear-gradient(74deg, transparent 0 47%, rgba(0,22,45,0.055) 47.1% 47.28%, transparent 47.38% 100%),
      radial-gradient(ellipse at 82% 18%, rgba(174,153,118,0.18), transparent 28rem),
      radial-gradient(ellipse at 18% 72%, rgba(112,139,146,0.13), transparent 30rem);
  }

  /* Subtle grid + diagonal stripe overlay */
  .op-page::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    opacity: 0.46;
    background-image:
      repeating-linear-gradient(90deg, rgba(0,22,45,0.035) 0 1px, transparent 1px 42px),
      repeating-linear-gradient(0deg, rgba(0,22,45,0.026) 0 1px, transparent 1px 42px),
      linear-gradient(135deg, transparent 0 45%, rgba(0,22,45,0.035) 45.1% 45.35%, transparent 45.45% 100%);
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.28) 72%, transparent);
  }

  /* Dark-mode overrides for the backgrounds */
  [data-theme="dark"] .op-page::before {
    background:
      linear-gradient(135deg, #111009 0%, #17130e 45%, #130f09 100%),
      linear-gradient(115deg, transparent 0 18%, rgba(255,255,255,0.055) 18.1% 18.35%, transparent 18.45% 100%),
      linear-gradient(74deg, transparent 0 47%, rgba(185,204,220,0.05) 47.1% 47.28%, transparent 47.38% 100%),
      radial-gradient(ellipse at 82% 18%, rgba(180,160,125,0.10), transparent 28rem),
      radial-gradient(ellipse at 18% 72%, rgba(110,145,160,0.10), transparent 30rem);
  }

  [data-theme="dark"] .op-page::after {
    opacity: 0.34;
    background-image:
      repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 42px),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 42px),
      linear-gradient(135deg, transparent 0 45%, rgba(255,255,255,0.04) 45.1% 45.35%, transparent 45.45% 100%);
  }

  .op-container { max-width: 1180px; margin: 0 auto; position: relative; z-index: 1; }

  /* ── GLASS PANEL — matches sg-card look from HomePage ── */
  .lg-panel {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.22) 54%, rgba(226,235,244,0.30) 100%);
    backdrop-filter: blur(20px) saturate(1.5) contrast(1.03);
    -webkit-backdrop-filter: blur(20px) saturate(1.5) contrast(1.03);
    border: 1px solid rgba(255,255,255,0.72);
    border-top-color: rgba(255,255,255,0.96);
    border-bottom-color: rgba(0,22,45,0.11);
    border-radius: var(--radius-lg);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.96),
      inset 0 -1px 0 rgba(0,22,45,0.06),
      0 18px 50px rgba(0,22,45,0.10),
      0 2px 8px rgba(0,22,45,0.05);
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.25s var(--ease), border-color 0.25s var(--ease);
  }

  /* Inner highlight sheen — mirrors sg-card::after */
  .lg-panel::after {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: calc(var(--radius-lg) - 1px);
    pointer-events: none;
    background:
      linear-gradient(155deg, rgba(255,255,255,0.62), transparent 24%),
      linear-gradient(335deg, transparent 0 68%, rgba(255,255,255,0.26) 78%, transparent 100%);
    opacity: 0.78;
    z-index: 0;
  }

  [data-theme="dark"] .lg-panel {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.045) 52%, rgba(156,178,208,0.06) 100%);
    border-color: rgba(255,255,255,0.11);
    border-top-color: rgba(255,255,255,0.25);
    border-bottom-color: rgba(0,0,0,0.58);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.18),
      inset 0 -1px 0 rgba(0,0,0,0.50),
      0 18px 52px rgba(0,0,0,0.58),
      0 2px 8px rgba(0,0,0,0.34);
  }

  [data-theme="dark"] .lg-panel::after {
    opacity: 0.22;
  }

  /* Glass card (inner surfaces) */
  .lg-card {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.32), rgba(255,255,255,0.14));
    backdrop-filter: blur(14px) saturate(1.3);
    -webkit-backdrop-filter: blur(14px) saturate(1.3);
    border: 1px solid rgba(255,255,255,0.72);
    border-top-color: rgba(255,255,255,0.96);
    border-radius: var(--radius-md);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.92),
      0 6px 22px rgba(0,22,45,0.07);
    transition: box-shadow 0.22s var(--ease), border-color 0.22s var(--ease);
  }

  [data-theme="dark"] .lg-card {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035));
    border-color: rgba(255,255,255,0.12);
    border-top-color: rgba(255,255,255,0.20);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.15),
      0 8px 22px rgba(0,0,0,0.32);
  }

  /* Section headers inside panels */
  .lg-panel-header {
    background: var(--navy);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding: 18px 24px;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  .lg-panel-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg, rgba(255,255,255,0.10) 0%, transparent 40%),
      radial-gradient(circle at 20% 0%, rgba(255,255,255,0.12), transparent 30%);
    pointer-events: none;
  }

  .lg-panel-header h2 {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--cream);
    letter-spacing: -0.01em;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 9px;
    position: relative;
    z-index: 1;
  }

  .lg-panel-header p {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: rgba(250,247,243,0.55);
    margin: 5px 0 0;
    position: relative;
    z-index: 1;
  }

  [data-theme="dark"] .lg-panel-header {
    background: rgba(255,255,255,0.07);
    border-bottom: 1px solid rgba(255,255,255,0.10);
  }

  [data-theme="dark"] .lg-panel-header h2 { color: var(--text-primary); }
  [data-theme="dark"] .lg-panel-header p  { color: var(--text-muted); }

  .lg-panel-body { padding: 22px; position: relative; z-index: 1; }

  /* Section titles */
  .lg-section-label {
    font-family: 'Inter', sans-serif;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--sg-border);
    display: flex;
    align-items: center;
    gap: 7px;
  }

  /* ── INPUTS — glass style ── */
  .lg-input {
    width: 100%;
    padding: 11px 14px;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.54), rgba(255,255,255,0.18));
    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.72);
    border-bottom-color: rgba(0,22,45,0.10);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.95),
      0 4px 14px rgba(0,22,45,0.06);
    border-radius: var(--radius-sm);
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }

  .lg-input::placeholder { color: var(--text-muted); }

  .lg-input:focus {
    border-color: rgba(0,22,45,0.38);
    background: rgba(255,255,255,0.82);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.98),
      0 0 0 3px rgba(0,22,45,0.07),
      0 6px 20px rgba(0,22,45,0.08);
  }

  .lg-input.error { border-color: rgba(220,38,38,0.5); }
  .lg-input.error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }

  [data-theme="dark"] .lg-input {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035));
    border-color: rgba(255,255,255,0.13);
    border-bottom-color: rgba(0,0,0,0.45);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.18),
      inset 0 -1px 0 rgba(0,0,0,0.45),
      0 4px 14px rgba(0,0,0,0.32);
    color: var(--text-primary);
  }

  [data-theme="dark"] .lg-input:focus {
    border-color: rgba(255,255,255,0.28);
    background: rgba(255,255,255,0.12);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.22),
      0 0 0 3px rgba(255,255,255,0.06),
      0 8px 24px rgba(0,0,0,0.40);
  }

  .lg-label {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: block;
    margin-bottom: 7px;
  }

  .lg-error-msg {
    font-family: 'Inter', sans-serif;
    font-size: 11.5px;
    color: rgb(185,28,28);
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* ── DELIVERY CARDS — sg-card style ── */
  .lg-delivery-card {
    padding: 16px 18px;
    border-radius: var(--radius-md);
    border: 1.5px solid rgba(255,255,255,0.72);
    border-top-color: rgba(255,255,255,0.96);
    border-bottom-color: rgba(0,22,45,0.11);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.24), rgba(226,235,244,0.30));
    backdrop-filter: blur(14px) saturate(1.3);
    -webkit-backdrop-filter: blur(14px) saturate(1.3);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.96),
      0 8px 24px rgba(0,22,45,0.07);
    cursor: pointer;
    transition: all 0.25s var(--ease);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .lg-delivery-card:hover:not(.active) {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.84);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.98),
      0 16px 40px rgba(0,22,45,0.12);
  }

  .lg-delivery-card.active {
    border-color: rgba(0,22,45,0.30);
    border-top-color: rgba(0,22,45,0.40);
    background:
      linear-gradient(145deg, rgba(0,22,45,0.07), rgba(0,22,45,0.04));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.60),
      0 8px 28px rgba(0,22,45,0.14);
  }

  [data-theme="dark"] .lg-delivery-card {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.12), rgba(156,178,208,0.06));
    border-color: rgba(255,255,255,0.11);
    border-top-color: rgba(255,255,255,0.25);
    border-bottom-color: rgba(0,0,0,0.58);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.18),
      0 8px 28px rgba(0,0,0,0.38);
  }

  [data-theme="dark"] .lg-delivery-card.active {
    border-color: rgba(255,255,255,0.28);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06));
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.30),
      0 10px 34px rgba(0,0,0,0.50);
  }

  .lg-delivery-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.54), rgba(255,255,255,0.18));
    border: 1px solid rgba(255,255,255,0.72);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.90), 0 4px 12px rgba(0,22,45,0.08);
    color: var(--text-muted);
    transition: all 0.22s;
  }

  .lg-delivery-card.active .lg-delivery-icon {
    background: var(--navy);
    color: var(--cream);
    border-color: transparent;
    box-shadow: 0 6px 18px rgba(0,22,45,0.22);
  }

  [data-theme="dark"] .lg-delivery-card .lg-delivery-icon {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035));
    border-color: rgba(255,255,255,0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.28);
  }

  /* Summary rows */
  .lg-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.60);
    background:
      linear-gradient(135deg, rgba(255,255,255,0.40), rgba(255,255,255,0.14));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.80), 0 2px 8px rgba(0,22,45,0.04);
    margin-bottom: 6px;
    transition: background 0.15s;
  }

  .lg-summary-row:last-child { margin-bottom: 0; }

  [data-theme="dark"] .lg-summary-row {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
    border-color: rgba(255,255,255,0.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 8px rgba(0,0,0,0.20);
  }

  /* Preview tabs */
  .lg-tab-group {
    display: flex;
    background:
      linear-gradient(135deg, rgba(0,22,45,0.05), rgba(0,22,45,0.03));
    border: 1px solid rgba(255,255,255,0.60);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.80);
    border-radius: 12px;
    padding: 3px;
    gap: 3px;
    margin-bottom: 14px;
    backdrop-filter: blur(10px);
  }

  [data-theme="dark"] .lg-tab-group {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .lg-tab {
    flex: 1;
    padding: 8px 12px;
    border-radius: 9px;
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
    background: var(--navy);
    color: var(--cream);
    box-shadow: 0 4px 14px rgba(0,22,45,0.22), inset 0 1px 0 rgba(255,255,255,0.10);
  }

  .lg-tab:hover:not(.active) {
    color: var(--text-primary);
    background: rgba(255,255,255,0.50);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.80);
  }

  [data-theme="dark"] .lg-tab.active {
    background: rgba(255,255,255,0.14);
    color: var(--text-primary);
    box-shadow: 0 4px 14px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.20);
  }

  /* Download btn */
  .lg-download-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.70);
    background:
      linear-gradient(135deg, rgba(0,52,135,0.14), rgba(25,48,104,0.10));
    backdrop-filter: blur(22px) saturate(175%);
    -webkit-backdrop-filter: blur(22px) saturate(175%);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.92),
      0 6px 18px rgba(0,22,45,0.07);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 550;
    color: var(--text-secondary);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.22s var(--ease);
  }

  .lg-download-btn:hover {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.28));
    border-color: rgba(255,255,255,0.84);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.96),
      0 12px 32px rgba(0,22,45,0.10);
    color: var(--text-primary);
    transform: translateY(-1px);
  }

  [data-theme="dark"] .lg-download-btn {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035));
    border-color: rgba(255,255,255,0.12);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.18),
      inset 0 -1px 0 rgba(0,0,0,0.45),
      0 6px 18px rgba(0,0,0,0.32);
    color: var(--text-secondary);
  }

  [data-theme="dark"] .lg-download-btn:hover {
    background: rgba(255,255,255,0.14);
    border-color: rgba(255,255,255,0.22);
    color: var(--text-primary);
  }

  /* Notice box */
  .lg-notice {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.54), rgba(255,255,255,0.18));
    backdrop-filter: blur(18px) saturate(180%);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.72);
    border-left: 3px solid var(--navy);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.95),
      0 8px 28px rgba(0,22,45,0.07);
    padding: 16px 18px;
  }

  [data-theme="dark"] .lg-notice {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035));
    border-color: rgba(255,255,255,0.12);
    border-left-color: rgba(240,235,226,0.50);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.15),
      0 8px 28px rgba(0,0,0,0.32);
  }

  .lg-notice-title {
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .lg-notice-step {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 7px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .lg-notice-step:last-child { margin-bottom: 0; }

  .lg-step-num {
    min-width: 20px;
    height: 20px;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.54), rgba(255,255,255,0.18));
    border: 1px solid rgba(255,255,255,0.72);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.90), 0 2px 6px rgba(0,22,45,0.06);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: var(--text-primary);
    flex-shrink: 0;
    margin-top: 1px;
  }

  [data-theme="dark"] .lg-step-num {
    background: rgba(255,255,255,0.10);
    border-color: rgba(255,255,255,0.14);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
  }

  /* ── CTA BUTTON — sg-btn-primary style ── */
  .lg-cta-btn {
    width: 100%;
    padding: 16px 24px;
    border-radius: 100px;
    background: #00162d73;
    color: #faf7f3;
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 650;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: transform 0.22s, box-shadow 0.22s, background 0.22s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.20),
      inset 0 -1px 0 rgba(0,0,0,0.24),
      0 10px 30px rgba(0,22,45,0.24);
  }

  .lg-cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(115deg, rgba(255,255,255,0.68), transparent 28% 62%, rgba(255,255,255,0.18)),
      radial-gradient(circle at 22% 0%, rgba(255,255,255,0.72), transparent 34%);
    opacity: 0.72;
    mix-blend-mode: screen;
  }

  .lg-cta-btn:hover:not(:disabled) {
    background: #002344;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.22),
      0 16px 42px rgba(0,22,45,0.32);
    transform: translateY(-2px);
  }

  .lg-cta-btn:active:not(:disabled) { transform: scale(0.985); }

  .lg-cta-btn:disabled {
    background: rgba(0,22,45,0.35);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  [data-theme="dark"] .lg-cta-btn {
    background: rgba(240,235,230,0.94);
    color: #0f0d0b;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.55),
      0 12px 34px rgba(0,0,0,0.42);
  }

  [data-theme="dark"] .lg-cta-btn:hover:not(:disabled) {
    background: #fff;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.70),
      0 18px 48px rgba(0,0,0,0.50);
  }

  /* Color dot */
  .lg-color-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.60);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.60), 0 2px 6px rgba(0,22,45,0.10);
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

  /* Tag */
  .lg-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 100px;
    font-family: 'Inter', sans-serif;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.54), rgba(255,255,255,0.18));
    border: 1px solid rgba(255,255,255,0.72);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.95),
      0 4px 10px rgba(0,22,45,0.06);
    color: var(--text-muted);
  }

  .lg-tag.success {
    background: rgba(16,185,129,0.09);
    color: rgb(6,120,83);
    border-color: rgba(16,185,129,0.20);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.70), 0 2px 8px rgba(16,185,129,0.08);
  }

  /* Success alert */
  .lg-success-alert {
    background:
      linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.04));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(16,185,129,0.25);
    border-top-color: rgba(255,255,255,0.60);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.80),
      0 8px 28px rgba(16,185,129,0.10);
    border-radius: var(--radius-md);
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

  /* Loading screen */
  .lg-loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background:
      linear-gradient(135deg, #e8e4dd 0%, #f5f2ed 45%, #ede9e2 100%);
    gap: 16px;
    position: relative;
    isolation: isolate;
  }

  .lg-loading::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    background:
      radial-gradient(ellipse at 82% 18%, rgba(174,153,118,0.18), transparent 28rem),
      radial-gradient(ellipse at 18% 72%, rgba(112,139,146,0.13), transparent 30rem);
  }

  .lg-spinner {
    width: 42px;
    height: 42px;
    border: 2.5px solid rgba(0,22,45,0.12);
    border-top-color: var(--navy);
    border-radius: 50%;
    animation: spin 0.85s linear infinite;
  }

  /* Layout grid */
  .op-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  @media (min-width: 1024px) {
    .op-grid { grid-template-columns: 360px 1fr; }
  }

  .op-sidebar { display: flex; flex-direction: column; gap: 20px; }
  .op-main { display: flex; flex-direction: column; gap: 20px; }

  /* Form section */
  .lg-form-section { display: flex; flex-direction: column; gap: 14px; }

  /* Back link */
  .lg-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.18s;
    padding: 8px 0;
  }

  .lg-back-link:hover { color: var(--text-primary); }

  /* ── HERO — matches sg-hero from HomePage ── */
  .op-hero {
    text-align: center;
    margin-bottom: 32px;
  }

  .op-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--sg-muted);
    margin-bottom: 1rem;
    padding: 0.34rem 0.95rem;
    border-radius: 100px;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.54), rgba(255,255,255,0.18));
    border: 1px solid rgba(255,255,255,0.72);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.95),
      0 8px 28px rgba(0,22,45,0.07);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    backdrop-filter: blur(18px) saturate(180%);
  }

  .op-hero-eyebrow::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.72;
  }

  [data-theme="dark"] .op-hero-eyebrow {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035));
    border-color: rgba(255,255,255,0.13);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.18),
      0 10px 34px rgba(0,0,0,0.40);
  }

  .op-hero h1 {
    font-family: 'Inter', sans-serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    line-height: 1.04;
    color: var(--sg-text);
    letter-spacing: -0.03em;
    margin: 0 0 0.75rem;
  }

  .op-hero p {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    line-height: 1.7;
    color: var(--sg-muted);
    max-width: 480px;
    margin: 0 auto;
  }

  /* Divider — sg-divider */
  .sg-divider {
    height: 1px;
    max-width: 960px;
    margin: 0 auto 32px;
    background: linear-gradient(to right, transparent, var(--sg-border), transparent);
  }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

  input:focus, textarea:focus, select:focus { outline: none; }
  button:disabled { cursor: not-allowed; }

  .op-footer {
    text-align: center;
    margin-top: 40px;
    font-family: 'Inter', sans-serif;
    font-size: 11.5px;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }
`;

// ─── SVG ICON HELPER ─────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, style = {} }) => {
  const icons = {
    shirt: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 1.5L1 5l3 1.5V14h8V6.5L15 5l-2-3.5-2 1.5C10.5 2.5 9 2 8 2s-2.5.5-3 1.5L3 1.5z"/></svg>),
    user: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5"/></svg>),
    truck: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h9v8H1zM10 6l3 2v3h-3V6z"/><circle cx="3.5" cy="12" r="1.2"/><circle cx="11.5" cy="12" r="1.2"/></svg>),
    pin: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5a4 4 0 00-4 4c0 3 4 9 4 9s4-6 4-9a4 4 0 00-4-4z"/><circle cx="8" cy="5.5" r="1.5"/></svg>),
    note: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="1.5" width="12" height="13" rx="1.5"/><path d="M5 5h6M5 8h6M5 11h4"/></svg>),
    eye: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 8S4 3 8 3s6.5 5 6.5 5S14 13 8 13 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>),
    download: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v9M5 8l3 3 3-3"/><path d="M2 13h12"/></svg>),
    check: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8.5l3.5 3.5 7-7"/></svg>),
    info: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 7.5V11M8 5.5v.5"/></svg>),
    whatsapp: (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>),
    spinner: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 1.5v2M8 12.5v2M12.7 3.3l-1.4 1.4M4.7 11.3l-1.4 1.4M14.5 8h-2M3.5 8h-2M12.7 12.7l-1.4-1.4M4.7 4.7L3.3 3.3"/></svg>),
    back: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4"/></svg>),
    image: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="2.5" width="13" height="11" rx="2"/><circle cx="5.5" cy="6" r="1.2"/><path d="M1.5 11l3.5-3.5 2.5 2.5 2-2 4 4"/></svg>),
    text: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12M8 4v9M5 13h6"/></svg>),
    warn: (<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1.5L1.5 13.5h13L8 1.5z"/><path d="M8 6.5v3M8 11v.5"/></svg>),
  };
  return (
    <span style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
      {React.cloneElement(icons[name] || icons.info, { width: size, height: size })}
    </span>
  );
};

// ─── ORDER PAGE ───────────────────────────────────────────────────────────────
const OrderPage = () => {
  const [design, setDesign] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [preferredDelivery, setPreferredDelivery] = useState('delivery');
  const [urgency, setUrgency] = useState('normal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState('front');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    try {
      const storedDesign = localStorage.getItem('currentDesign');
      if (storedDesign) {
        setDesign(JSON.parse(storedDesign));
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Error al leer el diseño de localStorage:", error);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!clientName.trim()) errors.clientName = 'El nombre es obligatorio';
    if (preferredDelivery === 'delivery' && !shippingAddress.trim())
      errors.shippingAddress = 'La dirección es obligatoria para envío a domicilio';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateEstimatedPrice = () => {
    const basePrice = 150;
    const imageCount = design?.imageElements?.length || 0;
    const textCount = design?.textElements?.length || 0;
    const quantity = design?.quantity || 1;
    const printCost = (imageCount * 30) + (textCount * 20);
    const subtotal = (basePrice + printCost) * quantity;
    return { basePrice, printCost, quantity, subtotal, total: subtotal };
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) { alert("Por favor, corrige los errores en el formulario."); return; }
    setIsSubmitting(true);
    setSubmissionSuccess(false);
    if (!design) { alert("Error: No se encontró el diseño."); setIsSubmitting(false); return; }

    let message = `*NUEVO PEDIDO DE PLAYERA PERSONALIZADA*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `*DATOS DEL CLIENTE*\n`;
    message += `• Nombre: ${clientName}\n`;
    message += `*DETALLES DE ENTREGA*\n`;
    message += `• Método: ${preferredDelivery === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}\n`;
    if (preferredDelivery === 'delivery' && shippingAddress) message += `• Dirección: ${shippingAddress}\n`;
    message += `*ESPECIFICACIONES DEL DISEÑO*\n`;
    message += `• Color: ${colorNames[design.shirtColor] || design.shirtColor}\n`;
    message += `• Tela: ${fabricNames[design.fabricType] || 'No especificada'}\n`;
    message += `• Talla: ${design.size || 'M'}\n`;
    message += `• Cantidad: ${design.quantity || 1} pieza(s)\n\n`;

    if (design.imageElements && design.imageElements.length > 0) {
      message += `*IMÁGENES* (${design.imageElements.length})\n`;
      design.imageElements.forEach((img, index) => {
        const dims = getElementDimensionsInCm(img);
        message += `   ${index + 1}. Imagen en *${translateSide(img.side)}*\n`;
        message += `      • Dimensiones: *${dims.width} x ${dims.height} cm*\n`;
      });
      message += `\n`;
    }

    if (design.textElements && design.textElements.length > 0) {
      message += `*TEXTOS* (${design.textElements.length})\n`;
      design.textElements.forEach((textEl, index) => {
        const dims = getElementDimensionsInCm(textEl);
        message += `   ${index + 1}. "${textEl.text}"\n`;
        message += `      • Ubicación: *${translateSide(textEl.side)}*\n`;
        message += `      • Dimensiones: *${dims.width} x ${dims.height} cm*\n`;
        message += `      • Fuente: ${textEl.fontFamily}\n`;
        message += `      • Color: ${textEl.color}\n`;
      });
      message += `\n`;
    }

    if (additionalNotes) { message += `*NOTAS ADICIONALES*\n${additionalNotes}\n\n`; }

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*IMPORTANTE: PASOS FINALES*\n`;
    message += `Para completar tu pedido, por favor:\n`;
    message += `1. Envía las *2 capturas del diseño* (frente y trasero) a este chat.\n`;
    if (design.imageElements && design.imageElements.length > 0)
      message += `2. Envía también los *archivos originales* de las imágenes que subiste.\n`;
    message += `¡Gracias por tu preferencia!`;

    const whatsappNumber = "524622125407";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setSubmissionSuccess(true);
    setIsSubmitting(false);
    saveOrderToHistory();
  };

  const saveOrderToHistory = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orders.push({ id: Date.now(), date: new Date().toISOString(), clientName, design: { color: design.shirtColor, fabric: design.fabricType, size: design.size, quantity: design.quantity } });
      localStorage.setItem('orderHistory', JSON.stringify(orders));
    } catch (error) { console.error('Error al guardar en historial:', error); }
  };

  // ── LOADING ──
  if (isLoading) {
    return (
      <>
        <style>{lgStyles}</style>
        <div className="lg-loading">
          <div className="lg-spinner" />
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: 'rgba(0,22,45,0.5)', fontWeight: 500, margin: 0 }}>
            Cargando tu diseño…
          </p>
        </div>
      </>
    );
  }

  // ── NO DESIGN ──
  if (!design) {
    return (
      <>
        <style>{lgStyles}</style>
        <div className="lg-loading">
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.24), rgba(226,235,244,0.30))',
            backdropFilter: 'blur(20px) saturate(1.5)',
            border: '1px solid rgba(255,255,255,0.72)',
            borderTopColor: 'rgba(255,255,255,0.96)',
            borderRadius: 22,
            padding: '40px 36px', textAlign: 'center', maxWidth: 380,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.96), 0 18px 50px rgba(0,22,45,0.10)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.54), rgba(255,255,255,0.18))',
              border: '1px solid rgba(255,255,255,0.72)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.90), 0 6px 18px rgba(0,22,45,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: 'rgba(0,22,45,0.4)'
            }}>
              <Icon name="warn" size={26} />
            </div>
            <h2 style={{ fontFamily: 'Inter,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--sg-text)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Diseño no encontrado
            </h2>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13.5, color: 'rgba(0,22,45,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
              No se encontró ningún diseño. Por favor, crea uno primero.
            </p>
            <a href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#00162d73',
              color: '#faf7f3',
              padding: '12px 24px', borderRadius: 100,
              fontFamily: 'Inter,sans-serif', fontSize: 13.5, fontWeight: 650,
              textDecoration: 'none', transition: 'all 0.22s ease',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 10px 30px rgba(0,22,45,0.24)',
            }}>
              <Icon name="back" size={14} />
              Volver al Diseñador
            </a>
          </div>
        </div>
      </>
    );
  }

  const showPickupOption = false;

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

          {/* Divider */}
          <div className="sg-divider" />

          {/* Success alert */}
          {submissionSuccess && (
            <div className="lg-success-alert">
              <div className="lg-success-icon">
                <Icon name="check" size={16} />
              </div>
              <div>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13.5, fontWeight: 700, color: 'rgb(6,120,83)', margin: '0 0 4px' }}>
                  WhatsApp abierto correctamente
                </p>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 12.5, color: 'rgba(0,22,45,0.55)', margin: 0, lineHeight: 1.5 }}>
                  No olvides adjuntar las capturas y los archivos de tu diseño para procesar el pedido.
                </p>
              </div>
            </div>
          )}

          <div className="op-grid">

            {/* ── LEFT SIDEBAR ── */}
            <div className="op-sidebar">

              {/* Design Preview */}
              <div className="lg-panel">
                <div className="lg-panel-header">
                  <h2><Icon name="eye" size={15} /> Vista del diseño</h2>
                </div>
                <div className="lg-panel-body">
                  <div className="lg-tab-group">
                    {['front', 'back'].map((view) => (
                      <button
                        key={view}
                        onClick={() => setShowImagePreview(view)}
                        className={`lg-tab ${showImagePreview === view ? 'active' : ''}`}
                      >
                        {view === 'front' ? 'Frente' : 'Trasero'}
                      </button>
                    ))}
                  </div>

                  <div style={{
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.20) 50%, rgba(226,235,244,0.28) 100%)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.68)',
                    borderTopColor: 'rgba(255,255,255,0.92)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.88), 0 4px 14px rgba(0,22,45,0.06)',
                    minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', marginBottom: 12,
                  }}>
                    {design[`${showImagePreview}Image`] ? (
                      <img
                        src={design[`${showImagePreview}Image`]}
                        alt={`Diseño ${showImagePreview}`}
                        style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: 12, display: 'block' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: 32, color: 'rgba(0,22,45,0.3)' }}>
                        <Icon name="image" size={36} style={{ marginBottom: 8 }} />
                        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: 'rgba(0,22,45,0.35)', margin: 0 }}>
                          Sin diseño para esta vista
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={design.frontImage} download="diseño_frente.png" className="lg-download-btn">
                      <Icon name="download" size={13} />
                      <span>Frente</span>
                    </a>
                    <a href={design.backImage} download="diseño_trasero.png" className="lg-download-btn">
                      <Icon name="download" size={13} />
                      <span>Trasero</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Design Summary */}
              <div className="lg-panel">
                <div className="lg-panel-header">
                  <h2><Icon name="shirt" size={15} /> Resumen del diseño</h2>
                </div>
                <div className="lg-panel-body">
                  {[
                    {
                      label: 'Color',
                      value: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div className="lg-color-dot" style={{ background: design.shirtColor }} />
                          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {colorNames[design.shirtColor] || design.shirtColor}
                          </span>
                        </div>
                      )
                    },
                    { label: 'Tela', value: fabricNames[design.fabricType] || 'No especificada' },
                    { label: 'Talla', value: design.size || 'M' },
                    { label: 'Cantidad', value: `${design.quantity || 1} pieza(s)` },
                    { label: 'Imágenes', value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Icon name="image" size={13} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{design.imageElements?.length || 0}</span>
                      </div>
                    )},
                    { label: 'Textos', value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Icon name="text" size={13} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{design.textElements?.length || 0}</span>
                      </div>
                    )},
                  ].map((item) => (
                    <div key={item.label} className="lg-summary-row">
                      <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                      {typeof item.value === 'string' ? (
                        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                      ) : item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT MAIN ── */}
            <div className="op-main">
              <div className="lg-panel">
                <div className="lg-panel-header">
                  <h2><Icon name="user" size={15} /> Completa tu información</h2>
                  <p>Los campos marcados con * son obligatorios</p>
                </div>

                <div className="lg-panel-body">
                  <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Personal Info */}
                    <div className="lg-form-section">
                      <div className="lg-section-label">
                        <Icon name="user" size={13} />
                        Información personal
                      </div>
                      <div>
                        <span className="lg-label">Nombre completo *</span>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className={`lg-input ${formErrors.clientName ? 'error' : ''}`}
                          placeholder="Ingresar aquí su nombre…"
                          disabled={isSubmitting}
                        />
                        {formErrors.clientName && (
                          <p className="lg-error-msg">
                            <Icon name="warn" size={11} /> {formErrors.clientName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery */}
                    <div className="lg-form-section">
                      <div className="lg-section-label">
                        <Icon name="truck" size={13} />
                        Información de entrega
                      </div>

                      <div>
                        <span className="lg-label">Método de entrega *</span>
                        <div style={{ display: 'grid', gridTemplateColumns: showPickupOption ? '1fr 1fr' : '1fr', gap: 10 }}>
                          {showPickupOption && (
                            <button
                              type="button"
                              onClick={() => setPreferredDelivery('pickup')}
                              className={`lg-delivery-card ${preferredDelivery === 'pickup' ? 'active' : ''}`}
                              disabled={isSubmitting}
                            >
                              <div className="lg-delivery-icon">
                                <Icon name="pin" size={18} />
                              </div>
                              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Recoger en tienda</span>
                              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, color: 'var(--text-muted)' }}>Sin costo adicional</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setPreferredDelivery('delivery')}
                            className={`lg-delivery-card ${preferredDelivery === 'delivery' ? 'active' : ''}`}
                            disabled={isSubmitting}
                          >
                            <div className="lg-delivery-icon">
                              <Icon name="truck" size={18} />
                            </div>
                            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Envío a domicilio</span>
                            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, color: 'var(--text-muted)' }}>Coordinar con el equipo</span>
                          </button>
                        </div>
                      </div>

                      {preferredDelivery === 'delivery' && (
                        <div style={{ animation: 'slideDown 0.22s ease' }}>
                          <span className="lg-label">Dirección de envío *</span>
                          <textarea
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            rows={3}
                            className={`lg-input ${formErrors.shippingAddress ? 'error' : ''}`}
                            style={{ resize: 'vertical', lineHeight: 1.55 }}
                            placeholder="Calle, número, colonia, código postal, ciudad"
                            disabled={isSubmitting}
                          />
                          {formErrors.shippingAddress && (
                            <p className="lg-error-msg">
                              <Icon name="warn" size={11} /> {formErrors.shippingAddress}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="lg-form-section">
                      <div className="lg-section-label">
                        <Icon name="note" size={13} />
                        Notas adicionales
                      </div>
                      <div>
                        <span className="lg-label">¿Algo más que debamos saber? (opcional)</span>
                        <textarea
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          rows={4}
                          className="lg-input"
                          style={{ resize: 'vertical', lineHeight: 1.55 }}
                          placeholder="Ej: referencias de su casa, alguien más que pueda recoger el pedido, horarios de entrega…"
                          disabled={isSubmitting}
                        />
                        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                          Puedes incluir preferencias de diseño, necesidades especiales, horarios de entrega, etc.
                        </p>
                      </div>
                    </div>

                    {/* Instructions notice */}
                    <div className="lg-notice">
                      <div className="lg-notice-title">
                        <Icon name="info" size={13} style={{ color: 'var(--text-muted)' }} />
                        Instrucciones importantes
                      </div>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <button type="submit" className="lg-cta-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="lg-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                            <span>Procesando…</span>
                          </>
                        ) : (
                          <>
                            <Icon name="whatsapp" size={18} />
                            <span>Confirmar pedido por WhatsApp</span>
                          </>
                        )}
                      </button>

                      <div style={{ textAlign: 'center' }}>
                        <a href="/designer" className="lg-back-link">
                          <Icon name="back" size={13} />
                          Volver al diseñador
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