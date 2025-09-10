<template>
  <div class="hologram-container" ref="containerRef">
    <canvas ref="canvasRef" class="hologram-canvas"></canvas>

    <!-- Driver Info Overlay -->
    <div class="driver-info" :class="{ visible: isAssembled }">
      <h3 class="driver-name">{{ driver.name }}</h3>
      <p class="driver-name-en">{{ driver.nameEn }}</p>
      <p class="driver-team">{{ driver.team }}</p>
      <div class="driver-stats">
        <span>{{ driver.number }}번</span>
        <span>{{ driver.wins }} 승리</span>
      </div>
    </div>

    <!-- Navigation Controls -->
    <div class="hologram-controls">
      <button @click="previousDriver" class="nav-btn prev">‹</button>
      <div class="driver-indicators">
        <div
          v-for="(d, index) in drivers"
          :key="d.id"
          class="indicator"
          :class="{ active: currentIndex === index }"
          @click="goToDriver(index)"
        ></div>
      </div>
      <button @click="nextDriver" class="nav-btn next">›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  drivers: {
    type: Array,
    default: () => [
      {
        id: 1,
        name: '막스 베르스타펜',
        nameEn: 'Max Verstappen',
        team: 'Red Bull Racing',
        number: '1',
        image: '/images/drivers/레드불_레이싱_막스_베르스타펜_1번.jpg',
        wins: 61,
      },
      {
        id: 2,
        name: '루이스 해밀턴',
        nameEn: 'Lewis Hamilton',
        team: 'Ferrari',
        number: '44',
        image: '/images/drivers/페라리_루이스_해밀턴_44번.jpg',
        wins: 105,
      },
      {
        id: 3,
        name: '샤를 르클레르',
        nameEn: 'Charles Leclerc',
        team: 'Ferrari',
        number: '16',
        image: '/images/drivers/페라리_샤를_르클레르_16번.jpg',
        wins: 8,
      },
      {
        id: 4,
        name: '랜도 노리스',
        nameEn: 'Lando Norris',
        team: 'McLaren',
        number: '4',
        image: '/images/drivers/맥라렌_랜도_노리스_4번.jpg',
        wins: 4,
      },
    ],
  },
})

// Refs
const containerRef = ref(null)
const canvasRef = ref(null)
const currentIndex = ref(0)
const isAssembled = ref(false)

// Three.js variables
let scene, camera, renderer, particles, animationId
let particlePositions = []
let targetPositions = []
let originalPositions = []
let imageData = null
let isAnimating = false

// Computed
const driver = ref(props.drivers[0])

// Methods
const initThreeJS = () => {
  if (!containerRef.value || !canvasRef.value || typeof window.THREE === 'undefined') return

  const THREE = window.THREE

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000)
  camera.position.z = 300

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
  })
  renderer.setSize(800, 600)
  renderer.setPixelRatio(window.devicePixelRatio)

  // Load first driver
  loadDriverImage(props.drivers[currentIndex.value])
}

const loadDriverImage = async (driverData) => {
  if (!driverData) return

  const THREE = window.THREE
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()

  img.crossOrigin = 'anonymous'
  img.onload = () => {
    // Set canvas size
    const size = 128 // Reduced for performance
    canvas.width = size
    canvas.height = size

    // Draw image to canvas
    ctx.drawImage(img, 0, 0, size, size)
    imageData = ctx.getImageData(0, 0, size, size)

    createParticleSystem()
    driver.value = driverData
  }

  img.onerror = () => {
    console.warn('Failed to load driver image, using fallback')
    createFallbackParticles(driverData)
  }

  img.src = driverData.image
}

const createParticleSystem = () => {
  if (!imageData) return

  const THREE = window.THREE

  // Clear existing particles
  if (particles) {
    scene.remove(particles)
    particles.geometry.dispose()
    particles.material.dispose()
  }

  const particleCount = imageData.width * imageData.height
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)

  particlePositions = []
  targetPositions = []
  originalPositions = []

  let particleIndex = 0

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const pixelIndex = (y * imageData.width + x) * 4
      const r = imageData.data[pixelIndex] / 255
      const g = imageData.data[pixelIndex + 1] / 255
      const b = imageData.data[pixelIndex + 2] / 255
      const a = imageData.data[pixelIndex + 3] / 255

      // Skip transparent pixels
      if (a < 0.1) {
        continue
      }

      // Target position (assembled)
      const targetX = (x - imageData.width / 2) * 3
      const targetY = -(y - imageData.height / 2) * 3
      const targetZ = 0

      // Random scattered position (disassembled)
      const scatteredX = (Math.random() - 0.5) * 400
      const scatteredY = (Math.random() - 0.5) * 400
      const scatteredZ = (Math.random() - 0.5) * 200

      // Store positions
      originalPositions.push({ x: scatteredX, y: scatteredY, z: scatteredZ })
      targetPositions.push({ x: targetX, y: targetY, z: targetZ })

      // Initial position (scattered)
      positions[particleIndex * 3] = scatteredX
      positions[particleIndex * 3 + 1] = scatteredY
      positions[particleIndex * 3 + 2] = scatteredZ

      // Colors
      colors[particleIndex * 3] = r
      colors[particleIndex * 3 + 1] = g
      colors[particleIndex * 3 + 2] = b

      // Size
      sizes[particleIndex] = Math.random() * 2 + 1

      particleIndex++
    }
  }

  // Trim arrays to actual particle count
  const actualPositions = positions.slice(0, particleIndex * 3)
  const actualColors = colors.slice(0, particleIndex * 3)
  const actualSizes = sizes.slice(0, particleIndex)

  // Create geometry
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(actualPositions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(actualColors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(actualSizes, 1))

  // Create material
  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8,
  })

  // Create particles
  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  particlePositions = actualPositions

  // Start assembly animation
  setTimeout(() => {
    assembleParticles()
  }, 500)
}

