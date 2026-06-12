'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  ChevronDown,
  Palette,
  Layers,
  Ruler,
  Minus,
  Plus,
  ImageIcon,
  Type,
  Trash2,
  FlipHorizontal2,
  RotateCcw,
  Upload,
  Check,
  Circle,
  Lightbulb,
  ShoppingBag,
  Move,
  RotateCw,
  Maximize2,
} from 'lucide-react';

// --- CONSTANTES DE TALLAS (Medidas aproximadas en CM) ---
const SHIRT_SPECS = {
  S: { width: 46, height: 70, label: 'Chica (S)' },
  M: { width: 51, height: 72, label: 'Mediana (M)' },
  L: { width: 56, height: 74, label: 'Grande (L)' },
  XL: { width: 61, height: 76, label: 'Extra Grande (XL)' }
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (font) => {
    onChange(font);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-field w-full px-4 py-3 text-sm flex justify-between items-center"
      >
        <span style={{ fontFamily: value, fontSize: '1.05rem', color: '#00162d' }}>{value}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`text-[#00162d]/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="glass-panel absolute z-20 top-full mt-2 w-full max-h-64 overflow-y-auto p-1.5" style={{ background: "#fff" }}>
          {options.map(group => (
            <div key={group.label}>
              <h5 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#00162d]/40 px-3 pt-3 pb-1.5">
                {group.label}
              </h5>
              <ul>
                {group.fonts.map(font => (
                  <li key={font}>
                    <button
                      type="button"
                      onClick={() => handleSelect(font)}
                      className={`w-full text-left px-3 py-2 text-base rounded-xl transition-colors ${
                        value === font
                          ? 'bg-[#00162d] text-[#faf7f3]'
                          : 'text-[#00162d] hover:bg-[#00162d]/[0.06]'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE: Guías de Medidas Visuales ---
const DimensionGuides = ({ sizeSpec }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
      <div className="relative w-[60%] h-[70%]">
        {/* Línea Vertical (Alto) */}
        <div className="absolute right-[-22px] top-0 bottom-0 flex items-center">
          <div className="h-full w-px bg-[#00162d]/15 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-px bg-[#00162d]/20"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-px bg-[#00162d]/20"></div>
            <div className="absolute top-1/2 left-2.5 -translate-y-1/2 glass-chip px-2 py-1 text-[11px] font-medium text-[#00162d] whitespace-nowrap">
              {sizeSpec.height} cm
            </div>
          </div>
        </div>

        {/* Línea Horizontal (Ancho) */}
        <div className="absolute bottom-[-22px] left-0 right-0 flex justify-center">
          <div className="w-full h-px bg-[#00162d]/15 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2.5 w-px bg-[#00162d]/20"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-px bg-[#00162d]/20"></div>
            <div className="absolute left-1/2 bottom-2.5 -translate-x-1/2 glass-chip px-2 py-1 text-[11px] font-medium text-[#00162d] whitespace-nowrap">
              {sizeSpec.width} cm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- FACTORES DE CALIBRACIÓN UV → CM ---
// Calibrado empíricamente con talla M (51x72 cm):
//   scaleX=1.0 mostraba 36cm  → factor = 51/36 ≈ 1.4167
//   scaleY=1.0 mostraba 68cm  → factor = 72/68 ≈ 1.0588
const UV_SCALE_FACTOR_W = 51 / 36;
const UV_SCALE_FACTOR_H = 72 / 68;

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
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeHandle, setActiveHandle] = useState(null);
  const [isColorSectionOpen, setIsColorSectionOpen] = useState(true);
  const [isFabricSectionOpen, setIsFabricSectionOpen] = useState(true);
  const [isSizeSectionOpen, setIsSizeSectionOpen] = useState(true);
  const [isQuantitySectionOpen, setIsQuantitySectionOpen] = useState(true);
  
  // Talla inicial
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

  // Variable de referencia para dimensiones de la textura
  const CANVAS_SIZE = 2048;

  // Cargar todas las tipografías de moda desde Google Fonts
  useEffect(() => {
    const googleFontsUrl =
      'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Bodoni+Moda:ital,wght@0,400;0,600;1,400&family=DM+Serif+Display:ital@0;1&family=Fraunces:ital,wght@0,300;0,400;1,300&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=Tenor+Sans&family=Josefin+Sans:ital,wght@0,100;0,300;0,400;1,100;1,300&family=Poiret+One&family=Raleway:ital,wght@0,100;0,300;0,400;1,100;1,300&family=Montserrat:ital,wght@0,100;0,300;0,400;1,100&family=Jost:ital,wght@0,100;0,300;0,400;1,100&family=Outfit:wght@100;300;400&family=Urbanist:ital,wght@0,100;0,300;0,400;1,100&family=Nunito+Sans:wght@200;300;400&family=Bebas+Neue&family=Great+Vibes&family=Sacramento&family=Allura&family=Pinyon+Script&family=Petit+Formal+Script&family=Italianno&family=Dancing+Script:wght@400;700&family=Parisienne&family=Alex+Brush&family=Carattere&family=Clicker+Script&family=Damion&family=Oswald:wght@200;300;400;500&family=Barlow+Condensed:ital,wght@0,100;0,300;0,400;1,100&family=Anton&family=Big+Shoulders+Display:wght@100;300;400;700&family=Fjalla+One&family=Pathway+Gothic+One&family=Lora:ital,wght@0,400;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cardo:ital,wght@0,400;0,700;1,400&family=Spectral:ital,wght@0,300;0,400;1,300&family=Arvo:ital,wght@0,400;0,700;1,400&display=swap';
    const existingLink = document.getElementById('fashion-google-fonts');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'fashion-google-fonts';
      link.rel = 'stylesheet';
      link.href = googleFontsUrl;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  useEffect(() => {
    activeHandleRef.current = activeHandle;
  }, [activeHandle]);

  const shirtColors = [
    { color: '#ffffff', name: 'Blanco' },
    { color: 'rgb(187, 187, 187)', name: 'Gris' },
    { color: 'rgb(53, 53, 53)', name: 'Negro' },
  ];

  const fabricTypes = [
    { id: 'algodon', name: 'Algodón', image: '/models/algodon.jpeg' },
  ];

  const fontFamilies = [
    {
      label: 'Alta Moda — Serif de Lujo',
      fonts: ['Cormorant', 'Cormorant Garamond', 'Playfair Display', 'Bodoni Moda', 'DM Serif Display', 'Fraunces']
    },
    {
      label: 'Editorial — Estilo Vogue & Dior',
      fonts: ['Cinzel', 'Cinzel Decorative', 'Tenor Sans', 'Josefin Sans', 'Poiret One', 'Raleway']
    },
    {
      label: 'Minimalismo Chic — Sans Serif',
      fonts: ['Montserrat', 'Jost', 'Outfit', 'Urbanist', 'Nunito Sans', 'Bebas Neue']
    },
    {
      label: 'Cursivas Elegantes — Haute Couture',
      fonts: ['Great Vibes', 'Sacramento', 'Allura', 'Pinyon Script', 'Petit Formal Script', 'Italianno']
    },
    {
      label: 'Script con Carácter',
      fonts: ['Dancing Script', 'Parisienne', 'Alex Brush', 'Carattere', 'Clicker Script', 'Damion']
    },
    {
      label: 'Condensadas de Impacto',
      fonts: ['Oswald', 'Barlow Condensed', 'Anton', 'Big Shoulders Display', 'Fjalla One', 'Pathway Gothic One']
    },
    {
      label: 'Clásicas & Atemporales',
      fonts: ['Lora', 'EB Garamond', 'Libre Baskerville', 'Cardo', 'Spectral', 'Arvo']
    }
  ];

  // --- CALCULO DE DIMENSIONES DINÁMICO ---
  const getElementDimensionsInCm = (element) => {
    const shirtWidthCm  = SHIRT_SPECS[currentSize].width;
    const shirtHeightCm = SHIRT_SPECS[currentSize].height;

    const scaleX = element.scaleX ?? element.scale ?? 0;
    const scaleY = element.scaleY ?? element.scale ?? 0;

    const widthCm  = scaleX * shirtWidthCm  * UV_SCALE_FACTOR_W;
    const heightCm = scaleY * shirtHeightCm * UV_SCALE_FACTOR_H;

    return { width: widthCm.toFixed(1), height: heightCm.toFixed(1) };
  };

  // --- FUNCIÓN PARA CAMBIAR TALLA Y AJUSTAR ELEMENTOS ---
  const changeSize = (newSize) => {
    if (newSize === currentSize) return;

    const oldWidth = SHIRT_SPECS[currentSize].width;
    const newWidth = SHIRT_SPECS[newSize].width;
    
    // Calculamos el ratio: Si la camisa crece (S -> L), el ratio es < 1, 
    // por lo tanto la imagen ocupa menos % de la tela (se ve más chica relativamente)
    const ratio = oldWidth / newWidth;

    // Actualizar imágenes
    setImageElements(prev => prev.map(el => ({
      ...el,
      scale: el.scale * ratio,
      scaleX: el.scaleX * ratio,
      scaleY: el.scaleY * ratio
    })));

    // Actualizar textos
    setTextElements(prev => prev.map(el => ({
      ...el,
      scale: el.scale * ratio,
      scaleX: el.scaleX * ratio,
      scaleY: el.scaleY * ratio
    })));

    setCurrentSize(newSize);
  };


  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;
    const width = viewer.clientWidth;
    const height = viewer.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf7f3);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    viewer.appendChild(renderer.domElement);

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

    imageElements.forEach(element => {
      if (element.texture && element.side === 'front') {
        drawElementOnCanvas(ctx, element, canvas.width, canvas.height, 'front');
      }
    });

    textElements.forEach(element => {
      if (element.side === 'front') {
        drawTextOnCanvas(ctx, element, canvas.width, canvas.height, 'front');
      }
    });

    imageElements.forEach(element => {
      if (element.texture && element.side === 'back') {
        drawElementOnCanvas(ctx, element, canvas.width, canvas.height, 'back');
      }
    });

    textElements.forEach(element => {
      if (element.side === 'back') {
        drawTextOnCanvas(ctx, element, canvas.width, canvas.height, 'back');
      }
    });

    if (selectedElementRef.current) {
      const element = [...imageElements, ...textElements].find(el => 
        el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type
      );
      
      if (element) {
        const elementOnFront = element.side === 'front';
        const viewingFront = isElementOnFront(element);
        
        if (elementOnFront === viewingFront) {
          drawControlsOnCanvas(ctx, element, canvas.width, canvas.height, element.side);
        }
      }
    }

    const combinedTexture = new THREE.CanvasTexture(canvas);
    combinedTexture.colorSpace = THREE.SRGBColorSpace;
    combinedTexture.wrapS = THREE.ClampToEdgeWrapping;
    combinedTexture.wrapT = THREE.ClampToEdgeWrapping;
    combinedTexture.minFilter = THREE.LinearFilter;
    combinedTexture.magFilter = THREE.LinearFilter;
    combinedTexture.needsUpdate = true;

    modelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        const applyTextureToMaterial = (mat, uuidKey) => {
          mat.map = combinedTexture;
          mat.color.set(0xffffff);
          mat.transparent = false;
          mat.opacity = 1.0;
          // Neutralize PBR properties that darken the texture
          if (mat.roughness !== undefined) mat.roughness = 1.0;
          if (mat.metalness !== undefined) mat.metalness = 0.0;
          if (mat.emissive !== undefined) mat.emissive.set(0x000000);
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0;
          mat.needsUpdate = true;
          materialsWithTexture.current.add(uuidKey);
        };

        if (Array.isArray(child.material)) {
          child.material.forEach((mat, index) => {
            applyTextureToMaterial(mat, `${child.uuid}_${index}`);
          });
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
    if (element.type === 'image' && element.texture?.image) {
      aspectRatio = element.texture.image.height / element.texture.image.width;
    } else if (element.type === 'text') {
      aspectRatio = 0.3;
    }
    const elementHeight = (element.scaleY || (element.scale * aspectRatio)) * pixelScale;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(element.rotation || 0);

    ctx.strokeStyle = '#00162d';
    ctx.lineWidth = 5;
    ctx.setLineDash([14, 10]);
    ctx.strokeRect(-elementWidth / 2, -elementHeight / 2, elementWidth, elementHeight);
    ctx.setLineDash([]);

    const handleSize = 28;
    const corners = [
      { x: -elementWidth / 2, y: -elementHeight / 2 },
      { x: elementWidth / 2, y: -elementHeight / 2 },
      { x: -elementWidth / 2, y: elementHeight / 2 },
      { x: elementWidth / 2, y: elementHeight / 2 },
    ];

    const drawHandle = (x, y, fill) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, handleSize / 2 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, handleSize / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    corners.forEach(corner => {
      drawHandle(corner.x, corner.y, '#00162d');
    });

    const edges = [
      { x: 0, y: -elementHeight / 2 },
      { x: 0, y: elementHeight / 2 },
      { x: -elementWidth / 2, y: 0 },
      { x: elementWidth / 2, y: 0 },
    ];

    edges.forEach(edge => {
      drawHandle(edge.x, edge.y, '#3a6b8a');
    });

    const rotateDistance = elementHeight / 2 + 80;
    ctx.strokeStyle = 'rgba(0, 22, 45, 0.35)';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, -elementHeight / 2);
    ctx.lineTo(0, -rotateDistance);
    ctx.stroke();
    ctx.setLineDash([]);

    drawHandle(0, -rotateDistance, '#c9512f');

    const dims = getElementDimensionsInCm(element);
    ctx.fillStyle = '#00162d';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.font = '500 36px Outfit, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Width below
    const widthTextY = elementHeight / 2 + 50;
    const widthText = `${dims.width} cm`;
    ctx.strokeText(widthText, 0, widthTextY);
    ctx.fillText(widthText, 0, widthTextY);
    
    // Height on the right
    const heightTextX = elementWidth / 2 + 50;
    const heightText = `${dims.height} cm`;
    ctx.save();
    ctx.translate(heightTextX, 0);
    ctx.rotate(Math.PI / 2);
    ctx.strokeText(heightText, 0, 0);
    ctx.fillText(heightText, 0, 0);
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
    if (element.type === 'image' && element.texture?.image) {
      aspectRatio = element.texture.image.height / element.texture.image.width;
    } else if (element.type === 'text') {
      aspectRatio = 0.3;
    }
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
    
    if (Math.abs(rotatedU) < handleSizeUV && Math.abs(rotatedV - rotateDistanceUV) < handleSizeUV) {
      return 'rotate';
    }
    
    const halfU = elementWidthUV / 2;
    const halfV = elementHeightUV / 2;
    
    const corners = [
      { u: -halfU, v: halfV, name: 'scale-nw' },  // Top-Left
      { u: halfU, v: halfV, name: 'scale-ne' },   // Top-Right
      { u: -halfU, v: -halfV, name: 'scale-sw' }, // Bottom-Left
      { u: halfU, v: -halfV, name: 'scale-se' }  // Bottom-Right
    ];
    
    for (const corner of corners) {
      if (Math.abs(rotatedU - corner.u) < handleSizeUV && Math.abs(rotatedV - corner.v) < handleSizeUV) {
        return corner.name;
      }
    }

    const edges = [
      { u: 0, v: halfV, name: 'edge-n' },   // Top
      { u: 0, v: -halfV, name: 'edge-s' },  // Bottom
      { u: -halfU, v: 0, name: 'edge-w' },  // Left
      { u: halfU, v: 0, name: 'edge-e' }   // Right
    ];

    for (const edge of edges) {
      if (Math.abs(rotatedU - edge.u) < handleSizeUV && Math.abs(rotatedV - edge.v) < handleSizeUV) {
        return edge.name;
      }
    }
    
    if (Math.abs(rotatedU) < halfU * 1.2 && Math.abs(rotatedV) < halfV * 1.2) {
      return 'move';
    }
    
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
      const selectedEl = allElements.find(el => 
        el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type
      );
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
    const localPosition = new THREE.Vector3(
      element.offsetX * MODEL_OFFSET_SCALE,
      (baseY + element.offsetY) * MODEL_OFFSET_SCALE,
      zPosition
    );
    const worldPosition = localPosition.clone();
    modelRef.current.localToWorld(worldPosition);
    worldPosition.project(cameraRef.current);
    const rect = viewerRef.current.getBoundingClientRect();
    return {
      x: (worldPosition.x * 0.5 + 0.5) * rect.width,
      y: (-worldPosition.y * 0.5 + 0.5) * rect.height
    };
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
          if (element.type === 'image' && element.texture?.image) {
            aspectRatio = element.texture.image.height / element.texture.image.width;
          } else if (element.type === 'text') {
            aspectRatio = 0.3;
          }
          scaleStart.current = {
            distance,
            elementScale: element.scale,
            width: element.scaleX || element.scale,
            height: element.scaleY || (element.scale * aspectRatio),
            startX: clientX,
            startY: clientY
          };
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
        const element = [...imageElementsRef.current, ...textElementsRef.current].find(el => 
          el.id === currentSelected.id && el.type === currentSelected.type
        );
        if (!element) return;

        if (currentHandle === 'move') {
          const deltaPixelsX = x - dragStart.current.x;
          const deltaPixelsY = y - dragStart.current.y;
          const worldDelta = screenToWorldDelta(deltaPixelsX, deltaPixelsY);
          const newOffsetX = dragStart.current.elementX + worldDelta.x;
          const newOffsetY = dragStart.current.elementY + worldDelta.y;
          if (element.type === 'image') {
            updateImageElement(element.id, 'offsetX', newOffsetX);
            updateImageElement(element.id, 'offsetY', newOffsetY);
          } else {
            updateTextElement(element.id, 'offsetX', newOffsetX);
            updateTextElement(element.id, 'offsetY', newOffsetY);
          }
        } else if (currentHandle === 'rotate') {
          const pos = get2DPositionFromElement(element);
          const angle = Math.atan2(y - pos.y, x - pos.x);
          const rotation = rotateStart.current.elementRotation + (angle - rotateStart.current.angle);
          if (element.type === 'image') {
            updateImageElement(element.id, 'rotation', rotation);
          } else {
            updateTextElement(element.id, 'rotation', rotation);
          }
        } else if (currentHandle.startsWith('scale-')) {
          const pos = get2DPositionFromElement(element);
          const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          const scaleFactor = distance / scaleStart.current.distance;
          const newScale = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.elementScale * scaleFactor));
          if (element.type === 'image') {
            updateImageElement(element.id, 'scale', newScale);
            updateImageElement(element.id, 'scaleX', newScale);
            let aspectRatio = 1;
            if (element.texture?.image) {
              aspectRatio = element.texture.image.height / element.texture.image.width;
            }
            updateImageElement(element.id, 'scaleY', newScale * aspectRatio);
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
            if (element.type === 'image') {
              updateImageElement(element.id, 'scaleY', newHeight);
            } else {
              updateTextElement(element.id, 'scaleY', newHeight);
            }
          } else if (currentHandle === 'edge-w' || currentHandle === 'edge-e') {
            const deltaScale = (currentHandle === 'edge-w' ? -deltaX : deltaX) * pixelToScale;
            const newWidth = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.width + deltaScale));
            if (element.type === 'image') {
              updateImageElement(element.id, 'scaleX', newWidth);
            } else {
              updateTextElement(element.id, 'scaleX', newWidth);
            }
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
          if (handle === 'rotate') {
            canvas.style.cursor = 'grab';
          } else if (handle.startsWith('scale-')) {
            if (handle === 'scale-nw' || handle === 'scale-se') {
              canvas.style.cursor = 'nwse-resize';
            } else { // 'scale-ne' and 'scale-sw'
              canvas.style.cursor = 'nesw-resize';
            }
          } else if (handle.startsWith('edge-')) {
            canvas.style.cursor = (handle === 'edge-n' || handle === 'edge-s') ? 'ns-resize' : 'ew-resize';
          } else if (handle === 'move') {
            canvas.style.cursor = 'move';
          }
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
            if (element.type === 'image' && element.texture?.image) {
              aspectRatio = element.texture.image.height / element.texture.image.width;
            } else if (element.type === 'text') {
              aspectRatio = 0.3;
            }
            scaleStart.current = {
              distance,
              elementScale: element.scale,
              width: element.scaleX || element.scale,
              height: element.scaleY || (element.scale * aspectRatio),
              startX: clientX,
              startY: clientY
            };
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
          const element = [...imageElementsRef.current, ...textElementsRef.current].find(el => 
            el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type
          );
          if (!element) return;

          if (currentHandle === 'move') {
            const deltaPixelsX = x - dragStart.current.x;
            const deltaPixelsY = y - dragStart.current.y;
            const worldDelta = screenToWorldDelta(deltaPixelsX, deltaPixelsY);
            const newOffsetX = dragStart.current.elementX + worldDelta.x;
            const newOffsetY = dragStart.current.elementY + worldDelta.y;
            if (element.type === 'image') {
              updateImageElement(element.id, 'offsetX', newOffsetX);
              updateImageElement(element.id, 'offsetY', newOffsetY);
            } else {
              updateTextElement(element.id, 'offsetX', newOffsetX);
              updateTextElement(element.id, 'offsetY', newOffsetY);
            }
          } else if (currentHandle === 'rotate') {
            const pos = get2DPositionFromElement(element);
            const angle = Math.atan2(y - pos.y, x - pos.x);
            const rotation = rotateStart.current.elementRotation + (angle - rotateStart.current.angle);
            if (element.type === 'image') {
              updateImageElement(element.id, 'rotation', rotation);
            } else {
              updateTextElement(element.id, 'rotation', rotation);
            }
          } else if (currentHandle.startsWith('scale-')) {
            const pos = get2DPositionFromElement(element);
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            const scaleFactor = distance / scaleStart.current.distance;
            const newScale = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.elementScale * scaleFactor));
            if (element.type === 'image') {
              updateImageElement(element.id, 'scale', newScale);
              updateImageElement(element.id, 'scaleX', newScale);
              let aspectRatio = 1;
              if (element.texture?.image) {
                aspectRatio = element.texture.image.height / element.texture.image.width;
              }
              updateImageElement(element.id, 'scaleY', newScale * aspectRatio);
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
              if (element.type === 'image') {
                updateImageElement(element.id, 'scaleY', newHeight);
              } else {
                updateTextElement(element.id, 'scaleY', newHeight);
              }
            } else if (currentHandle === 'edge-w' || currentHandle === 'edge-e') {
              const deltaScale = (currentHandle === 'edge-w' ? -deltaX : deltaX) * pixelToScale;
              const newWidth = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.width + deltaScale));
              if (element.type === 'image') {
                updateImageElement(element.id, 'scaleX', newWidth);
              } else {
                updateTextElement(element.id, 'scaleX', newWidth);
              }
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
    setIsLoadingModel(true);
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
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
      (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% cargado'),
      (error) => {
        console.error('Error al cargar modelo:', error);
        setIsLoadingModel(false);
        alert('No se pudo cargar el modelo 3D. Verifica que el archivo existe en /models/Shirt3D.glb');
      }
    );
  };

  const clearScene = () => {
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
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
            const key = `${child.uuid}_${index}`;
            originalMaterials.current.set(key, {
              color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
              map: mat.map ? mat.map.clone() : null
            });
          });
        } else {
          originalMaterials.current.set(child.uuid, {
            color: child.material.color ? child.material.color.clone() : new THREE.Color(0xffffff),
            map: child.material.map ? child.material.map.clone() : null
          });
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
    const initialOffsetX = 0;
    const initialOffsetY = currentSide === 'front' ? 0.0625 : 0.25;
    const newElement = {
      id,
      type: 'image',
      texture: null,
      scale: 0.2,
      scaleX: 0.2,
      scaleY: 0.2,
      offsetX: initialOffsetX,
      offsetY: initialOffsetY,
      rotation: 0,
      side: currentSide,
      flipped: false
    };
    setImageElements(prev => [...prev, newElement]);
    setSelectedElement({ id, type: 'image' });
  };

  const addText = () => {
    const id = elementIdCounter + 1;
    setElementIdCounter(id);
    const currentSide = isElementOnFront({ side: 'front' }) ? 'front' : 'back';
    const initialOffsetX = 0;
    const initialOffsetY = currentSide === 'front' ? 0.0625 : 0.25;
    const newElement = {
      id,
      type: 'text',
      text: 'Texto ejemplo',
      fontFamily: 'Great Vibes', // Fuente por defecto más estilizada
      color: '#000000',
      outline: false,
      outlineWidth: 2,
      scale: 0.2,
      scaleX: 0.2,
      scaleY: 0.06,
      offsetX: initialOffsetX,
      offsetY: initialOffsetY,
      rotation: 0,
      side: currentSide
    };
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
    if (type === 'image') {
      setImageElements(prev => prev.map(el => 
        el.id === id ? { ...el, side: el.side === 'front' ? 'back' : 'front' } : el
      ));
    } else {
      setTextElements(prev => prev.map(el => 
        el.id === id ? { ...el, side: el.side === 'front' ? 'back' : 'front' } : el
      ));
    }
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

    // Tamaño base de fuente en píxeles del canvas (constante interna)
    const BASE_FONT_SIZE = 200;
    // Escala horizontal y vertical del recuadro en píxeles
    const boxWidth = (element.scaleX || element.scale) * pixelScale;
    const boxHeight = (element.scaleY || (element.scale * 0.3)) * pixelScale;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(element.rotation || 0);

    // Medir el texto a tamaño base para calcular el factor de escala
    ctx.font = `${BASE_FONT_SIZE}px ${element.fontFamily}`;
    const measuredWidth = ctx.measureText(element.text).width || 1;

    // Escalar el canvas para que el texto llene el recuadro
    const scaleX = boxWidth / measuredWidth;
    const scaleY = boxHeight / BASE_FONT_SIZE;
    ctx.scale(scaleX, scaleY);

    ctx.font = `${BASE_FONT_SIZE}px ${element.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (element.outline) {
      // Modo OUTLINE: solo contorno, interior transparente
      const strokeW = (element.outlineWidth || 2) * (BASE_FONT_SIZE / 40);
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = element.color;
      ctx.lineJoin = 'round';
      ctx.strokeText(element.text, 0, 0);
      // No fillText → interior vacío
    } else {
      // Modo normal: relleno sólido
      ctx.fillStyle = element.color;
      ctx.fillText(element.text, 0, 0);
    }

    ctx.restore();
  };

  const captureScreenshot = (rotationY) => {
    return new Promise((resolve) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !modelRef.current) {
        resolve(null);
        return;
      }
      const originalRotationY = modelRef.current.rotation.y;
      const isAnythingSelected = !!selectedElementRef.current;
      if (isAnythingSelected) setSelectedElement(null);

      // Guardar estado original
      const originalCameraZ = cameraRef.current.position.z;
      const originalCameraX = cameraRef.current.position.x;
      const originalCameraY = cameraRef.current.position.y;
      const originalAspect = cameraRef.current.aspect;

      const CAPTURE_SIZE = 900; // resolución cuadrada fija para captura

      modelRef.current.rotation.y = rotationY;

      // Configurar cámara y renderer para captura cuadrada
      rendererRef.current.setSize(CAPTURE_SIZE, CAPTURE_SIZE);
      cameraRef.current.aspect = 1; // aspecto cuadrado
      cameraRef.current.position.set(0, 0, 1.5);
      cameraRef.current.updateProjectionMatrix();

      setTimeout(() => {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataURL = rendererRef.current.domElement.toDataURL('image/png');

        // Restaurar todo al estado original
        modelRef.current.rotation.y = originalRotationY;
        cameraRef.current.position.set(originalCameraX, originalCameraY, originalCameraZ);
        cameraRef.current.aspect = originalAspect;
        cameraRef.current.updateProjectionMatrix();

        // Restaurar tamaño original del renderer
        const viewer = rendererRef.current.domElement.parentElement;
        if (viewer) {
          rendererRef.current.setSize(viewer.clientWidth, viewer.clientHeight);
        }

        resolve(dataURL);
      }, 80);
    });
  };

  const captureAndRedirectToOrderPage = async () => {
    if (!isModelLoaded) {
      alert("El modelo 3D aún se está cargando. Por favor, espera un momento.");
      return;
    }
    const tempSelected = selectedElementRef.current;
    setSelectedElement(null);
    await new Promise(resolve => setTimeout(resolve, 50));
    const frontImage = await captureScreenshot(0);
    const backImage = await captureScreenshot(Math.PI);
    const designData = {
      shirtColor: currentShirtColor,
      fabricType: currentFabric,
      size: currentSize,
      quantity: quantity,
      imageElements: imageElements.map(el => ({ ...el, texture: null })),
      textElements: textElements,
      frontImage: frontImage,
      backImage: backImage
    };
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
    if (selectedElement.type === 'image') {
      return imageElements.find(el => el.id === selectedElement.id);
    } else {
      return textElements.find(el => el.id === selectedElement.id);
    }
  };

  const selectedElementData = getSelectedElementData();

  // --- Sub-componente local: encabezado de sección colapsable ---
  const SectionHeader = ({ icon: Icon, title, isOpen, onToggle }) => (
    <button onClick={onToggle} className="w-full flex justify-between items-center text-left group">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#00162d]/[0.05] text-[#00162d]">
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <h3 className="text-[15px] font-semibold text-[#00162d] tracking-tight">{title}</h3>
      </div>
      <ChevronDown
        size={18}
        strokeWidth={2}
        className={`text-[#00162d]/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row app-bg">
      <div className="h-[50vh] lg:flex-1 lg:h-screen overflow-hidden relative">
        <div className="h-full w-full overflow-hidden flex items-center justify-center relative">
          <div ref={viewerRef} className="w-full h-full relative touch-none z-10">
            {isLoadingModel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="loader-ring mb-4"></div>
                <p className="text-sm font-medium tracking-wide text-[#00162d]/60">Cargando modelo 3D…</p>
              </div>
            )}
            {!isLoadingModel && !isModelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#00162d]/50 text-sm">
                <p>No se pudo cargar el modelo 3D</p>
              </div>
            )}
          </div>

          {/* Overlay de Guías de Dimensiones */}
          {isModelLoaded && <DimensionGuides sizeSpec={SHIRT_SPECS[currentSize]} />}

          {/* Etiqueta de talla flotante */}
          {isModelLoaded && (
            <div className="absolute top-5 left-5 glass-chip px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#00162d] z-20">
              Talla {currentSize}
            </div>
          )}
        </div>
      </div>

      <div className="h-[50vh] lg:h-screen w-full lg:w-[26rem] p-5 lg:p-6 overflow-y-auto z-10 sidebar-panel">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold text-[#00162d] tracking-tight">Diseñador 3D</h2>
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#00162d]/35 font-medium">Personaliza</span>
        </div>

        <div className="space-y-5">
          {isModelLoaded && (
            <>
              {/* Sección de Color */}
              <div className="glass-card p-5">
                <SectionHeader
                  icon={Palette}
                  title="Color de la camisa"
                  isOpen={isColorSectionOpen}
                  onToggle={() => setIsColorSectionOpen(!isColorSectionOpen)}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isColorSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="flex gap-3">
                    {shirtColors.map(({ color, name }) => (
                      <button
                        key={color}
                        onClick={() => changeColor(color)}
                        className={`swatch ${currentShirtColor === color ? 'swatch-active' : ''}`}
                        style={{ backgroundColor: color }}
                        title={name}
                      >
                        {currentShirtColor === color && (
                          <Check
                            size={14}
                            strokeWidth={3}
                            className={color === '#ffffff' ? 'text-[#00162d]' : 'text-[#faf7f3]'}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sección de Tela */}
              <div className="glass-card p-5">
                <SectionHeader
                  icon={Layers}
                  title="Tipo de tela"
                  isOpen={isFabricSectionOpen}
                  onToggle={() => setIsFabricSectionOpen(!isFabricSectionOpen)}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFabricSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="grid grid-cols-2 gap-3">
                    {fabricTypes.map(({ id, name, image }) => (
                      <button
                        key={id}
                        onClick={() => changeFabric(id)}
                        className={`fabric-tile ${currentFabric === id ? 'fabric-tile-active' : ''}`}
                      >
                        <div className="aspect-square bg-[#00162d]/5 flex items-center justify-center overflow-hidden rounded-t-2xl">
                          <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="text-[#00162d]/30 text-xs p-2">Sin imagen</div>';
                            }}
                          />
                        </div>
                        <div className="py-2 text-center text-sm font-medium text-[#00162d]">
                          {name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sección de Talla */}
              <div className="glass-card p-5">
                <SectionHeader
                  icon={Ruler}
                  title="Talla"
                  isOpen={isSizeSectionOpen}
                  onToggle={() => setIsSizeSectionOpen(!isSizeSectionOpen)}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSizeSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="grid grid-cols-4 gap-2.5">
                    {shirtSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => changeSize(size)}
                        className={`size-pill ${currentSize === size ? 'size-pill-active' : ''}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#00162d]/45 text-center tracking-wide">
                    {SHIRT_SPECS[currentSize].width} cm de ancho · {SHIRT_SPECS[currentSize].height} cm de alto
                  </p>
                </div>
              </div>

              {/* Sección de Cantidad */}
              <div className="glass-card p-5">
                <SectionHeader
                  icon={Layers}
                  title="Cantidad"
                  isOpen={isQuantitySectionOpen}
                  onToggle={() => setIsQuantitySectionOpen(!isQuantitySectionOpen)}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isQuantitySectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="stepper-btn"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={16} strokeWidth={2.5} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setQuantity(val >= 1 ? val : 1);
                      }}
                      className="glass-field w-20 h-12 text-center text-lg font-semibold text-[#00162d]"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="stepper-btn"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Añadir Elementos */}
              <div className="glass-card p-5">
                <h3 className="text-[15px] font-semibold text-[#00162d] tracking-tight mb-4">Añadir elementos</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={addImage} className="add-element-btn">
                    <ImageIcon size={20} strokeWidth={1.75} />
                    <span>Imagen</span>
                  </button>
                  <button onClick={addText} className="add-element-btn">
                    <Type size={20} strokeWidth={1.75} />
                    <span>Texto</span>
                  </button>
                </div>
              </div>

              {/* Editor de Elemento Seleccionado */}
              {selectedElementData && (
                <div className="glass-card glass-card-accent p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#00162d] text-[#faf7f3]">
                        {selectedElementData.type === 'image' ? (
                          <ImageIcon size={15} strokeWidth={1.75} />
                        ) : (
                          <Type size={15} strokeWidth={1.75} />
                        )}
                      </span>
                      <h3 className="text-[15px] font-semibold text-[#00162d] tracking-tight">
                        {selectedElementData.type === 'image' ? 'Imagen' : 'Texto'} · #{selectedElementData.id}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedElementData.type === 'image') {
                          removeImage(selectedElementData.id);
                        } else {
                          removeText(selectedElementData.id);
                        }
                      }}
                      className="icon-ghost-btn text-[#c9512f]"
                      aria-label="Eliminar elemento"
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Dimensiones dinámicas */}
                    <div className="glass-field-static px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#00162d]/40 font-medium mb-1">
                        Dimensiones reales
                      </div>
                      <div className="text-lg font-semibold text-[#00162d]">
                        {getElementDimensionsInCm(selectedElementData).width} × {getElementDimensionsInCm(selectedElementData).height} cm
                      </div>
                      <div className="text-[11px] text-[#00162d]/35 mt-0.5">
                        Ajustado para talla {currentSize}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#00162d]/55 mb-2 uppercase tracking-wide">Lado de la camisa</label>
                      <button
                        onClick={() => toggleElementSide(selectedElementData.id, selectedElementData.type)}
                        className="glass-field w-full px-4 py-3 text-sm font-medium text-[#00162d] flex items-center justify-between hover:bg-[#00162d]/[0.04] transition-colors"
                      >
                        <span>{selectedElementData.side === 'front' ? 'Frente' : 'Parte trasera'}</span>
                        <span className="flex items-center gap-1.5 text-[#00162d]/45 text-xs">
                          <RotateCcw size={14} strokeWidth={2} />
                          Cambiar
                        </span>
                      </button>
                    </div>

                    {selectedElementData.type === 'image' && (
                      <>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => loadImageTexture(selectedElementData.id, e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="dropzone px-4 py-4 text-sm text-[#00162d] text-center font-medium flex items-center justify-center gap-2">
                            {selectedElementData.texture ? (
                              <>
                                <Check size={16} strokeWidth={2} />
                                Cambiar imagen
                              </>
                            ) : (
                              <>
                                <Upload size={16} strokeWidth={1.75} />
                                Cargar imagen
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFlipImage(selectedElementData.id)}
                          className="glass-field w-full px-4 py-3 text-sm font-medium text-[#00162d] flex items-center justify-center gap-2 hover:bg-[#00162d]/[0.04] transition-colors"
                        >
                          <FlipHorizontal2 size={16} strokeWidth={1.75} />
                          {selectedElementData.flipped ? 'Desactivar espejo' : 'Activar espejo'}
                        </button>
                      </>
                    )}

                    {selectedElementData.type === 'text' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-[#00162d]/55 mb-2 uppercase tracking-wide">Texto</label>
                          <input
                            type="text"
                            value={selectedElementData.text}
                            onChange={(e) => updateTextElement(selectedElementData.id, 'text', e.target.value)}
                            className="glass-field w-full px-4 py-3 text-sm text-[#00162d]"
                            placeholder="Escribe tu texto"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#00162d]/55 mb-2 uppercase tracking-wide">Fuente</label>
                          <FontSelector
                            options={fontFamilies}
                            value={selectedElementData.fontFamily}
                            onChange={(font) => updateTextElement(selectedElementData.id, 'fontFamily', font)}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#00162d]/55 mb-2 uppercase tracking-wide">Color</label>
                          <div className="glass-field flex items-center gap-3 px-3 py-2.5">
                            <input
                              type="color"
                              value={selectedElementData.color}
                              onChange={(e) => updateTextElement(selectedElementData.id, 'color', e.target.value)}
                              className="color-swatch-input"
                            />
                            <span className="text-sm font-medium text-[#00162d]/70 uppercase tracking-wide">
                              {selectedElementData.color}
                            </span>
                          </div>
                        </div>

                        {/* Toggle Outline */}
                        <div>
                          <label className="block text-xs font-medium text-[#00162d]/55 mb-2 uppercase tracking-wide">Estilo de letra</label>
                          <div className="grid grid-cols-2 gap-2.5">
                            <button
                              type="button"
                              onClick={() => updateTextElement(selectedElementData.id, 'outline', false)}
                              className={`style-toggle ${!selectedElementData.outline ? 'style-toggle-active' : ''}`}
                              style={{ fontFamily: selectedElementData.fontFamily }}
                            >
                              <span className="block text-lg leading-tight">Aa</span>
                              <span className="block text-[11px] mt-1 font-medium tracking-wide">Relleno</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTextElement(selectedElementData.id, 'outline', true)}
                              className={`style-toggle ${selectedElementData.outline ? 'style-toggle-active' : ''}`}
                            >
                              <span
                                className="block text-lg leading-tight"
                                style={{
                                  fontFamily: selectedElementData.fontFamily,
                                  WebkitTextStroke: `1.5px ${selectedElementData.outline ? '#faf7f3' : '#00162d'}`,
                                  WebkitTextFillColor: 'transparent',
                                }}
                              >
                                Aa
                              </span>
                              <span className="block text-[11px] mt-1 font-medium tracking-wide">Contorno</span>
                            </button>
                          </div>
                        </div>

                        {/* Grosor del contorno (solo visible en modo outline) */}
                        {selectedElementData.outline && (
                          <div>
                            <label className="block text-xs font-medium text-[#00162d]/55 mb-2 uppercase tracking-wide">
                              Grosor del contorno — <span className="text-[#00162d] font-semibold">{selectedElementData.outlineWidth ?? 2}</span>
                            </label>
                            <input
                              type="range"
                              min="0.5"
                              max="8"
                              step="0.5"
                              value={selectedElementData.outlineWidth ?? 2}
                              onChange={(e) => updateTextElement(selectedElementData.id, 'outlineWidth', parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-[11px] text-[#00162d]/35 mt-1 tracking-wide">
                              <span>Fino</span>
                              <span>Grueso</span>
                            </div>
                          </div>
                        )}

                      </>
                    )}

                    <div className="pt-4 border-t border-[#00162d]/[0.08]">
                      <p className="flex items-center gap-2 text-xs text-[#00162d]/55 font-medium mb-2.5">
                        <Lightbulb size={14} strokeWidth={1.75} />
                        Controles interactivos
                      </p>
                      <ul className="text-xs text-[#00162d]/55 space-y-1.5">
                        <li className="flex items-center gap-2">
                          <Maximize2 size={12} strokeWidth={2} className="text-[#00162d]/70" />
                          Esquinas: escalar proporcionalmente
                        </li>
                        <li className="flex items-center gap-2">
                          <Maximize2 size={12} strokeWidth={2} className="text-[#3a6b8a] rotate-45" />
                          Aristas: cambiar ancho o alto
                        </li>
                        <li className="flex items-center gap-2">
                          <RotateCw size={12} strokeWidth={2} className="text-[#c9512f]" />
                          Círculo: rotar
                        </li>
                        <li className="flex items-center gap-2">
                          <Move size={12} strokeWidth={2} className="text-[#00162d]/70" />
                          Centro: mover
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card p-5">
                <h3 className="text-[15px] font-semibold text-[#00162d] tracking-tight mb-4">
                  Elementos ({imageElements.length + textElements.length})
                </h3>

                {imageElements.length === 0 && textElements.length === 0 && (
                  <p className="text-sm text-[#00162d]/40 text-center py-4">
                    No hay elementos. Añade una imagen o texto para comenzar.
                  </p>
                )}

                <div className="space-y-2">
                  {imageElements.map((element) => (
                    <button
                      key={`img-${element.id}`}
                      onClick={() => setSelectedElement({ id: element.id, type: 'image' })}
                      className={`element-row ${selectedElement?.id === element.id && selectedElement?.type === 'image' ? 'element-row-active' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ImageIcon size={15} strokeWidth={1.75} className="text-[#00162d]/60" />
                        <span className="font-medium text-[#00162d] text-sm">
                          Imagen #{element.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {element.flipped && (
                          <FlipHorizontal2 size={13} strokeWidth={2} className="text-[#3a6b8a]" />
                        )}
                        <span className="text-[11px] font-medium text-[#00162d]/45 bg-[#00162d]/[0.05] px-2 py-1 rounded-md">
                          {element.side === 'front' ? 'Frente' : 'Trasera'}
                        </span>
                        {element.texture ? (
                          <Check size={14} strokeWidth={2.5} className="text-[#00162d]/50" />
                        ) : (
                          <Circle size={14} strokeWidth={2} className="text-[#00162d]/25" />
                        )}
                      </div>
                    </button>
                  ))}

                  {textElements.map((element) => (
                    <button
                      key={`txt-${element.id}`}
                      onClick={() => setSelectedElement({ id: element.id, type: 'text' })}
                      className={`element-row ${selectedElement?.id === element.id && selectedElement?.type === 'text' ? 'element-row-active' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Type size={15} strokeWidth={1.75} className="text-[#00162d]/60 flex-shrink-0" />
                        <span className="font-medium text-[#00162d] text-sm truncate" style={{ fontFamily: element.fontFamily }}>
                          {element.text.substring(0, 20)}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#00162d]/45 bg-[#00162d]/[0.05] px-2 py-1 rounded-md flex-shrink-0">
                        {element.side === 'front' ? 'Frente' : 'Trasera'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={captureAndRedirectToOrderPage} className="order-btn">
                <ShoppingBag size={18} strokeWidth={1.75} />
                Hacer pedido
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .app-bg {
          background: radial-gradient(120% 100% at 100% 0%, rgba(0, 22, 45, 0.05), transparent 55%),
            linear-gradient(180deg, #faf7f3 0%, #f3eee7 100%);
        }

        .sidebar-panel {
          background: rgba(250, 247, 243, 0.55);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border-left: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: -1px 0 40px rgba(0, 22, 45, 0.04);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 1.25rem;
          box-shadow: 0 4px 24px rgba(0, 22, 45, 0.05);
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .glass-card-accent {
          border: 1px solid rgba(0, 22, 45, 0.12);
          box-shadow: 0 8px 32px rgba(0, 22, 45, 0.08);
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 1rem;
          box-shadow: 0 12px 40px rgba(0, 22, 45, 0.12);
        }

        .glass-chip {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 0.6rem;
          box-shadow: 0 4px 16px rgba(0, 22, 45, 0.06);
        }

        .glass-field {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 22, 45, 0.08);
          border-radius: 0.875rem;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .glass-field:focus,
        .glass-field:focus-within {
          outline: none;
          border-color: rgba(0, 22, 45, 0.3);
          background: rgba(255, 255, 255, 0.7);
        }

        .glass-field-static {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 22, 45, 0.08);
          border-radius: 0.875rem;
        }

        .loader-ring {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 3px solid rgba(0, 22, 45, 0.1);
          border-top-color: rgba(0, 22, 45, 0.55);
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* --- Color swatches --- */
        .swatch {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0, 22, 45, 0.12);
          box-shadow: 0 2px 8px rgba(0, 22, 45, 0.06);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .swatch:hover {
          transform: translateY(-1px);
        }
        .swatch-active {
          border: 2px solid #00162d;
          box-shadow: 0 4px 14px rgba(0, 22, 45, 0.18);
        }

        /* --- Fabric tiles --- */
        .fabric-tile {
          border-radius: 1rem;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 22, 45, 0.08);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .fabric-tile-active {
          border: 1.5px solid #00162d;
          box-shadow: 0 6px 20px rgba(0, 22, 45, 0.1);
        }

        /* --- Size pills --- */
        .size-pill {
          padding: 0.75rem 0;
          border-radius: 0.875rem;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #00162d;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 22, 45, 0.08);
          transition: all 0.2s ease;
        }
        .size-pill:hover {
          border-color: rgba(0, 22, 45, 0.25);
        }
        .size-pill-active {
          background: #00162d;
          color: #faf7f3;
          border-color: #00162d;
          box-shadow: 0 6px 18px rgba(0, 22, 45, 0.22);
        }

        /* --- Quantity stepper --- */
        .stepper-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00162d;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 22, 45, 0.08);
          transition: all 0.2s ease;
        }
        .stepper-btn:hover:not(:disabled) {
          background: rgba(0, 22, 45, 0.06);
          border-color: rgba(0, 22, 45, 0.15);
        }
        .stepper-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* --- Add element buttons --- */
        .add-element-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.1rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #00162d;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 22, 45, 0.08);
          transition: all 0.2s ease;
        }
        .add-element-btn:hover {
          background: #00162d;
          color: #faf7f3;
          box-shadow: 0 8px 20px rgba(0, 22, 45, 0.18);
          transform: translateY(-1px);
        }

        /* --- Generic small icon button --- */
        .icon-ghost-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.7rem;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 22, 45, 0.08);
          transition: all 0.2s ease;
        }
        .icon-ghost-btn:hover {
          background: rgba(201, 81, 47, 0.1);
          border-color: rgba(201, 81, 47, 0.25);
        }

        /* --- Dropzone for image upload --- */
        .dropzone {
          border: 1.5px dashed rgba(0, 22, 45, 0.2);
          border-radius: 0.875rem;
          background: rgba(255, 255, 255, 0.4);
          transition: all 0.2s ease;
        }
        .dropzone:hover {
          border-color: rgba(0, 22, 45, 0.4);
          background: rgba(255, 255, 255, 0.6);
        }

        /* --- Color picker swatch input --- */
        .color-swatch-input {
          width: 34px;
          height: 34px;
          border-radius: 0.6rem;
          border: 1px solid rgba(0, 22, 45, 0.1);
          cursor: pointer;
          padding: 0;
          background: none;
        }

        /* --- Outline / fill style toggle --- */
        .style-toggle {
          padding: 0.7rem 0.5rem;
          border-radius: 0.875rem;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0, 22, 45, 0.08);
          color: #00162d;
          transition: all 0.2s ease;
        }
        .style-toggle-active {
          background: #00162d;
          color: #faf7f3;
          border-color: #00162d;
          box-shadow: 0 6px 18px rgba(0, 22, 45, 0.18);
        }

        /* --- Element list rows --- */
        .element-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.7rem 0.9rem;
          border-radius: 0.875rem;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(0, 22, 45, 0.06);
          transition: all 0.2s ease;
        }
        .element-row:hover {
          border-color: rgba(0, 22, 45, 0.15);
          background: rgba(255, 255, 255, 0.6);
        }
        .element-row-active {
          border-color: #00162d;
          background: rgba(255, 255, 255, 0.75);
          box-shadow: 0 4px 14px rgba(0, 22, 45, 0.08);
        }

        /* --- Order button --- */
        .order-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 1.1rem 0;
          border-radius: 1.1rem;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: #faf7f3;
          background: linear-gradient(135deg, #00162d 0%, #052338 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 10px 30px rgba(0, 22, 45, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .order-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(0, 22, 45, 0.3);
        }
        .order-btn:active {
          transform: translateY(0);
        }

        /* --- Range slider --- */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: rgba(0, 22, 45, 0.12);
          border-radius: 999px;
          outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #00162d;
          border: 2px solid #faf7f3;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 22, 45, 0.25);
          transition: all 0.2s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.12);
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #00162d;
          border: 2px solid #faf7f3;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.12);
        }

        .touch-none {
          touch-action: none;
        }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        /* Scrollbar minimalista */
        .sidebar-panel::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-panel::-webkit-scrollbar-thumb {
          background: rgba(0, 22, 45, 0.12);
          border-radius: 999px;
        }
        .sidebar-panel::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default ShirtDesigner;