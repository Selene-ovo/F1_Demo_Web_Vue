<template>
  <div class="particle-background" ref="containerRef">
    <canvas 
      ref="canvasRef" 
      :width="canvasWidth" 
      :height="canvasHeight"
      class="absolute inset-0 pointer-events-none"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  particleCount: {
    type: Number,
    default: 50
  },
  color: {
    type: String,
    default: '#dc2626'
  },
  speed: {
    type: Number,
    default: 0.5
  },
  connectionDistance: {
    type: Number,
    default: 100
  },
  particleSize: {
    type: Number,
    default: 2
  }
})

const canvasRef = ref(null)
const containerRef = ref(null)
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const animationId = ref(null)
const particles = ref([])

class Particle {
  constructor(x, y, canvas) {
    this.x = x
    this.y = y
    this.canvas = canvas
    this.vx = (Math.random() - 0.5) * props.speed
    this.vy = (Math.random() - 0.5) * props.speed
    this.radius = Math.random() * props.particleSize + 1
    this.opacity = Math.random() * 0.8 + 0.2
  }

  update() {
    this.x += this.vx
    this.y += this.vy

    // 경계 반사
    if (this.x < 0 || this.x > this.canvas.width) {
      this.vx = -this.vx
    }
    if (this.y < 0 || this.y > this.canvas.height) {
      this.vy = -this.vy
    }

    // 경계 내 유지
    this.x = Math.max(0, Math.min(this.canvas.width, this.x))
    this.y = Math.max(0, Math.min(this.canvas.height, this.y))
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = props.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

const initParticles = () => {
  particles.value = []
  const canvas = canvasRef.value
  
  for (let i = 0; i < props.particleCount; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    particles.value.push(new Particle(x, y, canvas))
  }
}

const drawConnections = (ctx) => {
  for (let i = 0; i < particles.value.length; i++) {
    for (let j = i + 1; j < particles.value.length; j++) {
      const p1 = particles.value[i]
      const p2 = particles.value[j]
      
      const distance = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      )
      
      if (distance < props.connectionDistance) {
        const opacity = (1 - distance / props.connectionDistance) * 0.3
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.strokeStyle = props.color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
        ctx.restore()
      }
    }
  }
}

const animate = () => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  
  // 캔버스 지우기
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 파티클 업데이트 및 그리기
  particles.value.forEach(particle => {
    particle.update()
    particle.draw(ctx)
  })
  
  // 연결선 그리기
  drawConnections(ctx)
  
  animationId.value = requestAnimationFrame(animate)
}

const handleResize = () => {
  nextTick(() => {
    if (containerRef.value) {
      canvasWidth.value = containerRef.value.clientWidth
      canvasHeight.value = containerRef.value.clientHeight
      
      if (canvasRef.value) {
        initParticles()
      }
    }
  })
}

const handleMouseMove = (event) => {
  if (!containerRef.value || !canvasRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  // 마우스 근처 파티클들에 영향 주기
  particles.value.forEach(particle => {
    const distance = Math.sqrt(
      Math.pow(mouseX - particle.x, 2) + Math.pow(mouseY - particle.y, 2)
    )
    
    if (distance < 100) {
      const force = (100 - distance) / 100
      const angle = Math.atan2(particle.y - mouseY, particle.x - mouseX)
      particle.vx += Math.cos(angle) * force * 0.02
      particle.vy += Math.sin(angle) * force * 0.02
    }
  })
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  if (containerRef.value) {
    containerRef.value.addEventListener('mousemove', handleMouseMove)
  }
  
  nextTick(() => {
    if (canvasRef.value) {
      initParticles()
      animate()
    }
  })
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  window.removeEventListener('resize', handleResize)
  
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<style scoped>
.particle-background {
  @apply absolute inset-0 overflow-hidden;
  z-index: 0;
}
</style>