<template>
  <div
    ref="containerRef"
    class="driver-3d-container"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <canvas ref="canvasRef"></canvas>
    <div class="driver-info-overlay">
      <h3 class="driver-name">{{ driver.name }}</h3>
      <p class="driver-team">{{ driver.team }}</p>
      <div
        class="team-color-indicator"
        :style="{
          background: `linear-gradient(45deg, ${driver.primaryColor}, ${driver.secondaryColor})`,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
// Three.js via CDN (available as window.THREE)
const THREE = window.THREE

const props = defineProps({
  driver: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
  },
})

const containerRef = ref(null)
const canvasRef = ref(null)
let scene, camera, renderer, mesh, animationId
let isHovered = false

// Size configurations
const sizeConfig = {
  small: { width: 120, height: 120 },
  medium: { width: 200, height: 200 },
  large: { width: 300, height: 300 },
}

const init3D = () => {
  if (!containerRef.value || !canvasRef.value || typeof window.THREE === 'undefined') return

  const THREE = window.THREE
  const config = sizeConfig[props.size]

  // Scene setup
  scene = new THREE.Scene()
  scene.background = null // Transparent background

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  camera.position.z = 3

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true,
  })
  renderer.setSize(config.width, config.height)
  renderer.setPixelRatio(window.devicePixelRatio)

  // Create geometry for driver face plane
  const geometry = new THREE.PlaneGeometry(2, 2)

  // Load driver image texture
  const loader = new THREE.TextureLoader()
  const texture = loader.load(
    getDriverImageUrl(props.driver),
    () => {
      // Texture loaded successfully
      animate()
    },
    undefined,
    (error) => {
      console.warn('Failed to load driver image:', error)
      // Create fallback material with team colors
      createFallbackMaterial()
    },
  )

  // Material with driver face
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  })

  // Create mesh
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // Add subtle lighting for realism
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 0.8, 100)
  pointLight.position.set(10, 10, 10)
  scene.add(pointLight)
}

const createFallbackMaterial = () => {
  // Create a gradient material with team colors as fallback
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 256, 256)
  gradient.addColorStop(0, props.driver.primaryColor || '#333')
  gradient.addColorStop(1, props.driver.secondaryColor || '#666')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  // Add driver initials
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(getDriverInitials(props.driver.name), 128, 128)

  const texture = new THREE.CanvasTexture(canvas)
  if (mesh) {
    mesh.material.map = texture
    mesh.material.needsUpdate = true
  }
}

const getDriverImageUrl = (driver) => {
  // Generate driver image URL - in a real app, you'd have actual driver photos
  // For now, we'll use a placeholder service or team-based approach
  const driverSlug = driver.name.toLowerCase().replace(/\s+/g, '-')

  // Try different image sources
  const imageSources = [
    `/images/drivers/${driverSlug}.jpg`,
    `/images/drivers/${driverSlug}.png`,
    `https://api.multiavatar.com/${encodeURIComponent(driver.name)}.svg`, // Fallback avatar
  ]

  return imageSources[0] // Return first option for now
}

const getDriverInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

const animate = () => {
  if (!renderer || !scene || !camera) return

  animationId = requestAnimationFrame(animate)

  if (mesh) {
    // Subtle rotation animation
    mesh.rotation.y += 0.005

    // Enhanced animation when hovered
    if (isHovered) {
      mesh.rotation.y += 0.01
      mesh.scale.setScalar(1.05 + Math.sin(Date.now() * 0.003) * 0.02)
    } else {
      mesh.scale.setScalar(1)
    }
  }

  renderer.render(scene, camera)
}

const onMouseEnter = () => {
  isHovered = true
}

const onMouseLeave = () => {
  isHovered = false
}

const handleResize = () => {
  if (!renderer || !camera || !containerRef.value) return

  const config = sizeConfig[props.size]
  renderer.setSize(config.width, config.height)
}

// Watch for driver changes
watch(
  () => props.driver,
  () => {
    if (mesh) {
      const loader = new THREE.TextureLoader()
      const texture = loader.load(getDriverImageUrl(props.driver), undefined, undefined, () =>
        createFallbackMaterial(),
      )
      mesh.material.map = texture
      mesh.material.needsUpdate = true
    }
  },
  { deep: true },
)

onMounted(() => {
  // Wait for Three.js to load
  const checkThreeJS = () => {
    if (typeof window.THREE !== 'undefined') {
      init3D()
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

  if (scene) {
    scene.clear()
  }

  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.driver-3d-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.driver-3d-container:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

canvas {
  display: block;
  border-radius: 12px;
}

.driver-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    transparent 100%
  );
  padding: 1rem;
  color: white;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.driver-3d-container:hover .driver-info-overlay {
  transform: translateY(0);
}

.driver-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.driver-team {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
}

.team-color-indicator {
  width: 30px;
  height: 3px;
  border-radius: 2px;
  margin-top: 0.5rem;
}

/* Size variations */
.driver-3d-container.small canvas {
  width: 120px !important;
  height: 120px !important;
}

.driver-3d-container.medium canvas {
  width: 200px !important;
  height: 200px !important;
}

.driver-3d-container.large canvas {
  width: 300px !important;
  height: 300px !important;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .driver-info-overlay {
    transform: translateY(0);
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.5) 70%,
      transparent 100%
    );
  }

  .driver-name {
    font-size: 0.9rem;
  }

  .driver-team {
    font-size: 0.75rem;
  }
}
</style>
