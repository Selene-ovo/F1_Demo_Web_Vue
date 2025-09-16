<template>
  <div id="app" class="app-container">

    <!-- Dark Background with Particle Effect -->
    <div class="dark-background">
      <div class="particle-layer"></div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- App Header -->
    <AppHeader />

    <!-- Main Content -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- App Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useSEO } from '@/functions/useSEO'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { OverlayScrollbars } from 'overlayscrollbars'
import 'overlayscrollbars/overlayscrollbars.css'

// SEO 설정
const { setSEO } = useSEO()

// 기본 SEO 설정
onMounted(() => {
  setSEO({
    title: 'EMOLA',
    description: 'F1의 속도와 열정을 경험하세요. 드라이버 프로필, 팀 정보, 챔피언십 기록, 최신 뉴스까지 모든 F1 정보를 EMOLA에서.',
    keywords: 'F1, Formula1, EMOLA, 레이싱, 드라이버, 포뮬러원, 챔피언십, 모터스포츠',
    ogImage: '/images/og-emola.jpg'
  })

  // Initialize OverlayScrollbars with round theme and custom positioning
  OverlayScrollbars(document.body, {
    className: 'os-theme-round-dark',
    resize: 'none',
    sizeAutoCapable: true,
    clipAlways: true,
    normalizeRTL: true,
    paddingAbsolute: false,
    autoUpdate: null,
    autoUpdateInterval: 33,
    updateOnLoad: ['img'],
    nativeScrollbarsOverlaid: {
      showNativeScrollbars: false,
      initialize: true
    },
    overflowBehavior: {
      x: 'scroll',
      y: 'scroll'
    },
    scrollbars: {
      visibility: 'auto',
      autoHide: 'never',
      autoHideDelay: 800,
      dragScrolling: true,
      clickScrolling: false,
      touchSupport: true,
      snapHandle: false
    }
  })

  // Custom positioning with CSS
  const style = document.createElement('style')
  style.textContent = `
    .os-scrollbar-vertical {
      right: 30px !important;
      width: 10px !important;
      top: 38% !important;
      height: 24% !important;
    }
    .os-scrollbar-horizontal {
      bottom: 30px !important;
      height: 10px !important;
      left: 38% !important;
      width: 24% !important;
    }
    .os-scrollbar .os-scrollbar-track {
      background: rgba(128, 128, 128, 0.2) !important;
      border-radius: 8px !important;
    }
    .os-scrollbar .os-scrollbar-handle {
      background: white !important;
      border-radius: 6px !important;
      min-height: 35px !important;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.1) !important;
      pointer-events: none !important;
    }
    .os-scrollbar-track {
      pointer-events: none !important;
    }
  `
  document.head.appendChild(style)

  // Completely disable scrollbar interactions
  setTimeout(() => {
    const scrollbars = document.querySelectorAll('.os-scrollbar, .os-scrollbar-track, .os-scrollbar-handle')
    scrollbars.forEach(element => {
      element.style.pointerEvents = 'none'
    })
  }, 200)

  // Stop any auto-scroll animations
  setTimeout(() => {
    document.documentElement.style.scrollBehavior = 'auto'
  }, 100)
})
</script>

<style scoped>
/* App Container */
.app-container {
  font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  position: relative;
  background: #000;
  color: #fff;
  overflow-x: hidden;
}

/* Dark Background */
.dark-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: radial-gradient(ellipse at center, rgba(20, 20, 20, 0.9) 0%, rgba(0, 0, 0, 1) 100%);
}

.particle-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.15), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255, 255, 255, 0.1), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.08), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.12), transparent);
  background-repeat: repeat;
  background-size: 150px 100px;
  animation: particleFloat 20s linear infinite;
}

.gradient-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(15, 15, 15, 0.9) 25%,
    rgba(0, 0, 0, 0.95) 50%,
    rgba(10, 10, 10, 0.9) 75%,
    rgba(0, 0, 0, 1) 100%
  );
}

@keyframes particleFloat {
  0% {
    transform: translateY(0px) translateX(0px);
  }
  33% {
    transform: translateY(-10px) translateX(10px);
  }
  66% {
    transform: translateY(-20px) translateX(-5px);
  }
  100% {
    transform: translateY(0px) translateX(0px);
  }
}

/* Main Content */
.main-content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  padding-top: 80px; /* Account for header height */
}

/* Global Reset */
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: auto;
}

body {
  margin: 0;
  padding: 0;
  background: #000;
  overflow-x: hidden;
}

</style>

<!-- Global Styles -->
<style>
/* Ensure consistent dark theme across all components */
body {
  background: #000 !important;
  color: #fff !important;
}

/* Override any conflicting styles */
.bg-f1-bg-dark,
.bg-white {
  background: transparent !important;
}

/* Smooth transitions for route changes */
.router-view {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>