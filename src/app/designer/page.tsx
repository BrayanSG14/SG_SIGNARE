'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// --- CONSTANTES DE TALLAS (Medidas aproximadas en CM) ---
const SHIRT_SPECS = {
  S: { width: 46, height: 70, label: 'Chica (S)' },
  M: { width: 51, height: 72, label: 'Mediana (M)' },
  L: { width: 56, height: 74, label: 'Grande (L)' },
  XL: { width: 61, height: 76, label: 'Extra Grande (XL)' }
};

// --- FACTORES DE CALIBRACIÓN UV → CM ---
const UV_SCALE_FACTOR_W = 51 / 36;
const UV_SCALE_FACTOR_H = 72 / 68;

// --- LIQUID GLASS CSS ---
const liquidGlassStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; }

  :root {
    --navy: #00162d;
    --cream: #faf7f3;
    --glass-bg: rgba(250, 247, 243, 0.55);
    --glass-bg-strong: rgba(250, 247, 243, 0.75);
    --glass-border: rgba(255, 255, 255, 0.45);
    --glass-border-strong: rgba(255, 255, 255, 0.65);
    --glass-shadow: 0 8px 32px rgba(0, 22, 45, 0.10), 0 1.5px 6px rgba(0,22,45,0.06);
    --glass-shadow-hover: 0 12px 40px rgba(0, 22, 45, 0.15), 0 2px 8px rgba(0,22,45,0.08);
    --navy-glass: rgba(0, 22, 45, 0.06);
    --text-primary: #00162d;
    --text-secondary: rgba(0, 22, 45, 0.55);
    --text-muted: rgba(0, 22, 45, 0.35);
    --accent: #00162d;
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 22px;
    --radius-xl: 30px;
    --transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  .lg-panel {
    background: var(--glass-bg-strong);
    backdrop-filter: blur(28px) saturate(1.6);
    -webkit-backdrop-filter: blur(28px) saturate(1.6);
    border: 1px solid var(--glass-border-strong);
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-shadow);
  }

  .lg-card {
    background: var(--glass-bg);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 20px rgba(0,22,45,0.07), 0 1px 4px rgba(0,22,45,0.04);
    transition: var(--transition);
  }

  .lg-card:hover {
    box-shadow: var(--glass-shadow-hover);
    border-color: var(--glass-border-strong);
    transform: translateY(-1px);
  }

  .lg-card-active {
    background: rgba(0, 22, 45, 0.92);
    border-color: rgba(0, 22, 45, 0.9);
    box-shadow: 0 8px 32px rgba(0,22,45,0.25);
    transform: translateY(-1px);
  }

  .lg-card-selected {
    background: rgba(250, 247, 243, 0.85);
    border: 1.5px solid rgba(0, 22, 45, 0.35);
    box-shadow: 0 6px 24px rgba(0,22,45,0.12);
  }

  .lg-btn-primary {
    background: var(--navy);
    color: var(--cream);
    border: 1px solid rgba(0,22,45,0.8);
    border-radius: var(--radius-md);
    padding: 14px 20px;
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: var(--transition);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
  }

  .lg-btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%);
    border-radius: inherit;
    pointer-events: none;
  }

  .lg-btn-primary:hover {
    background: rgba(0, 22, 45, 0.85);
    box-shadow: 0 8px 28px rgba(0,22,45,0.3);
    transform: translateY(-1px);
  }

  .lg-btn-primary:active { transform: scale(0.98); }

  .lg-btn-ghost {
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border-strong);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
  }

  .lg-btn-ghost:hover {
    background: rgba(250,247,243,0.8);
    border-color: rgba(0,22,45,0.2);
    box-shadow: 0 4px 16px rgba(0,22,45,0.1);
  }

  .lg-btn-ghost:active { transform: scale(0.97); }

  .lg-btn-danger {
    background: rgba(220, 38, 38, 0.08);
    border: 1px solid rgba(220, 38, 38, 0.2);
    border-radius: var(--radius-sm);
    color: rgb(185, 28, 28);
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    padding: 6px 12px;
  }

  .lg-btn-danger:hover {
    background: rgba(220, 38, 38, 0.14);
    border-color: rgba(220, 38, 38, 0.35);
  }

  .lg-input {
    background: rgba(250,247,243,0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 22, 45, 0.15);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    transition: var(--transition);
    outline: none;
    width: 100%;
    padding: 10px 14px;
  }

  .lg-input:focus {
    border-color: rgba(0,22,45,0.4);
    background: rgba(250,247,243,0.9);
    box-shadow: 0 0 0 3px rgba(0,22,45,0.07);
  }

  .lg-label {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
    display: block;
  }

  .lg-section-title {
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .lg-accordion-trigger {
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    transition: var(--transition);
  }

  .lg-accordion-trigger:hover .lg-section-title { opacity: 0.75; }

  .lg-chevron {
    width: 16px;
    height: 16px;
    color: var(--text-muted);
    transition: transform 0.22s ease;
  }

  .lg-chevron.open { transform: rotate(180deg); }

  .lg-color-swatch {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
  }

  .lg-color-swatch::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 55%);
    pointer-events: none;
  }

  .lg-color-swatch.selected {
    border-color: var(--navy);
    box-shadow: 0 0 0 3px rgba(0,22,45,0.12), 0 4px 12px rgba(0,22,45,0.2);
  }

  .lg-size-btn {
    height: 40px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(0,22,45,0.15);
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: var(--text-secondary);
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: var(--transition);
  }

  .lg-size-btn:hover {
    border-color: rgba(0,22,45,0.3);
    background: rgba(250,247,243,0.85);
  }

  .lg-size-btn.active {
    background: var(--navy);
    color: var(--cream);
    border-color: var(--navy);
    box-shadow: 0 4px 14px rgba(0,22,45,0.22);
  }

  .lg-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 20px;
    font-family: 'Inter', sans-serif;
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .lg-tag-navy {
    background: rgba(0,22,45,0.07);
    color: rgba(0,22,45,0.65);
    border: 1px solid rgba(0,22,45,0.1);
  }

  .lg-tag-green {
    background: rgba(16,185,129,0.09);
    color: rgb(6,120,83);
    border: 1px solid rgba(16,185,129,0.18);
  }

  .lg-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,22,45,0.1) 30%, rgba(0,22,45,0.1) 70%, transparent);
    margin: 16px 0;
  }

  .lg-qty-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(0,22,45,0.15);
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 400;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lg-qty-btn:hover:not(:disabled) {
    background: rgba(250,247,243,0.9);
    border-color: rgba(0,22,45,0.3);
    box-shadow: 0 4px 12px rgba(0,22,45,0.1);
  }

  .lg-qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .lg-qty-input {
    width: 64px;
    height: 36px;
    text-align: center;
    font-size: 17px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
    background: rgba(250,247,243,0.8);
    border: 1px solid rgba(0,22,45,0.12);
    border-radius: var(--radius-sm);
    outline: none;
    -moz-appearance: textfield;
  }

  .lg-qty-input::-webkit-inner-spin-button,
  .lg-qty-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

  .lg-qty-input:focus {
    border-color: rgba(0,22,45,0.35);
    box-shadow: 0 0 0 3px rgba(0,22,45,0.06);
  }

  .lg-element-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    cursor: pointer;
    transition: var(--transition);
    background: transparent;
    width: 100%;
    text-align: left;
  }

  .lg-element-row:hover {
    background: rgba(250,247,243,0.7);
    border-color: rgba(0,22,45,0.1);
  }

  .lg-element-row.active {
    background: rgba(250,247,243,0.85);
    border-color: rgba(0,22,45,0.18);
    box-shadow: 0 2px 8px rgba(0,22,45,0.07);
  }

  .lg-fabric-card {
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: var(--transition);
    background: var(--glass-bg);
  }

  .lg-fabric-card.active {
    border-color: var(--navy);
    box-shadow: 0 6px 24px rgba(0,22,45,0.18);
  }

  .lg-fabric-card:hover:not(.active) {
    border-color: rgba(0,22,45,0.25);
    box-shadow: 0 4px 14px rgba(0,22,45,0.1);
  }

  .lg-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px 16px;
    border-radius: var(--radius-md);
    border: 1px solid rgba(0,22,45,0.13);
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    letter-spacing: 0.01em;
  }

  .lg-add-btn:hover {
    background: rgba(250,247,243,0.9);
    border-color: rgba(0,22,45,0.25);
    box-shadow: 0 6px 20px rgba(0,22,45,0.1);
    transform: translateY(-1px);
  }

  .lg-add-btn:active { transform: scale(0.97); }

  .lg-add-btn svg {
    width: 15px;
    height: 15px;
    opacity: 0.65;
  }

  .lg-file-drop {
    border: 1.5px dashed rgba(0,22,45,0.2);
    border-radius: var(--radius-md);
    padding: 14px;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition);
    background: rgba(250,247,243,0.4);
    position: relative;
  }

  .lg-file-drop:hover {
    border-color: rgba(0,22,45,0.38);
    background: rgba(250,247,243,0.65);
  }

  .lg-file-drop input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .lg-tip-box {
    background: rgba(0,22,45,0.04);
    border: 1px solid rgba(0,22,45,0.08);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
  }

  .lg-tip-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 11.5px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 6px;
  }

  .lg-tip-item:last-child { margin-bottom: 0; }

  .lg-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .lg-side-btn {
    width: 100%;
    padding: 11px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(0,22,45,0.13);
    background: var(--glass-bg);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lg-side-btn:hover {
    background: rgba(250,247,243,0.85);
    border-color: rgba(0,22,45,0.25);
  }

  .lg-style-btn {
    flex: 1;
    padding: 10px 8px;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(0,22,45,0.13);
    background: var(--glass-bg);
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-family: 'Inter', sans-serif;
  }

  .lg-style-btn.active {
    border-color: rgba(0,22,45,0.35);
    background: rgba(250,247,243,0.9);
    box-shadow: 0 2px 10px rgba(0,22,45,0.1);
  }

  .lg-style-btn:hover:not(.active) {
    background: rgba(250,247,243,0.7);
    border-color: rgba(0,22,45,0.2);
  }

  .lg-dims-pill {
    background: rgba(0,22,45,0.05);
    border: 1px solid rgba(0,22,45,0.09);
    border-radius: var(--radius-md);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lg-cta-btn {
    width: 100%;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    background: var(--navy);
    color: var(--cream);
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }

  .lg-cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%);
    pointer-events: none;
    border-radius: inherit;
  }

  .lg-cta-btn:hover {
    background: rgba(0,22,45,0.88);
    box-shadow: 0 12px 36px rgba(0,22,45,0.32);
    transform: translateY(-1.5px);
  }

  .lg-cta-btn:active { transform: scale(0.985); }

  .lg-spinner {
    width: 44px;
    height: 44px;
    border: 2.5px solid rgba(0,22,45,0.12);
    border-top-color: var(--navy);
    border-radius: 50%;
    animation: lg-spin 0.85s linear infinite;
  }

  @keyframes lg-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .lg-range {
    -webkit-appearance: none;
    appearance: none;
    height: 5px;
    background: rgba(0,22,45,0.12);
    border-radius: 3px;
    outline: none;
    width: 100%;
  }

  .lg-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: var(--navy);
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid var(--cream);
    box-shadow: 0 2px 8px rgba(0,22,45,0.25);
    transition: all 0.15s ease;
  }

  .lg-range::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }

  .lg-range::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: var(--navy);
    border-radius: 50%;
    border: 3px solid var(--cream);
    box-shadow: 0 2px 8px rgba(0,22,45,0.25);
    cursor: pointer;
  }

  .touch-none { touch-action: none; }
