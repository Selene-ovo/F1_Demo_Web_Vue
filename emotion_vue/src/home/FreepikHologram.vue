<template>
  <div class="freepik-hologram">
    <div class="hologram-container">
      <!-- 홀로그램 디스플레이 -->
      <div class="hologram-display" @mousemove="onMouseMove" ref="displayRef">
        
        <!-- 드라이버 이미지 -->
        <div class="driver-container">
          <div class="hologram-image-wrapper">
            <img 
              :src="currentDriver.image" 
              :alt="currentDriver.name"
              class="driver-image"
              ref="imageRef"
            >
            
            <!-- 무지개 홀로그램 오버레이 -->
            <div class="hologram-rainbow-overlay" ref="rainbowRef"></div>
            
            <!-- 프리즘 효과 -->
            <div class="prism-effects">
              <div class="prism-layer prism-1"></div>
              <div class="prism-layer prism-2"></div>
              <div class="prism-layer prism-3"></div>
            </div>
            
            <!-- 반사 효과 -->
            <div class="reflection-effect"></div>
            
            <!-- 스펙트럼 라인 -->
            <div class="spectrum-lines">
              <div class="spectrum-line" v-for="n in 5" :key="n"></div>
            </div>
          </div>
          
          <!-- 드라이버 정보 -->
          <div class="driver-info">
            <h3 class="hologram-text">{{ currentDriver.name }}</h3>
            <p class="hologram-subtext">{{ currentDriver.team }}</p>
            <div class="driver-stats">
              <span class="stat-item">#{{ currentDriver.number }}</span>
              <span class="stat-item">{{ currentDriver.wins }} WINS</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 홀로그램 컨트롤 -->
      <div class="hologram-controls">
        <button @click="previousDriver" class="holo-btn prev">
          <span>‹</span>
        </button>
        
        <div class="driver-indicators">
          <div 
            v-for="(driver, index) in drivers" 
            :key="driver.id"
            class="holo-indicator"
            :class="{ active: currentIndex === index }"
            @click="goToDriver(index)"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
        </div>
        
        <button @click="nextDriver" class="holo-btn next">
          <span>›</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  drivers: {
    type: Array,
    default: () => []
  }
})

// Refs
const displayRef = ref(null)
const imageRef = ref(null)
const rainbowRef = ref(null)
const currentIndex = ref(0)

// Computed
const currentDriver = computed(() => {
  return props.drivers[currentIndex.value] || props.drivers[0]
})

// Methods
const nextDriver = () => {
  currentIndex.value = (currentIndex.value + 1) % props.drivers.length
  triggerTransition()
}

const previousDriver = () => {
  currentIndex.value = currentIndex.value === 0 ? props.drivers.length - 1 : currentIndex.value - 1
  triggerTransition()
}

const goToDriver = (index) => {
  if (index !== currentIndex.value) {
    currentIndex.value = index
    triggerTransition()
  }
}

const triggerTransition = () => {
  if (imageRef.value) {
    imageRef.value.style.transform = 'scale(0.8) rotateY(180deg)'
    imageRef.value.style.opacity = '0'
    
    setTimeout(() => {
      if (imageRef.value) {
        imageRef.value.style.transform = 'scale(1) rotateY(0deg)'
        imageRef.value.style.opacity = '1'
      }
    }, 300)
  }
}

const onMouseMove = (event) => {
  if (!rainbowRef.value || !displayRef.value) return
  
  const rect = displayRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  // 무지개 효과를 마우스 위치에 따라 이동
  rainbowRef.value.style.background = `
    radial-gradient(circle at ${x}% ${y}%, 
      rgba(255, 0, 150, 0.4) 0%,
      rgba(0, 255, 255, 0.4) 25%,
      rgba(255, 255, 0, 0.4) 50%,
      rgba(255, 0, 255, 0.4) 75%,
      transparent 100%
    )
  `
}

onMounted(() => {
  // 초기 홀로그램 효과 시작
  setTimeout(() => {
    if (imageRef.value) {
      imageRef.value.style.opacity = '1'
      imageRef.value.style.transform = 'scale(1)'
    }
  }, 500)
})
</script>

