<script setup lang="ts">
import MiniPlayer from '@/components/MiniPlayer.vue'
</script>

<template>
  <div class="app-bg">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
    <div class="orb orb-4"></div>
    <div class="noise-overlay"></div>
    <RouterView />
    <MiniPlayer />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-hover: rgba(255, 255, 255, 0.1);
  --glass-active: rgba(255, 255, 255, 0.15);
  --glass-blur: 24px;
  --glass-heavy-blur: 40px;
  --accent: #1db954;
  --accent-glow: rgba(29, 185, 84, 0.4);
  --accent-2: #a855f7;
  --accent-2-glow: rgba(168, 85, 247, 0.4);
  --accent-3: #ec4899;
  --accent-3-glow: rgba(236, 72, 153, 0.4);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-muted: rgba(255, 255, 255, 0.35);
  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 28px;
  --radius-xl: 36px;
}

body {
  background: #050505;
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-bg {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* ---- Animated gradient orbs ---- */
.orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #1db954 0%, transparent 70%);
  top: -200px;
  right: -100px;
  animation: orbFloat1 20s ease-in-out infinite;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #a855f7 0%, transparent 70%);
  bottom: -150px;
  left: -100px;
  animation: orbFloat2 25s ease-in-out infinite;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #ec4899 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: orbFloat3 18s ease-in-out infinite;
}

.orb-4 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  top: 20%;
  left: 10%;
  animation: orbFloat4 22s ease-in-out infinite;
}

.noise-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-80px, 60px) scale(1.1); }
  50% { transform: translate(-40px, 120px) scale(0.9); }
  75% { transform: translate(60px, 40px) scale(1.05); }
}

@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(100px, -50px) scale(1.15); }
  50% { transform: translate(50px, -100px) scale(0.85); }
  75% { transform: translate(-30px, -60px) scale(1.1); }
}

@keyframes orbFloat3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  33% { transform: translate(-30%, -60%) scale(1.2); }
  66% { transform: translate(-70%, -40%) scale(0.8); }
}

@keyframes orbFloat4 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  25% { transform: translate(60px, 80px) scale(1.1) rotate(5deg); }
  50% { transform: translate(120px, 20px) scale(0.95) rotate(-3deg); }
  75% { transform: translate(30px, -40px) scale(1.08) rotate(2deg); }
}

/* ---- Scrollbar ---- */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* ---- Utility animations ---- */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes borderGlow {
  0%, 100% { border-color: rgba(29, 185, 84, 0.3); }
  33% { border-color: rgba(168, 85, 247, 0.3); }
  66% { border-color: rgba(236, 72, 153, 0.3); }
}

/* ---- Mobile Responsive ---- */
@media (max-width: 768px) {
  .orb-1 { width: 350px; height: 350px; filter: blur(80px); opacity: 0.35; }
  .orb-2 { width: 300px; height: 300px; filter: blur(80px); opacity: 0.35; }
  .orb-3 { width: 250px; height: 250px; filter: blur(80px); opacity: 0.3; }
  .orb-4 { width: 200px; height: 200px; filter: blur(80px); opacity: 0.3; }
}

@media (max-width: 480px) {
  .orb-1 { width: 250px; height: 250px; }
  .orb-2 { width: 200px; height: 200px; }
  .orb-3 { width: 180px; height: 180px; }
  .orb-4 { display: none; }
}

/* ---- Safe area for notched devices ---- */
@supports (padding: env(safe-area-inset-bottom)) {
  body {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}

/* ---- Touch device optimizations ---- */
@media (hover: none) and (pointer: coarse) {
  /* Larger tap targets on touch devices */
  button, a, [role="button"] {
    min-height: 38px;
    min-width: 38px;
  }
  /* Disable hover effects that cause sticky states on mobile */
  * {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
