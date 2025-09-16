<template>
  <div ref="containerRef" class="ascii-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect.js'

const containerRef = ref(null)

let camera, scene, renderer, effect
let sphere, plane, video
let animationId

onMounted(() => {
  init()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (effect) {
    effect.domElement?.remove()
  }
  if (video) {
    video.pause()
    video.src = ''
  }
})

function init() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.y = 150
  camera.position.z = 500

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0, 0, 0)

  // Create video element for GIF
  video = document.createElement('video')
  video.src = '/src/assets/Gif/Win.gif'
  video.loop = true
  video.muted = true
  video.autoplay = true
  video.crossOrigin = 'anonymous'
  video.setAttribute('playsinline', '')
  
  // Start video
  video.play().catch(e => console.warn('Video play failed:', e))

  // Create video texture
  const videoTexture = new THREE.VideoTexture(video)
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter

  // Create plane with video texture
  const planeGeometry = new THREE.PlaneGeometry(500, 300)
  const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture })
  plane = new THREE.Mesh(planeGeometry, planeMaterial)
  scene.add(plane)

  // Add some additional geometry for visual interest
  const geometry = new THREE.SphereGeometry(50, 20, 10)
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  // Lights
  const pointLight1 = new THREE.PointLight(0xffffff, 3, 0, 0)
  pointLight1.position.set(500, 500, 500)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0xffffff, 1, 0, 0)
  pointLight2.position.set(-500, -500, -500)
  scene.add(pointLight2)

  // Renderer
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)

  // ASCII Effect
  effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: false })
  effect.setSize(window.innerWidth, window.innerHeight)
  effect.domElement.style.color = 'white'
  effect.domElement.style.backgroundColor = 'black'

  containerRef.value.appendChild(effect.domElement)

  window.addEventListener('resize', onWindowResize)

  animate()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  effect.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  animationId = requestAnimationFrame(animate)

  const timer = Date.now() * 0.0001

  camera.position.x = Math.cos(timer) * 200
  camera.position.z = Math.sin(timer) * 200
  camera.lookAt(scene.position)

  sphere.position.x = Math.cos(timer * 2) * 100
  sphere.position.z = Math.sin(timer * 2) * 100
  sphere.rotation.x = timer * 5
  sphere.rotation.z = timer * 5

  plane.rotation.x = timer * 0.5
  plane.rotation.y = timer * 0.2

  effect.render(scene, camera)
}
</script>

<style scoped>
.ascii-container {
  width: 100%;
  height: 100vh;
  background: #000000;
  overflow: hidden;
}

.ascii-container >>> canvas {
  display: block;
  margin: 0 auto;
}
</style>