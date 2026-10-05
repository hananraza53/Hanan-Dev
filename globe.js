/**
 * =======================================================
 *  GLOBE.JS — Interactive 3D Earth in Contact Section
 *  Uses Three.js ES Module + GLTFLoader + OrbitControls
 * =======================================================
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function initGlobe() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;

  const wrapper = canvas.closest('.globe-wrapper');

  // ── Renderer ──────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ── Scene ──────────────────────────────────────────
  const scene = new THREE.Scene();

  // ── Camera ─────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 3.2);

  // ── Resize helper ──────────────────────────────────
  function syncSize() {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight || w;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  syncSize();

  // ── Lights ─────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffeedd, 2.4);
  sun.position.set(4, 3, 5);
  sun.castShadow = true;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x4fc3f7, 0.8);
  rim.position.set(-5, -2, -3);
  scene.add(rim);

  const hemi = new THREE.HemisphereLight(0x0d47a1, 0x001e3c, 0.5);
  scene.add(hemi);

  // ── Orbit Controls ─────────────────────────────────
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.5;
  // Lock polar angle so drag is horizontal-only
  const fixedPolar = Math.PI * 0.5;
  controls.minPolarAngle = fixedPolar;
  controls.maxPolarAngle = fixedPolar;

  // ── Stars ─────────────────────────────────────────
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1200;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ── Atmosphere glow ────────────────────────────────
  const glowGeo = new THREE.SphereGeometry(1.18, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x1a6fa8,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glowMesh);

  // ── Load GLTF Planet ───────────────────────────────
  let planetMesh = null;
  const loader = new GLTFLoader();

  const gltfPath = new URL('./planet/scene.gltf', import.meta.url).href;

  loader.load(
    gltfPath,
    (gltf) => {
      planetMesh = gltf.scene;

      const box = new THREE.Box3().setFromObject(planetMesh);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.8 / maxDim;
      planetMesh.scale.setScalar(scale);

      const centre = box.getCenter(new THREE.Vector3());
      planetMesh.position.sub(centre.multiplyScalar(scale));

      planetMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(planetMesh);
      canvas.classList.add('globe-loaded');
    },
    undefined,
    (err) => {
      console.warn('[Globe] GLTF load error, using fallback sphere:', err);
      const fbGeo = new THREE.SphereGeometry(0.9, 64, 64);
      const fbMat = new THREE.MeshStandardMaterial({
        color: 0x1565c0,
        roughness: 0.4,
        metalness: 0.15,
      });
      planetMesh = new THREE.Mesh(fbGeo, fbMat);
      scene.add(planetMesh);
      canvas.classList.add('globe-loaded');
    }
  );

  // ── IntersectionObserver (pause off-screen) ────────
  let isVisible = false;
  const observer = new IntersectionObserver(
    (entries) => { isVisible = entries[0].isIntersecting; },
    { threshold: 0.1 }
  );
  observer.observe(canvas);

  // ── Animation Loop ─────────────────────────────────
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    const t = clock.getElapsedTime();
    stars.rotation.y = t * 0.012;
    stars.rotation.x = t * 0.005;
    glowMesh.material.opacity = 0.10 + Math.sin(t * 1.2) * 0.025;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // ── Responsive ─────────────────────────────────────
  window.addEventListener('resize', syncSize, { passive: true });

  // ── Mouse parallax ─────────────────────────────────
  wrapper.addEventListener('mousemove', (e) => {
    if (!planetMesh) return;
    const rect = wrapper.getBoundingClientRect();
    const ny = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    planetMesh.rotation.x += (ny * 0.08 - planetMesh.rotation.x) * 0.05;
  });

  wrapper.addEventListener('mouseleave', () => {
    if (!planetMesh) return;
    (function resetTilt() {
      if (Math.abs(planetMesh.rotation.x) < 0.001) { planetMesh.rotation.x = 0; return; }
      planetMesh.rotation.x *= 0.9;
      requestAnimationFrame(resetTilt);
    })();
  });
})();
