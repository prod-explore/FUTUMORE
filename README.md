# FUTUMORE — Digital Agency Architecture

FUTUMORE is the primary digital agency platform designed to showcase technological prowess, automation capabilities, and bespoke IT solutions. The project emphasizes advanced frontend rendering techniques and a lightweight, highly optimized Node.js backend.

## Tech Stack & Architecture
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (No Heavy Frameworks)
- **Backend:** Node.js, Express (API handling for forms and emails)
- **Rendering:** Custom HTML5 Canvas (Particle Engine) & WebGL (Three.js)

## Key Technical Showcases

### 1. Custom 3D Model Rendering (`hero3d.js`)
Instead of relying on heavy embedded viewers, the platform integrates `Three.js` to render a highly detailed 3D Bonsai model (`bonsai.gltf`, ~24MB) directly in the hero section. This includes custom lighting, materials, and scroll-linked rotation logic to create a seamless, high-performance interactive experience.

### 2. Canvas-Based Particle Engine
The background utilizes a highly optimized HTML5 Canvas particle system (`script.js`). It generates multi-layered star fields, twinkling effects, glow halos, and shooting stars. The engine is bound to `requestAnimationFrame` and features custom mouse-parallax calculations with automatic pausing via `IntersectionObserver` when scrolled out of view to save CPU cycles.

### 3. Custom i18n Localization Engine
The platform implements a lightweight, dependency-free internationalization (i18n) system. Using the `data-i18n` attribute, the vanilla JavaScript router hot-swaps text content between Polish and English without requiring a page reload, preserving state and animations.

## Getting Started

1. Clone the repository.
2. Ensure you have Node.js installed.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. The application will be served locally on the port defined in your `.env`.