const createFallbackParticles = (driverData) => {
  // Create simple geometric pattern as fallback
  const THREE = window.THREE
  const particleCount = 2000
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 300
    positions[i * 3 + 1] = (Math.random() - 0.5) * 300
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100

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
    transparent: true,
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

const assembleParticles = () => {
  if (!particles || !targetPositions.length || isAnimating) return

  isAnimating = true
  const startTime = Date.now()
  const duration = 8000

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)

    const positions = particles.geometry.attributes.position.array

    for (let i = 0; i < targetPositions.length; i++) {
      const original = originalPositions[i]
      const target = targetPositions[i]

      positions[i * 3] = original.x + (target.x - original.x) * easeOut
      positions[i * 3 + 1] = original.y + (target.y - original.y) * easeOut
      positions[i * 3 + 2] = original.z + (target.z - original.z) * easeOut
    }

    particles.geometry.attributes.position.needsUpdate = true

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating = false
      isAssembled.value = true
    }
  }

  animate()
}

const disassembleParticles = () => {
  if (!particles || !originalPositions.length || isAnimating) return

  isAnimating = true
  isAssembled.value = false
  const startTime = Date.now()
  const duration = 1000

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeIn = Math.pow(progress, 2)

    const positions = particles.geometry.attributes.position.array

    for (let i = 0; i < originalPositions.length; i++) {
      const target = targetPositions[i]
      const scattered = {
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 200,
      }

      positions[i * 3] = target.x + (scattered.x - target.x) * easeIn
      positions[i * 3 + 1] = target.y + (scattered.y - target.y) * easeIn
      positions[i * 3 + 2] = target.z + (scattered.z - target.z) * easeIn
    }

    particles.geometry.attributes.position.needsUpdate = true

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isAnimating = false
    }
  }

  animate()
}

const nextDriver = () => {
  if (isAnimating) return

  disassembleParticles()

  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % props.drivers.length
    loadDriverImage(props.drivers[currentIndex.value])
  }, 1000)
}

const previousDriver = () => {
  if (isAnimating) return

  disassembleParticles()

  setTimeout(() => {
    currentIndex.value =
      currentIndex.value === 0 ? props.drivers.length - 1 : currentIndex.value - 1
    loadDriverImage(props.drivers[currentIndex.value])
  }, 1000)
}

const goToDriver = (index) => {
  if (isAnimating || index === currentIndex.value) return

  disassembleParticles()

  setTimeout(() => {
    currentIndex.value = index
    loadDriverImage(props.drivers[index])
  }, 1000)
}

const animate = () => {
  if (!renderer || !scene || !camera) return

  animationId = requestAnimationFrame(animate)

  // Subtle camera movement
  camera.position.x = Math.sin(Date.now() * 0.0005) * 10
  camera.position.y = Math.cos(Date.now() * 0.0003) * 5
  camera.lookAt(0, 0, 0)

  // Rotate particles slightly
  if (particles && isAssembled.value) {
    particles.rotation.y += 0.005
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

// Lifecycle
onMounted(() => {
  const checkThreeJS = () => {
    if (typeof window.THREE !== 'undefined') {
      initThreeJS()
      animate()
    } else {
      setTimeout(checkThreeJS, 100)
    }
  }
  checkThreeJS()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  if (renderer) {
    renderer.dispose()
  }

  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.hologram-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: radial-gradient(ellipse at center, rgba(0, 255, 255, 0.05) 0%, transparent 70%);
  border-radius: 20px;
  overflow: hidden;
  padding: 2rem;
}

.hologram-canvas {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(10, 10, 20, 0.95) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
  box-shadow:
    0 0 50px rgba(0, 255, 255, 0.2),
    inset 0 0 30px rgba(0, 255, 255, 0.1);
}

/* Driver Info Overlay */
.driver-info {
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.driver-info.visible {
  opacity: 1;
}

.driver-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  background: linear-gradient(135deg, #00ffff, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.driver-name-en {
  font-size: 0.9rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.75rem;
  letter-spacing: 0.5px;
}

.driver-team {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.75rem;
}

.driver-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: rgba(0, 255, 255, 0.9);
}

/* Controls */
.hologram-controls {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.75rem 1.5rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.5);
  transform: scale(1.1);
}

.driver-indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.indicator:hover {
  background: rgba(0, 255, 255, 0.7);
  transform: scale(1.2);
}

/* Responsive */
@media (max-width: 768px) {
  .hologram-container {
    padding: 1rem;
  }

  .hologram-canvas {
    height: 400px;
  }

  .driver-info {
    bottom: 3rem;
    left: 1rem;
    right: 1rem;
    transform: none;
  }

  .driver-name {
    font-size: 1.25rem;
  }

  .hologram-controls {
    bottom: 0.5rem;
    padding: 0.5rem 1rem;
  }

  .nav-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
}
</style>
