export default function GalleryPage() {
  const images = [
    "https://via.placeholder.com/500x500.png?text=Diseño+Increíble+1",
    "https://via.placeholder.com/500x500.png?text=Diseño+Creativo+2",
    "https://via.placeholder.com/500x500.png?text=Estampado+Moderno+3",
    "https://via.placeholder.com/500x500.png?text=Logo+Personalizado+4",
    "https://via.placeholder.com/500x500.png?text=Frase+Inspiradora+5",
    "https://via.placeholder.com/500x500.png?text=Arte+Abstracto+6",
  ];

  return (
    <div className="container mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">Galería de Inspiración</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Mira lo que otros han creado. ¡Usa estas ideas como punto de partida para tu propia obra de arte!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {images.map((src, index) => (
          <div key={index} className="group bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
            <img src={src} alt={` ${index + 1}`} className="w-full h-auto object-cover" />
             {/* Opcional: Añadir un título que aparece al pasar el cursor */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white text-lg font-bold">{src.split('=')[1].replace(/\+/g, ' ')}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}