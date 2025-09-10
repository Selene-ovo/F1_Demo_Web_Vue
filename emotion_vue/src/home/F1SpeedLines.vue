<template>
  <div class="speed-lines-container">
    <div 
      v-for="line in speedLines" 
      :key="line.id"
      class="speed-line"
      :style="line.style"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    default: 20
  },
  color: {
    type: String,
    default: '#dc2626'
  },
  speed: {
    type: Number,
    default: 3
  }
})

const speedLines = ref([])
const animationId = ref(null)

const createSpeedLine = (id) => {
  return {
    id,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    length: Math.random() * 100 + 50,
    angle: Math.random() * 360,
    opacity: Math.random() * 0.8 + 0.2,
    speed: (Math.random() * props.speed) + 1,
    style: {}
  }
}

const updateSpeedLine = (line) => {
  // 각도에 따라 움직임
  const radian = (line.angle * Math.PI) / 180
  line.x += Math.cos(radian) * line.speed
  line.y += Math.sin(radian) * line.speed

  // 화면을 벗어나면 반대편에서 다시 시작
  if (line.x > window.innerWidth + line.length) {
    line.x = -line.length
    line.y = Math.random() * window.innerHeight
  }
  if (line.x < -line.length) {
    line.x = window.innerWidth + line.length
    line.y = Math.random() * window.innerHeight
  }
  if (line.y > window.innerHeight + line.length) {
    line.y = -line.length
    line.x = Math.random() * window.innerWidth
  }
  if (line.y < -line.length) {
    line.y = window.innerHeight + line.length
    line.x = Math.random() * window.innerWidth
  }

  // 스타일 업데이트
  line.style = {
    position: 'absolute',
    left: line.x + 'px',
    top: line.y + 'px',
    width: line.length + 'px',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${props.color})`,
    transform: `rotate(${line.angle}deg)`,
    opacity: line.opacity,
    pointerEvents: 'none',
    zIndex: 1
  }
}

const animate = () => {
  speedLines.value.forEach(updateSpeedLine)
  animationId.value = requestAnimationFrame(animate)
}

onMounted(() => {
  // 스피드 라인들 생성
  for (let i = 0; i < props.count; i++) {
    speedLines.value.push(createSpeedLine(i))
  }
  
  // 애니메이션 시작
  animate()
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<style scoped>
.speed-lines-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.speed-line {
  box-shadow: 0 0 4px currentColor;
}
</style>