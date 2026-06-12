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

// ─── LIQUID GLASS STYLES ────────────────────────────────────────────────────
const lgStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --navy: #00162d;
    --cream: #faf7f3;
    --glass-bg: rgba(250,247,243,0.55);
    --glass-bg-strong: rgba(250,247,243,0.80);
    --glass-border: rgba(255,255,255,0.42);
    --glass-border-strong: rgba(255,255,255,0.68);
    --shadow-sm: 0 4px 18px rgba(0,22,45,0.07), 0 1px 4px rgba(0,22,45,0.04);
    --shadow-md: 0 8px 32px rgba(0,22,45,0.10), 0 2px 6px rgba(0,22,45,0.06);
    --shadow-lg: 0 16px 48px rgba(0,22,45,0.13), 0 4px 12px rgba(0,22,45,0.07);
    --text-primary: #00162d;
    --text-secondary: rgba(0,22,45,0.55);
    --text-muted: rgba(0, 22, 45, 0.69);
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 22px;
    --radius-xl: 30px;
    --ease: cubic-bezier(0.4,0,0.2,1);
  }

  .op-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #e8e4dd 0%, #f5f2ed 45%, #ede9e2 100%);
    font-family: 'Inter', sans-serif;
    padding: 40px 16px 64px;
  }

  .op-container { max-width: 1180px; margin: 0 auto; }

  /* Glass panel */
  .lg-panel {
    background: var(--glass-bg-strong);
    backdrop-filter: blur(28px) saturate(1.6);
    -webkit-backdrop-filter: blur(28px) saturate(1.6);
    border: 1px solid var(--glass-border-strong);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  /* Glass card */
  .lg-card {
    background: var(--glass-bg);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.22s var(--ease), border-color 0.22s var(--ease);
  }

  /* Section headers inside panels */
  .lg-panel-header {
    background: var(--navy);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding: 18px 24px;
    position: relative;
    overflow: hidden;
  }

  .lg-panel-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%);
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
  }

  .lg-panel-header p {
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    color: rgba(250,247,243,0.55);
    margin: 5px 0 0;
  }

  .lg-panel-body { padding: 22px 22px; }

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
    border-bottom: 1px solid rgba(0,22,45,0.08);
    display: flex;
    align-items: center;
    gap: 7px;
  }

  /* Input */
  .lg-input {
    width: 100%;
    padding: 11px 14px;
    background: rgba(250,247,243,0.75);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0,22,45,0.14);
    border-radius: var(--radius-sm);
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .lg-input::placeholder { color: var(--text-muted); }

  .lg-input:focus {
    border-color: rgba(0,22,45,0.38);
    background: rgba(250,247,243,0.92);
    box-shadow: 0 0 0 3px rgba(0,22,45,0.07);
  }

  .lg-input.error { border-color: rgba(220,38,38,0.5); }
  .lg-input.error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }

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

  /* Delivery option cards */
  .lg-delivery-card {
    padding: 16px 18px;
    border-radius: var(--radius-md);
    border: 1.5px solid rgba(0,22,45,0.12);
    background: var(--glass-bg);
    backdrop-filter: blur(14px);
    cursor: pointer;
    transition: all 0.22s var(--ease);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .lg-delivery-card:hover:not(.active) {
    border-color: rgba(0,22,45,0.28);
    box-shadow: 0 4px 16px rgba(0,22,45,0.09);
  }

  .lg-delivery-card.active {
    border-color: var(--navy);
    background: rgba(0,22,45,0.05);
    box-shadow: 0 6px 22px rgba(0,22,45,0.13);
  }

  .lg-delivery-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,22,45,0.06);
    color: rgba(0,22,45,0.5);
    transition: all 0.2s;
  }

  .lg-delivery-card.active .lg-delivery-icon {
    background: var(--navy);
    color: var(--cream);
  }

  /* Summary row */
  .lg-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid rgba(0,22,45,0.07);
    background: rgba(0,22,45,0.02);
    margin-bottom: 6px;
    transition: background 0.15s;
  }

  .lg-summary-row:last-child { margin-bottom: 0; }

  /* Preview toggle tabs */
  .lg-tab-group {
    display: flex;
    background: rgba(0,22,45,0.05);
    border-radius: 10px;
    padding: 3px;
    gap: 3px;
    margin-bottom: 14px;
  }

  .lg-tab {
    flex: 1;
    padding: 8px 12px;
    border-radius: 8px;
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
    box-shadow: 0 3px 10px rgba(0,22,45,0.2);
  }

  .lg-tab:hover:not(.active) { color: var(--text-primary); background: rgba(0,22,45,0.06); }

  /* Download btn */
  .lg-download-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid rgba(0,22,45,0.12);
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s var(--ease);
  }

  .lg-download-btn:hover {
    background: rgba(0,22,45,0.07);
    border-color: rgba(0,22,45,0.22);
    color: var(--text-primary);
  }

  /* Notice box */
  .lg-notice {
    background: rgba(250,247,243,0.65);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(0,22,45,0.1);
    border-left: 3px solid var(--navy);
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    padding: 16px 18px;
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
    background: rgba(0,22,45,0.08);
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

  /* CTA button */
  .lg-cta-btn {
    width: 100%;
    padding: 16px 24px;
    border-radius: var(--radius-lg);
    background: var(--navy);
    color: var(--cream);
    border: none;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.22s var(--ease);
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
    background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%);
    pointer-events: none;
  }

  .lg-cta-btn:hover:not(:disabled) {
    background: rgba(0,22,45,0.86);
    box-shadow: 0 12px 36px rgba(0,22,45,0.3);
    transform: translateY(-1.5px);
  }

  .lg-cta-btn:active:not(:disabled) { transform: scale(0.985); }

  .lg-cta-btn:disabled {
    background: rgba(0,22,45,0.35);
    cursor: not-allowed;
    transform: none;
  }

  /* Color dot */
  .lg-color-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid rgba(0,22,45,0.14);
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .lg-color-dot::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 55%);
  }

  /* Tag */
  .lg-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 20px;
    font-family: 'Inter', sans-serif;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: rgba(0,22,45,0.06);
    color: rgba(0,22,45,0.6);
    border: 1px solid rgba(0,22,45,0.1);
  }

  .lg-tag.success {
    background: rgba(16,185,129,0.09);
    color: rgb(6,120,83);
    border-color: rgba(16,185,129,0.18);
  }

  /* Success alert */
  .lg-success-alert {
    background: rgba(16,185,129,0.08);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(16,185,129,0.22);
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
    background: linear-gradient(135deg, #e8e4dd 0%, #f5f2ed 45%, #ede9e2 100%);
    gap: 16px;
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

  /* Hero */
  .op-hero {
    text-align: center;
    margin-bottom: 32px;
  }

  .op-hero-eyebrow {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .op-hero h1 {
    font-family: 'Inter', sans-serif;
    font-size: clamp(28px, 5vw, 42px);
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.03em;
    margin: 0 0 10px;
  }

  .op-hero p {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 480px;
    margin: 0 auto;
    line-height: 1.6;
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
            background: 'rgba(250,247,243,0.85)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.5)', borderRadius: 22,
            padding: '40px 36px', textAlign: 'center', maxWidth: 380,
            boxShadow: '0 16px 48px rgba(0,22,45,0.12)',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,22,45,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'rgba(0,22,45,0.4)' }}>
              <Icon name="warn" size={26} />
            </div>
            <h2 style={{ fontFamily: 'Inter,sans-serif', fontSize: 20, fontWeight: 600, color: '#00162d', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Diseño no encontrado
            </h2>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: 13.5, color: 'rgba(0,22,45,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
              No se encontró ningún diseño. Por favor, crea uno primero.
            </p>
            <a href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#00162d', color: '#faf7f3',
              padding: '12px 24px', borderRadius: 12,
              fontFamily: 'Inter,sans-serif', fontSize: 13.5, fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.2s ease',
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
            <p className="op-hero-eyebrow">Resumen del pedido</p>
            <h1>Casi listo</h1>
            <p>Revisa tu diseño, completa los datos y finaliza el pedido vía WhatsApp.</p>
          </div>

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
              <div className="lg-panel" style={{ overflow: 'hidden' }}>
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
                    background: 'linear-gradient(160deg, #f0ece5 0%, #faf7f3 50%, #ede8e0 100%)',
                    borderRadius: 12, border: '1px solid rgba(0,22,45,0.07)',
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
              <div className="lg-panel" style={{ overflow: 'hidden' }}>
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
                          <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: '#00162d' }}>
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
                        <Icon name="image" size={13} style={{ color: 'rgba(0,22,45,0.4)' }} />
                        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: '#00162d' }}>{design.imageElements?.length || 0}</span>
                      </div>
                    )},
                    { label: 'Textos', value: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Icon name="text" size={13} style={{ color: 'rgba(0,22,45,0.4)' }} />
                        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: '#00162d' }}>{design.textElements?.length || 0}</span>
                      </div>
                    )},
                  ].map((item) => (
                    <div key={item.label} className="lg-summary-row">
                      <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 12.5, color: 'rgba(0,22,45,0.45)', fontWeight: 500 }}>{item.label}</span>
                      {typeof item.value === 'string' ? (
                        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: '#00162d' }}>{item.value}</span>
                      ) : item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT MAIN ── */}
            <div className="op-main">
              <div className="lg-panel" style={{ overflow: 'hidden' }}>
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
                          placeholder="Ej: Prefiero tonos más oscuros, el texto debe ser muy legible…"
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
                        <Icon name="info" size={13} style={{ color: 'rgba(0,22,45,0.5)' }} />
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