`;

// --- ICON COMPONENTS ---
const Icon = ({ name, size = 16, style = {} }) => {
  const icons = {
    chevronDown: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5.5L8 10.5L13 5.5" />
      </svg>
    ),
    image: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="2.5" width="13" height="11" rx="2" />
        <circle cx="5.5" cy="6" r="1.2" />
        <path d="M1.5 11l3.5-3.5 2.5 2.5 2-2 4 4" />
      </svg>
    ),
    text: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h12M8 4v9M5 13h6" />
      </svg>
    ),
    trash: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h12M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5 4l.5 9h5l.5-9" />
      </svg>
    ),
    flipH: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v12M4 5L1 8l3 3M12 5l3 3-3 3" />
      </svg>
    ),
    front: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="12" height="10" rx="1.5" />
        <path d="M5 6.5h6M5 9h4" />
      </svg>
    ),
    back: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="12" height="10" rx="1.5" />
        <path d="M5 8h6" strokeDasharray="2 1.5" />
      </svg>
    ),
    upload: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10V3M5 6l3-3 3 3" />
        <path d="M2.5 13h11" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 8.5l3.5 3.5 7-7" />
      </svg>
    ),
    cart: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 1.5h2l1.5 7.5h7.5l1.5-5H4.5" />
        <circle cx="6.5" cy="13" r="1" />
        <circle cx="11.5" cy="13" r="1" />
      </svg>
    ),
    minus: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 8h10" />
      </svg>
    ),
    plus: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 3v10M3 8h10" />
      </svg>
    ),
    folder: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 4.5h5l1.5 2h6.5v7h-13z" />
      </svg>
    ),
    palette: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <circle cx="5.5" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="10.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    fabric: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 2h12v12H2z" />
        <path d="M5 2v12M8 2v12M11 2v12M2 5h12M2 8h12M2 11h12" strokeDasharray="1.5 1.5" />
      </svg>
    ),
    ruler: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="5.5" width="13" height="5" rx="1" />
        <path d="M4 5.5v2M7 5.5v3M10 5.5v2M13 5.5v2" />
      </svg>
    ),
    stack: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.5L14 5 8 8.5 2 5z" />
        <path d="M2 8.5L8 12l6-3.5M2 11.5L8 15l6-3.5" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 7.5V11M8 5.5v.5" />
      </svg>
    ),
  };
  return (
    <span style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
      {React.cloneElement(icons[name] || icons.info, { width: size, height: size })}
    </span>
  );
};

// --- COMPONENTE: Selector de Fuentes con Vista Previa ---
const FontSelector = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (font) => { onChange(font); setIsOpen(false); };

  return (
    <div style={{ position: 'relative' }} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(250,247,243,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,22,45,0.15)',
          borderRadius: 10,
          fontSize: '14px',
          fontFamily: value,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <span>{value}</span>
        <Icon name="chevronDown" size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          maxHeight: 260,
          overflowY: 'auto',
          background: 'rgba(250,247,243,0.96)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 14,
          boxShadow: '0 16px 48px rgba(0,22,45,0.14), 0 4px 12px rgba(0,22,45,0.08)',
        }}>
          {options.map(group => (
            <div key={group.label}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(0,22,45,0.4)',
                padding: '10px 14px 6px',
                background: 'rgba(0,22,45,0.02)',
                fontFamily: 'Inter, sans-serif',
              }}>{group.label}</div>
              {group.fonts.map(font => (
                <button
                  key={font}
                  type="button"
                  onClick={() => handleSelect(font)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 14px',
                    fontSize: 15,
                    fontFamily: font,
                    cursor: 'pointer',
                    background: value === font ? 'rgba(0,22,45,0.06)' : 'transparent',
                    color: value === font ? 'var(--navy)' : 'var(--text-primary)',
                    border: 'none',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { if (value !== font) e.currentTarget.style.background = 'rgba(0,22,45,0.035)'; }}
                  onMouseLeave={e => { if (value !== font) e.currentTarget.style.background = 'transparent'; }}
                >
                  {font}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE: Guías de Medidas Visuales ---
const DimensionGuides = ({ sizeSpec }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
    <div style={{ position: 'relative', width: '60%', height: '70%' }}>
      <div style={{ position: 'absolute', right: -20, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <div style={{ height: '100%', width: 1, background: 'rgba(0,22,45,0.2)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 8, height: 1, background: 'rgba(0,22,45,0.3)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 8, height: 1, background: 'rgba(0,22,45,0.3)' }} />
          <div style={{
            position: 'absolute', top: '50%', left: 6, transform: 'translateY(-50%)',
            background: 'rgba(250,247,243,0.88)', backdropFilter: 'blur(12px)',
            padding: '3px 7px', borderRadius: 6,
            fontSize: 11, fontWeight: 600, fontFamily: 'Inter,sans-serif',
            color: 'rgba(0,22,45,0.65)', border: '1px solid rgba(0,22,45,0.1)',
            whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,22,45,0.08)',
          }}>{sizeSpec.height} cm</div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', height: 1, background: 'rgba(0,22,45,0.2)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: 8, width: 1, background: 'rgba(0,22,45,0.3)' }} />
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', height: 8, width: 1, background: 'rgba(0,22,45,0.3)' }} />
          <div style={{
            position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)',
            background: 'rgba(250,247,243,0.88)', backdropFilter: 'blur(12px)',
            padding: '3px 7px', borderRadius: 6,
            fontSize: 11, fontWeight: 600, fontFamily: 'Inter,sans-serif',
            color: 'rgba(0,22,45,0.65)', border: '1px solid rgba(0,22,45,0.1)',
            whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,22,45,0.08)',
          }}>{sizeSpec.width} cm</div>
        </div>
      </div>
    </div>
  </div>
);

// --- ACCORDION SECTION ---
const AccordionSection = ({ icon, title, isOpen, onToggle, children }) => (
  <div className="lg-card" style={{ padding: '16px 18px' }}>
    <button className="lg-accordion-trigger" onClick={onToggle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ color: 'rgba(0,22,45,0.45)', display: 'flex' }}>
          <Icon name={icon} size={15} />
        </span>
        <span className="lg-section-title">{title}</span>
      </div>
      <Icon name="chevronDown" size={14} style={{ color: 'rgba(0,22,45,0.35)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s ease' }} />
    </button>
    <div style={{
      overflow: 'hidden',
      maxHeight: isOpen ? 600 : 0,
      opacity: isOpen ? 1 : 0,
      transition: 'max-height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease',
      marginTop: isOpen ? 16 : 0,
    }}>
      {children}
    </div>
  </div>
);

const CANVAS_SIZE = 2048;

const ShirtDesigner = () => {
  const viewerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const animationRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const [currentShirtColor, setCurrentShirtColor] = useState('#ffffff');
  const [currentFabric, setCurrentFabric] = useState('algodon');
  const [imageElements, setImageElements] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [elementIdCounter, setElementIdCounter] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [debugMsg, setDebugMsg] = useState('init');
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeHandle, setActiveHandle] = useState(null);
  const [isColorSectionOpen, setIsColorSectionOpen] = useState(true);
  const [isFabricSectionOpen, setIsFabricSectionOpen] = useState(true);
  const [isSizeSectionOpen, setIsSizeSectionOpen] = useState(true);
  const [isQuantitySectionOpen, setIsQuantitySectionOpen] = useState(true);
  const [currentSize, setCurrentSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  const shirtSizes = ['S', 'M', 'L', 'XL'];
  const originalMaterials = useRef(new Map());
  const materialsWithTexture = useRef(new Set());
  const isMouseDown = useRef(false);
  const isTouchActive = useRef(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const touchDistance = useRef(0);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const rotateStart = useRef({ angle: 0, elementRotation: 0 });
  const scaleStart = useRef({ distance: 0, elementScale: 1, width: 1, height: 1 });
  const isInteractingWithElement = useRef(false);
  const imageElementsRef = useRef([]);
  const textElementsRef = useRef([]);
  const selectedElementRef = useRef(null);
  const activeHandleRef = useRef(null);

  useEffect(() => {
    const googleFontsUrl = 'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Bodoni+Moda:ital,wght@0,400;0,600;1,400&family=DM+Serif+Display:ital@0;1&family=Fraunces:ital,wght@0,300;0,400;1,300&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=Tenor+Sans&family=Josefin+Sans:ital,wght@0,100;0,300;0,400;1,100;1,300&family=Poiret+One&family=Raleway:ital,wght@0,100;0,300;0,400;1,100;1,300&family=Montserrat:ital,wght@0,100;0,300;0,400;1,100&family=Jost:ital,wght@0,100;0,300;0,400;1,100&family=Outfit:wght@100;300;400&family=Urbanist:ital,wght@0,100;0,300;0,400;1,100&family=Nunito+Sans:wght@200;300;400&family=Bebas+Neue&family=Great+Vibes&family=Sacramento&family=Allura&family=Pinyon+Script&family=Petit+Formal+Script&family=Italianno&family=Dancing+Script:wght@400;700&family=Parisienne&family=Alex+Brush&family=Carattere&family=Clicker+Script&family=Damion&family=Oswald:wght@200;300;400;500&family=Barlow+Condensed:ital,wght@0,100;0,300;0,400;1,100&family=Anton&family=Big+Shoulders+Display:wght@100;300;400;700&family=Fjalla+One&family=Pathway+Gothic+One&family=Lora:ital,wght@0,400;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cardo:ital,wght@0,400;0,700;1,400&family=Spectral:ital,wght@0,300;0,400;1,300&family=Arvo:ital,wght@0,400;0,700;1,400&display=swap';
    const existingLink = document.getElementById('fashion-google-fonts');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'fashion-google-fonts';
      link.rel = 'stylesheet';
      link.href = googleFontsUrl;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => { selectedElementRef.current = selectedElement; }, [selectedElement]);
  useEffect(() => { activeHandleRef.current = activeHandle; }, [activeHandle]);

  const shirtColors = [
    { color: '#ffffff', name: 'Blanco' },
    { color: 'rgb(196, 196, 196)', name: 'Gris' },
    { color: 'rgb(38, 38, 38)', name: 'Negro' },
  ];

  const fabricTypes = [
    { id: 'algodon', name: 'Algodón', image: '/models/algodon.jpeg' },
  ];

  const fontFamilies = [
    { label: '✦ Alta Moda — Serif de Lujo', fonts: ['Cormorant', 'Cormorant Garamond', 'Playfair Display', 'Bodoni Moda', 'DM Serif Display', 'Fraunces'] },
    { label: '✦ Editorial — Estilo Vogue & Dior', fonts: ['Cinzel', 'Cinzel Decorative', 'Tenor Sans', 'Josefin Sans', 'Poiret One', 'Raleway'] },
    { label: '✦ Minimalismo Chic — Sans Serif', fonts: ['Montserrat', 'Jost', 'Outfit', 'Urbanist', 'Nunito Sans', 'Bebas Neue'] },
    { label: '✦ Cursivas Elegantes — Haute Couture', fonts: ['Great Vibes', 'Sacramento', 'Allura', 'Pinyon Script', 'Petit Formal Script', 'Italianno'] },
    { label: '✦ Script con Carácter', fonts: ['Dancing Script', 'Parisienne', 'Alex Brush', 'Carattere', 'Clicker Script', 'Damion'] },
    { label: '✦ Condensadas de Impacto', fonts: ['Oswald', 'Barlow Condensed', 'Anton', 'Big Shoulders Display', 'Fjalla One', 'Pathway Gothic One'] },
    { label: '✦ Clásicas & Atemporales', fonts: ['Lora', 'EB Garamond', 'Libre Baskerville', 'Cardo', 'Spectral', 'Arvo'] }
  ];

  const getElementDimensionsInCm = (element) => {
    const shirtWidthCm = SHIRT_SPECS[currentSize].width;
    const shirtHeightCm = SHIRT_SPECS[currentSize].height;
    const scaleX = element.scaleX ?? element.scale ?? 0;
    const scaleY = element.scaleY ?? element.scale ?? 0;
    const widthCm = scaleX * shirtWidthCm * UV_SCALE_FACTOR_W;
    const heightCm = scaleY * shirtHeightCm * UV_SCALE_FACTOR_H;
    return { width: widthCm.toFixed(1), height: heightCm.toFixed(1) };
  };

  const changeSize = (newSize) => {
    if (newSize === currentSize) return;
    const oldWidth = SHIRT_SPECS[currentSize].width;
    const newWidth = SHIRT_SPECS[newSize].width;
    const ratio = oldWidth / newWidth;
    setImageElements(prev => prev.map(el => ({ ...el, scale: el.scale * ratio, scaleX: el.scaleX * ratio, scaleY: el.scaleY * ratio })));
    setTextElements(prev => prev.map(el => ({ ...el, scale: el.scale * ratio, scaleX: el.scaleX * ratio, scaleY: el.scaleY * ratio })));
    setCurrentSize(newSize);
  };

  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const width = viewer.clientWidth;
    const height = viewer.clientHeight;
    setDebugMsg(`viewer: ${width}x${height}, dpr: ${window.devicePixelRatio}`);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf7f3);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    viewer.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      alert('Contexto WebGL perdido. Tamaño: ' + viewer.clientWidth + 'x' + viewer.clientHeight);
    });
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    setupInteractionControls(renderer.domElement);
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    const handleResize = () => {
      const newWidth = viewer.clientWidth;
      const newHeight = viewer.clientHeight;
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    loadModelFromPath('/models/Shirt3D2.glb');
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      if (viewer && renderer.domElement) viewer.removeChild(renderer.domElement);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  const isElementOnFront = (element) => {
    if (!modelRef.current) return true;
    let rotY = modelRef.current.rotation.y % (Math.PI * 2);
    if (rotY > Math.PI) rotY -= Math.PI * 2;
    if (rotY < -Math.PI) rotY += Math.PI * 2;
    return Math.abs(rotY) < Math.PI / 2;
  };

  const updateAllCombinedTextures = useCallback(() => {
    if (!modelRef.current || !rendererRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.fillStyle = currentShirtColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    imageElements.forEach(element => { if (element.texture && element.side === 'front') drawElementOnCanvas(ctx, element, canvas.width, canvas.height, 'front'); });
    textElements.forEach(element => { if (element.side === 'front') drawTextOnCanvas(ctx, element, canvas.width, canvas.height, 'front'); });
    imageElements.forEach(element => { if (element.texture && element.side === 'back') drawElementOnCanvas(ctx, element, canvas.width, canvas.height, 'back'); });
    textElements.forEach(element => { if (element.side === 'back') drawTextOnCanvas(ctx, element, canvas.width, canvas.height, 'back'); });
    if (selectedElementRef.current) {
      const element = [...imageElements, ...textElements].find(el => el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type);
      if (element) {
        const elementOnFront = element.side === 'front';
        const viewingFront = isElementOnFront(element);
        if (elementOnFront === viewingFront) drawControlsOnCanvas(ctx, element, canvas.width, canvas.height, element.side);
      }
    }
    if (modelRef.current.__lastTexture) {
      modelRef.current.__lastTexture.dispose();
    }
    const combinedTexture = new THREE.CanvasTexture(canvas);
    combinedTexture.colorSpace = THREE.SRGBColorSpace;
    combinedTexture.wrapS = THREE.ClampToEdgeWrapping;
    combinedTexture.wrapT = THREE.ClampToEdgeWrapping;
    combinedTexture.minFilter = THREE.LinearFilter;
    combinedTexture.magFilter = THREE.LinearFilter;
    combinedTexture.needsUpdate = true;
    modelRef.current.__lastTexture = combinedTexture;
    modelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        const applyTextureToMaterial = (mat, uuidKey) => {
          mat.map = combinedTexture;
          mat.color.set(0xffffff);
          mat.transparent = false;
          mat.opacity = 1.0;
          if (mat.roughness !== undefined) mat.roughness = 1.0;
          if (mat.metalness !== undefined) mat.metalness = 0.0;
          if (mat.emissive !== undefined) mat.emissive.set(0x000000);
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0;
          mat.needsUpdate = true;
          materialsWithTexture.current.add(uuidKey);
        };
        if (Array.isArray(child.material)) {
          child.material.forEach((mat, index) => applyTextureToMaterial(mat, `${child.uuid}_${index}`));
        } else {
          applyTextureToMaterial(child.material, child.uuid);
        }
      }
    });
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [currentShirtColor, imageElements, textElements, selectedElement]);

  useEffect(() => {
    const timeoutId = setTimeout(() => updateAllCombinedTextures(), 16);
    return () => clearTimeout(timeoutId);
  }, [currentShirtColor, imageElements, textElements, selectedElement, updateAllCombinedTextures]);

  useEffect(() => { imageElementsRef.current = imageElements; }, [imageElements]);
  useEffect(() => { textElementsRef.current = textElements; }, [textElements]);

  const drawControlsOnCanvas = (ctx, element, canvasWidth, canvasHeight, side) => {
    const designAreaHeight = canvasHeight / 2;
    const designAreaCenterY = side === 'front' ? canvasHeight * 0.75 : canvasHeight * 0.25;
    const pixelScale = designAreaHeight;
    const pixelOffsetX = (side === 'back' ? -element.offsetX : element.offsetX) * pixelScale;
    const pixelOffsetY = element.offsetY * pixelScale;
    const centerX = canvasWidth / 2 + pixelOffsetX;
    const centerY = designAreaCenterY - pixelOffsetY;
    const elementWidth = (element.scaleX || element.scale) * pixelScale;
    let aspectRatio = 1;
    if (element.type === 'image' && element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
    else if (element.type === 'text') aspectRatio = 0.3;
    const elementHeight = (element.scaleY || (element.scale * aspectRatio)) * pixelScale;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(element.rotation || 0);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.setLineDash([16, 8]);
    ctx.strokeRect(-elementWidth / 2, -elementHeight / 2, elementWidth, elementHeight);
    ctx.setLineDash([]);
    const handleSize = 30;
    const corners = [
      { x: -elementWidth / 2, y: -elementHeight / 2 }, { x: elementWidth / 2, y: -elementHeight / 2 },
      { x: -elementWidth / 2, y: elementHeight / 2 }, { x: elementWidth / 2, y: elementHeight / 2 },
    ];
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    corners.forEach(corner => {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });
    const edges = [
      { x: 0, y: -elementHeight / 2 }, { x: 0, y: elementHeight / 2 },
      { x: -elementWidth / 2, y: 0 }, { x: elementWidth / 2, y: 0 },
    ];
    ctx.fillStyle = '#10b981';
    edges.forEach(edge => {
      ctx.fillRect(edge.x - handleSize / 2, edge.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(edge.x - handleSize / 2, edge.y - handleSize / 2, handleSize, handleSize);
    });
    const rotateDistance = elementHeight / 2 + 80;
    ctx.strokeStyle = '#3b82f6';
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(0, -elementHeight / 2);
    ctx.lineTo(0, -rotateDistance);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -rotateDistance, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const dims = getElementDimensionsInCm(element);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const widthTextY = elementHeight / 2 + 50;
    ctx.strokeText(`${dims.width} cm`, 0, widthTextY);
    ctx.fillText(`${dims.width} cm`, 0, widthTextY);
    const heightTextX = elementWidth / 2 + 50;
    ctx.save();
    ctx.translate(heightTextX, 0);
    ctx.rotate(Math.PI / 2);
    ctx.strokeText(`${dims.height} cm`, 0, 0);
    ctx.fillText(`${dims.height} cm`, 0, 0);
    ctx.restore();
    ctx.restore();
  };

  const screenToWorldDelta = (deltaPixelsX, deltaPixelsY) => {
    if (!modelRef.current || !cameraRef.current) return { x: 0, y: 0 };
    const distance = cameraRef.current.position.distanceTo(modelRef.current.position);
    const vFOV = (cameraRef.current.fov * Math.PI) / 180;
    const worldHeight = 2 * Math.tan(vFOV / 2) * distance;
    const pixelsPerWorldUnit = viewerRef.current.clientHeight / worldHeight;
    let worldDeltaX = deltaPixelsX / pixelsPerWorldUnit;
    let worldDeltaY = -deltaPixelsY / pixelsPerWorldUnit;
    let rotY = modelRef.current.rotation.y % (Math.PI * 2);
    if (rotY > Math.PI) rotY -= Math.PI * 2;
    if (rotY < -Math.PI) rotY += Math.PI * 2;
    const isViewingBack = Math.abs(rotY) > Math.PI / 2;
    if (isViewingBack) worldDeltaX = -worldDeltaX;
    return { x: worldDeltaX / 2, y: worldDeltaY / 2 };
  };

  const getClickedHandleFromUV = (clickU, clickV, element) => {
    if (!element) return null;
    const canvasSize = CANVAS_SIZE;
    const designAreaHeight = canvasSize / 2;
    const designAreaCenterY = element.side === 'front' ? canvasSize * 0.75 : canvasSize * 0.25;
    const pixelScale = designAreaHeight;
    const pixelOffsetX = (element.side === 'back' ? -element.offsetX : element.offsetX) * pixelScale;
    const pixelOffsetY = element.offsetY * pixelScale;
    const centerX = canvasSize / 2 + pixelOffsetX;
    const centerY = designAreaCenterY - pixelOffsetY;
    const centerU = centerX / canvasSize;
    const centerV = 1.0 - (centerY / canvasSize);
    const elementWidthPixels = (element.scaleX || element.scale) * pixelScale;
    let aspectRatio = 1;
    if (element.type === 'image' && element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
    else if (element.type === 'text') aspectRatio = 0.3;
    const elementHeightPixels = (element.scaleY || (element.scale * aspectRatio)) * pixelScale;
    const elementWidthUV = elementWidthPixels / canvasSize;
    const elementHeightUV = elementHeightPixels / canvasSize;
    const rotation = element.rotation || 0;
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    const du = clickU - centerU;
    const dv = clickV - centerV;
    const rotatedU = du * cos - dv * sin;
    const rotatedV = du * sin + dv * cos;
    const handleSizeUV = 30 / canvasSize;
    const rotateDistancePixels = elementHeightPixels / 2 + 80;
    const rotateDistanceUV = rotateDistancePixels / canvasSize;
    if (Math.abs(rotatedU) < handleSizeUV && Math.abs(rotatedV - rotateDistanceUV) < handleSizeUV) return 'rotate';
    const halfU = elementWidthUV / 2;
    const halfV = elementHeightUV / 2;
    const corners = [
      { u: -halfU, v: halfV, name: 'scale-nw' }, { u: halfU, v: halfV, name: 'scale-ne' },
      { u: -halfU, v: -halfV, name: 'scale-sw' }, { u: halfU, v: -halfV, name: 'scale-se' }
    ];
    for (const corner of corners) {
      if (Math.abs(rotatedU - corner.u) < handleSizeUV && Math.abs(rotatedV - corner.v) < handleSizeUV) return corner.name;
    }
    const edges = [
      { u: 0, v: halfV, name: 'edge-n' }, { u: 0, v: -halfV, name: 'edge-s' },
      { u: -halfU, v: 0, name: 'edge-w' }, { u: halfU, v: 0, name: 'edge-e' }
    ];
    for (const edge of edges) {
      if (Math.abs(rotatedU - edge.u) < handleSizeUV && Math.abs(rotatedV - edge.v) < handleSizeUV) return edge.name;
    }
    if (Math.abs(rotatedU) < halfU * 1.2 && Math.abs(rotatedV) < halfV * 1.2) return 'move';
    return null;
  };

  const getClickedElement = (x, y) => {
    if (!modelRef.current || !cameraRef.current || !viewerRef.current) return null;
    const rect = viewerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((x - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((y - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    let clickedUV = null;
    modelRef.current.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const intersects = raycasterRef.current.intersectObject(child, false);
        if (intersects.length > 0 && intersects[0].uv) clickedUV = intersects[0].uv;
      }
    });
    if (!clickedUV) return null;
    const allElements = [...imageElementsRef.current, ...textElementsRef.current];
    if (selectedElementRef.current) {
      const selectedEl = allElements.find(el => el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type);
      if (selectedEl && selectedEl.side === 'front' === isElementOnFront(selectedEl)) {
        const handle = getClickedHandleFromUV(clickedUV.x, clickedUV.y, selectedEl);
        if (handle) return { element: selectedEl, handle };
      }
    }
    for (const element of allElements.reverse()) {
      if (element.side === 'front' !== isElementOnFront(element)) continue;
      const handle = getClickedHandleFromUV(clickedUV.x, clickedUV.y, element);
      if (handle) return { element, handle };
    }
    return null;
  };

  const get2DPositionFromElement = (element) => {
    if (!modelRef.current || !cameraRef.current || !viewerRef.current) return { x: 0, y: 0 };
    const MODEL_CHEST_CENTER_Y = 0.11;
    const MODEL_BACK_CENTER_Y = -0.05;
    const MODEL_OFFSET_SCALE = 1.8;
    const baseY = element.side === 'back' ? MODEL_BACK_CENTER_Y : MODEL_CHEST_CENTER_Y;
    const zPosition = element.side === 'back' ? -0.5 : 0.5;
    const localPosition = new THREE.Vector3(element.offsetX * MODEL_OFFSET_SCALE, (baseY + element.offsetY) * MODEL_OFFSET_SCALE, zPosition);
    const worldPosition = localPosition.clone();
    modelRef.current.localToWorld(worldPosition);
    worldPosition.project(cameraRef.current);
    const rect = viewerRef.current.getBoundingClientRect();
    return { x: (worldPosition.x * 0.5 + 0.5) * rect.width, y: (-worldPosition.y * 0.5 + 0.5) * rect.height };
  };

  const setupInteractionControls = (canvas) => {
    canvas.addEventListener('mousedown', (e) => {
      const clicked = getClickedElement(e.clientX, e.clientY);
      if (clicked) {
        const { element, handle } = clicked;
        setSelectedElement({ id: element.id, type: element.type });
        setActiveHandle(handle);
        isInteractingWithElement.current = true;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        if (handle === 'move') {
          dragStart.current = { x: clientX, y: clientY, elementX: element.offsetX, elementY: element.offsetY };
        } else if (handle === 'rotate') {
          const pos = get2DPositionFromElement(element);
          const angle = Math.atan2(clientY - pos.y, clientX - pos.x);
          rotateStart.current = { angle, elementRotation: element.rotation || 0 };
        } else if (handle.startsWith('scale-') || handle.startsWith('edge-')) {
          const pos = get2DPositionFromElement(element);
          const distance = Math.sqrt((clientX - pos.x) ** 2 + (clientY - pos.y) ** 2);
          let aspectRatio = 1;
          if (element.type === 'image' && element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
          else if (element.type === 'text') aspectRatio = 0.3;
          scaleStart.current = { distance, elementScale: element.scale, width: element.scaleX || element.scale, height: element.scaleY || (element.scale * aspectRatio), startX: clientX, startY: clientY };
        }
      } else {
        setSelectedElement(null);
        isMouseDown.current = true;
        mousePos.current = { x: e.clientX, y: e.clientY };
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const currentSelected = selectedElementRef.current;
      const currentHandle = activeHandleRef.current;
      if (isInteractingWithElement.current && currentSelected && currentHandle) {
        e.preventDefault();
        const element = [...imageElementsRef.current, ...textElementsRef.current].find(el => el.id === currentSelected.id && el.type === currentSelected.type);
        if (!element) return;
        if (currentHandle === 'move') {
          const deltaPixelsX = x - dragStart.current.x;
          const deltaPixelsY = y - dragStart.current.y;
          const worldDelta = screenToWorldDelta(deltaPixelsX, deltaPixelsY);
          const newOffsetX = dragStart.current.elementX + worldDelta.x;
          const newOffsetY = dragStart.current.elementY + worldDelta.y;
          if (element.type === 'image') { updateImageElement(element.id, 'offsetX', newOffsetX); updateImageElement(element.id, 'offsetY', newOffsetY); }
          else { updateTextElement(element.id, 'offsetX', newOffsetX); updateTextElement(element.id, 'offsetY', newOffsetY); }
        } else if (currentHandle === 'rotate') {
          const pos = get2DPositionFromElement(element);
          const angle = Math.atan2(y - pos.y, x - pos.x);
          const rotation = rotateStart.current.elementRotation + (angle - rotateStart.current.angle);
          if (element.type === 'image') updateImageElement(element.id, 'rotation', rotation);
          else updateTextElement(element.id, 'rotation', rotation);
        } else if (currentHandle.startsWith('scale-')) {
          const pos = get2DPositionFromElement(element);
          const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          const scaleFactor = distance / scaleStart.current.distance;
          const newScale = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.elementScale * scaleFactor));
          if (element.type === 'image') {
            updateImageElement(element.id, 'scale', newScale);
            updateImageElement(element.id, 'scaleX', newScale);
            let ar = 1;
            if (element.texture?.image) ar = element.texture.image.height / element.texture.image.width;
            updateImageElement(element.id, 'scaleY', newScale * ar);
          } else {
            updateTextElement(element.id, 'scale', newScale);
            updateTextElement(element.id, 'scaleX', newScale);
            updateTextElement(element.id, 'scaleY', newScale * 0.3);
          }
        } else if (currentHandle.startsWith('edge-')) {
          const deltaX = x - scaleStart.current.startX;
          const deltaY = y - scaleStart.current.startY;
          const pixelToScale = 1 / (viewerRef.current.clientHeight / 2);
          if (currentHandle === 'edge-n' || currentHandle === 'edge-s') {
            const deltaScale = (currentHandle === 'edge-n' ? -deltaY : deltaY) * pixelToScale;
            const newHeight = Math.max(0.02, Math.min(UV_SCALE_FACTOR_H, scaleStart.current.height + deltaScale));
            if (element.type === 'image') updateImageElement(element.id, 'scaleY', newHeight);
            else updateTextElement(element.id, 'scaleY', newHeight);
          } else if (currentHandle === 'edge-w' || currentHandle === 'edge-e') {
            const deltaScale = (currentHandle === 'edge-w' ? -deltaX : deltaX) * pixelToScale;
            const newWidth = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.width + deltaScale));
            if (element.type === 'image') updateImageElement(element.id, 'scaleX', newWidth);
            else updateTextElement(element.id, 'scaleX', newWidth);
          }
        }
      } else if (isMouseDown.current && !isInteractingWithElement.current && modelRef.current) {
        const deltaX = e.clientX - mousePos.current.x;
        const deltaY = e.clientY - mousePos.current.y;
        modelRef.current.rotation.y += deltaX * 0.01;
        modelRef.current.rotation.x += deltaY * 0.01;
        mousePos.current = { x: e.clientX, y: e.clientY };
      }
      if (!isInteractingWithElement.current) {
        const clicked = getClickedElement(e.clientX, e.clientY);
        if (clicked) {
          const { handle } = clicked;
          if (handle === 'rotate') canvas.style.cursor = 'grab';
          else if (handle.startsWith('scale-')) canvas.style.cursor = (handle === 'scale-nw' || handle === 'scale-se') ? 'nwse-resize' : 'nesw-resize';
          else if (handle.startsWith('edge-')) canvas.style.cursor = (handle === 'edge-n' || handle === 'edge-s') ? 'ns-resize' : 'ew-resize';
          else if (handle === 'move') canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'default';
        }
      }
    });

    canvas.addEventListener('mouseup', () => {
      isMouseDown.current = false;
      isInteractingWithElement.current = false;
      setActiveHandle(null);
    });

    canvas.addEventListener('wheel', (e) => {
      if (!isInteractingWithElement.current) {
        e.preventDefault();
        const zoom = cameraRef.current.position.z + e.deltaY * 0.01;
        cameraRef.current.position.z = Math.max(1, Math.min(10, zoom));
      }
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const clicked = getClickedElement(touch.clientX, touch.clientY);
        if (clicked) {
          const { element, handle } = clicked;
          setSelectedElement({ id: element.id, type: element.type });
          setActiveHandle(handle);
          isInteractingWithElement.current = true;
          const rect = canvas.getBoundingClientRect();
          const clientX = touch.clientX - rect.left;
          const clientY = touch.clientY - rect.top;
          if (handle === 'move') {
            dragStart.current = { x: clientX, y: clientY, elementX: element.offsetX, elementY: element.offsetY };
          } else if (handle === 'rotate') {
            const pos = get2DPositionFromElement(element);
            const angle = Math.atan2(clientY - pos.y, clientX - pos.x);
            rotateStart.current = { angle, elementRotation: element.rotation || 0 };
          } else if (handle.startsWith('scale-') || handle.startsWith('edge-')) {
            const pos = get2DPositionFromElement(element);
            const distance = Math.sqrt((clientX - pos.x) ** 2 + (clientY - pos.y) ** 2);
            let aspectRatio = 1;
            if (element.type === 'image' && element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
            else if (element.type === 'text') aspectRatio = 0.3;
            scaleStart.current = { distance, elementScale: element.scale, width: element.scaleX || element.scale, height: element.scaleY || (element.scale * aspectRatio), startX: clientX, startY: clientY };
          }
        } else {
          isTouchActive.current = true;
          mousePos.current = { x: touch.clientX, y: touch.clientY };
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistance.current = Math.sqrt(dx * dx + dy * dy);
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const currentHandle = activeHandleRef.current;
        if (isInteractingWithElement.current && selectedElementRef.current && currentHandle) {
          const element = [...imageElementsRef.current, ...textElementsRef.current].find(el => el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type);
          if (!element) return;
          if (currentHandle === 'move') {
            const deltaPixelsX = x - dragStart.current.x;
            const deltaPixelsY = y - dragStart.current.y;
            const worldDelta = screenToWorldDelta(deltaPixelsX, deltaPixelsY);
            const newOffsetX = dragStart.current.elementX + worldDelta.x;
            const newOffsetY = dragStart.current.elementY + worldDelta.y;
            if (element.type === 'image') { updateImageElement(element.id, 'offsetX', newOffsetX); updateImageElement(element.id, 'offsetY', newOffsetY); }
            else { updateTextElement(element.id, 'offsetX', newOffsetX); updateTextElement(element.id, 'offsetY', newOffsetY); }
          } else if (currentHandle === 'rotate') {
            const pos = get2DPositionFromElement(element);
            const angle = Math.atan2(y - pos.y, x - pos.x);
            const rotation = rotateStart.current.elementRotation + (angle - rotateStart.current.angle);
            if (element.type === 'image') updateImageElement(element.id, 'rotation', rotation);
            else updateTextElement(element.id, 'rotation', rotation);
          } else if (currentHandle.startsWith('scale-')) {
            const pos = get2DPositionFromElement(element);
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            const scaleFactor = distance / scaleStart.current.distance;
            const newScale = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.elementScale * scaleFactor));
            if (element.type === 'image') {
              updateImageElement(element.id, 'scale', newScale);
              updateImageElement(element.id, 'scaleX', newScale);
              let ar = 1;
              if (element.texture?.image) ar = element.texture.image.height / element.texture.image.width;
              updateImageElement(element.id, 'scaleY', newScale * ar);
            } else {
              updateTextElement(element.id, 'scale', newScale);
              updateTextElement(element.id, 'scaleX', newScale);
              updateTextElement(element.id, 'scaleY', newScale * 0.3);
            }
          } else if (currentHandle.startsWith('edge-')) {
            const deltaX = x - scaleStart.current.startX;
            const deltaY = y - scaleStart.current.startY;
            const pixelToScale = 1 / (viewerRef.current.clientHeight / 2);
            if (currentHandle === 'edge-n' || currentHandle === 'edge-s') {
              const deltaScale = (currentHandle === 'edge-n' ? -deltaY : deltaY) * pixelToScale;
              const newHeight = Math.max(0.02, Math.min(UV_SCALE_FACTOR_H, scaleStart.current.height + deltaScale));
              if (element.type === 'image') updateImageElement(element.id, 'scaleY', newHeight);
              else updateTextElement(element.id, 'scaleY', newHeight);
            } else if (currentHandle === 'edge-w' || currentHandle === 'edge-e') {
              const deltaScale = (currentHandle === 'edge-w' ? -deltaX : deltaX) * pixelToScale;
              const newWidth = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.width + deltaScale));
              if (element.type === 'image') updateImageElement(element.id, 'scaleX', newWidth);
              else updateTextElement(element.id, 'scaleX', newWidth);
            }
          }
        } else if (isTouchActive.current && modelRef.current) {
          const deltaX = touch.clientX - mousePos.current.x;
          const deltaY = touch.clientY - mousePos.current.y;
          modelRef.current.rotation.y += deltaX * 0.01;
          modelRef.current.rotation.x += deltaY * 0.01;
          mousePos.current = { x: touch.clientX, y: touch.clientY };
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delta = distance - touchDistance.current;
        const zoom = cameraRef.current.position.z - delta * 0.01;
        cameraRef.current.position.z = Math.max(1, Math.min(10, zoom));
        touchDistance.current = distance;
      }
    });

    canvas.addEventListener('touchend', () => {
      isTouchActive.current = false;
      isInteractingWithElement.current = false;
      setActiveHandle(null);
    });
  };

    const loadModelFromPath = (path) => {
      setDebugMsg('Iniciando carga: ' + path);
      setIsLoadingModel(true);
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        setDebugMsg('Modelo cargado OK');
        clearScene();
        const model = gltf.scene || gltf;
        modelRef.current = model;
        saveOriginalMaterials(model);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
        sceneRef.current.add(model);
        setIsModelLoaded(true);
        setIsLoadingModel(false);
      },
      (xhr) => setDebugMsg(`Cargando: ${Math.round(xhr.loaded / xhr.total * 100)}%`),
      (error) => {
        setDebugMsg('ERROR cargando modelo: ' + JSON.stringify(error.message || error));
        console.error('Error al cargar modelo:', error);
        setIsLoadingModel(false);
      }
    );
  };

  const clearScene = () => {
    if (modelRef.current) { sceneRef.current.remove(modelRef.current); modelRef.current = null; }
    originalMaterials.current.clear();
    materialsWithTexture.current.clear();
    setImageElements([]);
    setTextElements([]);
    setElementIdCounter(0);
    setSelectedElement(null);
  };

  const saveOriginalMaterials = (model) => {
    originalMaterials.current.clear();
    materialsWithTexture.current.clear();
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat, index) => {
            originalMaterials.current.set(`${child.uuid}_${index}`, { color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff), map: mat.map ? mat.map.clone() : null });
          });
        } else {
          originalMaterials.current.set(child.uuid, { color: child.material.color ? child.material.color.clone() : new THREE.Color(0xffffff), map: child.material.map ? child.material.map.clone() : null });
        }
      }
    });
  };

  const changeColor = (color) => setCurrentShirtColor(color);
  const changeFabric = (fabricId) => setCurrentFabric(fabricId);

  const addImage = () => {
    const id = elementIdCounter + 1;
    setElementIdCounter(id);
    const currentSide = isElementOnFront({ side: 'front' }) ? 'front' : 'back';
    const initialOffsetY = currentSide === 'front' ? 0.0625 : 0.25;
    const newElement = { id, type: 'image', texture: null, scale: 0.2, scaleX: 0.2, scaleY: 0.2, offsetX: 0, offsetY: initialOffsetY, rotation: 0, side: currentSide, flipped: false };
    setImageElements(prev => [...prev, newElement]);
    setSelectedElement({ id, type: 'image' });
  };

  const addText = () => {
    const id = elementIdCounter + 1;
    setElementIdCounter(id);
    const currentSide = isElementOnFront({ side: 'front' }) ? 'front' : 'back';
    const initialOffsetY = currentSide === 'front' ? 0.0625 : 0.25;
    const newElement = { id, type: 'text', text: 'Texto ejemplo', fontFamily: 'Great Vibes', color: '#000000', outline: false, outlineWidth: 2, scale: 0.2, scaleX: 0.2, scaleY: 0.06, offsetX: 0, offsetY: initialOffsetY, rotation: 0, side: currentSide };
    setTextElements(prev => [...prev, newElement]);
    setSelectedElement({ id, type: 'text' });
  };

  const updateImageElement = (id, property, value) => {
    setImageElements(prev => prev.map(el => el.id === id ? { ...el, [property]: value } : el));
  };

  const updateTextElement = (id, property, value) => {
    setTextElements(prev => prev.map(el => el.id === id ? { ...el, [property]: value } : el));
  };

  const loadImageTexture = (id, event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const texture = new THREE.Texture(img);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        setImageElements(prev => prev.map(el => {
          if (el.id === id) {
            const aspectRatio = img.height / img.width;
            return { ...el, texture, scaleY: el.scaleX * aspectRatio };
          }
          return el;
        }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id) => {
    setImageElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement?.id === id && selectedElement?.type === 'image') setSelectedElement(null);
  };

  const removeText = (id) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement?.id === id && selectedElement?.type === 'text') setSelectedElement(null);
  };

  const toggleElementSide = (id, type) => {
    if (type === 'image') setImageElements(prev => prev.map(el => el.id === id ? { ...el, side: el.side === 'front' ? 'back' : 'front' } : el));
    else setTextElements(prev => prev.map(el => el.id === id ? { ...el, side: el.side === 'front' ? 'back' : 'front' } : el));
  };

  const toggleFlipImage = (id) => {
    setImageElements(prev => prev.map(el => el.id === id ? { ...el, flipped: !el.flipped } : el));
  };

  const drawElementOnCanvas = (ctx, element, canvasWidth, canvasHeight, side) => {
    const designAreaHeight = canvasHeight / 2;
    const designAreaCenterY = side === 'front' ? canvasHeight * 0.75 : canvasHeight * 0.25;
    const pixelScale = designAreaHeight;
    const pixelOffsetX = (side === 'back' ? -element.offsetX : element.offsetX) * pixelScale;
    const pixelOffsetY = element.offsetY * pixelScale;
    const centerX = canvasWidth / 2 + pixelOffsetX;
    const centerY = designAreaCenterY - pixelOffsetY;
    const imageWidth = (element.scaleX || element.scale) * pixelScale;
    const imageHeight = (element.scaleY || (element.scale * (element.texture.image.height / element.texture.image.width))) * pixelScale;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(element.rotation || 0);
    if (element.flipped) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(element.texture.image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
    ctx.restore();
  };

  const drawTextOnCanvas = (ctx, element, canvasWidth, canvasHeight, side) => {
    const designAreaHeight = canvasHeight / 2;
    const designAreaCenterY = side === 'front' ? canvasHeight * 0.75 : canvasHeight * 0.25;
    const pixelScale = designAreaHeight;
    const pixelOffsetX = (side === 'back' ? -element.offsetX : element.offsetX) * pixelScale;
    const pixelOffsetY = element.offsetY * pixelScale;
    const centerX = canvasWidth / 2 + pixelOffsetX;
    const centerY = designAreaCenterY - pixelOffsetY;
    const BASE_FONT_SIZE = 200;
    const boxWidth = (element.scaleX || element.scale) * pixelScale;
    const boxHeight = (element.scaleY || (element.scale * 0.3)) * pixelScale;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(element.rotation || 0);
    ctx.font = `${BASE_FONT_SIZE}px ${element.fontFamily}`;
    const measuredWidth = ctx.measureText(element.text).width || 1;
    const scaleX = boxWidth / measuredWidth;
    const scaleY = boxHeight / BASE_FONT_SIZE;
    ctx.scale(scaleX, scaleY);
    ctx.font = `${BASE_FONT_SIZE}px ${element.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (element.outline) {
      const strokeW = (element.outlineWidth || 2) * (BASE_FONT_SIZE / 40);
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = element.color;
      ctx.lineJoin = 'round';
      ctx.strokeText(element.text, 0, 0);
    } else {
      ctx.fillStyle = element.color;
      ctx.fillText(element.text, 0, 0);
    }
    ctx.restore();
  };

  const captureScreenshot = (rotationY) => {
    return new Promise((resolve) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !modelRef.current) { resolve(null); return; }
      const originalRotationY = modelRef.current.rotation.y;
      const isAnythingSelected = !!selectedElementRef.current;
      if (isAnythingSelected) setSelectedElement(null);
      const originalCameraZ = cameraRef.current.position.z;
      const originalCameraX = cameraRef.current.position.x;
      const originalCameraY = cameraRef.current.position.y;
      const originalAspect = cameraRef.current.aspect;
      const CAPTURE_SIZE = 900;
      modelRef.current.rotation.y = rotationY;
      rendererRef.current.setSize(CAPTURE_SIZE, CAPTURE_SIZE);
      cameraRef.current.aspect = 1;
      cameraRef.current.position.set(0, 0, 1.5);
      cameraRef.current.updateProjectionMatrix();
      setTimeout(() => {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataURL = rendererRef.current.domElement.toDataURL('image/png');
        modelRef.current.rotation.y = originalRotationY;
        cameraRef.current.position.set(originalCameraX, originalCameraY, originalCameraZ);
        cameraRef.current.aspect = originalAspect;
        cameraRef.current.updateProjectionMatrix();
        const viewer = rendererRef.current.domElement.parentElement;
        if (viewer) rendererRef.current.setSize(viewer.clientWidth, viewer.clientHeight);
        resolve(dataURL);
      }, 80);
    });
  };

  const captureAndRedirectToOrderPage = async () => {
    if (!isModelLoaded) { alert("El modelo 3D aún se está cargando. Por favor, espera un momento."); return; }
    const tempSelected = selectedElementRef.current;
    setSelectedElement(null);
    await new Promise(resolve => setTimeout(resolve, 50));
    const frontImage = await captureScreenshot(0);
    const backImage = await captureScreenshot(Math.PI);
    const designData = { shirtColor: currentShirtColor, fabricType: currentFabric, size: currentSize, quantity: quantity, imageElements: imageElements.map(el => ({ ...el, texture: null })), textElements: textElements, frontImage: frontImage, backImage: backImage };
    try {
      localStorage.setItem('currentDesign', JSON.stringify(designData));
      window.location.href = "/pedido";
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
      alert("Hubo un error al guardar tu diseño. Por favor, inténtalo de nuevo.");
      setSelectedElement(tempSelected);
    }
  };

  const getSelectedElementData = () => {
    if (!selectedElement) return null;
    if (selectedElement.type === 'image') return imageElements.find(el => el.id === selectedElement.id);
    return textElements.find(el => el.id === selectedElement.id);
  };

  const selectedElementData = getSelectedElementData();

  return (
    <>
      <style>{liquidGlassStyles}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8e4dd 0%, #f5f2ed 40%, #ede9e2 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
      }}>
        <style>{`@media (min-width: 1024px) { .main-layout { flex-direction: row !important; } .viewer-pane { height: 100vh !important; } .sidebar-pane { height: 100vh !important; width: 380px !important; } }`}</style>

        <div className="main-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* 3D Viewer Pane */}
          {/* <div className="viewer-pane" style={{ height: '50vh', flex: 1, overflow: 'hidden', position: 'relative' }}> */}
          <div className="viewer-pane" style={{ height: '50dvh', minHeight: '320px', flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              height: '100%', width: '100%',
              background: 'linear-gradient(160deg, #f0ece5 0%, #faf7f3 50%, #ede8e0 100%)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div ref={viewerRef} className="touch-none" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, zIndex: 999,
                  background: 'rgba(0,0,0,0.7)', color: 'lime',
                  fontSize: 10, padding: 4, maxWidth: '100%',
                  wordBreak: 'break-all', fontFamily: 'monospace'
                }}>{debugMsg}</div>
                {isLoadingModel && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(250,247,243,0.6)', backdropFilter: 'blur(12px)', zIndex: 20,
                  }}>
                    <div className="lg-spinner" style={{ marginBottom: 16 }} />
                    <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: 'rgba(0,22,45,0.5)', fontWeight: 500, letterSpacing: '0.02em' }}>Cargando modelo…</p>
                  </div>
                )}
                {!isLoadingModel && !isModelLoaded && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: 'rgba(0,22,45,0.4)' }}>No se pudo cargar el modelo 3D</p>
                  </div>
                )}
              </div>
              {isModelLoaded && <DimensionGuides sizeSpec={SHIRT_SPECS[currentSize]} />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar-pane" style={{
            height: '50vh',
            width: '100%',
            overflowY: 'auto',
            padding: '20px 18px 28px',
            background: 'rgba(250,247,243,0.6)',
            backdropFilter: 'blur(32px)',
            borderLeft: '1px solid rgba(255,255,255,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {/* Header */}
            <div style={{ marginBottom: 4 }}>
              <h2 style={{
                fontFamily: 'Inter,sans-serif',
                fontSize: 20,
                fontWeight: 600,
                color: '#00162d',
                letterSpacing: '-0.03em',
                margin: 0,
              }}>Diseñador 3D</h2>
              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 11.5, color: 'rgba(0,22,45,0.4)', marginTop: 3, letterSpacing: '0.01em' }}>
                Personaliza tu prenda
              </p>
            </div>

            {isModelLoaded && (
              <>
                {/* Color */}
                <AccordionSection icon="palette" title="Color de la camisa" isOpen={isColorSectionOpen} onToggle={() => setIsColorSectionOpen(!isColorSectionOpen)}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {shirtColors.map(({ color, name }) => (
                      <button
                        key={color}
                        onClick={() => changeColor(color)}
                        title={name}
                        className={`lg-color-swatch ${currentShirtColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color, boxShadow: color === '#ffffff' ? '0 0 0 1px rgba(0,22,45,0.12) inset' : undefined }}
                      >
                        {currentShirtColor === color && (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                            <Icon name="check" size={14} style={{ color: color === 'rgb(11, 11, 11)' ? '#faf7f3' : '#00162d' }} />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </AccordionSection>

                {/* Fabric */}
                <AccordionSection icon="fabric" title="Tipo de tela" isOpen={isFabricSectionOpen} onToggle={() => setIsFabricSectionOpen(!isFabricSectionOpen)}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {fabricTypes.map(({ id, name, image }) => (
                      <button
                        key={id}
                        onClick={() => changeFabric(id)}
                        className={`lg-fabric-card ${currentFabric === id ? 'active' : ''}`}
                        style={{ background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <div style={{ aspectRatio: '1', overflow: 'hidden', background: 'rgba(0,22,45,0.04)' }}>
                          <img
                            src={image}
                            alt={name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div style={{
                          padding: '8px 10px',
                          background: currentFabric === id ? '#00162d' : 'rgba(250,247,243,0.6)',
                          transition: 'all 0.2s ease',
                        }}>
                          <span style={{
                            fontFamily: 'Inter,sans-serif',
                            fontSize: 12,
                            fontWeight: 500,
                            color: currentFabric === id ? '#faf7f3' : 'rgba(0,22,45,0.7)',
                          }}>{name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionSection>

                {/* Size */}
                <AccordionSection icon="ruler" title="Talla" isOpen={isSizeSectionOpen} onToggle={() => setIsSizeSectionOpen(!isSizeSectionOpen)}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                    {shirtSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => changeSize(size)}
                        className={`lg-size-btn ${currentSize === size ? 'active' : ''}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '7px 12px',
                    background: 'rgba(0,22,45,0.04)',
                    borderRadius: 8,
                    border: '1px solid rgba(0,22,45,0.07)',
                  }}>
                    <Icon name="ruler" size={13} style={{ color: 'rgba(0,22,45,0.35)' }} />
                    <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 11.5, color: 'rgba(0,22,45,0.5)', fontWeight: 500 }}>
                      {SHIRT_SPECS[currentSize].width} × {SHIRT_SPECS[currentSize].height} cm
                    </span>
                  </div>
                </AccordionSection>

                {/* Quantity */}
                <AccordionSection icon="stack" title="Cantidad" isOpen={isQuantitySectionOpen} onToggle={() => setIsQuantitySectionOpen(!isQuantitySectionOpen)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="lg-qty-btn"
                    >
                      <Icon name="minus" size={14} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => { const val = parseInt(e.target.value, 10); setQuantity(val >= 1 ? val : 1); }}
                      className="lg-qty-input"
                      min="1"
                    />
                    <button onClick={() => setQuantity(q => q + 1)} className="lg-qty-btn">
                      <Icon name="plus" size={14} />
                    </button>
                  </div>
                </AccordionSection>

                {/* Add Elements */}
                <div className="lg-card" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                    <span style={{ color: 'rgba(0,22,45,0.45)', display: 'flex' }}><Icon name="plus" size={15} /></span>
                    <span className="lg-section-title">Añadir elementos</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button onClick={addImage} className="lg-add-btn">
                      <Icon name="image" size={15} />
                      <span>Imagen</span>
                    </button>
                    <button onClick={addText} className="lg-add-btn">
                      <Icon name="text" size={15} />
                      <span>Texto</span>
                    </button>
                  </div>
                </div>

                {/* Selected Element Editor */}
                {selectedElementData && (
                  <div style={{
                    background: 'rgba(250,247,243,0.85)',
                    backdropFilter: 'blur(24px)',
                    border: '1.5px solid rgba(0,22,45,0.14)',
                    borderRadius: 20,
                    padding: '18px 18px',
                    boxShadow: '0 8px 32px rgba(0,22,45,0.1)',
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: 'rgba(0,22,45,0.07)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'rgba(0,22,45,0.6)',
                        }}>
                          <Icon name={selectedElementData.type === 'image' ? 'image' : 'text'} size={14} />
                        </div>
                        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: '#00162d' }}>
                          {selectedElementData.type === 'image' ? 'Imagen' : 'Texto'} #{selectedElementData.id}
                        </span>
                      </div>
                      <button
                        onClick={() => selectedElementData.type === 'image' ? removeImage(selectedElementData.id) : removeText(selectedElementData.id)}
                        className="lg-btn-danger"
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <Icon name="trash" size={12} />
                        <span>Eliminar</span>
                      </button>
                    </div>

                    {/* Dimensions pill */}
                    <div className="lg-dims-pill" style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="ruler" size={13} style={{ color: 'rgba(0,22,45,0.35)' }} />
                        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, color: 'rgba(0,22,45,0.45)', fontWeight: 500 }}>Dimensiones · Talla {currentSize}</span>
                      </div>
                      <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 700, color: '#00162d', letterSpacing: '-0.02em' }}>
                        {getElementDimensionsInCm(selectedElementData).width} × {getElementDimensionsInCm(selectedElementData).height} cm
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Side toggle */}
                      <div>
                        <span className="lg-label">Posición</span>
                        <button
                          onClick={() => toggleElementSide(selectedElementData.id, selectedElementData.type)}
                          className="lg-side-btn"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Icon name={selectedElementData.side === 'front' ? 'front' : 'back'} size={14} style={{ color: 'rgba(0,22,45,0.5)' }} />
                            <span>{selectedElementData.side === 'front' ? 'Frente' : 'Parte trasera'}</span>
                          </div>
                          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10.5, color: 'rgba(0,22,45,0.35)', background: 'rgba(0,22,45,0.05)', padding: '3px 8px', borderRadius: 6 }}>
                            Cambiar
                          </span>
                        </button>
                      </div>

                      {/* Image controls */}
                      {selectedElementData.type === 'image' && (
                        <>
                          <div>
                            <span className="lg-label">Archivo</span>
                            <div className="lg-file-drop">
                              <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => loadImageTexture(selectedElementData.id, e)} />
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, pointerEvents: 'none' }}>
                                <Icon name="upload" size={14} style={{ color: 'rgba(0,22,45,0.4)' }} />
                                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12.5, color: 'rgba(0,22,45,0.5)' }}>
                                  {selectedElementData.texture ? 'Cambiar imagen' : 'Cargar imagen'}
                                </span>
                                {selectedElementData.texture && (
                                  <span className="lg-tag lg-tag-green" style={{ marginLeft: 4 }}>
                                    <Icon name="check" size={10} style={{ marginRight: 3 }} /> cargada
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleFlipImage(selectedElementData.id)}
                            className="lg-side-btn"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <Icon name="flipH" size={14} style={{ color: 'rgba(0,22,45,0.5)' }} />
                              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 500 }}>
                                {selectedElementData.flipped ? 'Desactivar espejo' : 'Activar espejo'}
                              </span>
                            </div>
                            <span style={{
                              fontFamily: 'Inter,sans-serif', fontSize: 10,
                              color: selectedElementData.flipped ? '#00162d' : 'rgba(0,22,45,0.3)',
                              background: selectedElementData.flipped ? 'rgba(0,22,45,0.08)' : 'rgba(0,22,45,0.04)',
                              padding: '3px 8px', borderRadius: 6, fontWeight: 500,
                            }}>
                              {selectedElementData.flipped ? 'Activo' : 'Inactivo'}
                            </span>
                          </button>
                        </>
                      )}

                      {/* Text controls */}
                      {selectedElementData.type === 'text' && (
                        <>
                          <div>
                            <span className="lg-label">Contenido</span>
                            <input
                              type="text"
                              value={selectedElementData.text}
                              onChange={(e) => updateTextElement(selectedElementData.id, 'text', e.target.value)}
                              className="lg-input"
                              placeholder="Escribe tu texto"
                            />
                          </div>

                          <div>
                            <span className="lg-label">Tipografía</span>
                            <FontSelector
                              options={fontFamilies}
                              value={selectedElementData.fontFamily}
                              onChange={(font) => updateTextElement(selectedElementData.id, 'fontFamily', font)}
                            />
                          </div>

                          <div>
                            <span className="lg-label">Color</span>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
                              <input
                                type="color"
                                value={selectedElementData.color}
                                onChange={(e) => updateTextElement(selectedElementData.id, 'color', e.target.value)}
                                style={{
                                  width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(0,22,45,0.12)',
                                  cursor: 'pointer', padding: 3, background: 'rgba(250,247,243,0.8)',
                                }}
                              />
                              <span style={{
                                fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 500,
                                color: 'rgba(0,22,45,0.6)',
                                letterSpacing: '0.04em',
                              }}>{selectedElementData.color.toUpperCase()}</span>
                            </div>
                          </div>

                          <div>
                            <span className="lg-label">Estilo</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => updateTextElement(selectedElementData.id, 'outline', false)}
                                className={`lg-style-btn ${!selectedElementData.outline ? 'active' : ''}`}
                              >
                                <span style={{ fontSize: 18, fontFamily: selectedElementData.fontFamily, color: !selectedElementData.outline ? '#00162d' : 'rgba(0,22,45,0.4)', fontWeight: 500 }}>Aa</span>
                                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, fontWeight: 500, color: !selectedElementData.outline ? 'rgba(0,22,45,0.7)' : 'rgba(0,22,45,0.35)' }}>Relleno</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateTextElement(selectedElementData.id, 'outline', true)}
                                className={`lg-style-btn ${selectedElementData.outline ? 'active' : ''}`}
                              >
                                <span style={{
                                  fontSize: 18, fontFamily: selectedElementData.fontFamily, fontWeight: 500,
                                  WebkitTextStroke: `1.5px ${selectedElementData.outline ? '#00162d' : 'rgba(0,22,45,0.3)'}`,
                                  WebkitTextFillColor: 'transparent',
                                }}>Aa</span>
                                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, fontWeight: 500, color: selectedElementData.outline ? 'rgba(0,22,45,0.7)' : 'rgba(0,22,45,0.35)' }}>Contorno</span>
                              </button>
                            </div>
                          </div>

                          {selectedElementData.outline && (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <span className="lg-label" style={{ margin: 0 }}>Grosor del contorno</span>
                                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 700, color: '#00162d', background: 'rgba(0,22,45,0.06)', padding: '2px 8px', borderRadius: 6 }}>
                                  {selectedElementData.outlineWidth ?? 2}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0.5"
                                max="8"
                                step="0.5"
                                value={selectedElementData.outlineWidth ?? 2}
                                onChange={(e) => updateTextElement(selectedElementData.id, 'outlineWidth', parseFloat(e.target.value))}
                                className="lg-range"
                              />
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, color: 'rgba(0,22,45,0.35)' }}>Fino</span>
                                <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10, color: 'rgba(0,22,45,0.35)' }}>Grueso</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Controls hint */}
                      <div className="lg-tip-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <Icon name="info" size={12} style={{ color: 'rgba(0,22,45,0.35)' }} />
                          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 10.5, fontWeight: 600, color: 'rgba(0,22,45,0.45)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Controles en el visor</span>
                        </div>
                        {[
                          { color: '#3b82f6', label: 'Esquinas azules', desc: 'Escalar' },
                          { color: '#10b981', label: 'Aristas verdes', desc: 'Ancho / Alto' },
                          { color: '#ef4444', label: 'Círculo rojo', desc: 'Rotar' },
                          { color: '#00162d', label: 'Centro', desc: 'Mover' },
                        ].map(item => (
                          <div key={item.label} className="lg-tip-item">
                            <div className="lg-dot" style={{ background: item.color }} />
                            <span><strong style={{ color: 'rgba(0,22,45,0.65)', fontWeight: 600 }}>{item.label}:</strong> {item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Elements List */}
                {(imageElements.length > 0 || textElements.length > 0) && (
                  <div className="lg-card" style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'rgba(0,22,45,0.45)', display: 'flex' }}><Icon name="stack" size={15} /></span>
                        <span className="lg-section-title">Capas</span>
                      </div>
                      <span className="lg-tag lg-tag-navy">{imageElements.length + textElements.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {imageElements.map((element) => (
                        <button
                          key={`img-${element.id}`}
                          onClick={() => setSelectedElement({ id: element.id, type: 'image' })}
                          className={`lg-element-row ${selectedElement?.id === element.id && selectedElement?.type === 'image' ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <span style={{ color: 'rgba(0,22,45,0.45)', display: 'flex' }}><Icon name="image" size={14} /></span>
                            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12.5, fontWeight: 500, color: 'rgba(0,22,45,0.7)' }}>Imagen #{element.id}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span className="lg-tag lg-tag-navy">{element.side === 'front' ? 'Frente' : 'Trasera'}</span>
                            {element.texture && <span className="lg-tag lg-tag-green"><Icon name="check" size={9} style={{ marginRight: 2 }} />ok</span>}
                          </div>
                        </button>
                      ))}
                      {textElements.map((element) => (
                        <button
                          key={`txt-${element.id}`}
                          onClick={() => setSelectedElement({ id: element.id, type: 'text' })}
                          className={`lg-element-row ${selectedElement?.id === element.id && selectedElement?.type === 'text' ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <span style={{ color: 'rgba(0,22,45,0.45)', display: 'flex' }}><Icon name="text" size={14} /></span>
                            <span style={{ fontFamily: element.fontFamily, fontSize: 13, color: 'rgba(0,22,45,0.75)' }}>
                              {element.text.substring(0, 22)}{element.text.length > 22 ? '…' : ''}
                            </span>
                          </div>
                          <span className="lg-tag lg-tag-navy">{element.side === 'front' ? 'Frente' : 'Trasera'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div style={{ paddingTop: 4 }}>
                  <button onClick={captureAndRedirectToOrderPage} className="lg-cta-btn">
                    <Icon name="cart" size={17} style={{ opacity: 0.85 }} />
                    <span>Hacer pedido</span>
                  </button>
                </div>
              </>
            )}

            {!isModelLoaded && !isLoadingModel && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(0,22,45,0.35)', fontFamily: 'Inter,sans-serif', fontSize: 13 }}>
                Esperando modelo 3D…
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShirtDesigner;