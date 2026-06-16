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
        <span style={{ fontFamily: value, fontSize: '1.05rem' }} className="field-text">{value}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`field-icon transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="glass-dropdown absolute z-20 top-full mt-2 w-full max-h-64 overflow-y-auto p-1.5">
          {options.map(group => (
            <div key={group.label}>
              <h5 className="dropdown-label text-[10px] font-semibold uppercase tracking-[0.14em] px-3 pt-3 pb-1.5">
                {group.label}
              </h5>
              <ul>
                {group.fonts.map(font => (
                  <li key={font}>
                    <button
                      type="button"
                      onClick={() => handleSelect(font)}
                      className={`w-full text-left px-3 py-2 text-base rounded-xl transition-colors dropdown-item ${
                        value === font ? 'dropdown-item-active' : ''
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
        <div className="absolute right-[-22px] top-0 bottom-0 flex items-center">
          <div className="guide-line h-full w-px relative">
            <div className="guide-tick absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-px"></div>
            <div className="guide-tick absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-px"></div>
            <div className="absolute top-1/2 left-2.5 -translate-y-1/2 glass-chip px-2 py-1 text-[11px] font-medium whitespace-nowrap chip-text">
              {sizeSpec.height} cm
            </div>
          </div>
        </div>
        <div className="absolute bottom-[-22px] left-0 right-0 flex justify-center">
          <div className="guide-line w-full h-px relative">
            <div className="guide-tick absolute left-0 top-1/2 -translate-y-1/2 h-2.5 w-px"></div>
            <div className="guide-tick absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-px"></div>
            <div className="absolute left-1/2 bottom-2.5 -translate-x-1/2 glass-chip px-2 py-1 text-[11px] font-medium whitespace-nowrap chip-text">
              {sizeSpec.width} cm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- FACTORES DE CALIBRACIÓN UV → CM ---
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

  const CANVAS_SIZE = 2048;

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
    { label: 'Alta Moda — Serif de Lujo', fonts: ['Cormorant', 'Cormorant Garamond', 'Playfair Display', 'Bodoni Moda', 'DM Serif Display', 'Fraunces'] },
    { label: 'Editorial — Estilo Vogue & Dior', fonts: ['Cinzel', 'Cinzel Decorative', 'Tenor Sans', 'Josefin Sans', 'Poiret One', 'Raleway'] },
    { label: 'Minimalismo Chic — Sans Serif', fonts: ['Montserrat', 'Jost', 'Outfit', 'Urbanist', 'Nunito Sans', 'Bebas Neue'] },
    { label: 'Cursivas Elegantes — Haute Couture', fonts: ['Great Vibes', 'Sacramento', 'Allura', 'Pinyon Script', 'Petit Formal Script', 'Italianno'] },
    { label: 'Script con Carácter', fonts: ['Dancing Script', 'Parisienne', 'Alex Brush', 'Carattere', 'Clicker Script', 'Damion'] },
    { label: 'Condensadas de Impacto', fonts: ['Oswald', 'Barlow Condensed', 'Anton', 'Big Shoulders Display', 'Fjalla One', 'Pathway Gothic One'] },
    { label: 'Clásicas & Atemporales', fonts: ['Lora', 'EB Garamond', 'Libre Baskerville', 'Cardo', 'Spectral', 'Arvo'] }
  ];

  const getElementDimensionsInCm = (element) => {
    const shirtWidthCm  = SHIRT_SPECS[currentSize].width;
    const shirtHeightCm = SHIRT_SPECS[currentSize].height;
    const scaleX = element.scaleX ?? element.scale ?? 0;
    const scaleY = element.scaleY ?? element.scale ?? 0;
    const widthCm  = scaleX * shirtWidthCm  * UV_SCALE_FACTOR_W;
    const heightCm = scaleY * shirtHeightCm * UV_SCALE_FACTOR_H;
    return { width: widthCm.toFixed(1), height: heightCm.toFixed(1) };
  };

  const changeSize = (newSize) => {
    if (newSize === currentSize) return;
    const oldWidth = SHIRT_SPECS[currentSize].width;
    const newWidth = SHIRT_SPECS[newSize].width;
    const ratio = oldWidth / newWidth;
    setImageElements(prev => prev.map(el => ({ ...el, scale: el.scale * ratio, scaleX: el.scaleX * ratio, scaleY: el.scaleY * ratio })));
    setTextElements(prev => prev.map(el => ({ ...el, scale: el.scale * ratio, scaleX: el.scaleX * ratio, scaleY: el.scaleY * ratio })));
    setCurrentSize(newSize);
  };

  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const width = viewer.clientWidth;
    const height = viewer.clientHeight;
    const scene = new THREE.Scene();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    scene.background = new THREE.Color(isDark ? 0x080a0f : 0xfaf7f3);
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
    imageElements.forEach(element => { if (element.texture && element.side === 'front') drawElementOnCanvas(ctx, element, canvas.width, canvas.height, 'front'); });
    textElements.forEach(element => { if (element.side === 'front') drawTextOnCanvas(ctx, element, canvas.width, canvas.height, 'front'); });
    imageElements.forEach(element => { if (element.texture && element.side === 'back') drawElementOnCanvas(ctx, element, canvas.width, canvas.height, 'back'); });
    textElements.forEach(element => { if (element.side === 'back') drawTextOnCanvas(ctx, element, canvas.width, canvas.height, 'back'); });
    if (selectedElementRef.current) {
      const element = [...imageElements, ...textElements].find(el => el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type);
      if (element) {
        const elementOnFront = element.side === 'front';
        const viewingFront = isElementOnFront(element);
        if (elementOnFront === viewingFront) drawControlsOnCanvas(ctx, element, canvas.width, canvas.height, element.side);
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
          if (mat.roughness !== undefined) mat.roughness = 1.0;
          if (mat.metalness !== undefined) mat.metalness = 0.0;
          if (mat.emissive !== undefined) mat.emissive.set(0x000000);
          if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0;
          mat.needsUpdate = true;
          materialsWithTexture.current.add(uuidKey);
        };
        if (Array.isArray(child.material)) {
          child.material.forEach((mat, index) => applyTextureToMaterial(mat, `${child.uuid}_${index}`));
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

  useEffect(() => {
    const updateSceneBg = () => {
      if (!sceneRef.current) return;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      sceneRef.current.background = new THREE.Color(isDark ? 0x080a0f : 0xfaf7f3);
    };
    updateSceneBg();
    const observer = new MutationObserver(updateSceneBg);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

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
    if (element.type === 'image' && element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
    else if (element.type === 'text') aspectRatio = 0.3;
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
    const corners = [{ x: -elementWidth / 2, y: -elementHeight / 2 }, { x: elementWidth / 2, y: -elementHeight / 2 }, { x: -elementWidth / 2, y: elementHeight / 2 }, { x: elementWidth / 2, y: elementHeight / 2 }];
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
    corners.forEach(corner => drawHandle(corner.x, corner.y, '#00162d'));
    const edges = [{ x: 0, y: -elementHeight / 2 }, { x: 0, y: elementHeight / 2 }, { x: -elementWidth / 2, y: 0 }, { x: elementWidth / 2, y: 0 }];
    edges.forEach(edge => drawHandle(edge.x, edge.y, '#3a6b8a'));
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
    const widthTextY = elementHeight / 2 + 50;
    const widthText = `${dims.width} cm`;
    ctx.strokeText(widthText, 0, widthTextY);
    ctx.fillText(widthText, 0, widthTextY);
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
    if (element.type === 'image' && element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
    else if (element.type === 'text') aspectRatio = 0.3;
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
    if (Math.abs(rotatedU) < handleSizeUV && Math.abs(rotatedV - rotateDistanceUV) < handleSizeUV) return 'rotate';
    const halfU = elementWidthUV / 2;
    const halfV = elementHeightUV / 2;
    const corners = [{ u: -halfU, v: halfV, name: 'scale-nw' }, { u: halfU, v: halfV, name: 'scale-ne' }, { u: -halfU, v: -halfV, name: 'scale-sw' }, { u: halfU, v: -halfV, name: 'scale-se' }];
    for (const corner of corners) {
      if (Math.abs(rotatedU - corner.u) < handleSizeUV && Math.abs(rotatedV - corner.v) < handleSizeUV) return corner.name;
    }
    const edges = [{ u: 0, v: halfV, name: 'edge-n' }, { u: 0, v: -halfV, name: 'edge-s' }, { u: -halfU, v: 0, name: 'edge-w' }, { u: halfU, v: 0, name: 'edge-e' }];
    for (const edge of edges) {
      if (Math.abs(rotatedU - edge.u) < handleSizeUV && Math.abs(rotatedV - edge.v) < handleSizeUV) return edge.name;
    }
    if (Math.abs(rotatedU) < halfU * 1.2 && Math.abs(rotatedV) < halfV * 1.2) return 'move';
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
      const selectedEl = allElements.find(el => el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type);
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
    const localPosition = new THREE.Vector3(element.offsetX * MODEL_OFFSET_SCALE, (baseY + element.offsetY) * MODEL_OFFSET_SCALE, zPosition);
    const worldPosition = localPosition.clone();
    modelRef.current.localToWorld(worldPosition);
    worldPosition.project(cameraRef.current);
    const rect = viewerRef.current.getBoundingClientRect();
    return { x: (worldPosition.x * 0.5 + 0.5) * rect.width, y: (-worldPosition.y * 0.5 + 0.5) * rect.height };
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
          if (element.type === 'image' && element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
          else if (element.type === 'text') aspectRatio = 0.3;
          scaleStart.current = { distance, elementScale: element.scale, width: element.scaleX || element.scale, height: element.scaleY || (element.scale * aspectRatio), startX: clientX, startY: clientY };
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
        const element = [...imageElementsRef.current, ...textElementsRef.current].find(el => el.id === currentSelected.id && el.type === currentSelected.type);
        if (!element) return;
        if (currentHandle === 'move') {
          const deltaPixelsX = x - dragStart.current.x;
          const deltaPixelsY = y - dragStart.current.y;
          const worldDelta = screenToWorldDelta(deltaPixelsX, deltaPixelsY);
          const newOffsetX = dragStart.current.elementX + worldDelta.x;
          const newOffsetY = dragStart.current.elementY + worldDelta.y;
          if (element.type === 'image') { updateImageElement(element.id, 'offsetX', newOffsetX); updateImageElement(element.id, 'offsetY', newOffsetY); }
          else { updateTextElement(element.id, 'offsetX', newOffsetX); updateTextElement(element.id, 'offsetY', newOffsetY); }
        } else if (currentHandle === 'rotate') {
          const pos = get2DPositionFromElement(element);
          const angle = Math.atan2(y - pos.y, x - pos.x);
          const rotation = rotateStart.current.elementRotation + (angle - rotateStart.current.angle);
          if (element.type === 'image') updateImageElement(element.id, 'rotation', rotation);
          else updateTextElement(element.id, 'rotation', rotation);
        } else if (currentHandle.startsWith('scale-')) {
          const pos = get2DPositionFromElement(element);
          const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          const scaleFactor = distance / scaleStart.current.distance;
          const newScale = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.elementScale * scaleFactor));
          if (element.type === 'image') {
            updateImageElement(element.id, 'scale', newScale);
            updateImageElement(element.id, 'scaleX', newScale);
            let aspectRatio = 1;
            if (element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
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
            if (element.type === 'image') updateImageElement(element.id, 'scaleY', newHeight);
            else updateTextElement(element.id, 'scaleY', newHeight);
          } else if (currentHandle === 'edge-w' || currentHandle === 'edge-e') {
            const deltaScale = (currentHandle === 'edge-w' ? -deltaX : deltaX) * pixelToScale;
            const newWidth = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.width + deltaScale));
            if (element.type === 'image') updateImageElement(element.id, 'scaleX', newWidth);
            else updateTextElement(element.id, 'scaleX', newWidth);
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
          if (handle === 'rotate') canvas.style.cursor = 'grab';
          else if (handle.startsWith('scale-')) canvas.style.cursor = (handle === 'scale-nw' || handle === 'scale-se') ? 'nwse-resize' : 'nesw-resize';
          else if (handle.startsWith('edge-')) canvas.style.cursor = (handle === 'edge-n' || handle === 'edge-s') ? 'ns-resize' : 'ew-resize';
          else if (handle === 'move') canvas.style.cursor = 'move';
        } else canvas.style.cursor = 'default';
      }
    });

    canvas.addEventListener('mouseup', () => { isMouseDown.current = false; isInteractingWithElement.current = false; setActiveHandle(null); });
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
          if (handle === 'move') dragStart.current = { x: clientX, y: clientY, elementX: element.offsetX, elementY: element.offsetY };
          else if (handle === 'rotate') { const pos = get2DPositionFromElement(element); const angle = Math.atan2(clientY - pos.y, clientX - pos.x); rotateStart.current = { angle, elementRotation: element.rotation || 0 }; }
          else if (handle.startsWith('scale-') || handle.startsWith('edge-')) {
            const pos = get2DPositionFromElement(element);
            const distance = Math.sqrt((clientX - pos.x) ** 2 + (clientY - pos.y) ** 2);
            let aspectRatio = 1;
            if (element.type === 'image' && element.texture?.image) aspectRatio = element.texture.image.height / element.texture.image.width;
            else if (element.type === 'text') aspectRatio = 0.3;
            scaleStart.current = { distance, elementScale: element.scale, width: element.scaleX || element.scale, height: element.scaleY || (element.scale * aspectRatio), startX: clientX, startY: clientY };
          }
        } else { isTouchActive.current = true; mousePos.current = { x: touch.clientX, y: touch.clientY }; }
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
          const element = [...imageElementsRef.current, ...textElementsRef.current].find(el => el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type);
          if (!element) return;
          if (currentHandle === 'move') {
            const worldDelta = screenToWorldDelta(x - dragStart.current.x, y - dragStart.current.y);
            const newOffsetX = dragStart.current.elementX + worldDelta.x;
            const newOffsetY = dragStart.current.elementY + worldDelta.y;
            if (element.type === 'image') { updateImageElement(element.id, 'offsetX', newOffsetX); updateImageElement(element.id, 'offsetY', newOffsetY); }
            else { updateTextElement(element.id, 'offsetX', newOffsetX); updateTextElement(element.id, 'offsetY', newOffsetY); }
          } else if (currentHandle === 'rotate') {
            const pos = get2DPositionFromElement(element);
            const angle = Math.atan2(y - pos.y, x - pos.x);
            const rotation = rotateStart.current.elementRotation + (angle - rotateStart.current.angle);
            if (element.type === 'image') updateImageElement(element.id, 'rotation', rotation);
            else updateTextElement(element.id, 'rotation', rotation);
          } else if (currentHandle.startsWith('scale-')) {
            const pos = get2DPositionFromElement(element);
            const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            const scaleFactor = distance / scaleStart.current.distance;
            const newScale = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.elementScale * scaleFactor));
            if (element.type === 'image') {
              updateImageElement(element.id, 'scale', newScale);
              updateImageElement(element.id, 'scaleX', newScale);
              let ar = 1; if (element.texture?.image) ar = element.texture.image.height / element.texture.image.width;
              updateImageElement(element.id, 'scaleY', newScale * ar);
            } else { updateTextElement(element.id, 'scale', newScale); updateTextElement(element.id, 'scaleX', newScale); updateTextElement(element.id, 'scaleY', newScale * 0.3); }
          } else if (currentHandle.startsWith('edge-')) {
            const pixelToScale = 1 / (viewerRef.current.clientHeight / 2);
            if (currentHandle === 'edge-n' || currentHandle === 'edge-s') {
              const dY = (currentHandle === 'edge-n' ? -(y - scaleStart.current.startY) : (y - scaleStart.current.startY)) * pixelToScale;
              const newH = Math.max(0.02, Math.min(UV_SCALE_FACTOR_H, scaleStart.current.height + dY));
              if (element.type === 'image') updateImageElement(element.id, 'scaleY', newH); else updateTextElement(element.id, 'scaleY', newH);
            } else {
              const dX = (currentHandle === 'edge-w' ? -(x - scaleStart.current.startX) : (x - scaleStart.current.startX)) * pixelToScale;
              const newW = Math.max(0.02, Math.min(UV_SCALE_FACTOR_W, scaleStart.current.width + dX));
              if (element.type === 'image') updateImageElement(element.id, 'scaleX', newW); else updateTextElement(element.id, 'scaleX', newW);
            }
          }
        } else if (isTouchActive.current && modelRef.current) {
          modelRef.current.rotation.y += (touch.clientX - mousePos.current.x) * 0.01;
          modelRef.current.rotation.x += (touch.clientY - mousePos.current.y) * 0.01;
          mousePos.current = { x: touch.clientX, y: touch.clientY };
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delta = distance - touchDistance.current;
        cameraRef.current.position.z = Math.max(1, Math.min(10, cameraRef.current.position.z - delta * 0.01));
        touchDistance.current = distance;
      }
    });
    canvas.addEventListener('touchend', () => { isTouchActive.current = false; isInteractingWithElement.current = false; setActiveHandle(null); });
  };

  const loadModelFromPath = (path) => {
    setIsLoadingModel(true);
    const loader = new GLTFLoader();
    loader.load(path,
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
        model.scale.setScalar(2 / maxDim);
        sceneRef.current.add(model);
        setIsModelLoaded(true);
        setIsLoadingModel(false);
      },
      (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% cargado'),
      (error) => { console.error('Error al cargar modelo:', error); setIsLoadingModel(false); alert('No se pudo cargar el modelo 3D.'); }
    );
  };

  const clearScene = () => {
    if (modelRef.current) { sceneRef.current.remove(modelRef.current); modelRef.current = null; }
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
          child.material.forEach((mat, index) => { originalMaterials.current.set(`${child.uuid}_${index}`, { color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff), map: mat.map ? mat.map.clone() : null }); });
        } else {
          originalMaterials.current.set(child.uuid, { color: child.material.color ? child.material.color.clone() : new THREE.Color(0xffffff), map: child.material.map ? child.material.map.clone() : null });
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
    const initialOffsetY = currentSide === 'front' ? 0.0625 : 0.25;
    setImageElements(prev => [...prev, { id, type: 'image', texture: null, scale: 0.2, scaleX: 0.2, scaleY: 0.2, offsetX: 0, offsetY: initialOffsetY, rotation: 0, side: currentSide, flipped: false }]);
    setSelectedElement({ id, type: 'image' });
  };

  const addText = () => {
    const id = elementIdCounter + 1;
    setElementIdCounter(id);
    const currentSide = isElementOnFront({ side: 'front' }) ? 'front' : 'back';
    const initialOffsetY = currentSide === 'front' ? 0.0625 : 0.25;
    setTextElements(prev => [...prev, { id, type: 'text', text: 'Texto ejemplo', fontFamily: 'Great Vibes', color: '#000000', outline: false, outlineWidth: 2, scale: 0.2, scaleX: 0.2, scaleY: 0.06, offsetX: 0, offsetY: initialOffsetY, rotation: 0, side: currentSide }]);
    setSelectedElement({ id, type: 'text' });
  };

  const updateImageElement = (id, property, value) => setImageElements(prev => prev.map(el => el.id === id ? { ...el, [property]: value } : el));
  const updateTextElement = (id, property, value) => setTextElements(prev => prev.map(el => el.id === id ? { ...el, [property]: value } : el));

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
        setImageElements(prev => prev.map(el => { if (el.id === id) { const ar = img.height / img.width; return { ...el, texture, scaleY: el.scaleX * ar }; } return el; }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (id) => { setImageElements(prev => prev.filter(el => el.id !== id)); if (selectedElement?.id === id && selectedElement?.type === 'image') setSelectedElement(null); };
  const removeText = (id) => { setTextElements(prev => prev.filter(el => el.id !== id)); if (selectedElement?.id === id && selectedElement?.type === 'text') setSelectedElement(null); };

  const toggleElementSide = (id, type) => {
    if (type === 'image') setImageElements(prev => prev.map(el => el.id === id ? { ...el, side: el.side === 'front' ? 'back' : 'front' } : el));
    else setTextElements(prev => prev.map(el => el.id === id ? { ...el, side: el.side === 'front' ? 'back' : 'front' } : el));
  };

  const toggleFlipImage = (id) => setImageElements(prev => prev.map(el => el.id === id ? { ...el, flipped: !el.flipped } : el));

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
    const BASE_FONT_SIZE = 200;
    const boxWidth = (element.scaleX || element.scale) * pixelScale;
    const boxHeight = (element.scaleY || (element.scale * 0.3)) * pixelScale;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(element.rotation || 0);
    ctx.font = `${BASE_FONT_SIZE}px ${element.fontFamily}`;
    const measuredWidth = ctx.measureText(element.text).width || 1;
    ctx.scale(boxWidth / measuredWidth, boxHeight / BASE_FONT_SIZE);
    ctx.font = `${BASE_FONT_SIZE}px ${element.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (element.outline) {
      const strokeW = (element.outlineWidth || 2) * (BASE_FONT_SIZE / 40);
      ctx.lineWidth = strokeW;
      ctx.strokeStyle = element.color;
      ctx.lineJoin = 'round';
      ctx.strokeText(element.text, 0, 0);
    } else {
      ctx.fillStyle = element.color;
      ctx.fillText(element.text, 0, 0);
    }
    ctx.restore();
  };

  const captureScreenshot = (rotationY) => {
    return new Promise((resolve) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !modelRef.current) { resolve(null); return; }
      const originalRotationY = modelRef.current.rotation.y;
      const isAnythingSelected = !!selectedElementRef.current;
      if (isAnythingSelected) setSelectedElement(null);
      const originalCameraZ = cameraRef.current.position.z;
      const originalCameraX = cameraRef.current.position.x;
      const originalCameraY = cameraRef.current.position.y;
      const originalAspect = cameraRef.current.aspect;
      const CAPTURE_SIZE = 900;
      modelRef.current.rotation.y = rotationY;
      rendererRef.current.setSize(CAPTURE_SIZE, CAPTURE_SIZE);
      cameraRef.current.aspect = 1;
      cameraRef.current.position.set(0, 0, 1.5);
      cameraRef.current.updateProjectionMatrix();
      setTimeout(() => {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataURL = rendererRef.current.domElement.toDataURL('image/png');
        modelRef.current.rotation.y = originalRotationY;
        cameraRef.current.position.set(originalCameraX, originalCameraY, originalCameraZ);
        cameraRef.current.aspect = originalAspect;
        cameraRef.current.updateProjectionMatrix();
        const viewer = rendererRef.current.domElement.parentElement;
        if (viewer) rendererRef.current.setSize(viewer.clientWidth, viewer.clientHeight);
        resolve(dataURL);
      }, 80);
    });
  };

  const captureAndRedirectToOrderPage = async () => {
    if (!isModelLoaded) { alert("El modelo 3D aún se está cargando. Por favor, espera un momento."); return; }
    const tempSelected = selectedElementRef.current;
    setSelectedElement(null);
    await new Promise(resolve => setTimeout(resolve, 50));
    const frontImage = await captureScreenshot(0);
    const backImage = await captureScreenshot(Math.PI);
    const designData = { shirtColor: currentShirtColor, fabricType: currentFabric, size: currentSize, quantity, imageElements: imageElements.map(el => ({ ...el, texture: null })), textElements, frontImage, backImage };
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
    if (selectedElement.type === 'image') return imageElements.find(el => el.id === selectedElement.id);
    return textElements.find(el => el.id === selectedElement.id);
  };

  const selectedElementData = getSelectedElementData();

  const SectionHeader = ({ icon: Icon, title, isOpen, onToggle }) => (
    <button onClick={onToggle} className="w-full flex justify-between items-center text-left group">
      <div className="flex items-center gap-2.5">
        <span className="section-icon-wrap flex items-center justify-center w-8 h-8 rounded-xl">
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <h3 className="section-title text-[15px] font-semibold tracking-tight">{title}</h3>
      </div>
      <ChevronDown size={18} strokeWidth={2} className={`chevron transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row sg-designer-bg">
      <div className="h-[50vh] lg:flex-1 lg:h-screen overflow-hidden relative">
        <div className="h-full w-full overflow-hidden flex items-center justify-center relative">
          <div ref={viewerRef} className="w-full h-full relative touch-none z-10">
            {isLoadingModel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="loader-ring mb-4"></div>
                <p className="loader-text text-sm font-medium tracking-wide">Cargando modelo 3D…</p>
              </div>
            )}
            {!isLoadingModel && !isModelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-sm error-text">
                <p>No se pudo cargar el modelo 3D</p>
              </div>
            )}
          </div>
          {isModelLoaded && <DimensionGuides sizeSpec={SHIRT_SPECS[currentSize]} />}
          {isModelLoaded && (
            <div className="absolute top-5 left-5 glass-chip px-3.5 py-1.5 text-xs font-semibold tracking-wide z-20 chip-text">
              Talla {currentSize}
            </div>
          )}
        </div>
      </div>

      <div className="h-[50vh] lg:h-screen w-full lg:w-[26rem] p-5 lg:p-6 overflow-y-auto z-10 sidebar-panel">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="heading-primary text-2xl font-semibold tracking-tight">Diseñador 3D</h2>
          <span className="heading-label text-[11px] uppercase tracking-[0.18em] font-medium">Personaliza</span>
        </div>

        <div className="space-y-5">
          {isModelLoaded && (
            <>
              {/* Color */}
              <div className="glass-card p-5">
                <SectionHeader icon={Palette} title="Color de la camisa" isOpen={isColorSectionOpen} onToggle={() => setIsColorSectionOpen(!isColorSectionOpen)} />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isColorSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="flex gap-3">
                    {shirtColors.map(({ color, name }) => (
                      <button key={color} onClick={() => changeColor(color)} className={`swatch ${currentShirtColor === color ? 'swatch-active' : ''}`} style={{ backgroundColor: color }} title={name}>
                        {currentShirtColor === color && <Check size={14} strokeWidth={3} className={color === '#ffffff' ? 'text-[#00162d]' : 'text-[#faf7f3]'} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tela */}
              <div className="glass-card p-5">
                <SectionHeader icon={Layers} title="Tipo de tela" isOpen={isFabricSectionOpen} onToggle={() => setIsFabricSectionOpen(!isFabricSectionOpen)} />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFabricSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="grid grid-cols-2 gap-3">
                    {fabricTypes.map(({ id, name, image }) => (
                      <button key={id} onClick={() => changeFabric(id)} className={`fabric-tile ${currentFabric === id ? 'fabric-tile-active' : ''}`}>
                        <div className="aspect-square fabric-img-bg flex items-center justify-center overflow-hidden rounded-t-2xl">
                          <img src={image} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="no-img text-xs p-2">Sin imagen</div>'; }} />
                        </div>
                        <div className="py-2 text-center text-sm font-medium fabric-name">{name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Talla */}
              <div className="glass-card p-5">
                <SectionHeader icon={Ruler} title="Talla" isOpen={isSizeSectionOpen} onToggle={() => setIsSizeSectionOpen(!isSizeSectionOpen)} />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSizeSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="grid grid-cols-4 gap-2.5">
                    {shirtSizes.map((size) => (
                      <button key={size} onClick={() => changeSize(size)} className={`size-pill ${currentSize === size ? 'size-pill-active' : ''}`}>{size}</button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs size-hint text-center tracking-wide">
                    {SHIRT_SPECS[currentSize].width} cm de ancho · {SHIRT_SPECS[currentSize].height} cm de alto
                  </p>
                </div>
              </div>

              {/* Cantidad */}
              <div className="glass-card p-5">
                <SectionHeader icon={Layers} title="Cantidad" isOpen={isQuantitySectionOpen} onToggle={() => setIsQuantitySectionOpen(!isQuantitySectionOpen)} />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isQuantitySectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="stepper-btn" aria-label="Disminuir cantidad"><Minus size={16} strokeWidth={2.5} /></button>
                    <input type="number" value={quantity} onChange={(e) => { const val = parseInt(e.target.value, 10); setQuantity(val >= 1 ? val : 1); }} className="glass-field quantity-input w-20 h-12 text-center text-lg font-semibold" min="1" />
                    <button onClick={() => setQuantity(q => q + 1)} className="stepper-btn" aria-label="Aumentar cantidad"><Plus size={16} strokeWidth={2.5} /></button>
                  </div>
                </div>
              </div>

              {/* Añadir elementos */}
              <div className="glass-card p-5">
                <h3 className="section-title text-[15px] font-semibold tracking-tight mb-4">Añadir elementos</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={addImage} className="add-element-btn"><ImageIcon size={20} strokeWidth={1.75} /><span>Imagen</span></button>
                  <button onClick={addText} className="add-element-btn"><Type size={20} strokeWidth={1.75} /><span>Texto</span></button>
                </div>
              </div>

              {/* Editor elemento seleccionado */}
              {selectedElementData && (
                <div className="glass-card glass-card-accent p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="accent-icon-wrap flex items-center justify-center w-8 h-8 rounded-xl">
                        {selectedElementData.type === 'image' ? <ImageIcon size={15} strokeWidth={1.75} /> : <Type size={15} strokeWidth={1.75} />}
                      </span>
                      <h3 className="section-title text-[15px] font-semibold tracking-tight">
                        {selectedElementData.type === 'image' ? 'Imagen' : 'Texto'} · #{selectedElementData.id}
                      </h3>
                    </div>
                    <button onClick={() => { if (selectedElementData.type === 'image') removeImage(selectedElementData.id); else removeText(selectedElementData.id); }} className="icon-ghost-btn icon-delete" aria-label="Eliminar elemento">
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="glass-field-static px-4 py-3">
                      <div className="dims-label text-[11px] uppercase tracking-[0.14em] font-medium mb-1">Dimensiones reales</div>
                      <div className="dims-value text-lg font-semibold">
                        {getElementDimensionsInCm(selectedElementData).width} × {getElementDimensionsInCm(selectedElementData).height} cm
                      </div>
                      <div className="dims-hint text-[11px] mt-0.5">Ajustado para talla {currentSize}</div>
                    </div>

                    <div>
                      <label className="field-label block text-xs font-medium mb-2 uppercase tracking-wide">Lado de la camisa</label>
                      <button onClick={() => toggleElementSide(selectedElementData.id, selectedElementData.type)} className="glass-field toggle-field w-full px-4 py-3 text-sm font-medium flex items-center justify-between transition-colors">
                        <span className="field-text">{selectedElementData.side === 'front' ? 'Frente' : 'Parte trasera'}</span>
                        <span className="flex items-center gap-1.5 text-xs toggle-hint"><RotateCcw size={14} strokeWidth={2} />Cambiar</span>
                      </button>
                    </div>

                    {selectedElementData.type === 'image' && (
                      <>
                        <div className="relative">
                          <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => loadImageTexture(selectedElementData.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="dropzone px-4 py-4 text-sm text-center font-medium flex items-center justify-center gap-2 dropzone-text">
                            {selectedElementData.texture ? <><Check size={16} strokeWidth={2} />Cambiar imagen</> : <><Upload size={16} strokeWidth={1.75} />Cargar imagen</>}
                          </div>
                        </div>
                        <button onClick={() => toggleFlipImage(selectedElementData.id)} className="glass-field toggle-field w-full px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors field-text">
                          <FlipHorizontal2 size={16} strokeWidth={1.75} />
                          {selectedElementData.flipped ? 'Desactivar espejo' : 'Activar espejo'}
                        </button>
                      </>
                    )}

                    {selectedElementData.type === 'text' && (
                      <>
                        <div>
                          <label className="field-label block text-xs font-medium mb-2 uppercase tracking-wide">Texto</label>
                          <input type="text" value={selectedElementData.text} onChange={(e) => updateTextElement(selectedElementData.id, 'text', e.target.value)} className="glass-field field-input w-full px-4 py-3 text-sm" placeholder="Escribe tu texto" />
                        </div>
                        <div>
                          <label className="field-label block text-xs font-medium mb-2 uppercase tracking-wide">Fuente</label>
                          <FontSelector options={fontFamilies} value={selectedElementData.fontFamily} onChange={(font) => updateTextElement(selectedElementData.id, 'fontFamily', font)} />
                        </div>
                        <div>
                          <label className="field-label block text-xs font-medium mb-2 uppercase tracking-wide">Color</label>
                          <div className="glass-field flex items-center gap-3 px-3 py-2.5">
                            <input type="color" value={selectedElementData.color} onChange={(e) => updateTextElement(selectedElementData.id, 'color', e.target.value)} className="color-swatch-input" />
                            <span className="text-sm font-medium uppercase tracking-wide color-hex">{selectedElementData.color}</span>
                          </div>
                        </div>
                        <div>
                          <label className="field-label block text-xs font-medium mb-2 uppercase tracking-wide">Estilo de letra</label>
                          <div className="grid grid-cols-2 gap-2.5">
                            <button type="button" onClick={() => updateTextElement(selectedElementData.id, 'outline', false)} className={`style-toggle ${!selectedElementData.outline ? 'style-toggle-active' : ''}`} style={{ fontFamily: selectedElementData.fontFamily }}>
                              <span className="block text-lg leading-tight">Aa</span>
                              <span className="block text-[11px] mt-1 font-medium tracking-wide">Relleno</span>
                            </button>
                            <button type="button" onClick={() => updateTextElement(selectedElementData.id, 'outline', true)} className={`style-toggle ${selectedElementData.outline ? 'style-toggle-active' : ''}`}>
                              <span className="block text-lg leading-tight" style={{ fontFamily: selectedElementData.fontFamily, WebkitTextStroke: `1.5px currentColor`, WebkitTextFillColor: 'transparent' }}>Aa</span>
                              <span className="block text-[11px] mt-1 font-medium tracking-wide">Contorno</span>
                            </button>
                          </div>
                        </div>
                        {selectedElementData.outline && (
                          <div>
                            <label className="field-label block text-xs font-medium mb-2 uppercase tracking-wide">
                              Grosor del contorno — <span className="section-title font-semibold">{selectedElementData.outlineWidth ?? 2}</span>
                            </label>
                            <input type="range" min="0.5" max="8" step="0.5" value={selectedElementData.outlineWidth ?? 2} onChange={(e) => updateTextElement(selectedElementData.id, 'outlineWidth', parseFloat(e.target.value))} className="w-full" />
                            <div className="flex justify-between text-[11px] mt-1 tracking-wide range-labels"><span>Fino</span><span>Grueso</span></div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="pt-4 controls-divider border-t">
                      <p className="flex items-center gap-2 text-xs font-medium mb-2.5 controls-hint">
                        <Lightbulb size={14} strokeWidth={1.75} />Controles interactivos
                      </p>
                      <ul className="text-xs space-y-1.5 controls-hint">
                        <li className="flex items-center gap-2"><Maximize2 size={12} strokeWidth={2} className="controls-icon-primary" />Esquinas: escalar proporcionalmente</li>
                        <li className="flex items-center gap-2"><Maximize2 size={12} strokeWidth={2} className="controls-icon-secondary rotate-45" />Aristas: cambiar ancho o alto</li>
                        <li className="flex items-center gap-2"><RotateCw size={12} strokeWidth={2} className="controls-icon-accent" />Círculo: rotar</li>
                        <li className="flex items-center gap-2"><Move size={12} strokeWidth={2} className="controls-icon-primary" />Centro: mover</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista elementos */}
              <div className="glass-card p-5">
                <h3 className="section-title text-[15px] font-semibold tracking-tight mb-4">
                  Elementos ({imageElements.length + textElements.length})
                </h3>
                {imageElements.length === 0 && textElements.length === 0 && (
                  <p className="text-sm text-center py-4 empty-text">No hay elementos. Añade una imagen o texto para comenzar.</p>
                )}
                <div className="space-y-2">
                  {imageElements.map((element) => (
                    <button key={`img-${element.id}`} onClick={() => setSelectedElement({ id: element.id, type: 'image' })} className={`element-row ${selectedElement?.id === element.id && selectedElement?.type === 'image' ? 'element-row-active' : ''}`}>
                      <div className="flex items-center gap-2.5">
                        <ImageIcon size={15} strokeWidth={1.75} className="element-icon" />
                        <span className="font-medium text-sm element-name">Imagen #{element.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {element.flipped && <FlipHorizontal2 size={13} strokeWidth={2} className="element-badge-icon" />}
                        <span className="element-badge text-[11px] font-medium px-2 py-1 rounded-md">{element.side === 'front' ? 'Frente' : 'Trasera'}</span>
                        {element.texture ? <Check size={14} strokeWidth={2.5} className="element-check" /> : <Circle size={14} strokeWidth={2} className="element-empty-check" />}
                      </div>
                    </button>
                  ))}
                  {textElements.map((element) => (
                    <button key={`txt-${element.id}`} onClick={() => setSelectedElement({ id: element.id, type: 'text' })} className={`element-row ${selectedElement?.id === element.id && selectedElement?.type === 'text' ? 'element-row-active' : ''}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Type size={15} strokeWidth={1.75} className="element-icon flex-shrink-0" />
                        <span className="font-medium text-sm truncate element-name" style={{ fontFamily: element.fontFamily }}>{element.text.substring(0, 20)}</span>
                      </div>
                      <span className="element-badge text-[11px] font-medium px-2 py-1 rounded-md flex-shrink-0">{element.side === 'front' ? 'Frente' : 'Trasera'}</span>
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

      <style>{`
        /* ============================================================
           DESIGN TOKENS — Light & Dark
        ============================================================ */

        /* Light base (default) */
        :root,
        [data-theme="light"] {
          --bg-page-from: #faf7f3;
          --bg-page-to: #f3eee7;
          --bg-noise-line-v: rgba(0,22,45,0.035);
          --bg-noise-line-h: rgba(0,22,45,0.026);
          --bg-streak-a: rgba(120,101,77,0.08);
          --bg-streak-b: rgba(0,22,45,0.055);
          --bg-radial-a: rgba(174,153,118,0.18);
          --bg-radial-b: rgba(112,139,146,0.13);

          --sidebar-bg: rgba(250,247,243,0.55);
          --sidebar-blur: blur(28px) saturate(160%);
          --sidebar-border: rgba(255,255,255,0.5);
          --sidebar-shadow: rgba(0,22,45,0.04);

          --card-bg: rgba(255,255,255,0.55);
          --card-blur: blur(20px) saturate(180%);
          --card-border: rgba(255,255,255,0.65);
          --card-shadow: rgba(0,22,45,0.05);
          --card-accent-border: rgba(0,22,45,0.12);
          --card-accent-shadow: rgba(0,22,45,0.08);

          --panel-bg: rgba(255,255,255,0.75);
          --panel-border: rgba(255,255,255,0.7);
          --panel-shadow: rgba(0,22,45,0.12);

          --chip-bg: rgba(255,255,255,0.6);
          --chip-border: rgba(255,255,255,0.7);
          --chip-shadow: rgba(0,22,45,0.06);

          --field-bg: rgba(255,255,255,0.5);
          --field-border: rgba(0,22,45,0.08);
          --field-focus-border: rgba(0,22,45,0.3);
          --field-focus-bg: rgba(255,255,255,0.7);
          --field-hover-bg: rgba(0,22,45,0.04);

          --text-primary: #00162d;
          --text-secondary: rgba(0,22,45,0.55);
          --text-tertiary: rgba(0,22,45,0.4);
          --text-muted: rgba(0,22,45,0.35);

          --accent-icon-bg: #00162d;
          --accent-icon-fg: #faf7f3;
          --section-icon-bg: rgba(0,22,45,0.05);

          --swatch-border: rgba(0,22,45,0.12);
          --swatch-active-border: #00162d;
          --swatch-shadow: rgba(0,22,45,0.06);
          --swatch-active-shadow: rgba(0,22,45,0.18);

          --size-pill-bg: rgba(255,255,255,0.5);
          --size-pill-border: rgba(0,22,45,0.08);
          --size-pill-color: #00162d;
          --size-pill-active-bg: #00162d;
          --size-pill-active-color: #faf7f3;
          --size-pill-hover-border: rgba(0,22,45,0.25);

          --stepper-bg: rgba(255,255,255,0.5);
          --stepper-border: rgba(0,22,45,0.08);
          --stepper-color: #00162d;
          --stepper-hover-bg: rgba(0,22,45,0.06);

          --add-btn-bg: rgba(255,255,255,0.5);
          --add-btn-border: rgba(0,22,45,0.08);
          --add-btn-color: #00162d;
          --add-btn-hover-bg: #00162d;
          --add-btn-hover-color: #faf7f3;
          --add-btn-hover-shadow: rgba(0,22,45,0.18);

          --delete-btn-bg: rgba(255,255,255,0.5);
          --delete-btn-border: rgba(0,22,45,0.08);
          --delete-btn-hover-bg: rgba(201,81,47,0.1);
          --delete-btn-hover-border: rgba(201,81,47,0.25);
          --delete-icon-color: #c9512f;

          --dropzone-border: rgba(0,22,45,0.2);
          --dropzone-bg: rgba(255,255,255,0.4);
          --dropzone-hover-border: rgba(0,22,45,0.4);
          --dropzone-hover-bg: rgba(255,255,255,0.6);

          --style-toggle-bg: rgba(255,255,255,0.5);
          --style-toggle-border: rgba(0,22,45,0.08);
          --style-toggle-color: #00162d;
          --style-toggle-active-bg: #00162d;
          --style-toggle-active-color: #faf7f3;

          --element-row-bg: rgba(255,255,255,0.4);
          --element-row-border: rgba(0,22,45,0.06);
          --element-row-hover-bg: rgba(255,255,255,0.6);
          --element-row-hover-border: rgba(0,22,45,0.15);
          --element-row-active-bg: rgba(255,255,255,0.75);
          --element-row-active-border: #00162d;
          --element-row-active-shadow: rgba(0,22,45,0.08);
          --element-name-color: #00162d;
          --element-icon-color: rgba(0,22,45,0.6);
          --element-badge-bg: rgba(0,22,45,0.05);
          --element-badge-color: rgba(0,22,45,0.45);
          --element-badge-icon-color: #3a6b8a;
          --element-check-color: rgba(0,22,45,0.5);
          --element-empty-check-color: rgba(0,22,45,0.25);

          --guide-line-color: rgba(0,22,45,0.15);
          --guide-tick-color: rgba(0,22,45,0.20);

          --dims-label-color: rgba(0,22,45,0.4);
          --dims-value-color: #00162d;
          --dims-hint-color: rgba(0,22,45,0.35);

          --controls-hint-color: rgba(0,22,45,0.55);
          --controls-divider-color: rgba(0,22,45,0.08);
          --controls-icon-primary: rgba(0,22,45,0.7);
          --controls-icon-secondary: #3a6b8a;
          --controls-icon-accent: #c9512f;

          --fabric-img-bg: rgba(0,22,45,0.05);
          --fabric-name-color: #00162d;
          --fabric-tile-border: rgba(0,22,45,0.08);
          --fabric-tile-bg: rgba(255,255,255,0.5);
          --fabric-tile-active-border: #00162d;
          --fabric-tile-active-shadow: rgba(0,22,45,0.1);

          --range-track: rgba(0,22,45,0.12);
          --range-thumb-bg: #00162d;
          --range-thumb-border: #faf7f3;
          --range-labels-color: rgba(0,22,45,0.35);

          --order-btn-from: #00162d;
          --order-btn-to: #052338;
          --order-btn-border: rgba(255,255,255,0.12);
          --order-btn-shadow: rgba(0,22,45,0.25);
          --order-btn-hover-shadow: rgba(0,22,45,0.3);

          --loader-border: rgba(0,22,45,0.1);
          --loader-top: rgba(0,22,45,0.55);
          --loader-text-color: rgba(0,22,45,0.6);
          --error-text-color: rgba(0,22,45,0.5);
          --empty-text-color: rgba(0,22,45,0.4);
          --color-hex-color: rgba(0,22,45,0.7);
          --dropdown-label-color: rgba(0,22,45,0.4);
          --dropdown-item-color: #00162d;
          --dropdown-item-hover-bg: rgba(0,22,45,0.06);
          --dropdown-item-active-bg: #00162d;
          --dropdown-item-active-color: #faf7f3;
          --toggle-field-hover-bg: rgba(0,22,45,0.04);
          --toggle-hint-color: rgba(0,22,45,0.45);
          --field-icon-color: rgba(0,22,45,0.5);
        }

        /* ============================================================
           DARK MODE TOKENS — Liquid Glass on Deep Obsidian
        ============================================================ */
        [data-theme="dark"] {
          --bg-page-from: #080a0f;
          --bg-page-to: #0d1018;

          --sidebar-bg: rgba(12,15,22,0.72);
          --sidebar-blur: blur(32px) saturate(200%) brightness(1.08);
          --sidebar-border: rgba(255,255,255,0.055);
          --sidebar-shadow: rgba(0,0,0,0.5);

          --card-bg: rgba(255,255,255,0.04);
          --card-blur: blur(24px) saturate(180%);
          --card-border: rgba(255,255,255,0.07);
          --card-shadow: rgba(0,0,0,0.3);
          --card-accent-border: rgba(180,200,255,0.1);
          --card-accent-shadow: rgba(100,140,255,0.06);

          --panel-bg: rgba(16,20,30,0.92);
          --panel-border: rgba(255,255,255,0.08);
          --panel-shadow: rgba(0,0,0,0.6);

          --chip-bg: rgba(255,255,255,0.07);
          --chip-border: rgba(255,255,255,0.10);
          --chip-shadow: rgba(0,0,0,0.35);

          --field-bg: rgba(255,255,255,0.05);
          --field-border: rgba(255,255,255,0.09);
          --field-focus-border: rgba(255,255,255,0.28);
          --field-focus-bg: rgba(255,255,255,0.09);
          --field-hover-bg: rgba(255,255,255,0.07);

          --text-primary: rgba(240,242,248,0.95);
          --text-secondary: rgba(200,210,230,0.65);
          --text-tertiary: rgba(180,195,220,0.45);
          --text-muted: rgba(180,195,220,0.35);

          --accent-icon-bg: rgba(255,255,255,0.10);
          --accent-icon-fg: rgba(240,242,248,0.95);
          --section-icon-bg: rgba(255,255,255,0.07);

          --swatch-border: rgba(255,255,255,0.12);
          --swatch-active-border: rgba(200,215,255,0.6);
          --swatch-shadow: rgba(0,0,0,0.3);
          --swatch-active-shadow: rgba(150,170,255,0.2);

          --size-pill-bg: rgba(255,255,255,0.05);
          --size-pill-border: rgba(255,255,255,0.09);
          --size-pill-color: rgba(220,228,245,0.85);
          --size-pill-active-bg: rgba(200,215,255,0.14);
          --size-pill-active-color: rgba(240,244,255,0.97);
          --size-pill-hover-border: rgba(255,255,255,0.22);

          --stepper-bg: rgba(255,255,255,0.05);
          --stepper-border: rgba(255,255,255,0.09);
          --stepper-color: rgba(220,228,245,0.9);
          --stepper-hover-bg: rgba(255,255,255,0.09);

          --add-btn-bg: rgba(255,255,255,0.05);
          --add-btn-border: rgba(255,255,255,0.09);
          --add-btn-color: rgba(220,228,245,0.85);
          --add-btn-hover-bg: rgba(255,255,255,0.12);
          --add-btn-hover-color: rgba(240,244,255,0.97);
          --add-btn-hover-shadow: rgba(150,170,255,0.12);

          --delete-btn-bg: rgba(255,255,255,0.05);
          --delete-btn-border: rgba(255,255,255,0.08);
          --delete-btn-hover-bg: rgba(201,81,47,0.15);
          --delete-btn-hover-border: rgba(201,81,47,0.3);
          --delete-icon-color: #e07050;

          --dropzone-border: rgba(255,255,255,0.13);
          --dropzone-bg: rgba(255,255,255,0.04);
          --dropzone-hover-border: rgba(255,255,255,0.28);
          --dropzone-hover-bg: rgba(255,255,255,0.08);

          --style-toggle-bg: rgba(255,255,255,0.05);
          --style-toggle-border: rgba(255,255,255,0.09);
          --style-toggle-color: rgba(220,228,245,0.85);
          --style-toggle-active-bg: rgba(200,215,255,0.14);
          --style-toggle-active-color: rgba(240,244,255,0.97);

          --element-row-bg: rgba(255,255,255,0.03);
          --element-row-border: rgba(255,255,255,0.07);
          --element-row-hover-bg: rgba(255,255,255,0.07);
          --element-row-hover-border: rgba(255,255,255,0.15);
          --element-row-active-bg: rgba(200,215,255,0.08);
          --element-row-active-border: rgba(180,200,255,0.3);
          --element-row-active-shadow: rgba(100,140,255,0.08);
          --element-name-color: rgba(230,238,255,0.9);
          --element-icon-color: rgba(180,200,230,0.6);
          --element-badge-bg: rgba(255,255,255,0.07);
          --element-badge-color: rgba(180,200,230,0.55);
          --element-badge-icon-color: #6aaccc;
          --element-check-color: rgba(160,190,230,0.6);
          --element-empty-check-color: rgba(150,175,220,0.25);

          --guide-line-color: rgba(255,255,255,0.10);
          --guide-tick-color: rgba(255,255,255,0.14);

          --dims-label-color: rgba(180,200,230,0.45);
          --dims-value-color: rgba(230,238,255,0.92);
          --dims-hint-color: rgba(160,185,220,0.38);

          --controls-hint-color: rgba(180,200,230,0.55);
          --controls-divider-color: rgba(255,255,255,0.07);
          --controls-icon-primary: rgba(180,200,230,0.7);
          --controls-icon-secondary: #6aaccc;
          --controls-icon-accent: #e07050;

          --fabric-img-bg: rgba(255,255,255,0.05);
          --fabric-name-color: rgba(220,228,245,0.85);
          --fabric-tile-border: rgba(255,255,255,0.09);
          --fabric-tile-bg: rgba(255,255,255,0.04);
          --fabric-tile-active-border: rgba(180,200,255,0.35);
          --fabric-tile-active-shadow: rgba(100,140,255,0.1);

          --range-track: rgba(255,255,255,0.1);
          --range-thumb-bg: rgba(200,215,255,0.85);
          --range-thumb-border: rgba(20,25,40,0.9);
          --range-labels-color: rgba(160,185,220,0.4);

          --order-btn-from: rgba(200,215,255,0.12);
          --order-btn-to: rgba(160,185,255,0.08);
          --order-btn-border: rgba(200,220,255,0.18);
          --order-btn-shadow: rgba(100,140,255,0.15);
          --order-btn-hover-shadow: rgba(100,140,255,0.25);
          --order-btn-text: rgba(220,232,255,0.95);

          --loader-border: rgba(255,255,255,0.08);
          --loader-top: rgba(200,215,255,0.65);
          --loader-text-color: rgba(180,200,230,0.55);
          --error-text-color: rgba(180,200,230,0.45);
          --empty-text-color: rgba(160,185,220,0.4);
          --color-hex-color: rgba(180,200,230,0.65);
          --dropdown-label-color: rgba(160,185,220,0.45);
          --dropdown-item-color: rgba(220,230,248,0.85);
          --dropdown-item-hover-bg: rgba(255,255,255,0.07);
          --dropdown-item-active-bg: rgba(200,215,255,0.14);
          --dropdown-item-active-color: rgba(240,244,255,0.97);
          --toggle-field-hover-bg: rgba(255,255,255,0.06);
          --toggle-hint-color: rgba(180,200,230,0.45);
          --field-icon-color: rgba(180,200,230,0.45);
        }

        /* ============================================================
           PAGE BACKGROUND
        ============================================================ */
        .sg-designer-bg {
          position: relative;
          isolation: isolate;
          background: linear-gradient(180deg, var(--bg-page-from) 0%, var(--bg-page-to) 100%);
        }

        .sg-designer-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            linear-gradient(115deg, transparent 0 18%, var(--bg-streak-a) 18.1% 18.35%, transparent 18.45% 100%),
            linear-gradient(74deg, transparent 0 47%, var(--bg-streak-b) 47.1% 47.28%, transparent 47.38% 100%),
            radial-gradient(ellipse at 82% 18%, var(--bg-radial-a), transparent 28rem),
            radial-gradient(ellipse at 18% 72%, var(--bg-radial-b), transparent 30rem);
        }

        .sg-designer-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.46;
          background-image:
            repeating-linear-gradient(90deg, var(--bg-noise-line-v) 0 1px, transparent 1px 42px),
            repeating-linear-gradient(0deg, var(--bg-noise-line-h) 0 1px, transparent 1px 42px);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.28) 72%, transparent);
        }

        /* Dark bg radial glows */
        [data-theme="dark"] .sg-designer-bg::before {
          background:
            radial-gradient(ellipse at 20% 15%, rgba(60,80,160,0.12), transparent 35rem),
            radial-gradient(ellipse at 80% 75%, rgba(30,55,120,0.10), transparent 40rem),
            radial-gradient(ellipse at 60% 40%, rgba(20,35,90,0.08), transparent 25rem);
        }

        [data-theme="dark"] .sg-designer-bg::after {
          opacity: 0.25;
          background-image:
            repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 42px),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 42px);
        }

        /* ============================================================
           LAYOUT COMPONENTS
        ============================================================ */
        .sidebar-panel {
          background: var(--sidebar-bg);
          backdrop-filter: var(--sidebar-blur);
          -webkit-backdrop-filter: var(--sidebar-blur);
          border-left: 1px solid var(--sidebar-border);
          box-shadow: -1px 0 40px var(--sidebar-shadow);
        }

        /* Dark sidebar: specular top highlight */
        [data-theme="dark"] .sidebar-panel {
          box-shadow: -1px 0 60px var(--sidebar-shadow), inset 1px 0 0 rgba(255,255,255,0.055);
        }

        .glass-card {
          background: var(--card-bg);
          backdrop-filter: var(--card-blur);
          -webkit-backdrop-filter: var(--card-blur);
          border: 1px solid var(--card-border);
          border-radius: 1.25rem;
          box-shadow: 0 4px 24px var(--card-shadow);
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }

        /* Dark cards: inner-top specular gleam */
        [data-theme="dark"] .glass-card {
          box-shadow: 0 4px 24px var(--card-shadow), inset 0 1px 0 rgba(255,255,255,0.07);
        }

        .glass-card-accent {
          border-color: var(--card-accent-border);
          box-shadow: 0 8px 32px var(--card-accent-shadow);
        }

        [data-theme="dark"] .glass-card-accent {
          box-shadow: 0 8px 32px var(--card-accent-shadow), inset 0 1px 0 rgba(200,220,255,0.06);
        }

        .glass-panel {
          background: var(--panel-bg);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--panel-border);
          border-radius: 1rem;
          box-shadow: 0 12px 40px var(--panel-shadow);
        }

        [data-theme="dark"] .glass-panel {
          box-shadow: 0 16px 50px var(--panel-shadow), inset 0 1px 0 rgba(255,255,255,0.07);
        }

        .glass-chip {
          background: var(--chip-bg);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid var(--chip-border);
          border-radius: 0.6rem;
          box-shadow: 0 4px 16px var(--chip-shadow);
        }

        [data-theme="dark"] .glass-chip {
          box-shadow: 0 4px 16px var(--chip-shadow), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .glass-field {
          background: var(--field-bg);
          border: 1px solid var(--field-border);
          border-radius: 0.875rem;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .glass-field:focus,
        .glass-field:focus-within {
          outline: none;
          border-color: var(--field-focus-border);
          background: var(--field-focus-bg);
        }

        .glass-field-static {
          background: var(--field-bg);
          border: 1px solid var(--field-border);
          border-radius: 0.875rem;
        }

        [data-theme="dark"] .glass-field-static {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }

        /* ============================================================
           SEMANTIC COLOR CLASSES (consume tokens)
        ============================================================ */
        .heading-primary { color: var(--text-primary); }
        .heading-label { color: var(--text-muted); }
        .section-title { color: var(--text-primary); }
        .field-text { color: var(--text-primary); }
        .field-icon { color: var(--field-icon-color); }
        .field-label { color: var(--text-secondary); }
        .field-input { color: var(--text-primary); }
        .chip-text { color: var(--text-primary); }
        .section-icon-wrap { background: var(--section-icon-bg); color: var(--text-primary); }
        .accent-icon-wrap { background: var(--accent-icon-bg); color: var(--accent-icon-fg); }
        .chevron { color: var(--text-tertiary); }
        .loader-text { color: var(--loader-text-color); }
        .error-text { color: var(--error-text-color); }
        .empty-text { color: var(--empty-text-color); }
        .color-hex { color: var(--color-hex-color); }
        .size-hint { color: var(--text-muted); }
        .dims-label { color: var(--dims-label-color); }
        .dims-value { color: var(--dims-value-color); }
        .dims-hint { color: var(--dims-hint-color); }
        .controls-hint { color: var(--controls-hint-color); }
        .controls-divider { border-color: var(--controls-divider-color); }
        .controls-icon-primary { color: var(--controls-icon-primary); }
        .controls-icon-secondary { color: var(--controls-icon-secondary); }
        .controls-icon-accent { color: var(--controls-icon-accent); }
        .range-labels { color: var(--range-labels-color); }
        .toggle-hint { color: var(--toggle-hint-color); }
        .fabric-name { color: var(--fabric-name-color); }
        .no-img { color: var(--text-tertiary); }
        .element-name { color: var(--element-name-color); }
        .element-icon { color: var(--element-icon-color); }
        .element-check { color: var(--element-check-color); }
        .element-empty-check { color: var(--element-empty-check-color); }
        .element-badge-icon { color: var(--element-badge-icon-color); }

        /* Guide lines */
        .guide-line { background: var(--guide-line-color); }
        .guide-tick { background: var(--guide-tick-color); }

        /* ============================================================
           LOADER
        ============================================================ */
        .loader-ring {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 3px solid var(--loader-border);
          border-top-color: var(--loader-top);
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ============================================================
           COLOR SWATCHES
        ============================================================ */
        .swatch {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--swatch-border);
          box-shadow: 0 2px 8px var(--swatch-shadow);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .swatch:hover { transform: translateY(-1px); }
        .swatch-active {
          border: 2px solid var(--swatch-active-border);
          box-shadow: 0 4px 14px var(--swatch-active-shadow);
        }

        /* ============================================================
           FABRIC TILES
        ============================================================ */
        .fabric-tile {
          border-radius: 1rem;
          overflow: hidden;
          background: var(--fabric-tile-bg);
          border: 1px solid var(--fabric-tile-border);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .fabric-tile-active {
          border: 1.5px solid var(--fabric-tile-active-border);
          box-shadow: 0 6px 20px var(--fabric-tile-active-shadow);
        }
        .fabric-img-bg { background: var(--fabric-img-bg); }

        /* ============================================================
           SIZE PILLS
        ============================================================ */
        .size-pill {
          padding: 0.75rem 0;
          border-radius: 0.875rem;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--size-pill-color);
          background: var(--size-pill-bg);
          border: 1px solid var(--size-pill-border);
          transition: all 0.2s ease;
        }
        .size-pill:hover { border-color: var(--size-pill-hover-border); }
        .size-pill-active {
          background: var(--size-pill-active-bg);
          color: var(--size-pill-active-color);
          border-color: var(--size-pill-active-bg);
        }

        /* Dark active pill: glass glow instead of flat fill */
        [data-theme="dark"] .size-pill-active {
          border-color: rgba(180,200,255,0.3);
          box-shadow: 0 0 0 1px rgba(180,200,255,0.12), 0 6px 18px rgba(100,140,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        /* ============================================================
           QUANTITY STEPPER
        ============================================================ */
        .stepper-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--stepper-color);
          background: var(--stepper-bg);
          border: 1px solid var(--stepper-border);
          transition: all 0.2s ease;
        }
        .stepper-btn:hover:not(:disabled) {
          background: var(--stepper-hover-bg);
          border-color: var(--size-pill-hover-border);
        }
        .stepper-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .quantity-input { color: var(--text-primary); }

        /* ============================================================
           ADD ELEMENT BUTTONS
        ============================================================ */
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
          color: var(--add-btn-color);
          background: var(--add-btn-bg);
          border: 1px solid var(--add-btn-border);
          transition: all 0.2s ease;
        }
        .add-element-btn:hover {
          background: var(--add-btn-hover-bg);
          color: var(--add-btn-hover-color);
          box-shadow: 0 8px 20px var(--add-btn-hover-shadow);
          transform: translateY(-1px);
        }

        /* Dark hover: frost shimmer instead of solid fill */
        [data-theme="dark"] .add-element-btn:hover {
          box-shadow: 0 8px 20px var(--add-btn-hover-shadow), inset 0 1px 0 rgba(255,255,255,0.12);
        }

        /* ============================================================
           ICON GHOST BUTTON (delete)
        ============================================================ */
        .icon-ghost-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.7rem;
          background: var(--delete-btn-bg);
          border: 1px solid var(--delete-btn-border);
          transition: all 0.2s ease;
        }
        .icon-delete { color: var(--delete-icon-color); }
        .icon-ghost-btn:hover {
          background: var(--delete-btn-hover-bg);
          border-color: var(--delete-btn-hover-border);
        }

        /* ============================================================
           DROPZONE
        ============================================================ */
        .dropzone {
          border: 1.5px dashed var(--dropzone-border);
          border-radius: 0.875rem;
          background: var(--dropzone-bg);
          transition: all 0.2s ease;
        }
        .dropzone:hover {
          border-color: var(--dropzone-hover-border);
          background: var(--dropzone-hover-bg);
        }
        .dropzone-text { color: var(--text-primary); }

        /* ============================================================
           COLOR SWATCH INPUT
        ============================================================ */
        .color-swatch-input {
          width: 34px;
          height: 34px;
          border-radius: 0.6rem;
          border: 1px solid var(--field-border);
          cursor: pointer;
          padding: 0;
          background: none;
        }

        /* ============================================================
           STYLE TOGGLE (fill / outline)
        ============================================================ */
        .style-toggle {
          padding: 0.7rem 0.5rem;
          border-radius: 0.875rem;
          background: var(--style-toggle-bg);
          border: 1px solid var(--style-toggle-border);
          color: var(--style-toggle-color);
          transition: all 0.2s ease;
        }
        .style-toggle-active {
          background: var(--style-toggle-active-bg);
          color: var(--style-toggle-active-color);
          border-color: var(--style-toggle-active-bg);
        }

        [data-theme="dark"] .style-toggle-active {
          border-color: rgba(180,200,255,0.25);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.09), 0 4px 12px rgba(100,140,255,0.1);
        }

        /* ============================================================
           TOGGLE FIELD (side switch)
        ============================================================ */
        .toggle-field:hover { background: var(--toggle-field-hover-bg); }

        /* ============================================================
           ELEMENT LIST ROWS
        ============================================================ */
        .element-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding: 0.7rem 0.9rem;
          border-radius: 0.875rem;
          background: var(--element-row-bg);
          border: 1px solid var(--element-row-border);
          transition: all 0.2s ease;
        }
        .element-row:hover {
          border-color: var(--element-row-hover-border);
          background: var(--element-row-hover-bg);
        }
        .element-row-active {
          border-color: var(--element-row-active-border);
          background: var(--element-row-active-bg);
          box-shadow: 0 4px 14px var(--element-row-active-shadow);
        }

        [data-theme="dark"] .element-row-active {
          box-shadow: 0 4px 14px var(--element-row-active-shadow), inset 0 1px 0 rgba(200,220,255,0.07);
        }

        .element-badge {
          background: var(--element-badge-bg);
          color: var(--element-badge-color);
        }

        /* ============================================================
           ORDER BUTTON
        ============================================================ */
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
          color: var(--order-btn-text, #faf7f3);
          background: linear-gradient(135deg, var(--order-btn-from) 0%, var(--order-btn-to) 100%);
          border: 1px solid var(--order-btn-border);
          box-shadow: 0 10px 30px var(--order-btn-shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .order-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px var(--order-btn-hover-shadow);
        }
        .order-btn:active { transform: translateY(0); }

        /* Dark order btn: crystal glass look */
        [data-theme="dark"] .order-btn {
          box-shadow: 0 10px 30px var(--order-btn-shadow), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3);
        }
        [data-theme="dark"] .order-btn:hover {
          box-shadow: 0 14px 40px var(--order-btn-hover-shadow), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.3);
        }

        /* ============================================================
           DROPDOWN
        ============================================================ */
        .glass-dropdown {
          background: var(--panel-bg);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--panel-border);
          border-radius: 1rem;
          box-shadow: 0 12px 40px var(--panel-shadow);
        }
        [data-theme="dark"] .glass-dropdown {
          box-shadow: 0 16px 50px var(--panel-shadow), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .dropdown-label { color: var(--dropdown-label-color); }
        .dropdown-item { color: var(--dropdown-item-color); }
        .dropdown-item:hover { background: var(--dropdown-item-hover-bg); }
        .dropdown-item-active {
          background: var(--dropdown-item-active-bg) !important;
          color: var(--dropdown-item-active-color) !important;
        }

        /* ============================================================
           RANGE SLIDER
        ============================================================ */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: var(--range-track);
          border-radius: 999px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: var(--range-thumb-bg);
          border: 2px solid var(--range-thumb-border);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.12); }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: var(--range-thumb-bg);
          border: 2px solid var(--range-thumb-border);
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        input[type="range"]::-moz-range-thumb:hover { transform: scale(1.12); }

        /* ============================================================
           MISC
        ============================================================ */
        .touch-none { touch-action: none; }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }

        .sidebar-panel::-webkit-scrollbar { width: 6px; }
        .sidebar-panel::-webkit-scrollbar-thumb {
          background: var(--field-border);
          border-radius: 999px;
        }
        .sidebar-panel::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

export default ShirtDesigner;