<style scoped>
.freepik-hologram {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.hologram-container {
  background: 
    radial-gradient(ellipse at center, rgba(0, 0, 0, 0.9) 0%, rgba(5, 5, 15, 0.95) 100%);
  border-radius: 24px;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.hologram-display {
  position: relative;
  cursor: none;
  padding: 2rem;
  border-radius: 20px;
  background: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.driver-container {
  text-align: center;
}

.hologram-image-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.driver-image {
  width: 300px;
  height: 350px;
  object-fit: cover;
  border-radius: 16px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  filter: 
    contrast(1.2) 
    brightness(1.1) 
    saturate(1.3);
}

/* 무지개 홀로그램 오버레이 - Freepik 스타일 */
.hologram-rainbow-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: 
    radial-gradient(circle at 50% 50%, 
      rgba(255, 0, 150, 0.3) 0%,
      rgba(0, 255, 255, 0.3) 25%,
      rgba(255, 255, 0, 0.3) 50%,
      rgba(255, 0, 255, 0.3) 75%,
      transparent 100%
    );
  mix-blend-mode: screen;
  opacity: 0.7;
  animation: rainbowShift 3s ease-in-out infinite alternate;
}

@keyframes rainbowShift {
  0% { 
    filter: hue-rotate(0deg);
    transform: scale(1);
  }
  100% { 
    filter: hue-rotate(60deg);
    transform: scale(1.02);
  }
}

/* 프리즘 효과 */
.prism-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.prism-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  mix-blend-mode: screen;
}

.prism-1 {
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 0, 100, 0.2) 50%, 
    transparent 70%);
  animation: prismMove1 4s ease-in-out infinite;
}

.prism-2 {
  background: linear-gradient(-45deg, 
    transparent 30%, 
    rgba(0, 255, 200, 0.2) 50%, 
    transparent 70%);
  animation: prismMove2 3s ease-in-out infinite reverse;
}

.prism-3 {
  background: linear-gradient(90deg, 
    transparent 40%, 
    rgba(255, 255, 0, 0.15) 50%, 
    transparent 60%);
  animation: prismMove3 5s ease-in-out infinite;
}

@keyframes prismMove1 {
  0%, 100% { transform: translateX(-20%) rotate(0deg); }
  50% { transform: translateX(20%) rotate(2deg); }
}

@keyframes prismMove2 {
  0%, 100% { transform: translateY(-20%) rotate(0deg); }
  50% { transform: translateY(20%) rotate(-2deg); }
}

@keyframes prismMove3 {
  0%, 100% { transform: translate(-10%, -10%) rotate(0deg); }
  50% { transform: translate(10%, 10%) rotate(1deg); }
}

/* 반사 효과 */
.reflection-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 45%, 
    rgba(255, 255, 255, 0.3) 50%, 
    rgba(255, 255, 255, 0.1) 55%, 
    transparent 100%);
  animation: reflectionSweep 2s ease-in-out infinite;
  mix-blend-mode: overlay;
}

@keyframes reflectionSweep {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(100%) skewX(-15deg); }
}

/* 스펙트럼 라인 */
.spectrum-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.spectrum-line {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom,
    rgba(255, 0, 255, 0.4),
    rgba(0, 255, 255, 0.4),
    rgba(255, 255, 0, 0.4),
    rgba(255, 0, 100, 0.4)
  );
  animation: spectrumFloat 3s ease-in-out infinite;
}

.spectrum-line:nth-child(1) { left: 10%; animation-delay: 0s; }
.spectrum-line:nth-child(2) { left: 30%; animation-delay: 0.5s; }
.spectrum-line:nth-child(3) { left: 50%; animation-delay: 1s; }
.spectrum-line:nth-child(4) { left: 70%; animation-delay: 1.5s; }
.spectrum-line:nth-child(5) { left: 90%; animation-delay: 2s; }

@keyframes spectrumFloat {
  0%, 100% { opacity: 0; transform: translateY(0); }
  50% { opacity: 0.6; transform: translateY(-10px); }
}

/* 드라이버 정보 - 홀로그램 스타일 */
.driver-info {
  text-align: center;
}

.hologram-text {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, 
    #ff006e, 
    #00f5ff, 
    #ffff00, 
    #ff00ff);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: hologramTextShift 3s ease-in-out infinite;
  text-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
  margin-bottom: 0.5rem;
}

@keyframes hologramTextShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hologram-subtext {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.driver-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat-item {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

/* 홀로그램 컨트롤 */
.hologram-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 3rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.holo-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(255, 0, 150, 0.2), 
    rgba(0, 255, 255, 0.2));
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.holo-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
  background: linear-gradient(135deg, 
    rgba(255, 0, 150, 0.4), 
    rgba(0, 255, 255, 0.4));
}

.driver-indicators {
  display: flex;
  gap: 0.5rem;
}

.holo-indicator {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.holo-indicator.active {
  background: linear-gradient(135deg, 
    rgba(255, 0, 150, 0.3), 
    rgba(0, 255, 255, 0.3));
  border-color: rgba(255, 255, 255, 0.5);
  color: #ffffff;
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.4);
}

.holo-indicator:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

/* 반응형 */
@media (max-width: 768px) {
  .freepik-hologram {
    padding: 1rem;
  }
  
  .hologram-container {
    padding: 2rem 1rem;
  }
  
  .driver-image {
    width: 250px;
    height: 300px;
  }
  
  .hologram-text {
    font-size: 2rem;
  }
  
  .hologram-controls {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .driver-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>