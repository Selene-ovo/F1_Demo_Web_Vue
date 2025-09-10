<template>
  <div ref="containerRef" class="three-background">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref(null)
const canvasRef = ref(null)
let animationId = null

onMounted(() => {
  initBackground()
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})

const initBackground = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  
  // Set canvas size
  resizeCanvas()
  
  // Initialize particles
  createParticles()
}

const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

const handleResize = () => {
  resizeCanvas()
}

// Particle system
let particles = []
const particleCount = 150

const createParticles = () => {
  particles = []
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: Math.random() * 2 + 1,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      color: {
        r: Math.floor(Math.random() * 100 + 155),
        g: Math.floor(Math.random() * 100 + 155),
        b: 255
      }
    })
  }
}

const updateParticles = () => {
  particles.forEach(particle => {
    // Update position
    particle.x += particle.vx
    particle.y += particle.vy
    particle.z -= particle.vz

    // Reset particle if it goes too far
    if (particle.z <= 0) {
      particle.z = 1000
      particle.x = Math.random() * window.innerWidth
      particle.y = Math.random() * window.innerHeight
    }

    // Wrap around screen edges
    if (particle.x < 0) particle.x = window.innerWidth
    if (particle.x > window.innerWidth) particle.x = 0
    if (particle.y < 0) particle.y = window.innerHeight
    if (particle.y > window.innerHeight) particle.y = 0
  })
}

const drawParticles = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  
  // Clear canvas with fade effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  particles.forEach(particle => {
    // Calculate 3D projection
    const scale = 800 / (800 + particle.z)
    const x = particle.x * scale + canvas.width / 2 * (1 - scale)
    const y = particle.y * scale + canvas.height / 2 * (1 - scale)
    const size = particle.size * scale
    const opacity = particle.opacity * scale

    // Draw particle
    ctx.save()
    ctx.globalAlpha = opacity
    
    // Create gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
    gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 1)`)
    gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`)
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
  })

  // Draw connecting lines
  drawConnections()
}

const drawConnections = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const maxDistance = 150

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i]
      const p2 = particles[j]

      // Calculate 3D projection
      const scale1 = 800 / (800 + p1.z)
      const scale2 = 800 / (800 + p2.z)
      
      const x1 = p1.x * scale1 + canvas.width / 2 * (1 - scale1)
      const y1 = p1.y * scale1 + canvas.height / 2 * (1 - scale1)
      const x2 = p2.x * scale2 + canvas.width / 2 * (1 - scale2)
      const y2 = p2.y * scale2 + canvas.height / 2 * (1 - scale2)

      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

      if (distance < maxDistance) {
        const opacity = (1 - distance / maxDistance) * 0.3 * Math.min(scale1, scale2)
        
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.strokeStyle = `rgba(0, 150, 255, 1)`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.restore()
      }
    }
  }
}

const animate = () => {
  updateParticles()
  drawParticles()
  animationId = requestAnimationFrame(animate)
}
</script>

<style scoped>
.three-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(5, 5, 15, 0.95) 25%,
    rgba(0, 0, 0, 0.98) 50%,
    rgba(10, 10, 20, 0.95) 75%,
    rgba(0, 0, 0, 1) 100%
  );
}

.three-background canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>