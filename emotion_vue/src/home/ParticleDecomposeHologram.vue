<template>
  <div class="particle-hologram-container">
    <div class="hologram-display" ref="containerRef">
      <!-- Three.js Canvas -->
      <canvas ref="canvasRef" class="particle-canvas"></canvas>
      
      <!-- UI 오버레이 -->
      <div class="hologram-ui">
        <div class="driver-info-panel" :class="{ visible: showInfo }">
          <h2 class="driver-name">{{ currentDriver.name }}</h2>
          <p class="driver-name-en" v-if="currentDriver.nameEn">{{ currentDriver.nameEn }}</p>
          <p class="driver-team">{{ currentDriver.team }}</p>
          <div class="driver-stats">
            <div class="stat">
              <span class="stat-label">NUMBER</span>
              <span class="stat-value">#{{ currentDriver.number }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">WINS</span>
              <span class="stat-value">{{ currentDriver.wins }}</span>
            </div>
          </div>
        </div>

        <!-- 컨트롤 -->
        <div class="hologram-controls">
          <button @click="previousDriver" class="control-btn" :disabled="isTransitioning">‹</button>
          <div class="status-indicator">
            <span v-if="isTransitioning">DECOMPILING...</span>
            <span v-else-if="showInfo">ASSEMBLED</span>
            <span v-else>ASSEMBLING...</span>
          </div>
          <button @click="nextDriver" class="control-btn" :disabled="isTransitioning">›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  drivers: {
    type: Array,
    default: () => []
  }
})

// Refs
const containerRef = ref(null)
const canvasRef = ref(null)
const currentIndex = ref(0)
const showInfo = ref(false)
const isTransitioning = ref(false)

// Three.js variables
let scene, camera, renderer, particles, animationId
let particlesData = []
let isAssembling = false

// Computed
const currentDriver = ref(props.drivers[0] || {})

// Methods
const initThreeJS = () => {
  if (!containerRef.value || !canvasRef.value) return
  
  if (typeof window.THREE === 'undefined') {
    console.warn('Three.js not loaded yet, retrying...')
    setTimeout(initThreeJS, 50)
    return
  }

  const THREE = window.THREE

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Camera setup  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 100

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8)
  renderer.setPixelRatio(window.devicePixelRatio)

  // Load first driver
  loadDriverParticles(props.drivers[currentIndex.value])

  // Start animation loop
  animate()
}

const loadDriverParticles = async (driver) => {
  if (!driver) return

  const THREE = window.THREE

  // Clear existing particles
  if (particles) {
    scene.remove(particles)
    particles.geometry.dispose()
    particles.material.dispose()
  }

  showInfo.value = false
  currentDriver.value = driver

  // Create image canvas
  const img = new Image()
  img.crossOrigin = 'anonymous'

  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Higher resolution for better image quality (160x160 = 25,600 particles)
    const size = 160
    canvas.width = size
    canvas.height = size
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0, size, size)
    const imageData = ctx.getImageData(0, 0, size, size)
    
    createParticleSystem(imageData, THREE)
  }

  img.onerror = () => {
    console.warn('Failed to load driver image:', driver.image)
    createFallbackParticles(THREE)
  }

  img.src = driver.image
}

const createParticleSystem = (imageData, THREE) => {
  const particleCount = imageData.width * imageData.height
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const originalPositions = new Float32Array(particleCount * 3)

  particlesData = []
  let particleIndex = 0

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const pixelIndex = (y * imageData.width + x) * 4
      const r = imageData.data[pixelIndex] / 255
      const g = imageData.data[pixelIndex + 1] / 255  
      const b = imageData.data[pixelIndex + 2] / 255
      const a = imageData.data[pixelIndex + 3] / 255

      // Skip transparent pixels - more strict threshold
      if (a < 0.05) {
        continue
      }

      // Target position (assembled state)
      const targetX = (x - imageData.width / 2) * 0.8
      const targetY = -(y - imageData.height / 2) * 0.8
      const targetZ = 0

      // Random scattered position (disassembled state)  
      const scatteredX = (Math.random() - 0.5) * 200
      const scatteredY = (Math.random() - 0.5) * 200
      const scatteredZ = (Math.random() - 0.5) * 100

      // Store data
      particlesData.push({
        target: { x: targetX, y: targetY, z: targetZ },
        scattered: { x: scatteredX, y: scatteredY, z: scatteredZ },
        color: { r, g, b }
      })

      // Initial positions (scattered)
      positions[particleIndex * 3] = scatteredX
      positions[particleIndex * 3 + 1] = scatteredY  
      positions[particleIndex * 3 + 2] = scatteredZ

      // Target positions
      originalPositions[particleIndex * 3] = targetX
      originalPositions[particleIndex * 3 + 1] = targetY
      originalPositions[particleIndex * 3 + 2] = targetZ

      // Colors
      colors[particleIndex * 3] = r
      colors[particleIndex * 3 + 1] = g
      colors[particleIndex * 3 + 2] = b

      particleIndex++
    }
  }

  // Create geometry with actual particle count
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(0, particleIndex * 3), 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors.slice(0, particleIndex * 3), 3))

  // Create material
  const material = new THREE.PointsMaterial({
    size: 2.0, // Larger particles for better coverage
    vertexColors: true,
    blending: THREE.NormalBlending, // Better for solid image formation
    transparent: true,
    opacity: 0.9 // More opaque
  })

  // Create particle system
  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // Start assembly animation
  setTimeout(() => {
    assembleParticles()
  }, 100)
}

