<template>
  <section class="section-01">
    <!-- HolographicDrivers -->
    <div class="home-content">
      <div class="hero-section">
        <span class="section-number">01</span>
        <h1 class="hero-title">
          <span class="title-line">FORMULA 1</span>
          <span class="title-subtitle">BEYOND THE LIMIT</span>
        </h1>
        <p class="hero-description">
          시속 350km의 극한.<br />
          0.001초가 승부를 가르는 세계.
        </p>

        <!-- 스크롤 유도 -->
        <div
          class="scroll-indicator"
          :style="{
            transform: `translate(-50%, ${scrollY}px)`,
            opacity: scrollIndicatorOpacity,
          }"
        >
          <p class="scroll-text">Scroll down to explore more</p>
          <div class="scroll-arrow">
            <div class="arrow-line"></div>
            <div class="arrow-head"></div>
          </div>
        </div>
      </div>

      <!-- 홈 배경 효과 -->
      <div class="home-background-effects">
        <!-- Three.js 3D 배경 -->
        <TjHomeBackground />

        <!-- F1 카 지나가는 효과 -->
        <div class="f1-car-animation">
          <div class="f1-car"></div>
          <div class="car-trail"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import TjHomeBackground from '@/components/ui/Home.vue'

const scrollY = ref(0)
const scrollIndicatorOpacity = ref(1)

onMounted(() => {
  // 홈 섹션 초기화
  initHomeEffects()

  // 스크롤 이벤트 리스너 추가
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 스크롤 이벤트 리스너 제거
  window.removeEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  scrollY.value = window.scrollY
  const windowHeight = window.innerHeight

  // 스크롤이 뷰포트의 30%를 넘으면 페이드 아웃 시작
  const fadeStartPoint = windowHeight * 0.3

  if (scrollY.value <= fadeStartPoint) {
    scrollIndicatorOpacity.value = 1
  } else {
    // fadeStartPoint부터 40% 구간에서 부드럽게 페이드 아웃
    const fadeDistance = windowHeight * 0.4
    const fadeProgress = Math.min((scrollY.value - fadeStartPoint) / fadeDistance, 1)
    scrollIndicatorOpacity.value = Math.max(0, 1 - fadeProgress)
  }
}

const initHomeEffects = () => {
  // Three.js 배경이 자동으로 초기화
  console.log('Three.js background initialized')
}
</script>

<style scoped>
.section-01 {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
  padding: 2rem;
}

.home-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
  z-index: 2;
  position: relative;
}

.hero-section {
  padding: 0;
  margin-top: -8rem;
}

.section-number {
  display: block;
  font-size: 1.5rem;
  color: #666;
  font-weight: 300;
  margin-bottom: 1rem;
  letter-spacing: 0.2em;
}

.hero-title {
  margin: 0 0 2rem 0;
}

.title-line {
  display: block;
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.title-subtitle {
  display: block;
  font-size: clamp(0.8rem, 2vw, 1.2rem);
  font-weight: 600;
  color: #dc2626;
  letter-spacing: 0.3em;
  margin-top: 1rem;
  text-transform: uppercase;
}

.hero-description {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 8rem auto;
  font-weight: 300;
}

/* 스크롤 유도 */
.scroll-indicator {
  position: fixed;
  bottom: 6rem;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: scrollBounce 2s ease-in-out infinite;
  z-index: 3;
}

.scroll-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  letter-spacing: 0.1em;
}

.scroll-arrow {
  position: relative;
  width: 2px;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.arrow-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8));
}

.arrow-head {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid rgba(255, 255, 255, 0.8);
  margin-top: -2px;
}

@keyframes scrollBounce {
  0%,
  100% {
    transform: translate(-50%, 0);
  }
  50% {
    transform: translate(-50%, 10px);
  }
}

/* 홈 배경 효과 */
.home-background-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* F1 카 애니메이션 */
.f1-car-animation {
  position: absolute;
  top: 35%;
  left: 0;
  width: 100%;
  height: 100px;
  transform: translateY(-50%);
  animation: carPass 12s linear infinite;
  transition: all 1s ease;
}

.f1-car {
  position: absolute;
  left: -120px;
  top: 50%;
  width: 120px;
  height: 50px;
  background: url('/src/assets/images/Cars/Ferrari_SF-25.jpg') no-repeat center center;
  background-size: contain;
  transform: translateY(-50%);
  filter: brightness(1.2) contrast(1.1);
}

.car-trail {
  position: absolute;
  left: -250px;
  top: 60%;
  width: 200px;
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: translateY(-50%);
  opacity: 0.4;
}

@keyframes carPass {
  0% {
    left: -120px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}
</style>
