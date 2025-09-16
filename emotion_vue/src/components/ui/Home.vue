<template>
  <div class="threejs-background">
    <canvas ref="threeCanvas" class="three-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const threeCanvas = ref(null)
let scene, camera, renderer, animationId
let subtleParticles = []
let mouseX = 0,
  mouseY = 0
let clock

onMounted(() => {
  initThreeJS()
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
  window.removeEventListener('mousemove', onMouseMove)
})

const initThreeJS = () => {
  const canvas = threeCanvas.value
  if (!canvas) return

  clock = new THREE.Clock()

  // Scene 설정
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // 매우 간단한 배경만 생성
  createSimpleBackground()

  // 카메라 초기 위치
  camera.position.set(0, 0, 400)

  // 애니메이션 시작
  animate()
}

const createSimpleBackground = () => {
  // Three.js anaglyph 예제 스타일의 구체들
  const geometry = new THREE.SphereGeometry(1, 8, 6)

  for (let i = 0; i < 200; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.8, Math.random() * 0.3 + 0.2), // 밝기 0.05-0.25 → 0.2-0.5
      transparent: true,
      opacity: 0.8,
    })

    const sphere = new THREE.Mesh(geometry, material)

    sphere.position.x = Math.random() * 800 - 400
    sphere.position.y = Math.random() * 800 - 400
    sphere.position.z = Math.random() * 800 - 400

    sphere.scale.x = sphere.scale.y = sphere.scale.z = Math.random() * 3 + 1

    // 애니메이션을 위한 초기값 저장
    sphere.userData = {
      originalX: sphere.position.x,
      originalY: sphere.position.y,
      originalZ: sphere.position.z,
      speed: Math.random() * 0.02 + 0.005,
    }

    scene.add(sphere)
    subtleParticles.push(sphere)
  }

  // 안개 설정
  scene.fog = new THREE.Fog(0x000000, 1, 1000)
}

const onMouseMove = (event) => {
  mouseX = (event.clientX - window.innerWidth / 2) * 0.3
  mouseY = (event.clientY - window.innerHeight / 2) * 0.3
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  const timer = Date.now() * 0.0005

  // 마우스에 따른 카메라 움직임
  camera.position.x += (mouseX - camera.position.x) * 0.05
  camera.position.y += (-mouseY - camera.position.y) * 0.05
  camera.lookAt(scene.position)

  // 구체들 애니메이션
  subtleParticles.forEach((sphere, index) => {
    const userData = sphere.userData

    sphere.position.x = userData.originalX + Math.cos(timer * userData.speed + index) * 100
    sphere.position.y = userData.originalY + Math.sin(timer * userData.speed * 1.1 + index) * 100
    sphere.position.z = userData.originalZ + Math.sin(timer * userData.speed * 0.7 + index) * 100

    // 회전
    sphere.rotation.x += userData.speed
    sphere.rotation.y += userData.speed * 0.5
    sphere.rotation.z += userData.speed * 0.3
  })

  renderer.render(scene, camera)
}

// 윈도우 리사이즈 핸들링
const handleResize = () => {
  if (!camera || !renderer) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.threejs-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