const createFallbackParticles = (THREE) => {
  // Simple fallback if image fails to load
  const particleCount = 5000
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100  
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50

    colors[i * 3] = Math.random() * 0.5 + 0.5
    colors[i * 3 + 1] = Math.random() * 0.5 + 0.5
    colors[i * 3 + 2] = 1
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

const assembleParticles = () => {
  if (!particles || !particlesData.length || isAssembling) return

  isAssembling = true
  const startTime = Date.now()
  const duration = 3000 // 3 seconds (much faster)

  const assembleAnimation = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Sharp ending for precise positioning
    let easing
    if (progress < 0.95) {
      // Fast movement for first 95%
      easing = 1 - Math.pow(1 - progress / 0.95, 2)
    } else {
      // Precise final positioning - no randomization
      easing = 1
    }

    const positions = particles.geometry.attributes.position.array

    for (let i = 0; i < particlesData.length; i++) {
      const data = particlesData[i]
      
      if (progress < 0.95) {
        // Add slight movement during assembly but reduce over time
        const randomFactor = (1 - progress / 0.95) * 0.3
        const randomOffset = Math.sin(elapsed * 0.001 + i * 0.01) * randomFactor
        
        positions[i * 3] = data.scattered.x + (data.target.x - data.scattered.x) * easing + randomOffset
        positions[i * 3 + 1] = data.scattered.y + (data.target.y - data.scattered.y) * easing + randomOffset
        positions[i * 3 + 2] = data.scattered.z + (data.target.z - data.scattered.z) * easing + randomOffset * 0.5
      } else {
        // Final precise positioning - snap to exact target
        positions[i * 3] = data.target.x
        positions[i * 3 + 1] = data.target.y
        positions[i * 3 + 2] = data.target.z
      }
    }

    particles.geometry.attributes.position.needsUpdate = true

    if (progress < 1) {
      requestAnimationFrame(assembleAnimation)
    } else {
      isAssembling = false
      showInfo.value = true
    }
  }

  assembleAnimation()
}

const disassembleParticles = () => {
  return new Promise((resolve) => {
    if (!particles || !particlesData.length || isAssembling) {
      resolve()
      return
    }

    isAssembling = true
    showInfo.value = false
    const startTime = Date.now()
    const duration = 1800 // 1.8 seconds (faster)

    // Pre-calculate scattered positions for consistency
    const newScatteredPositions = particlesData.map(() => ({
      x: (Math.random() - 0.5) * 250,
      y: (Math.random() - 0.5) * 250,
      z: (Math.random() - 0.5) * 120
    }))

    const disassembleAnimation = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // More natural easing curve for disassembly
      const easeInOutBack = progress < 0.5
        ? (Math.pow(2 * progress, 2) * ((1.7 + 1) * 2 * progress - 1.7)) / 2
        : (Math.pow(2 * progress - 2, 2) * ((1.7 + 1) * (progress * 2 - 2) + 1.7) + 2) / 2

      const positions = particles.geometry.attributes.position.array

      for (let i = 0; i < particlesData.length; i++) {
        const data = particlesData[i]
        const newScattered = newScatteredPositions[i]
        
        // Add some swirl effect during disassembly
        const swirlAngle = progress * Math.PI * 2 + i * 0.02
        const swirlRadius = progress * 20
        const swirlX = Math.cos(swirlAngle) * swirlRadius
        const swirlY = Math.sin(swirlAngle) * swirlRadius
        
        positions[i * 3] = data.target.x + (newScattered.x - data.target.x) * easeInOutBack + swirlX
        positions[i * 3 + 1] = data.target.y + (newScattered.y - data.target.y) * easeInOutBack + swirlY
        positions[i * 3 + 2] = data.target.z + (newScattered.z - data.target.z) * easeInOutBack
        
        // Update particle data for next assembly
        data.scattered = {
          x: positions[i * 3],
          y: positions[i * 3 + 1],
          z: positions[i * 3 + 2]
        }
      }

      particles.geometry.attributes.position.needsUpdate = true

      if (progress < 1) {
        requestAnimationFrame(disassembleAnimation)
      } else {
        isAssembling = false
        // Small delay before resolving for smoother transition
        setTimeout(resolve, 100)
      }
    }

    disassembleAnimation()
  })
}

