'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'es' | 'en';

export const translations = {
  es: {
    nav: {
      gallery: 'Galería',
      faq: 'Preguntas Frecuentes',
    },
    hero: {
      eyebrow: 'Diseño personalizado',
      title: 'SG Signare',
      sub: 'Diseña tu camisa con control total: modelo 3D, tela real y un proceso claro. Sin plantillas genéricas, sin límites.',
      cta1: 'Acceder al Estudio',
      cta2: 'Ver Portafolio',
    },
    features: {
      title: 'Tu diseño. Tu camisa.',
      sub: 'No vendemos opciones prediseñadas. Te damos control total para crear una pieza única.',
      items: [
        {
          title: 'Diseño Libre',
          desc: 'Tu diseño, tus colores, tu estilo. Sin plantillas ni límites en la creatividad.',
        },
        {
          title: 'Vista Previa 3D',
          desc: 'Revisa cómo quedará tu camisa en un modelo 3D antes de confirmar el pedido.',
        },
        {
          title: 'Materiales de Calidad',
          desc: 'Algodón y poliéster de alta calidad con sublimación duradera para uso diario.',
        },
        {
          title: 'Proceso Transparente',
          desc: 'Desde el diseño hasta tu puerta. Sin intermediarios ni pasos innecesarios.',
        },
      ],
    },
    footer: {
      links: {
        gallery: 'Portafolio',
        faq: 'Preguntas Frecuentes',
        home: 'Inicio',
      },
      copy: 'Todos los derechos reservados.',
      tagline: 'Cuidamos cada detalle del proceso.',
    },
  },
  en: {
    nav: {
      gallery: 'Gallery',
      faq: 'FAQ',
    },
    hero: {
      eyebrow: 'Custom design',
      title: 'SG Signare',
      sub: 'Design your shirt with full control: 3D model, real fabric, and a clear process. No generic templates, no limits.',
      cta1: 'Enter the Studio',
      cta2: 'View Portfolio',
    },
    features: {
      title: 'Your design. Your shirt.',
      sub: "We do not sell pre-made options. We give you full control to create a unique piece.",
      items: [
        {
          title: 'Free Design',
          desc: 'Your design, your colors, your style. No templates or creativity limits.',
        },
        {
          title: '3D Preview',
          desc: 'See how your shirt will look on a 3D model before confirming your order.',
        },
        {
          title: 'Quality Materials',
          desc: 'High-quality cotton and polyester with durable sublimation for daily use.',
        },
        {
          title: 'Clear Process',
          desc: 'From design to your door. No middlemen, no unnecessary steps.',
        },
      ],
    },
    footer: {
      links: {
        gallery: 'Portfolio',
        faq: 'FAQ',
        home: 'Home',
      },
      copy: 'All rights reserved.',
      tagline: 'We care about every detail of the process.',
    },
  },
};

interface LangCtx {
  lang: Lang;
  t: typeof translations.es;
  toggleLang: () => void;
}

const LangContext = createContext<LangCtx>({
  lang: 'es',
  t: translations.es,
  toggleLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');
  const toggleLang = () => setLang((currentLang) => (currentLang === 'es' ? 'en' : 'es'));

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);