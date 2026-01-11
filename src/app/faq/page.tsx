'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    { question: "¿Qué métodos de pago aceptan?", answer: "Actualmente, al ser un pedido coordinado por WhatsApp, aceptamos transferencia bancaria y pagos móviles. Te daremos todos los detalles al confirmar tu pedido." },
    { question: "¿Cuánto tarda el envío?", answer: "El tiempo de producción es de 3 a 5 días hábiles. El tiempo de envío dependerá de tu ubicación, lo cual te confirmaremos por WhatsApp." },
    { question: "¿Qué tallas manejan?", answer: "Manejamos tallas desde la S hasta la XXL. Próximamente incluiremos una tabla de medidas detallada para que elijas la talla perfecta." },
    { question: "¿Cómo debo lavar la camisa para cuidar el estampado?", answer: "Recomendamos lavar la prenda al revés, con agua fría y evitar el uso de secadoras para maximizar la durabilidad del estampado." },
];

const AccordionItem = ({ faq, isOpen, onClick }: { faq: typeof faqs[0], isOpen: boolean, onClick: () => void }) => (
  <div className="border-b border-gray-200">
    <button onClick={onClick} className="w-full flex justify-between items-center text-left py-5 px-6 focus:outline-none">
      <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="px-6 pb-5 text-gray-600">
            <p>{faq.answer}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">Preguntas Frecuentes</h1>
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} faq={faq} isOpen={openIndex === index} onClick={() => handleClick(index)} />
          ))}
        </div>
      </div>
    </div>
  );
}