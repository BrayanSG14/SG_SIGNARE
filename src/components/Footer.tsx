
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#00162d] text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold">SG SIGNARE</h3>
            <p className="text-[#959fa6] mt-1">Manufactura bajo demanda. Calidad sin compromisos.</p>
          </div>
          <div className="flex space-x-6 mt-6 md:mt-0">
            <Link href="/" className="text-[#c9d1d4] hover:text-white transition-colors">Inicio</Link>
            <Link href="/galeria" className="text-[#c9d1d4] hover:text-white transition-colors">Portafolio</Link>
            <Link href="/faq" className="text-[#c9d1d4] hover:text-white transition-colors">Especificaciones</Link>
          </div>
        </div>
        <div className="border-t border-[#748c94]/30 mt-8 pt-6 text-center text-[#959fa6]">
          <p>© {new Date().getFullYear()} SG SIGNARE. Todos los derechos reservados.</p>
          <p className="text-sm mt-2">Producción profesional para estándares profesionales.</p>
        </div>
      </div>
    </footer>
  );
}