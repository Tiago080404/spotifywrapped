<template>
  <nav class="glass-nav" :class="{ collapsed: isCollapsed }">
    <div class="nav-inner">
      <!-- Brand -->
      <div class="brand" @click="isCollapsed = !isCollapsed">
        <div class="brand-logo">
          <div class="logo-ring">
            <div class="logo-ring-inner"></div>
          </div>
        </div>
        <transition name="brand-fade">
          <span class="brand-text" v-show="!isCollapsed">Wrapped</span>
        </transition>
      </div>

      <!-- Menu -->
      <div class="nav-section">
        <span class="nav-label" v-show="!isCollapsed">DISCOVER</span>
        <ul class="menu">
          <li v-for="item in menuItems" :key="item.path">
            <a class="menu-item" :href="item.path"
              :class="{ active: currentPath === item.path }"
              @mouseenter="hoveredItem = item.path"
              @mouseleave="hoveredItem = null">
              <div class="menu-icon" :style="{ '--item-color': item.color }">
                <span v-html="item.icon"></span>
              </div>
              <transition name="label-fade">
                <span class="menu-text" v-show="!isCollapsed">{{ item.label }}</span>
              </transition>
              <div class="active-indicator" v-if="currentPath === item.path"></div>
            </a>
          </li>
        </ul>
      </div>

      <!-- Bottom -->
      <div class="nav-bottom">
        <div class="nav-divider"></div>
        <a class="menu-item logout-item" href="/" @click="logout">
          <div class="menu-icon" style="--item-color: rgba(239, 68, 68, 0.2)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <transition name="label-fade">
            <span class="menu-text" v-show="!isCollapsed">Logout</span>
          </transition>
        </a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isCollapsed = ref(false)
const hoveredItem = ref<string | null>(null)
const currentPath = ref(window.location.pathname)

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    color: 'rgba(29, 185, 84, 0.2)',
  },
  {
    path: '/toptracks',
    label: 'Top Tracks',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    color: 'rgba(168, 85, 247, 0.2)',
  },
  {
    path: '/recent',
    label: 'Zuletzt Gehoert',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    color: 'rgba(6, 182, 212, 0.2)',
  },
  {
    path: '/recommendations',
    label: 'Fuer Dich',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/></svg>',
    color: 'rgba(245, 158, 11, 0.2)',
  },
  {
    path: '/story',
    label: 'Your Story',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>',
    color: 'rgba(236, 72, 153, 0.2)',
  },
]

function logout() {
  localStorage.removeItem('spotify_token')
  localStorage.removeItem('spotify_refresh_token')
}

onMounted(() => {
  currentPath.value = window.location.pathname
})
</script>

<style scoped>
.glass-nav {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
  width: 240px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(var(--glass-heavy-blur));
  -webkit-backdrop-filter: blur(var(--glass-heavy-blur));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 16px 48px rgba(0, 0, 0, 0.3);
  transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  z-index: 10;
  animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.glass-nav.collapsed {
  width: 72px;
}

.nav-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 12px;
  gap: 8px;
}

/* ---- Brand ---- */
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
  margin-bottom: 8px;
}

.brand:hover {
  background: rgba(255, 255, 255, 0.05);
}

.brand-logo {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-ring {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  background-image: linear-gradient(#050505, #050505),
    linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3));
  background-origin: border-box;
  background-clip: padding-box, border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: logoSpin 8s linear infinite;
}

.logo-ring-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
}

@keyframes logoSpin {
  to { transform: rotate(360deg); }
}

.brand-text {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff, rgba(255,255,255,0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

/* ---- Section ---- */
.nav-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-label {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding: 12px 12px 6px;
  text-transform: uppercase;
}

/* ---- Menu ---- */
.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  overflow: hidden;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  transform: translateX(3px);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.menu-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--item-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.menu-item:hover .menu-icon {
  transform: scale(1.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.menu-text {
  white-space: nowrap;
  overflow: hidden;
}

.active-indicator {
  position: absolute;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
  animation: pulse 2s ease-in-out infinite;
}

/* ---- Bottom ---- */
.nav-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  margin: 0 8px;
}

.logout-item {
  color: rgba(239, 68, 68, 0.7);
}

.logout-item:hover {
  color: rgb(239, 68, 68);
  background: rgba(239, 68, 68, 0.08);
}

/* ---- Transitions ---- */
.brand-fade-enter-active,
.brand-fade-leave-active,
.label-fade-enter-active,
.label-fade-leave-active {
  transition: all 0.3s ease;
}

.brand-fade-enter-from,
.brand-fade-leave-to,
.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* ---- Mobile ---- */
@media (max-width: 900px) {
  .glass-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    height: auto;
    width: auto !important;
    border-radius: 0;
    z-index: 100;
    border-left: none;
    border-right: none;
    border-bottom: none;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .nav-inner {
    flex-direction: row;
    padding: 6px 8px;
    gap: 2px;
    align-items: center;
    justify-content: space-around;
  }

  .brand { display: none; }
  .nav-label { display: none; }
  .nav-section { flex-direction: row; flex: 1; }
  .menu { flex-direction: row; gap: 2px; flex: 1; justify-content: space-around; }
  .nav-bottom { display: none; }
  .nav-divider { display: none; }
  .menu-text { display: none !important; }
  .active-indicator { display: none; }

  .menu-item {
    flex-direction: column;
    gap: 2px;
    padding: 6px 8px;
    border-radius: 12px;
    font-size: 0.6rem;
  }

  .menu-item:hover {
    transform: none;
  }

  .menu-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
  }
}
</style>
