<template>
  <nav class="side-card">
    <div class="nav-top">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-text">Spotify Wrapped</span>
      </div>

      <div class="divider"></div>

      <ul class="menu">
        <li><a class="menu-item" href="/dashboard">Top Artists</a></li>
        <li><a class="menu-item" href="/toptracks">Top Tracks</a></li>
      </ul>
    </div>

    <div class="nav-bottom">
      <div class="divider"></div>
      <ul class="menu menu-bottom">
        <li><a class="menu-item" href="#">Settings</a></li>
        <li><a class="menu-item" href="#">Logout</a></li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped>
.side-card {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 88vh;
  max-height: 88vh;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px 14px;
  overflow-y: auto;
}

.nav-top {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.nav-bottom {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
}

.brand-mark {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
}

.brand-text {
  font-size: 1rem;
  font-weight: 650;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.16);
  margin: 2px 6px;
}

.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 10px 12px;
  border-radius: 11px;
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: translateX(2px);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.92);
  color: #1c1d1f;
}

.menu-bottom .menu-item {
  font-size: 0.88rem;
}

@media (max-width: 900px) {
  .side-card {
    position: static;
    min-height: auto;
    max-height: none;
    border-radius: 16px;
    padding: 12px;
    gap: 16px;
  }

  .nav-top,
  .nav-bottom {
    gap: 10px;
  }

  .menu {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .menu-item {
    padding: 8px 10px;
    font-size: 0.82rem;
  }
}
</style>