const nextDriver = async () => {
  if (isTransitioning.value) return
  
  isTransitioning.value = true
  await disassembleParticles()
  
  currentIndex.value = (currentIndex.value + 1) % props.drivers.length
  loadDriverParticles(props.drivers[currentIndex.value])
  
  // Immediately set transitioning to false since disassemble already has delay
  isTransitioning.value = false
}

const previousDriver = async () => {
  if (isTransitioning.value) return
  
  isTransitioning.value = true
  await disassembleParticles()
  
  currentIndex.value = currentIndex.value === 0 ? props.drivers.length - 1 : currentIndex.value - 1
  loadDriverParticles(props.drivers[currentIndex.value])
  
  // Immediately set transitioning to false since disassemble already has delay
  isTransitioning.value = false
}

const animate = () => {
  if (!renderer || !scene || !camera) return

  animationId = requestAnimationFrame(animate)

  // Subtle camera movement
  camera.position.x = Math.sin(Date.now() * 0.0003) * 5
  camera.position.y = Math.cos(Date.now() * 0.0002) * 3

  // Rotate particle system slightly
  if (particles && showInfo.value) {
    particles.rotation.y += 0.003
    particles.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1
  }

  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!camera || !renderer) return

  const rect = containerRef.value.getBoundingClientRect()
  camera.aspect = rect.width / rect.height
  camera.updateProjectionMatrix()
  renderer.setSize(rect.width, rect.height)
}

// Go to specific driver by index
const goToDriver = async (targetIndex) => {
  console.log('goToDriver called with index:', targetIndex)
  console.log('Current index:', currentIndex.value)
  console.log('Is transitioning:', isTransitioning.value)
  console.log('Target driver exists:', !!props.drivers[targetIndex])
  
  if (isTransitioning.value || targetIndex === currentIndex.value || !props.drivers[targetIndex]) {
    console.warn('Cannot transition:', { 
      isTransitioning: isTransitioning.value, 
      sameIndex: targetIndex === currentIndex.value,
      driverExists: !!props.drivers[targetIndex]
    })
    return
  }
  
  isTransitioning.value = true
  console.log('Starting disassembly...')
  await disassembleParticles()
  
  console.log('Loading new driver:', props.drivers[targetIndex].name)
  currentIndex.value = targetIndex
  loadDriverParticles(props.drivers[currentIndex.value])
  
  isTransitioning.value = false
  console.log('Transition complete')
}

// Expose methods to parent - ensure they are directly available
defineExpose({
  goToDriver: goToDriver,
  nextDriver: nextDriver, 
  previousDriver: previousDriver,
  getCurrentIndex: () => currentIndex.value,
  getIsTransitioning: () => isTransitioning.value
})

// Event listener for driver changes
const handleDriverChange = (event) => {
  console.log('Received driver change event:', event.detail)
  const { driverIndex } = event.detail
  goToDriver(driverIndex)
}

// Lifecycle
onMounted(() => {
  // Wait for DOM and Three.js to be ready
  nextTick(() => {
    setTimeout(() => {
      initThreeJS()
    }, 10)
  })

  window.addEventListener('resize', handleResize)
  window.addEventListener('hologram-change-driver', handleDriverChange)
  
  // Debug: log that component is mounted
  console.log('ParticleDecomposeHologram mounted, methods available:', {
    goToDriver: typeof goToDriver,
    nextDriver: typeof nextDriver,
    previousDriver: typeof previousDriver
  })
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  if (renderer) {
    renderer.dispose()
  }

  window.removeEventListener('resize', handleResize)
  window.removeEventListener('hologram-change-driver', handleDriverChange)
})
</script>

<style scoped>
.particle-hologram-container {
  width: 100%;
  height: 80vh;
  position: relative;
  background: #000000;
  border-radius: 20px;
  overflow: hidden;
}

.hologram-display {
  position: relative;
  width: 100%;
  height: 100%;
}

.particle-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* UI 오버레이 */
.hologram-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.driver-info-panel {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  max-width: 300px;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.8s ease;
}

.driver-info-panel.visible {
  opacity: 1;
  transform: translateX(0);
}

.driver-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.driver-name-en {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
  margin-bottom: 0.75rem;
}

.driver-team {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.driver-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
}

.stat-value {
  font-size: 1rem;
  color: rgba(0, 255, 255, 0.9);
  font-weight: 600;
}

/* 컨트롤 */
.hologram-controls {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 1rem 2rem;
  pointer-events: all;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.5);
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-indicator {
  font-size: 0.875rem;
  color: rgba(0, 255, 255, 0.8);
  font-weight: 500;
  letter-spacing: 1px;
  min-width: 120px;
  text-align: center;
}

/* 반응형 */
@media (max-width: 768px) {
  .particle-hologram-container {
    height: 60vh;
  }
  
  .driver-info-panel {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
    text-align: center;
  }
  
  .hologram-controls {
    bottom: 1rem;
    padding: 0.75rem 1.5rem;
  }
  
  .control-btn {
    width: 35px;
    height: 35px;
    font-size: 1.25rem;
  }
}
</style>