<template>
  <div id="app" class="app-container">
    <!-- Three.js Background -->
    <ThreeBackground />

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
import { usePerformance } from '@/functions/usePerformance'
import AppHeader from '@/common/AppHeader.vue'
import AppFooter from '@/common/AppFooter.vue'
import ThreeBackground from '@/home/ThreeBackground.vue'

// SEO 설정
const { setSEO } = useSEO()

// 성능 최적화
const { isLoading } = usePerformance()

// 기본 SEO 설정
onMounted(() => {
  setSEO({
    title: 'EMOLA',
    description: 'F1의 속도와 열정을 경험하세요. 드라이버 프로필, 팀 정보, 챔피언십 기록, 최신 뉴스까지 모든 F1 정보를 EMOLA에서.',
    keywords: 'F1, Formula1, EMOLA, 레이싱, 드라이버, 포뮬러원, 챔피언십, 모터스포츠',
    ogImage: '/images/og-emola.jpg'
  })
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
  scroll-behavior: smooth;
}

body {
  margin: 0;
  padding: 0;
  background: #000;
  overflow-x: hidden;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Firefox Scrollbar */
html {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
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