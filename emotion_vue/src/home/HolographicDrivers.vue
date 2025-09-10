<template>
  <section ref="sectionElement" class="holographic-drivers">
    <div class="section-header" :class="{ 'visible': headerVisible }">
      <span class="section-number">01</span>
      <h2 class="section-title">
        <span class="title-line">Holographic Drivers</span>
        <span class="title-description">
          차세대 홀로그램 기술로 만나는 F1 드라이버들. 
          파티클이 조립되어 선수의 모습을 구현합니다.
        </span>
      </h2>
    </div>

    <!-- Particle Assembly Animation -->
    <div class="driver-hologram" :class="{ 'assembling': isAssembling, 'complete': hologramComplete }">
      <!-- Particle points that form driver silhouette -->
      <div class="particle-container">
        <div 
          v-for="particle in particles" 
          :key="particle.id"
          class="particle-point"
          :style="{
            '--start-x': particle.startX + 'px',
            '--start-y': particle.startY + 'px',
            '--end-x': particle.endX + 'px',
            '--end-y': particle.endY + 'px',
            '--delay': particle.delay + 's',
            '--color': particle.color
          }"
        ></div>
      </div>

      <!-- Driver silhouette overlay (appears when assembly complete) -->
      <div class="driver-silhouette" v-if="hologramComplete">
        <div class="driver-outline"></div>
        <div class="driver-glow"></div>
        <div class="driver-details">
          <div class="helmet"></div>
          <div class="body"></div>
        </div>
      </div>

      <!-- Hologram effects -->
      <div class="hologram-effects">
        <div class="scan-lines"></div>
        <div class="interference-lines"></div>
        <div class="energy-field"></div>
      </div>
    </div>

    <!-- Progress indicator -->
    <div class="assembly-progress" :class="{ 'visible': progressVisible }">
      <div class="progress-text">HOLOGRAM ASSEMBLY</div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: `${assemblyProgress}%` }"></div>
      </div>
      <div class="progress-percentage">{{ Math.round(assemblyProgress) }}%</div>
    </div>


    <!-- Background Tech Grid -->
    <div class="tech-grid">
      <div class="grid-lines-h"></div>
      <div class="grid-lines-v"></div>
      <div class="grid-nodes"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

// Reactive states
const sectionElement = ref(null)
const headerVisible = ref(false)
const isAssembling = ref(false)
const hologramComplete = ref(false)
const progressVisible = ref(false)
const assemblyProgress = ref(0)

// Particle system for hologram assembly
const particles = ref([])
const particleCount = 150

// Initialize particles forming driver silhouette
const initParticles = () => {
  particles.value = []
  
  // Create particles in driver shape pattern
  const centerX = 0
  const centerY = 0
  
  for (let i = 0; i < particleCount; i++) {
    // Random starting positions (scattered)
    const startX = (Math.random() - 0.5) * 800
    const startY = (Math.random() - 0.5) * 600
    
    // Target positions forming driver silhouette
    const angle = (i / particleCount) * Math.PI * 2
    const radius = 80 + Math.random() * 40
    const endX = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 60
    const endY = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 80
    
    // Particle colors (F1 theme)
    const colors = ['#ff0000', '#ffffff', '#0066ff', '#ffaa00']
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    particles.value.push({
      id: i,
      startX,
      startY,
      endX,
      endY,
      delay: Math.random() * 2,
      color,
      intensity: Math.random()
    })
  }
}

// Section scroll handler
let isInSection = ref(false)
let sectionProgress = ref(0)

const handleScroll = () => {
  if (!sectionElement.value) return
  
  const rect = sectionElement.value.getBoundingClientRect()
  const windowHeight = window.innerHeight
  
  // Check if section is in viewport
  const sectionTop = rect.top
  const sectionBottom = rect.bottom
  
  isInSection.value = sectionTop < windowHeight && sectionBottom > 0
  
  if (!isInSection.value) {
    return
  }
  
  // Calculate progress within section
  const scrollWithinSection = Math.max(0, windowHeight - sectionTop)
  sectionProgress.value = Math.min(scrollWithinSection / windowHeight, 1)
  
  // Trigger animations based on scroll progress
  if (sectionProgress.value > 0.1) {
    headerVisible.value = true
  }
  
  if (sectionProgress.value > 0.3) {
    progressVisible.value = true
    isAssembling.value = true
    
    // Update assembly progress
    const progress = Math.max(0, (sectionProgress.value - 0.3) / 0.4)
    assemblyProgress.value = progress * 100
  }
  
  if (sectionProgress.value > 0.7) {
    hologramComplete.value = true
  }
}


