<template>
  <div 
    class="f1-card-3d"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @mouseenter="handleMouseEnter"
    :style="cardStyle"
  >
    <div class="card-inner" :style="innerStyle">
      <div class="card-content">
        <slot />
      </div>
      
      <!-- 3D 글로우 효과 -->
      <div class="card-glow" :style="glowStyle"></div>
      
      <!-- 반사 효과 -->
      <div class="card-reflection" :style="reflectionStyle"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  intensity: {
    type: Number,
    default: 15
  },
  glowColor: {
    type: String,
    default: '#dc2626'
  },
  perspective: {
    type: Number,
    default: 1000
  }
})

const isHovered = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const cardRef = ref(null)

const cardStyle = computed(() => ({
  perspective: `${props.perspective}px`
}))

const innerStyle = computed(() => {
  if (!isHovered.value) {
    return {
      transform: 'rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.320, 1)'
    }
  }

  const rotateX = (mouseY.value - 0.5) * props.intensity
  const rotateY = -(mouseX.value - 0.5) * props.intensity
  const translateZ = isHovered.value ? 20 : 0

  return {
    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
    transition: 'transform 0.1s ease-out'
  }
})

const glowStyle = computed(() => {
  if (!isHovered.value) {
    return {
      opacity: 0,
      transition: 'opacity 0.6s ease'
    }
  }

  return {
    opacity: 0.6,
    background: `radial-gradient(circle at ${mouseX.value * 100}% ${mouseY.value * 100}%, ${props.glowColor}40, transparent 70%)`,
    transition: 'opacity 0.3s ease'
  }
})

const reflectionStyle = computed(() => {
  if (!isHovered.value) {
    return {
      opacity: 0,
      transition: 'opacity 0.6s ease'
    }
  }

  return {
    opacity: 0.1,
    background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)`,
    transform: `translateX(${(mouseX.value - 0.5) * 50}px) translateY(${(mouseY.value - 0.5) * 50}px)`,
    transition: 'opacity 0.3s ease, transform 0.1s ease-out'
  }
})

const handleMouseMove = (event) => {
  if (!cardRef.value) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  mouseX.value = (event.clientX - rect.left) / rect.width
  mouseY.value = (event.clientY - rect.top) / rect.height
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
  mouseX.value = 0.5
  mouseY.value = 0.5
}

onMounted(() => {
  mouseX.value = 0.5
  mouseY.value = 0.5
})
</script>

<style scoped>
.f1-card-3d {
  @apply relative w-full h-full cursor-pointer;
  transform-style: preserve-3d;
}

.card-inner {
  @apply relative w-full h-full;
  @apply bg-f1-surface border border-gray-700 rounded-xl;
  @apply shadow-2xl;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.card-content {
  @apply relative z-20 w-full h-full p-6;
}

.card-glow {
  @apply absolute inset-0 rounded-xl pointer-events-none;
  z-index: 10;
  mix-blend-mode: soft-light;
}

.card-reflection {
  @apply absolute inset-0 rounded-xl pointer-events-none;
  z-index: 15;
  mix-blend-mode: overlay;
}

/* 호버 상태에서 추가 효과 */
.f1-card-3d:hover .card-inner {
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(220, 38, 38, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
</style>