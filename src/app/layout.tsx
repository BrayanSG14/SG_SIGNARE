import type { Metadata } from "next";
import { Manrope } from "next/font/google"; // NUEVO: Usaremos una fuente más moderna y limpia como Manrope.
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// MEJORA: Manrope es una fuente sans-serif moderna que se ve excelente en interfaces limpias.
const manrope = Manrope({ 
  subsets: ["latin"],
  weight: ['400', '600', '700'], // Cargamos los pesos que usaremos
  variable: '--font-manrope' // La definimos como una variable CSS
});

export const metadata: Metadata = {
  title: "SG SIGNARE",
  description: "Control total sobre tu prenda. Sistema de diseño 3D de precisión profesional con sublimación certificada y manufactura transparente.",
  keywords: "camisas personalizadas profesionales, diseño 3D industrial, sublimación premium, manufactura bajo demanda, prendas técnicas personalizadas",
  openGraph: {
    title: "SG SIGNARE",
    description: "Manufactura bajo demanda con estándares verificables. Tu diseño, nuestra precisión.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* ... otros elementos del head ... */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Allura&family=Anton&family=Arvo&family=Bebas+Neue&family=Caveat&family=Cinzel+Decorative&family=Cormorant+Garamond&family=Damion&family=Dancing+Script&family-Great+Vibes&family=Indie+Flower&family=Josefin+Sans&family=Kalam&family=Lato&family=Lobster&family=Lora&family=Montserrat&family=Oswald&family=Pacifico&family=Permanent+Marker&family=Playfair+Display&family=Poppins&family=Raleway&family=Roboto+Slab&family=Rock+Salt&family=Sacramento&display=swap" rel="stylesheet" />
      </head>
      {/* MEJORA: Aplicamos la fuente y el color de fondo directamente aquí.
          'antialiased' suaviza el texto para una mejor lectura. */}
      <body className={`${manrope.variable} font-sans antialiased`} style={{ backgroundColor: '#faf7f3' }}>
        {/* El Navbar y Footer ahora vivirán dentro de un contenedor que gestiona el color */}
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}