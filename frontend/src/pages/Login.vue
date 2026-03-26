<template>
  <div class="login-scene">
    <!-- Floating music bars -->
    <div class="bars-container">
      <div v-for="n in 40" :key="n" class="floating-bar"
        :style="{
          left: Math.random() * 100 + '%',
          animationDelay: Math.random() * 5 + 's',
          animationDuration: (3 + Math.random() * 4) + 's',
          height: (20 + Math.random() * 60) + 'px',
          opacity: 0.03 + Math.random() * 0.08,
        }">
      </div>
    </div>

    <!-- Main glass card -->
    <div class="login-card" @mousemove="handleMouse" @mouseleave="resetMouse"
      :style="{ transform: `perspective(800px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)` }">

      <!-- Refraction edge glow -->
      <div class="card-glow"></div>

      <!-- Spotify waveform animation -->
      <div class="waveform">
        <div v-for="n in 5" :key="n" class="wave-bar"
          :style="{ animationDelay: (n * 0.15) + 's' }">
        </div>
      </div>

      <h1 class="login-title">
        <span class="title-line">Your Music.</span>
        <span class="title-line title-accent">Visualized.</span>
      </h1>

      <p class="login-subtitle">
        Entdecke deine Top Artists & Tracks in einem einzigartigen visuellen Erlebnis.
      </p>

      <button class="login-btn" @click="login" :class="{ loading: isLoading }">
        <div class="btn-shine"></div>
        <div class="btn-content">
          <svg class="spotify-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span>{{ isLoading ? 'Connecting...' : 'Mit Spotify einloggen' }}</span>
        </div>
        <div class="btn-particles" v-if="isLoading">
          <div v-for="n in 6" :key="n" class="particle"
            :style="{ animationDelay: (n * 0.2) + 's' }"></div>
        </div>
      </button>

      <div class="login-features">
        <div class="feature" v-for="(feature, i) in features" :key="i"
          :style="{ animationDelay: (0.8 + i * 0.15) + 's' }">
          <div class="feature-icon" :style="{ background: feature.color }">
            <span>{{ feature.icon }}</span>
          </div>
          <span class="feature-text">{{ feature.text }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom gradient line -->
    <div class="bottom-line"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isLoading = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)

const features = [
  { icon: '\u{1F3A4}', text: 'Top Artists', color: 'rgba(29, 185, 84, 0.2)' },
  { icon: '\u{1F3B5}', text: 'Top Tracks', color: 'rgba(168, 85, 247, 0.2)' },
  { icon: '\u{1F525}', text: 'Live Stats', color: 'rgba(236, 72, 153, 0.2)' },
]

function handleMouse(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  tiltX.value = x * 8
  tiltY.value = -y * 8
}

function resetMouse() {
  tiltX.value = 0
  tiltY.value = 0
}

async function login() {
  isLoading.value = true
  try {
    const res = await fetch('/api/login')
    const data = await res.json()
    window.location.href = data.url
  } catch {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-scene {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

/* ---- Floating bars background ---- */
.bars-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-bar {
  position: absolute;
  bottom: -80px;
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(to top, var(--accent), var(--accent-2));
  animation: floatUp linear infinite;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) scaleY(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-110vh) scaleY(0.5);
    opacity: 0;
  }
}

/* ---- Glass card ---- */
.login-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 460px;
  padding: 48px 40px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--glass-heavy-blur));
  -webkit-backdrop-filter: blur(var(--glass-heavy-blur));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 24px 80px rgba(0, 0, 0, 0.4),
    0 0 120px rgba(29, 185, 84, 0.08);
  transition: transform 0.3s cubic-bezier(0.03, 0.98, 0.52, 0.99);
  animation: cardEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-glow {
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg,
    rgba(29, 185, 84, 0.15) 0%,
    transparent 40%,
    transparent 60%,
    rgba(168, 85, 247, 0.15) 100%);
  z-index: -1;
  animation: borderGlow 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: perspective(800px) translateY(60px) rotateX(8deg) scale(0.92);
  }
  to {
    opacity: 1;
    transform: perspective(800px) translateY(0) rotateX(0) scale(1);
  }
}

/* ---- Waveform ---- */
.waveform {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 40px;
  margin-bottom: 32px;
}

.wave-bar {
  width: 5px;
  border-radius: 3px;
  background: linear-gradient(to top, var(--accent), var(--accent-2));
  animation: waveAnim 1.2s ease-in-out infinite alternate;
}

.wave-bar:nth-child(1) { height: 60%; }
.wave-bar:nth-child(2) { height: 100%; }
.wave-bar:nth-child(3) { height: 40%; }
.wave-bar:nth-child(4) { height: 80%; }
.wave-bar:nth-child(5) { height: 50%; }

@keyframes waveAnim {
  0% { transform: scaleY(0.4); }
  100% { transform: scaleY(1); }
}

/* ---- Title ---- */
.login-title {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

.title-line {
  display: block;
}

.title-accent {
  background: linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 4s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ---- Subtitle ---- */
.login-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 36px;
  max-width: 340px;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}

/* ---- Button ---- */
.login-btn {
  position: relative;
  width: 100%;
  padding: 16px 28px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 50%, #1db954 100%);
  background-size: 200% 200%;
  color: #000;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
  outline: none;
}

.login-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 8px 40px rgba(29, 185, 84, 0.4),
    0 0 80px rgba(29, 185, 84, 0.15);
  background-position: 100% 50%;
}

.login-btn:active {
  transform: translateY(0) scale(0.98);
}

.login-btn.loading {
  background: linear-gradient(135deg, var(--accent-2), var(--accent-3));
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both,
    gradientShift 2s ease-in-out infinite;
  pointer-events: none;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: btnShine 3s ease-in-out infinite;
}

@keyframes btnShine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 1;
}

.spotify-icon {
  width: 22px;
  height: 22px;
}

/* ---- Particles ---- */
.btn-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #fff;
  animation: particleFloat 1.5s ease-out infinite;
}

.particle:nth-child(odd) { background: var(--accent); }
.particle:nth-child(even) { background: var(--accent-2); }

@keyframes particleFloat {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc((var(--n, 1) - 0.5) * 100px), -60px) scale(0);
    opacity: 0;
  }
}

.particle:nth-child(1) { left: 15%; top: 50%; --n: 0.2; }
.particle:nth-child(2) { left: 30%; top: 40%; --n: 0.4; }
.particle:nth-child(3) { left: 50%; top: 50%; --n: 0.6; }
.particle:nth-child(4) { left: 65%; top: 45%; --n: 0.7; }
.particle:nth-child(5) { left: 80%; top: 50%; --n: 0.9; }
.particle:nth-child(6) { left: 45%; top: 55%; --n: 0.3; }

/* ---- Features ---- */
.login-features {
  display: flex;
  gap: 16px;
  margin-top: 36px;
  width: 100%;
  justify-content: center;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.feature:hover .feature-icon {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.feature-text {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

/* ---- Bottom line ---- */
.bottom-line {
  position: fixed;
  bottom: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent,
    var(--accent),
    var(--accent-2),
    var(--accent-3),
    transparent);
  border-radius: 2px;
  animation: fadeIn 1.5s ease 1s both;
  z-index: 10;
}

/* ---- Responsive ---- */
@media (max-width: 520px) {
  .login-card {
    padding: 36px 24px;
  }
  .login-title {
    font-size: 1.9rem;
  }
  .login-features {
    gap: 12px;
  }
}
</style>
