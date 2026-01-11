// page.tsx - VERSION PROFESIONAL PERSUASIVA

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brush, Cuboid, CheckCircle, Truck } from 'lucide-react';

const featureIcons = {
  design: <Brush className="w-10 h-10" />,
  '3d': <Cuboid className="w-10 h-10" />,
  quality: <CheckCircle className="w-10 h-10" />,
  delivery: <Truck className="w-10 h-10" />,
};

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="text-[#00162d]">
      <section className="relative py-28 md:py-40 text-center bg-[#faf7f3]">
        <div className="container mx-auto px-6 z-10 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              No Compres Camisas Genéricas.
              <span className="block text-[#748c94] text-3xl md:text-5xl mt-2">Créalas.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-[#748c94] mb-12 max-w-3xl mx-auto"
            >
              Control absoluto sobre cada detalle. Nuestro sistema 3D profesional elimina intermediarios y errores. Obtienes exactamente lo que diseñaste, con calidad verificable en cada paso.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/designer"
                className="bg-[#00162d] text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Acceder al Estudio
              </Link>
              <Link
                href="/galeria"
                className="border-2 border-[#c9d1d4] text-[#00162d] font-semibold py-3 px-8 rounded-lg text-lg hover:border-[#00162d] hover:bg-[#00162d] hover:text-white transition-all duration-300"
              >
                Ver Portafolio
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#dcd4d6]/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por Qué <span className="text-[#748c94]">SG SIGNARE</span> es Superior</h2>
            <p className="text-lg text-[#748c94] max-w-2xl mx-auto">
              No ofrecemos opciones. Ofrecemos certeza. Cada prenda lleva nuestro estándar de manufactura y tu visión intacta.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: featureIcons.design, 
                title: "Diseño Sin Restricciones", 
                description: "Tu archivo, tus colores, tu composición. Sin plantillas limitantes ni aprobaciones innecesarias." 
              },
              { 
                icon: featureIcons['3d'], 
                title: "Previsualización Exacta", 
                description: "Nuestro motor 3D replica la prenda final con precisión milimétrica. Lo que ves es lo que obtienes." 
              },
              { 
                icon: featureIcons.quality, 
                title: "Materiales Verificables", 
                description: "Algodón premium certificado y sublimación de alta densidad. Especificaciones técnicas disponibles bajo solicitud." 
              },
              { 
                icon: featureIcons.delivery, 
                title: "Producción Transparente", 
                description: "Tracking completo desde manufactura hasta entrega. Sin intermediarios, sin excusas." 
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-[#faf7f3] p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-2"
              >
                <div className="text-[#00162d] mb-5 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[#748c94] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}