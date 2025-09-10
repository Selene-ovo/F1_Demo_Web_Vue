<template>
  <div class="simple-hologram">
    <div class="hologram-display">
      <div class="driver-image-container">
        <img 
          :src="currentDriver.image" 
          :alt="currentDriver.name"
          class="driver-image"
        >
        <div class="hologram-effects">
          <div class="scan-line"></div>
          <div class="glitch-overlay"></div>
          <div class="particles">
            <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle()"></div>
          </div>
        </div>
      </div>
      
      <div class="driver-info">
        <h3>{{ currentDriver.name }}</h3>
        <p>{{ currentDriver.team }}</p>
        <div class="driver-stats">
          <span>{{ currentDriver.number }}번</span>
          <span>{{ currentDriver.wins }} 승리</span>
        </div>
      </div>
    </div>

    <div class="hologram-controls">
      <button @click="previousDriver" class="nav-btn">‹</button>
      <div class="indicators">
        <div 
          v-for="(driver, index) in drivers" 
          :key="driver.id"
          class="indicator"
          :class="{ active: currentIndex === index }"
          @click="goToDriver(index)"
        ></div>
      </div>
      <button @click="nextDriver" class="nav-btn">›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  drivers: {
    type: Array,
    default: () => []
  }
})

const currentIndex = ref(0)

const currentDriver = computed(() => {
  return props.drivers[currentIndex.value] || props.drivers[0]
})

const nextDriver = () => {
  currentIndex.value = (currentIndex.value + 1) % props.drivers.length
}

const previousDriver = () => {
  currentIndex.value = currentIndex.value === 0 ? props.drivers.length - 1 : currentIndex.value - 1
}

const goToDriver = (index) => {
  currentIndex.value = index
}

const getParticleStyle = () => {
  return {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: Math.random() * 2 + 's'
  }
}
</script>

<style scoped>
.simple-hologram {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.hologram-display {
  position: relative;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(10, 10, 20, 0.95) 100%);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  padding: 3rem;
  margin-bottom: 2rem;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.2),
    inset 0 0 30px rgba(0, 255, 255, 0.05);
}

.driver-image-container {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.driver-image {
  width: 200px;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
  filter: 
    brightness(1.2) 
    contrast(1.1) 
    hue-rotate(10deg);
  transition: all 0.5s ease;
  animation: hologramFlicker 3s infinite;
}

@keyframes hologramFlicker {
  0%, 100% { opacity: 0.8; filter: brightness(1.2) contrast(1.1); }
  50% { opacity: 1; filter: brightness(1.4) contrast(1.2) hue-rotate(5deg); }
}

.hologram-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 스캔라인 효과 */
.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
  animation: scanMove 2s linear infinite;
}

@keyframes scanMove {
  0% { top: 0; opacity: 0; }
  10%, 90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* 글리치 효과 */
.glitch-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 0, 0, 0.05) 2px,
    rgba(255, 0, 0, 0.05) 4px
  );
  animation: glitchMove 0.3s infinite;
  mix-blend-mode: screen;
}

@keyframes glitchMove {
  0% { transform: translateX(0); }
  20% { transform: translateX(-2px); }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-1px); }
  80% { transform: translateX(1px); }
  100% { transform: translateX(0); }
}

/* 파티클 효과 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(0, 255, 255, 0.8);
  border-radius: 50%;
  animation: particleFloat 3s infinite;
}

@keyframes particleFloat {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
  50% { opacity: 1; transform: translateY(-20px) scale(1); }
}

/* 드라이버 정보 */
.driver-info h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #00ffff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.driver-info p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1rem;
}

.driver-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 1rem;
  color: rgba(0, 255, 255, 0.9);
}

/* 컨트롤 */
.hologram-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 1rem 2rem;
  border-radius: 50px;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.nav-btn {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: scale(1.1);
}

.indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.indicator:hover {
  background: rgba(0, 255, 255, 0.7);
  transform: scale(1.2);
}

/* 반응형 */
@media (max-width: 768px) {
  .simple-hologram {
    padding: 1rem;
  }
  
  .hologram-display {
    padding: 2rem 1rem;
  }
  
  .driver-image {
    width: 150px;
    height: 180px;
  }
  
  .driver-info h3 {
    font-size: 1.5rem;
  }
  
  .driver-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>