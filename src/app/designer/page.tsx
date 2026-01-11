'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
        className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none flex justify-between items-center bg-white"
      >
        <span style={{ fontFamily: value, fontSize: '1.1rem' }}>{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full mt-2 w-full max-h-60 overflow-y-auto bg-white border border-slate-300 rounded-lg shadow-lg">
          {options.map(group => (
            <div key={group.label}>
              <h5 className="text-xs font-bold text-slate-500 uppercase px-3 pt-3 pb-1 bg-slate-50">{group.label}</h5>
              <ul>
                {group.fonts.map(font => (
                  <li key={font}>
                    <button
                      type="button"
                      onClick={() => handleSelect(font)}
                      className={`w-full text-left px-3 py-2 text-base hover:bg-blue-100 ${value === font ? 'bg-blue-50 font-bold text-blue-700' : ''}`}
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

  const SCALE_TO_CM = 50;

  useEffect(() => {
    selectedElementRef.current = selectedElement;
  }, [selectedElement]);

  useEffect(() => {
    activeHandleRef.current = activeHandle;
  }, [activeHandle]);

  const shirtColors = [
    { color: '#ffffff', name: 'Blanco' },
    { color: '#646464ff', name: 'Gris' },
    { color: '#2d2d2dff', name: 'Grafito' },
    { color: '#121212ff', name: 'Negro' },
    { color: '#00162d', name: 'Azul Noche' }
  ];

  const fabricTypes = [
    { id: 'algodon', name: 'Algodón', image: '/textures/fabrics/cotton.jpg' },
    { id: 'poliester', name: 'Poliéster', image: '/textures/fabrics/polyester.jpg' },
    { id: 'mezcla', name: 'Mezcla', image: '/textures/fabrics/blend.jpg' },
    { id: 'premium', name: 'Premium', image: '/textures/fabrics/premium.jpg' }
  ];

  // --- LISTA DE FUENTES DEFINITIVA, INSPIRADA EN LA IMAGEN ---
  const fontFamilies = [
    {
      label: 'Script & Cursivas Finas',
      fonts: [
        'Great Vibes',    // Alternativa a Hello Stockholm
        'Sacramento',     // Alternativa a Fox in the Snow
        'Allura',         // Alternativa a Graced Script, Biloxi
        'Kalam',          // Alternativa a Ting Tong
        'Dancing Script',
        'Caveat'
      ]
    },
    {
      label: 'Script con Personalidad',
      fonts: [
        'Damion',         // Fuente original de la imagen
        'Pacifico',       // Alternativa a Buffalo Script
        'Lobster',
        'Permanent Marker', // Alternativa a Taken by Vultures
        'Rock Salt'
      ]
    },
    {
      label: 'Serif Modernas & Clásicas',
      fonts: [
        'Playfair Display', // Alternativa a Soria
        'Lora',
        'Arvo',
        'Roboto Slab',    // Alternativa a Eponymous
        'Cormorant Garamond'
      ]
    },
    {
      label: 'Sans Serif de Impacto',
      fonts: [
        'Bebas Neue',     // Alternativa a Lovelo, Canter, Blanch
        'Oswald',         // Alternativa a Gogoia
        'Anton',
        'Montserrat',
        'Raleway'
      ]
    },
    {
      label: 'Decorativas & Unicas',
      fonts: [
        'Cinzel Decorative', // Alternativa a Paihuen Mapuche
        'Josefin Sans',      // Alternativa a Norse (estilo delgado)
        'Indie Flower'
      ]
    }
  ];

  const getElementDimensionsInCm = (element) => {
    let aspectRatio = 1;
    if (element.type === 'image' && element.texture?.image) {
      aspectRatio = element.texture.image.height / element.texture.image.width;
    } else if (element.type === 'text') {
      aspectRatio = 0.3;
    }
    
    const width = (element.scaleX || element.scale) * SCALE_TO_CM;
    const height = (element.scaleY || (element.scale * aspectRatio)) * SCALE_TO_CM;
    
    return { width: width.toFixed(1), height: height.toFixed(1) };
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

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
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
    canvas.width = 2048;
    canvas.height = 2048;

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

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.setLineDash([16, 8]);
    ctx.strokeRect(-elementWidth / 2, -elementHeight / 2, elementWidth, elementHeight);
    ctx.setLineDash([]);

    const handleSize = 30;
    const corners = [
      { x: -elementWidth / 2, y: -elementHeight / 2 },
      { x: elementWidth / 2, y: -elementHeight / 2 },
      { x: -elementWidth / 2, y: elementHeight / 2 },
      { x: elementWidth / 2, y: elementHeight / 2 },
    ];

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    corners.forEach(corner => {
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    });

    const edges = [
      { x: 0, y: -elementHeight / 2 },
      { x: 0, y: elementHeight / 2 },
      { x: -elementWidth / 2, y: 0 },
      { x: elementWidth / 2, y: 0 },
    ];

    ctx.fillStyle = '#10b981';
    edges.forEach(edge => {
      ctx.fillRect(edge.x - handleSize / 2, edge.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(edge.x - handleSize / 2, edge.y - handleSize / 2, handleSize, handleSize);
    });

    const rotateDistance = elementHeight / 2 + 80;
    ctx.strokeStyle = '#3b82f6';
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(0, -elementHeight / 2);
    ctx.lineTo(0, -rotateDistance);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -rotateDistance, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const dims = getElementDimensionsInCm(element);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.font = 'bold 40px Arial';
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
    const canvasSize = 2048;
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
          const newScale = Math.max(0.02, Math.min(0.8, scaleStart.current.elementScale * scaleFactor));
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
            const newHeight = Math.max(0.02, Math.min(0.8, scaleStart.current.height + deltaScale));
            if (element.type === 'image') {
              updateImageElement(element.id, 'scaleY', newHeight);
            } else {
              updateTextElement(element.id, 'scaleY', newHeight);
            }
          } else if (currentHandle === 'edge-w' || currentHandle === 'edge-e') {
            const deltaScale = (currentHandle === 'edge-w' ? -deltaX : deltaX) * pixelToScale;
            const newWidth = Math.max(0.02, Math.min(0.8, scaleStart.current.width + deltaScale));
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
        if (isInteractingWithElement.current && selectedElementRef.current && activeHandleRef.current) {
          const element = [...imageElementsRef.current, ...textElementsRef.current].find(el => 
            el.id === selectedElementRef.current.id && el.type === selectedElementRef.current.type
          );
          if (element && activeHandleRef.current === 'move') {
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
      fontSize: 48,
      fontFamily: 'Great Vibes', // Fuente por defecto más estilizada
      color: '#000000',
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
    const fontSize = element.fontSize * element.scale * 2.5;
    ctx.font = `${fontSize}px ${element.fontFamily}`;
    ctx.fillStyle = element.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(element.rotation || 0);
    ctx.strokeText(element.text, 0, 0);
    ctx.fillText(element.text, 0, 0);
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
      modelRef.current.rotation.y = rotationY;
      setTimeout(() => {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataURL = rendererRef.current.domElement.toDataURL('image/png');
        modelRef.current.rotation.y = originalRotationY;
        resolve(dataURL);
      }, 50);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col lg:flex-row">
      <div className="flex-1 lg:h-screen sticky top-0 overflow-hidden">
        <div className="h-full w-full bg-white rounded-none shadow-lg overflow-hidden flex items-center justify-center">
          <div ref={viewerRef} className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 relative touch-none">
            {isLoadingModel && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10">
                <div className="animate-spin w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full mb-4"></div>
                <p className="text-lg font-medium">Cargando modelo 3D...</p>
              </div>
            )}
            {!isLoadingModel && !isModelLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <p>No se pudo cargar el modelo 3D</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 p-6 bg-white shadow-lg overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Diseñador 3D</h2>

        <div className="space-y-6">
          {isModelLoaded && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <button onClick={() => setIsColorSectionOpen(!isColorSectionOpen)} className="w-full flex justify-between items-center text-left">
                  <h3 className="text-lg font-semibold text-slate-900">Color de la Camisa</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isColorSectionOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isColorSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="grid grid-cols-5 gap-3">
                    {shirtColors.map(({ color, name }) => (
                      <button
                        key={color}
                        onClick={() => changeColor(color)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          currentShirtColor === color ? 'border-slate-800 scale-110 shadow-lg' : 'border-slate-300 hover:border-slate-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <button onClick={() => setIsFabricSectionOpen(!isFabricSectionOpen)} className="w-full flex justify-between items-center text-left">
                  <h3 className="text-lg font-semibold text-slate-900">Tipos de Tela</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isFabricSectionOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFabricSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="grid grid-cols-2 gap-3">
                    {fabricTypes.map(({ id, name, image }) => (
                      <button
                        key={id}
                        onClick={() => changeFabric(id)}
                        className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                          currentFabric === id ? 'border-slate-800 shadow-lg scale-105' : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        <div className="aspect-square bg-slate-100 flex items-center justify-center">
                          <img 
                            src={image} 
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="text-slate-400 text-xs p-2">Sin imagen</div>';
                            }}
                          />
                        </div>
                        <div className={`py-2 text-center text-sm font-medium ${
                          currentFabric === id ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-700'
                        }`}>
                          {name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <button onClick={() => setIsSizeSectionOpen(!isSizeSectionOpen)} className="w-full flex justify-between items-center text-left">
                  <h3 className="text-lg font-semibold text-slate-900">Talla</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isSizeSectionOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSizeSectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="grid grid-cols-4 gap-3">
                    {shirtSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setCurrentSize(size)}
                        className={`py-3 rounded-lg border-2 text-sm font-bold transition-all ${
                          currentSize === size ? 'bg-slate-800 text-white border-slate-800 shadow-lg scale-105' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <button onClick={() => setIsQuantitySectionOpen(!isQuantitySectionOpen)} className="w-full flex justify-between items-center text-left">
                  <h3 className="text-lg font-semibold text-slate-900">Cantidad</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isQuantitySectionOpen ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isQuantitySectionOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-12 h-12 rounded-full border-2 border-slate-300 text-slate-800 font-bold text-2xl hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setQuantity(val >= 1 ? val : 1);
                      }}
                      className="w-24 h-12 text-center text-xl font-bold border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none appearance-none"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-12 h-12 rounded-full border-2 border-slate-300 text-slate-800 font-bold text-2xl hover:bg-slate-100 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Añadir Elementos</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={addImage}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">🖼️</span>
                    Imagen
                  </button>
                  <button
                    onClick={addText}
                    className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">📝</span>
                    Texto
                  </button>
                </div>
              </div>

              {selectedElementData && (
                <div className="bg-blue-50 rounded-xl shadow-sm p-6 border-2 border-blue-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedElementData.type === 'image' ? '🖼️ Imagen' : '📝 Texto'} #{selectedElementData.id}
                    </h3>
                    <button
                      onClick={() => {
                        if (selectedElementData.type === 'image') {
                          removeImage(selectedElementData.id);
                        } else {
                          removeText(selectedElementData.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedElementData.type === 'image' && selectedElementData.texture && (
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-xs font-medium text-slate-600 mb-1">Dimensiones:</div>
                        <div className="text-lg font-bold text-blue-600">
                          {getElementDimensionsInCm(selectedElementData).width} × {getElementDimensionsInCm(selectedElementData).height} cm
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Lado de la camisa:</label>
                      <button
                        onClick={() => toggleElementSide(selectedElementData.id, selectedElementData.type)}
                        className="w-full bg-white border-2 border-blue-400 rounded-lg px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        {selectedElementData.side === 'front' ? '👕 Frente' : '🔄 Parte trasera'}
                        <span className="ml-2 text-xs">• Click para cambiar</span>
                      </button>
                    </div>
                    
                    {selectedElementData.type === 'image' && (
                      <>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => loadImageTexture(selectedElementData.id, e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="border-2 border-dashed border-blue-400 rounded-lg px-4 py-3 text-sm text-blue-700 hover:border-blue-500 transition-colors text-center font-medium">
                            {selectedElementData.texture ? '✓ Cambiar imagen' : '📂 Cargar imagen'}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleFlipImage(selectedElementData.id)}
                          className="w-full bg-purple-600 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="text-lg">↔️</span>
                          {selectedElementData.flipped ? 'Desactivar espejo' : 'Activar espejo'}
                        </button>
                      </>
                    )}
                    
                    {selectedElementData.type === 'text' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Texto:</label>
                          <input
                            type="text"
                            value={selectedElementData.text}
                            onChange={(e) => updateTextElement(selectedElementData.id, 'text', e.target.value)}
                            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Escribe tu texto"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Fuente:</label>
                          <FontSelector
                            options={fontFamilies}
                            value={selectedElementData.fontFamily}
                            onChange={(font) => updateTextElement(selectedElementData.id, 'fontFamily', font)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Color:</label>
                          <input
                            type="color"
                            value={selectedElementData.color}
                            onChange={(e) => updateTextElement(selectedElementData.id, 'color', e.target.value)}
                            className="w-full h-12 rounded-lg border-2 border-slate-300 cursor-pointer"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tamaño fuente: {selectedElementData.fontSize}
                          </label>
                          <input
                            type="range"
                            min="20"
                            max="200"
                            step="2"
                            value={selectedElementData.fontSize}
                            onChange={(e) => updateTextElement(selectedElementData.id, 'fontSize', parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="pt-4 border-t border-blue-200">
                      <p className="text-xs text-slate-600 italic mb-2">
                        💡 Controles interactivos:
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• <span className="font-semibold text-blue-600">Esquinas azules:</span> Escalar proporcionalmente</li>
                        <li>• <span className="font-semibold text-green-600">Aristas verdes:</span> Cambiar ancho/alto</li>
                        <li>• <span className="font-semibold text-red-600">Círculo rojo:</span> Rotar</li>
                        <li>• <span className="font-semibold">Centro:</span> Mover</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Elementos ({imageElements.length + textElements.length})
                </h3>
                
                {imageElements.length === 0 && textElements.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No hay elementos. Añade una imagen o texto para comenzar.
                  </p>
                )}
                
                <div className="space-y-2">
                  {imageElements.map((element) => (
                    <button
                      key={`img-${element.id}`}
                      onClick={() => setSelectedElement({ id: element.id, type: 'image' })}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedElement?.id === element.id && selectedElement?.type === 'image'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">
                          🖼️ Imagen #{element.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {element.side === 'front' ? 'Frente' : 'Trasera'}
                          </span>
                          {element.flipped && (
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">↔️</span>
                          )}
                          <span className="text-xs text-slate-500">
                            {element.texture ? '✓' : '○'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {textElements.map((element) => (
                    <button
                      key={`txt-${element.id}`}
                      onClick={() => setSelectedElement({ id: element.id, type: 'text' })}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedElement?.id === element.id && selectedElement?.type === 'text'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700" style={{fontFamily: element.fontFamily}}>
                          📝 {element.text.substring(0, 20)}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {element.side === 'front' ? 'Frente' : 'Trasera'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={captureAndRedirectToOrderPage}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                🛒 Hacer Pedido
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
      `}</style>
    </div>
  );
};

export default ShirtDesigner;