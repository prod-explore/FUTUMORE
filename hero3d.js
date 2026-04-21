/* ═══════════════════════════════════════════════════════════════
   FUTUMORE — 3D Bonsai Hero (Three.js ES Module)
   Loads bonsai.gltf and rotates it in the hero section
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

(() => {
    const container = document.getElementById('hero-3d');
    if (!container) return;

    // Respect reduced motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 2, 6.5);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Lighting — dramatic, moody
    // Lighting — Bright & Metallic focus
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(-5, 2, -2);
    scene.add(rimLight);

    const bottomLight = new THREE.PointLight(0xffffff, 0.8, 10);
    bottomLight.position.set(0, -2, 2);
    scene.add(bottomLight);

    // Load GLTF model
    let model = null;
    const loader = new GLTFLoader();

    loader.load(
        'bonsai.gltf',
        (gltf) => {
            model = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;

            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            // Keep model vertically centered — no offset

            // Make material bright, white, and metallic focus
            model.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        child.material.color.set(0xffffff);
                        child.material.emissive.set(0x222222); // Subtle glow to prevent black
                        child.material.roughness = 0.2;
                        child.material.metalness = 0.5;
                    }
                }
            });

            scene.add(model);
        },
        undefined,
        (error) => {
            console.warn('GLTF load failed:', error);
            container.style.display = 'none';
        }
    );

    // Resize
    function resize() {
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    resize();
    window.addEventListener('resize', resize);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Animation loop
    let animId;
    let baseRotation = 0;
    
    function animate() {
        animId = requestAnimationFrame(animate);

        if (model) {
            // Constant auto-rotation
            if (!reducedMotion) {
                baseRotation += 0.005; 
            }
            
            // Combine constant rotation with subtle smooth mouse parallax
            model.rotation.y = baseRotation + (mouseX * 0.2);
            model.rotation.x = (mouseY * 0.1);
        }

        renderer.render(scene, camera);
    }

    animate();

    // Pause when out of view (performance)
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if (!animId) animate();
            } else {
                cancelAnimationFrame(animId);
                animId = null;
            }
        }, { threshold: 0 });
        observer.observe(heroSection);
    }
})();
