// app/pedido/page.tsx
'use client';

import React, {useState, useEffect } from 'react';

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

// Constante y función para calcular dimensiones, traídas del diseñador.
const SCALE_TO_CM = 50;
const getElementDimensionsInCm = (element) => {
  const width = (element.scaleX || element.scale) * SCALE_TO_CM;
  const height = (element.scaleY || element.scale) * SCALE_TO_CM; // Usamos scaleY directamente ya que fue calculado y guardado
  return {
    width: width.toFixed(1),
    height: height.toFixed(1)
  };
};

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
        const parsedDesign = JSON.parse(storedDesign);
        setDesign(parsedDesign);
        console.log('Diseño cargado:', parsedDesign);
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
    
    if (!clientName.trim()) {
      errors.clientName = 'El nombre es obligatorio';
    }
   
    /*
    if (!clientPhone.trim()) {
      errors.clientPhone = 'El teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(clientPhone.replace(/\s/g, ''))) {
      errors.clientPhone = 'Ingresa un teléfono válido de 10 dígitos';
    }
    
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      errors.clientEmail = 'Ingresa un correo válido';
    }
    */
    
    if (preferredDelivery === 'delivery' && !shippingAddress.trim()) {
      errors.shippingAddress = 'La dirección es obligatoria para envío a domicilio';
    }
    
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
    
    return {
      basePrice,
      printCost,
      quantity,
      subtotal,
      total: subtotal
    };
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Por favor, corrige los errores en el formulario.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionSuccess(false);

    if (!design) {
      alert("Error: No se encontró el diseño.");
      setIsSubmitting(false);
      return;
    }

    const pricing = calculateEstimatedPrice();

    let message = `*NUEVO PEDIDO DE PLAYERA PERSONALIZADA*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    message += `*DATOS DEL CLIENTE*\n`;
    message += `• Nombre: ${clientName}\n`;
    
    /*
    message += `• Teléfono: ${clientPhone}\n`;
    if (clientEmail) message += `• Email: ${clientEmail}\n`;
    message += `\n`;
    */

    message += `*DETALLES DE ENTREGA*\n`;
    message += `• Método: ${preferredDelivery === 'pickup' ? 'Recoger en tienda' : 'Envío a domicilio'}\n`;
    if (preferredDelivery === 'delivery' && shippingAddress) {
      message += `• Dirección: ${shippingAddress}\n`;
    }
    /*message += `• Urgencia: ${urgency === 'urgent' ? '⚡ URGENTE' : urgency === 'normal' ? '📅 Normal (3-5 días)' : '🕐 Sin prisa'}\n`;
    message += `\n`;*/
    
    message += `*ESPECIFICACIONES DEL DISEÑO*\n`;
    message += `• Color: ${colorNames[design.shirtColor] || design.shirtColor}\n`;
    message += `• Tela: ${fabricNames[design.fabricType] || 'No especificada'}\n`;
    message += `• Talla: ${design.size || 'M'}\n`;
    message += `• Cantidad: ${design.quantity || 1} pieza(s)\n`;
    message += `\n`;

    if (design.imageElements && design.imageElements.length > 0) {
      message += `*IMÁGENES* (${design.imageElements.length})\n`;
      design.imageElements.forEach((img, index) => {
        const dims = getElementDimensionsInCm(img); // CALCULAR DIMENSIONES
        message += `   ${index + 1}. Imagen en *${translateSide(img.side)}*\n`;
        message += `      • Dimensiones: *${dims.width} x ${dims.height} cm*\n`; // MOSTRAR DIMENSIONES
      });
      message += `\n`;
    }

    if (design.textElements && design.textElements.length > 0) {
      message += `*TEXTOS* (${design.textElements.length})\n`;
      design.textElements.forEach((textEl, index) => {
        const dims = getElementDimensionsInCm(textEl); // CALCULAR DIMENSIONES
        message += `   ${index + 1}. "${textEl.text}"\n`;
        message += `      • Ubicación: *${translateSide(textEl.side)}*\n`;
        message += `      • Dimensiones: *${dims.width} x ${dims.height} cm*\n`; // MOSTRAR DIMENSIONES
        message += `      • Fuente: ${textEl.fontFamily}\n`;
        message += `      • Color: ${textEl.color}\n`;
      });
      message += `\n`;
    }
    
    /*
    message += `💰 *ESTIMADO DE PRECIO*\n`;
    message += `• Base: $${pricing.basePrice} MXN\n`;
    message += `• Estampados: $${pricing.printCost} MXN\n`;
    message += `• Cantidad: ${pricing.quantity}x\n`;
    message += `• *Total estimado: $${pricing.total} MXN*\n`;
    message += `\n`;
    */

    if (additionalNotes) {
      message += `*NOTAS ADICIONALES*\n`;
      message += `${additionalNotes}\n`;
      message += `\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*IMPORTANTE: PASOS FINALES*\n`;
    message += `Para completar tu pedido, por favor:\n`;
    message += `1. Envía las *2 capturas del diseño* (frente y trasero) a este chat.\n`;
    
    if (design.imageElements && design.imageElements.length > 0) {
      message += `2. Envía también los *archivos originales* de las imágenes que subiste.\n`;
    }
    
    //message += `\nEl precio final se confirmará al recibir todos los archivos.\n\n`;
    message += `¡Gracias por tu preferencia!`;

    const whatsappNumber = "524622125407"; // Número de WhatsApp del negocio
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, '_blank');
    
    setSubmissionSuccess(true);
    setIsSubmitting(false);
    
    saveOrderToHistory();
  };

  const saveOrderToHistory = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orders.push({
        id: Date.now(),
        date: new Date().toISOString(),
        clientName,
        design: {
          color: design.shirtColor,
          fabric: design.fabricType,
          size: design.size,
          quantity: design.quantity
        }
      });
      localStorage.setItem('orderHistory', JSON.stringify(orders));
    } catch (error) {
      console.error('Error al guardar en historial:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f3]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#c9d1d4] border-t-[#00162d] rounded-full mb-4 mx-auto"></div>
          <p className="text-[#748c94] font-medium">Cargando tu diseño...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf7f3] p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-[#c9d1d4]">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#00162d] mb-2">Diseño no encontrado</h2>
          <p className="text-[#748c94] mb-6">No se encontró ningún diseño. Por favor, crea uno primero.</p>
          <a href="/" className="inline-block bg-[#00162d] text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors shadow-md">
            Volver al Diseñador
          </a>
        </div>
      </div>
    );
  }

  const pricing = calculateEstimatedPrice();
  const showPickupOption = false; // cambiar a true cuando quieras mostrarla

  return (
    <div className="min-h-screen bg-[#faf7f3] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#00162d] mb-3">
            ¡Casi listo!
          </h1>
          <p className="text-lg text-[#748c94] max-w-3xl mx-auto">
            Revisa los detalles de tu diseño, completa tus datos y finaliza el pedido a través de WhatsApp.
          </p>
        </div>

        {submissionSuccess && (
          <div className="mb-6 bg-white border-l-4 border-[#00162d] p-6 rounded-r-lg shadow-md animate-slideIn">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-[#00162d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-[#00162d]">¡Redirección a WhatsApp exitosa!</h3>
                <p className="mt-1 text-[#748c94]">
                  Se ha abierto WhatsApp. <strong>No olvides adjuntar las capturas y los archivos de tu diseño</strong> para que podamos procesar tu pedido correctamente.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            
            <div className="bg-white rounded-xl shadow-lg border border-[#c9d1d4] overflow-hidden">
              <div className="bg-[#00162d] p-5">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2"></span> Vista del Diseño
                </h2>
              </div>
              
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setShowImagePreview('front')}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all text-sm ${
                      showImagePreview === 'front'
                        ? 'bg-[#00162d] text-white shadow-md'
                        : 'bg-transparent text-[#00162d] border-2 border-[#c9d1d4] hover:bg-[#00162d]/5'
                    }`}
                  >
                    Frente
                  </button>
                  <button
                    onClick={() => setShowImagePreview('back')}
                    className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all text-sm ${
                      showImagePreview === 'back'
                        ? 'bg-[#00162d] text-white shadow-md'
                        : 'bg-transparent text-[#00162d] border-2 border-[#c9d1d4] hover:bg-[#00162d]/5'
                    }`}
                  >
                    Trasero
                  </button>
                </div>
                
                <div className="relative aspect-square bg-[#faf7f3] rounded-lg overflow-hidden border border-[#c9d1d4]">
                  {design[`${showImagePreview}Image`] ? (
                    <img 
                      src={design[`${showImagePreview}Image`]} 
                      alt={`Diseño ${showImagePreview}`} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c9d1d4]">
                      <div className="text-center">
                         <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                         </svg>
                        <p className="text-sm text-[#748c94]">Sin diseño para esta vista</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <a
                    href={design.frontImage}
                    download="diseño_frente.png"
                    className="flex items-center justify-center gap-2 bg-transparent text-[#748c94] border border-[#c9d1d4] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#748c94] hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Frente
                  </a>
                  <a
                    href={design.backImage}
                    download="diseño_trasero.png"
                    className="flex items-center justify-center gap-2 bg-transparent text-[#748c94] border border-[#c9d1d4] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#748c94] hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Trasero
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#c9d1d4]">
              <h3 className="text-lg font-bold text-[#00162d] mb-4 flex items-center">
                <span className="mr-2"></span> Resumen del Diseño
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 bg-transparent border border-[#c9d1d4] rounded-lg">
                  <span className="text-[#748c94]">Color</span>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border border-[#c9d1d4]" style={{ backgroundColor: design.shirtColor }}></span>
                    <span className="font-semibold text-[#00162d]">{colorNames[design.shirtColor] || design.shirtColor}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-transparent border border-[#c9d1d4] rounded-lg">
                  <span className="text-[#748c94]">Tela</span>
                  <span className="font-semibold text-[#00162d]">{fabricNames[design.fabricType] || 'No especificada'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-transparent border border-[#c9d1d4] rounded-lg">
                  <span className="text-[#748c94]">Talla</span>
                  <span className="font-semibold text-[#00162d]">{design.size || 'M'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-transparent border border-[#c9d1d4] rounded-lg">
                  <span className="text-[#748c94]">Cantidad</span>
                  <span className="font-semibold text-[#00162d]">{design.quantity || 1} pieza(s)</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-transparent border border-[#c9d1d4] rounded-lg">
                  <span className="text-[#748c94]">Imágenes</span>
                  <span className="font-semibold text-[#00162d]">{design.imageElements?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-transparent border border-[#c9d1d4] rounded-lg">
                  <span className="text-[#748c94]">Textos</span>
                  <span className="font-semibold text-[#00162d]">{design.textElements?.length || 0}</span>
                </div>
              </div>
            </div>

            {/*
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#00162d]">
              <h3 className="text-lg font-bold text-[#00162d] mb-4 flex items-center">
                <span className="mr-2">💰</span> Precio Estimado
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#748c94]">
                  <span>Base por playera</span>
                  <span>${pricing.basePrice} MXN</span>
                </div>
                <div className="flex justify-between text-[#748c94]">
                  <span>Estampados</span>
                  <span>${pricing.printCost} MXN</span>
                </div>
                <div className="flex justify-between text-[#748c94]">
                  <span>Cantidad</span>
                  <span>×{pricing.quantity}</span>
                </div>
                <div className="border-t-2 border-[#c9d1d4] pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#00162d] text-lg">Total estimado</span>
                    <span className="font-bold text-[#00162d] text-2xl">${pricing.total} MXN</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#748c94] mt-3 italic">
                *El precio final se confirmará por WhatsApp según complejidad.
              </p>
            </div>
            */}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-[#c9d1d4] overflow-hidden">
              <div className="bg-[#00162d] p-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-2"></span> Completa tu Información
                </h2>
                <p className="text-[#c9d1d4] mt-1 text-sm">Los campos marcados con * son obligatorios</p>
              </div>

              <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#00162d] border-b border-[#c9d1d4] pb-2">
                    Información Personal
                  </h3>
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-[#748c94] mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className={`w-full px-4 py-3 bg-white border-2 rounded-md focus:ring-1 focus:ring-[#00162d] focus:border-[#00162d] transition-all ${
                        formErrors.clientName ? 'border-red-500' : 'border-[#c9d1d4]'
                      }`}
                      placeholder="Ingresar aquí su nombre..."
                      disabled={isSubmitting}
                    />
                    {formErrors.clientName && <p className="mt-1 text-sm text-red-600">{formErrors.clientName}</p>}
                  </div>

                  {/*
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="clientPhone" className="block text-sm font-medium text-[#748c94] mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="clientPhone"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-md focus:ring-1 focus:ring-[#00162d] focus:border-[#00162d] transition-all ${
                          formErrors.clientPhone ? 'border-red-500' : 'border-[#c9d1d4]'
                        }`}
                        placeholder="Ej. 4621234567"
                        disabled={isSubmitting}
                      />
                      {formErrors.clientPhone && <p className="mt-1 text-sm text-red-600">{formErrors.clientPhone}</p>}
                    </div>

                    <div>
                      <label htmlFor="clientEmail" className="block text-sm font-medium text-[#748c94] mb-2">
                        Correo Electrónico (opcional)
                      </label>
                      <input
                        type="email"
                        id="clientEmail"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-md focus:ring-1 focus:ring-[#00162d] focus:border-[#00162d] transition-all ${
                          formErrors.clientEmail ? 'border-red-500' : 'border-[#c9d1d4]'
                        }`}
                        placeholder="tu@email.com"
                        disabled={isSubmitting}
                      />
                      {formErrors.clientEmail && <p className="mt-1 text-sm text-red-600">{formErrors.clientEmail}</p>}
                    </div>
                  </div>
                  */}
                </div>

                {/* Delivery Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center border-b pb-2">
                    <span className="mr-2">📦</span> Información de Entrega
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Método de Entrega *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {showPickupOption && (
                        <button
                          type="button"
                          onClick={() => setPreferredDelivery('pickup')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            preferredDelivery === 'pickup'
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                          disabled={isSubmitting}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <span className="text-3xl">🏪</span>
                          </div>
                          <div className="font-semibold text-slate-900">Recoger en Tienda</div>
                          <div className="text-xs text-slate-600 mt-1">Sin costo adicional</div>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setPreferredDelivery('delivery')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          preferredDelivery === 'delivery'
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-3xl">🚚</span>
                        </div>
                        <div className="font-semibold text-slate-900">Envío a Domicilio</div>
                        <div className="text-xs text-slate-600 mt-1"></div>
                      </button>
                    </div>

                  </div>

                  {preferredDelivery === 'delivery' && (
                    <div className="animate-slideIn">
                      <label htmlFor="shippingAddress" className="block text-sm font-semibold text-slate-700 mb-2">
                        Dirección de Envío *
                      </label>
                      <textarea
                        id="shippingAddress"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          formErrors.shippingAddress ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Calle, número, colonia, código postal, ciudad"
                        disabled={isSubmitting}
                      />
                      {formErrors.shippingAddress && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.shippingAddress}</p>
                      )}
                    </div>
                  )}

                  {/*  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Urgencia del Pedido *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setUrgency('no-rush')}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          urgency === 'no-rush'
                            ? 'border-green-600 bg-green-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="text-2xl mb-1">🕐</div>
                        <div className="font-semibold text-sm">Sin Prisa</div>
                        <div className="text-xs text-slate-600">7-10 días</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setUrgency('normal')}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          urgency === 'normal'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="text-2xl mb-1">📅</div>
                        <div className="font-semibold text-sm">Normal</div>
                        <div className="text-xs text-slate-600">3-5 días</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setUrgency('urgent')}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          urgency === 'urgent'
                            ? 'border-red-600 bg-red-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="font-semibold text-sm">Urgente</div>
                        <div className="text-xs text-slate-600">1-2 días</div>
                      </button>
                    </div>
                  </div>
                  */}
                </div>

                {/* Additional Notes Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center border-b pb-2">
                    <span className="mr-2">📌</span> Notas Adicionales
                  </h3>
                  
                  <div>
                    <label htmlFor="additionalNotes" className="block text-sm font-semibold text-slate-700 mb-2">
                      ¿Algo más que debamos saber? (opcional)
                    </label>
                    <textarea
                      id="additionalNotes"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Ejemplo: Prefiero tonos más oscuros, el texto debe ser muy legible, necesito factura, etc."
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Puedes incluir preferencias de diseño, necesidades especiales, horarios de entrega, etc.
                    </p>
                  </div>
                </div>

                <div className="bg-[#faf7f3] border-l-4 border-[#00162d] rounded-r-lg p-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1"><svg className="h-5 w-5 text-[#00162d]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                    <div className="ml-3">
                      <h4 className="text-base font-bold text-[#00162d] mb-2">Instrucciones Importantes</h4>
                      <ul className="space-y-2 text-sm text-[#748c94]">
                        <li className="flex items-start"><span className="mr-2 mt-0.5">1.</span><span>Al confirmar, se abrirá WhatsApp con tu pedido pre-cargado.</span></li>
                        <li className="flex items-start"><span className="mr-2 mt-0.5">2.</span><span><strong>Debes adjuntar las 2 capturas</strong> (frente y trasero) en el chat.</span></li>
                        {design.imageElements?.length > 0 && (
                           <li className="flex items-start"><span className="mr-2 mt-0.5">3.</span><span>Además, <strong>envía los archivos originales</strong> de las imágenes que subiste.</span></li>
                        )}
                        <li className="flex items-start"><span className="mr-2 mt-0.5">{design.imageElements?.length > 0 ? '4.' : '3.'}</span><span>El precio final se confirmará por WhatsApp al revisar tu diseño.</span></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-md ${
                      isSubmitting 
                        ? 'bg-[#748c94] cursor-not-allowed text-white' 
                        : 'bg-[#00162d] text-white hover:bg-opacity-90 transform hover:scale-[1.01]'
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-6 h-6 border-3 border-white/30 border-t-white rounded-full mr-3"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Confirmar Pedido por WhatsApp
                      </>
                    )}
                  </button>
                  <div className="mt-4 text-center">
                    <a href="/" className="text-sm text-[#748c94] hover:text-[#00162d] underline transition-colors">
                      ← Volver al diseñador
                    </a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-[#748c94]">
          <p>Diseñador de Playeras 3D • Todos los diseños son revisados antes de producción</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus, textarea:focus, select:focus { outline: none; }
        button:disabled { cursor: not-allowed; }
        button, input, textarea, select { transition: all 0.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default OrderPage;