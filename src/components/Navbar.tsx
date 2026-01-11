'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const Logo = () => (
  <Link href="/" className="flex items-center space-x-2 group">
    <Image
      src="/models/Logo.png" // Reemplaza con la ruta a tu logo
      alt="Custom Studio Logo"
      width={50} // Un tamaño más refinado
      height={50}
      priority
      className="transition-transform duration-300 group-hover:rotate-[10deg]"
    />
  </Link>
);


const MobileMenuIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.div
    animate={isOpen ? "open" : "closed"}
    className="w-6 h-6 flex flex-col justify-center items-center space-y-1"
  >
    <motion.span
      variants={{
        closed: { rotate: 0, y: 0 },
        open: { rotate: 45, y: 6 }
      }}
      className="w-6 h-0.5 bg-gray-700 block"
    />
    <motion.span
      variants={{
        closed: { opacity: 1 },
        open: { opacity: 0 }
      }}
      className="w-6 h-0.5 bg-gray-700 block"
    />
    <motion.span
      variants={{
        closed: { rotate: 0, y: 0 },
        open: { rotate: -45, y: -6 }
      }}
      className="w-6 h-0.5 bg-gray-700 block"
    />
  </motion.div>
);


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/galeria", label: "Galería" },
    { href: "/faq", label: "Preguntas Frecuentes" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#faf7f3]/80 backdrop-blur-md border-b border-[#c9d1d4]/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Logo />
          
          {/* Menú de Escritorio */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-medium text-[#748c94] hover:text-[#00162d] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00162d] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

{/*
          <Link 
            href="/designer"
            className="hidden md:inline-block bg-[#00162d] text-white font-bold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-sm"
          >
            Crear Diseño
          </Link>
*/}
          {/* Botón de Menú Móvil */}
          <button 
            className="md:hidden p-2 text-[#00162d]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <MobileMenuIcon isOpen={isMobileMenuOpen} />
          </button>
        </div>
      </div>
      
      {/* Menú Móvil Desplegable */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#c9d1d4]/50"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium text-[#748c94] hover:text-[#00162d]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/designer"
                className="w-full text-center bg-[#00162d] text-white font-bold py-3 rounded-lg mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Crear Diseño
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}