// Listen for F1 sequence completion
const handleF1SequenceComplete = (event) => {
  // Trigger smooth scroll to this section
  setTimeout(() => {
    sectionElement.value?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start' 
    })
  }, 500)
}

onMounted(() => {
  initParticles()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('f1-sequence-complete', handleF1SequenceComplete)
  
  // Initial check
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('f1-sequence-complete', handleF1SequenceComplete)
})
</script>

<style scoped>
.holographic-drivers {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
  padding: 2rem;
}

/* Section Header */
.section-header {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin-bottom: 4rem;
  z-index: 10;
}

.section-header.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-number {
  display: block;
  font-size: 1.5rem;
  color: #00aaff;
  font-weight: 300;
  margin-bottom: 1rem;
  letter-spacing: 0.2em;
}

.section-title {
  margin: 0;
}

.title-line {
  display: block;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  color: white;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.title-description {
  display: block;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Hologram Container */
.driver-hologram {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 2rem auto;
}

/* Particle System */
.particle-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.particle-point {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--color);
  border-radius: 50%;
  opacity: 0;
  transform: translate(var(--start-x), var(--start-y));
  box-shadow: 0 0 6px var(--color);
}

.driver-hologram.assembling .particle-point {
  opacity: 1;
  animation: particleAssemble 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) var(--delay) forwards;
}

@keyframes particleAssemble {
  0% {
    transform: translate(var(--start-x), var(--start-y));
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--end-x), var(--end-y));
    opacity: 1;
  }
}

/* Driver Silhouette */
.driver-silhouette {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 280px;
  opacity: 0;
  animation: hologramFadeIn 1s ease-in-out 0.5s forwards;
}

@keyframes hologramFadeIn {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.driver-outline {
  width: 100%;
  height: 100%;
  border: 2px solid #00aaff;
  border-radius: 20px 20px 0 0;
  position: relative;
  background: rgba(0, 170, 255, 0.1);
}

.driver-glow {
  position: absolute;
  inset: -10px;
  border-radius: 30px 30px 10px 10px;
  background: radial-gradient(ellipse, rgba(0, 170, 255, 0.2), transparent);
  animation: hologramPulse 2s infinite ease-in-out;
}

@keyframes hologramPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Driver Details */
.driver-details {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.helmet {
  width: 60%;
  height: 35%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #ffffff;
  border-radius: 50% 50% 30% 30%;
  margin: 10px auto 0;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.body {
  width: 70%;
  height: 50%;
  background: rgba(0, 170, 255, 0.1);
  border: 1px solid #00aaff;
  margin: 15px auto;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 170, 255, 0.3);
}

/* Hologram Effects */
.hologram-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 170, 255, 0.1) 2px,
    rgba(0, 170, 255, 0.1) 4px
  );
  animation: scanMove 2s linear infinite;
}

@keyframes scanMove {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.interference-lines {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 98%,
    rgba(255, 255, 255, 0.1) 100%
  );
  animation: interference 0.1s linear infinite;
}

@keyframes interference {
  0% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}

.energy-field {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(0, 170, 255, 0.1) 0%,
    rgba(0, 170, 255, 0.05) 50%,
    transparent 100%
  );
  animation: energyPulse 3s ease-in-out infinite;
}

@keyframes energyPulse {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.6; }
}

/* Assembly Progress */
.assembly-progress {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
  text-align: center;
  margin-top: 3rem;
}

.assembly-progress.visible {
  opacity: 1;
  transform: translateY(0);
}

.progress-text {
  font-size: 0.9rem;
  color: #00aaff;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
}

.progress-track {
  width: 300px;
  height: 2px;
  background: rgba(0, 170, 255, 0.3);
  margin: 0 auto 1rem;
  border-radius: 1px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00aaff, #ffffff);
  border-radius: 1px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px #00aaff;
}

.progress-percentage {
  font-size: 1.2rem;
  color: white;
  font-weight: 300;
}


/* Tech Grid Background */
.tech-grid {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  overflow: hidden;
}

.grid-lines-h,
.grid-lines-v {
  position: absolute;
  inset: 0;
}

.grid-lines-h {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 50px,
    rgba(0, 170, 255, 0.3) 50px,
    rgba(0, 170, 255, 0.3) 51px
  );
}

.grid-lines-v {
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 50px,
    rgba(0, 170, 255, 0.3) 50px,
    rgba(0, 170, 255, 0.3) 51px
  );
}

/* Responsive Design */
@media (max-width: 768px) {
  .driver-hologram {
    width: 300px;
    height: 300px;
  }
  
  .progress-track {
    width: 250px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>