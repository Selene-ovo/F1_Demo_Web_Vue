<template>
  <div class="lusion-hologram-system">
    <!-- 배경 Matrix 효과 -->
    <div class="driver-background">
      <canvas ref="backgroundCanvas" class="background-canvas"></canvas>
    </div>

    <!-- Point Cloud 홀로그램 -->
    <div class="hologram-main">
      <canvas ref="hologramCanvas" class="hologram-canvas"></canvas>

      <!-- 우측 하단 상세정보 -->
      <div class="driver-details">
        <h1 class="section-title">DRIVERS</h1>
        <div class="driver-info">
          <h2 class="driver-name">{{ selectedDriver.name }}</h2>
          <p class="driver-team">{{ selectedDriver.team }}</p>
          <div class="driver-stats">
            <div class="stat">
              <span class="stat-label">Championships</span>
              <span class="stat-value">{{ selectedDriver.championships || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Wins</span>
              <span class="stat-value">{{ selectedDriver.wins || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 좌측 하단 진행률 -->
      <div class="progress-section">
        <div class="progress-dots">
          <div
            v-for="(driver, index) in drivers"
            :key="driver.id"
            class="progress-dot"
            :class="{ active: index === currentDriverIndex }"
            @click="selectDriver(index)"
          ></div>
        </div>
        <div class="controls">
          <button @click="previousDriver" class="nav-btn">‹</button>
          <button @click="nextDriver" class="nav-btn">›</button>

          <!-- 원기둥 바를 오른쪽 버튼 옆으로 -->
          <div class="timer-container">
            <div class="timer-track">
              <div
                class="timer-progress"
                :style="{
                  transform: `scaleX(${timeProgress / totalTime})`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 팀별 드라이버 선택 카드들 -->
    <div class="driver-selection">
      <div class="team-groups">
        <div v-for="(teamGroup, teamIndex) in teamGroups" :key="teamGroup.name" class="team-group">
          <div class="team-label">{{ teamGroup.name }}</div>
          <div class="team-drivers">
            <div
              v-for="driver in teamGroup.drivers"
              :key="driver.id"
              class="driver-card-mini"
              :class="{ active: driver.index === currentDriverIndex }"
              @click="selectDriver(driver.index)"
            >
              <img :src="driver.image" :alt="driver.name" class="card-avatar" />
              <div class="card-info">
                <span class="card-number">{{ driver.number }}</span>
                <span class="card-name">{{ driver.lastName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import * as THREE from 'three'

const hologramCanvas = ref(null)
const backgroundCanvas = ref(null)
const currentDriverIndex = ref(0)
const isPlaying = ref(true)
const currentTime = ref(0)
const autoPlayEnabled = ref(true)
const timeProgress = ref(0)
const totalTime = 8000 // 8초마다 넘어감
let autoPlayTimer = null

let scene, camera, renderer, animationId
let particleSystem,
  targetPositions = []
let canvas2D, ctx
let isTransitioning = false

// 배경 Matrix 효과 관련 변수들
let backgroundScene, backgroundCamera, backgroundRenderer, backgroundAnimationId
let subtleParticles = []
let backgroundClock

// F1 드라이버 데이터 (2025 시즌 팀별/포인트 순서)
const drivers = ref([
  // McLaren (1위 팀)
  {
    id: 1,
    name: 'Lando Norris',
    lastName: 'Norris',
    team: 'McLaren',
    number: 4,
    image: '/src/assets/images/Drivers/McLaren_Lando_Norris_4.jpg',
    championships: 0,
    wins: 1,
  },
  {
    id: 2,
    name: 'Oscar Piastri',
    lastName: 'Piastri',
    team: 'McLaren',
    number: 81,
    image: '/src/assets/images/Drivers/McLaren_Oscar_Piastri_81.jpg',
    championships: 0,
    wins: 2,
  },
  // Ferrari (2위 팀)
  {
    id: 3,
    name: 'Lewis Hamilton',
    lastName: 'Hamilton',
    team: 'Ferrari',
    number: 44,
    image: '/src/assets/images/Drivers/Ferrari_Lewis_Hamilton_44.jpg',
    championships: 7,
    wins: 105,
  },
  {
    id: 4,
    name: 'Charles Leclerc',
    lastName: 'Leclerc',
    team: 'Ferrari',
    number: 16,
    image: '/src/assets/images/Drivers/Ferrari_Charles_Leclerc_16.jpg',
    championships: 0,
    wins: 8,
  },
  // Red Bull Racing (3위 팀)
  {
    id: 5,
    name: 'Max Verstappen',
    lastName: 'Verstappen',
    team: 'Red Bull Racing',
    number: 1,
    image: '/src/assets/images/Drivers/Red_Bull_Racing_Max_Verstappen_1.jpg',
    championships: 3,
    wins: 50,
  },
  {
    id: 6,
    name: 'Yuki Tsunoda',
    lastName: 'Tsunoda',
    team: 'Red Bull Racing',
    number: 22,
    image: '/src/assets/images/Drivers/Red_Bull_Racing_Yuki_Tsunoda_22  .jpg',
    championships: 0,
    wins: 0,
  },
  // Mercedes (4위 팀)
  {
    id: 7,
    name: 'George Russell',
    lastName: 'Russell',
    team: 'Mercedes',
    number: 63,
    image: '/src/assets/images/Drivers/Mercedes_George_Russell_63.jpg',
    championships: 0,
    wins: 2,
  },
  {
    id: 8,
    name: 'Andrea Kimi Antonelli',
    lastName: 'Antonelli',
    team: 'Mercedes',
    number: 12,
    image: '/src/assets/images/Drivers/Mercedes_Andrea_Kimi_Antonelli_12.jpg',
    championships: 0,
    wins: 0,
  },
  // Aston Martin (5위 팀)
  {
    id: 9,
    name: 'Fernando Alonso',
    lastName: 'Alonso',
    team: 'Aston Martin',
    number: 14,
    image: '/src/assets/images/Drivers/Aston_Martin_Fernando_Alonso_14.jpg',
    championships: 2,
    wins: 32,
  },
  {
    id: 10,
    name: 'Lance Stroll',
    lastName: 'Stroll',
    team: 'Aston Martin',
    number: 18,
    image: '/src/assets/images/Drivers/Aston_Martin_Lance_Stroll_18.jpg',
    championships: 0,
    wins: 0,
  },
  // 알핀 (6위 팀)
  {
    id: 11,
    name: 'Pierre Gasly',
    lastName: 'Gasly',
    team: '알핀',
    number: 10,
    image: '/src/assets/images/Drivers/Alpine_Pierre_Gasly_10.jpg',
    championships: 0,
    wins: 1,
  },
  {
    id: 12,
    name: 'Jack Doohan',
    lastName: 'Doohan',
    team: '알핀',
    number: 7,
    image: '/src/assets/images/Drivers/Alpine_Jack_Doohan_7.jpg',
    championships: 0,
    wins: 0,
  },
  // Haas (7위 팀)
  {
    id: 13,
    name: 'Esteban Ocon',
    lastName: 'Ocon',
    team: 'Haas',
    number: 31,
    image: '/src/assets/images/Drivers/Haas_Esteban_Ocon_31.jpg',
    championships: 0,
    wins: 1,
  },
  {
    id: 14,
    name: 'Oliver Bearman',
    lastName: 'Bearman',
    team: 'Haas',
    number: 87,
    image: '/src/assets/images/Drivers/Haas_Oliver_Bearman_87.jpg',
    championships: 0,
    wins: 0,
  },
  // Racing Bulls (8위 팀)
  {
    id: 15,
    name: 'Liam Lawson',
    lastName: 'Lawson',
    team: 'Racing Bulls',
    number: 30,
    image: '/src/assets/images/Drivers/Racing_Bulls_Liam_Lawson_30.jpg',
    championships: 0,
    wins: 0,
  },
  {
    id: 16,
    name: 'Isack Hadjar',
    lastName: 'Hadjar',
    team: 'Racing Bulls',
    number: 6,
    image: '/src/assets/images/Drivers/Racing_Bulls_Isack_Hadjar_6.jpg',
    championships: 0,
    wins: 0,
  },
  // Williams (9위 팀)
  {
    id: 17,
    name: 'Carlos Sainz',
    lastName: 'Sainz',
    team: 'Williams',
    number: 55,
    image: '/src/assets/images/Drivers/Williams_Carlos_Sainz_55.jpg',
    championships: 0,
    wins: 4,
  },
  {
    id: 18,
    name: 'Alexander Albon',
    lastName: 'Albon',
    team: 'Williams',
    number: 23,
    image: '/src/assets/images/Drivers/Williams_Alexander_Albon_23.jpg',
    championships: 0,
    wins: 0,
  },
  // Sauber (10위 팀)
  {
    id: 19,
    name: 'Gabriel Bortoleto',
    lastName: 'Bortoleto',
    team: 'Sauber',
    number: 5,
    image: '/src/assets/images/Drivers/Sauber_Gabriel_Bortoleto_5.jpg',
    championships: 0,
    wins: 0,
  },
  {
    id: 20,
    name: 'Nico Huelkenberg',
    lastName: 'Huelkenberg',
    team: 'Sauber',
    number: 27,
    image: '/src/assets/images/Drivers/Sauber_Nico_Huelkenberg_27.jpg',
    championships: 0,
    wins: 0,
  },
])

// 계산된 속성
const selectedDriver = computed(() => drivers.value[currentDriverIndex.value] || drivers.value[0])

// 팀별 그룹핑 (2025 포인트 순서)
const teamGroups = computed(() => {
  const teams = [
    { name: 'McLaren', startIndex: 0, count: 2 },
    { name: 'Ferrari', startIndex: 2, count: 2 },
    { name: 'Red Bull Racing', startIndex: 4, count: 2 },
    { name: 'Mercedes', startIndex: 6, count: 2 },
    { name: 'Aston Martin', startIndex: 8, count: 2 },
    { name: '알핀', startIndex: 10, count: 2 },
    { name: 'Haas', startIndex: 12, count: 2 },
    { name: 'Racing Bulls', startIndex: 14, count: 2 },
    { name: 'Williams', startIndex: 16, count: 2 },
    { name: 'Sauber', startIndex: 18, count: 2 },
  ]

  return teams.map((team) => ({
    name: team.name,
    drivers: drivers.value
      .slice(team.startIndex, team.startIndex + team.count)
      .map((driver, idx) => ({
        ...driver,
        index: team.startIndex + idx,
      })),
  }))
})

// 드라이버 선택
const selectDriver = (index) => {
  if (index !== currentDriverIndex.value && !isTransitioning) {
    resetAutoPlayTimer()
    morphToDriver(index)
  }
}

const previousDriver = () => {
  const prevIndex = (currentDriverIndex.value - 1 + drivers.value.length) % drivers.value.length
  selectDriver(prevIndex)
}

const nextDriver = () => {
  const nextIndex = (currentDriverIndex.value + 1) % drivers.value.length
  selectDriver(nextIndex)
}

// 자동 재생 관련 함수들
let progressTimer = null

const startAutoPlay = () => {
  if (!autoPlayEnabled.value) return

  timeProgress.value = 0 // 타이머 리셋

  autoPlayTimer = setInterval(() => {
    if (!isTransitioning) {
      nextDriver()
    }
  }, totalTime)

  // 프로그레스 바 업데이트
  progressTimer = setInterval(() => {
    if (autoPlayTimer && autoPlayEnabled.value) {
      timeProgress.value += 50 // 50ms마다 업데이트
      if (timeProgress.value >= totalTime) {
        timeProgress.value = 0
      }
    } else {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }, 50)
}

const resetAutoPlayTimer = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  timeProgress.value = 0
  if (autoPlayEnabled.value) {
    setTimeout(startAutoPlay, 100) // 짧은 딜레이 후 재시작
  }
}

const toggleAutoPlay = () => {
  autoPlayEnabled.value = !autoPlayEnabled.value
  if (autoPlayEnabled.value) {
    startAutoPlay()
  } else {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer)
      autoPlayTimer = null
    }
    timeProgress.value = 0
  }
}

const initThreeJS = () => {
  const canvas = hologramCanvas.value
  if (!canvas) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  })

  renderer.setSize(800, 800) // 1000 -> 800 (다시 원래 크기로)
  renderer.setClearColor(0x000000, 0)

  camera.position.set(0, -50, 600) // 근본적 해결: 카메라 Y축을 -50으로 조정
  camera.lookAt(0, -50, 0) // 시선도 같이 조정

  animate()
}

const createParticleSystem = () => {
  const particleCount = 75000 // 50000 -> 75000 (더욱 극대화)
  const geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  const alpha = new Float32Array(particleCount)

  // 초기에는 모든 파티클을 숨김 (이미지 로드 후에만 표시)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = 0
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = 0

    // 초기에는 투명하게
    colors[i * 3] = 0 // R
    colors[i * 3 + 1] = 0 // G
    colors[i * 3 + 2] = 0 // B

    sizes[i] = 1.0
    alpha[i] = 0.0
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1))

  // 고품질 홀로그램 쉐이더
  const hologramVertexShader = `
    uniform float time;
    uniform float glitchIntensity;
    attribute float size;
    attribute float alpha;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vColor = color;
      vAlpha = alpha;

      vec3 pos = position;

      // 홀로그램 불안정 효과
      float glitch = sin(time * 10.0 + pos.x * 0.1 + pos.y * 0.1) * glitchIntensity;
      pos.x += glitch * 2.0;
      pos.z += sin(time * 8.0 + pos.y * 0.05) * glitchIntensity * 1.5;

      // 스캔라인 효과를 위한 위치 변화
      float scanline = sin(pos.y * 0.1 + time * 5.0) * 0.5;
      pos.x += scanline * 0.3;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `

  const hologramFragmentShader = `
    uniform float time;
    uniform float glitchIntensity;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // 원형 파티클 모양
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);

      if (dist > 0.5) discard;

      // 홀로그램 글리치 효과
      float glitch = step(0.95, sin(time * 20.0 + gl_FragCoord.x * 0.1)) * glitchIntensity;

      // 스캔라인 효과
      float scanlines = sin(gl_FragCoord.y * 0.5 + time * 10.0) * 0.1 + 0.9;

      // 홀로그램 색상 강화
      vec3 hologramColor = vColor;
      hologramColor += vec3(0.3, 0.6, 1.0) * 0.4; // 청록색 베이스 추가
      hologramColor *= scanlines;

      // 중심부는 더 밝게
      float centerGlow = 1.0 - dist * 2.0;
      hologramColor *= (0.7 + centerGlow * 0.5);

      // 글리치 시 색상 변화
      if (glitch > 0.5) {
        hologramColor.r += 0.3;
        hologramColor.g *= 0.7;
      }

      float finalAlpha = vAlpha * (1.0 - dist) * scanlines;
      gl_FragColor = vec4(hologramColor, finalAlpha);
    }
  `

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      glitchIntensity: { value: 0.1 },
    },
    vertexShader: hologramVertexShader,
    fragmentShader: hologramFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })

  particleSystem = new THREE.Points(geometry, material)
  particleSystem.position.set(0, -50, 0)
  scene.add(particleSystem)

  // 홀로그램 글로우 효과 추가
  addHologramGlow()
}

const addHologramGlow = () => {
  // 홀로그램 베이스 글로우
  const glowGeometry = new THREE.PlaneGeometry(400, 400)
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      opacity: { value: 0.3 },
      color: { value: new THREE.Color(0x00d4ff) },
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vPosition = position;

        vec3 pos = position;
        pos.z += sin(time * 2.0 + pos.x * 0.01) * 5.0;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform vec3 color;
      varying vec2 vUv;

      void main() {
        vec2 center = vUv - 0.5;
        float dist = length(center);

        float pulse = sin(time * 3.0) * 0.5 + 0.5;
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        glow *= (0.5 + pulse * 0.5);

        // 스캔라인 효과
        float scanlines = sin(vUv.y * 50.0 + time * 5.0) * 0.1 + 0.9;
        glow *= scanlines;

        gl_FragColor = vec4(color, glow * opacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
  })

  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
  glowMesh.position.set(0, -50, -50)
  scene.add(glowMesh)

  // 홀로그램 링 효과들
  for (let i = 0; i < 3; i++) {
    const ringGeometry = new THREE.RingGeometry(100 + i * 50, 110 + i * 50, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.5, 0.8, 0.5),
      transparent: true,
      opacity: 0.2 - i * 0.05,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })

    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.position.set(0, -50, -20 - i * 10)
    ring.rotation.x = Math.PI / 2
    ring.userData = {
      baseOpacity: 0.2 - i * 0.05,
      rotationSpeed: 0.01 + i * 0.005,
      pulseSpeed: 1 + i * 0.3,
    }
    scene.add(ring)
  }
}

const loadDriverImage = (driverIndex) => {
  const driver = drivers.value[driverIndex]
  if (!driver) return

  console.log('Loading driver image:', driver.image) // 디버그

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    console.log('Image loaded successfully:', img.width, img.height) // 디버그
    imageToParticles(img)
  }
  img.onerror = () => {
    console.error('Failed to load image:', driver.image) // 에러 디버그
  }
  img.src = driver.image
}

const imageToParticles = (image) => {
  // 이미지를 캔버스에 그리기 (원본 해상도 최대 활용)
  const width = 600 // 300 -> 600 (원본에 더 가깝게)
  const height = 600 // 300 -> 600 (원본에 더 가깝게)
  canvas2D.width = width
  canvas2D.height = height

  ctx.clearRect(0, 0, width, height)
  // 이미지 품질 향상 설정
  ctx.imageSmoothingEnabled = false // 픽셀 보간 끄기 (더 선명)
  ctx.drawImage(image, 0, 0, width, height)

  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = imageData.data

  const newTargetPositions = []

  // 픽셀을 3D 좌표로 변환 (눈코입이 보이도록 간격 조정)
  for (let y = 0; y < height; y += 3) {
    // 1.5 -> 3 (덜 촘촘하게)
    for (let x = 0; x < width; x += 3) {
      // 1.5 -> 3 (덜 촘촘하게)
      const index = (Math.floor(y) * width + Math.floor(x)) * 4
      const alpha = pixels[index + 3]
      const r = pixels[index]
      const g = pixels[index + 1]
      const b = pixels[index + 2]

      // 인물만 표시 (배경 완전 제거)
      const isNotBackground = alpha > 100 && r + g + b > 150 && !(r > 200 && g > 200 && b > 200) // 너무 밝은 배경 제거

      if (isNotBackground) {
        // 명암 계산 (밝기)
        const brightness = (r + g + b) / 3

        // 도트 느낌: 밝은 부분은 적게, 어두운 부분은 많게
        let dotIntensity = 1
        if (brightness < 80) {
          dotIntensity = 3 // 어두운 부분 (그림자) - 많은 파티클
        } else if (brightness < 150) {
          dotIntensity = 2 // 중간톤 - 보통 파티클
        } else {
          dotIntensity = 1 // 밝은 부분 (하이라이트) - 적은 파티클
        }

        // 엣지 디텍션 추가
        const isEdge =
          Math.floor(x) > 0 &&
          Math.floor(y) > 0 &&
          Math.floor(x) < width - 1 &&
          Math.floor(y) < height - 1
        if (isEdge) {
          const leftIdx = (Math.floor(y) * width + Math.floor(x) - 1) * 4
          const rightIdx = (Math.floor(y) * width + Math.floor(x) + 1) * 4
          const upIdx = ((Math.floor(y) - 1) * width + Math.floor(x)) * 4
          const downIdx = ((Math.floor(y) + 1) * width + Math.floor(x)) * 4

          const diffLeft = Math.abs(pixels[leftIdx] - r)
          const diffRight = Math.abs(pixels[rightIdx] - r)
          const diffUp = Math.abs(pixels[upIdx] - r)
          const diffDown = Math.abs(pixels[downIdx] - r)

          const edgeStrength = (diffLeft + diffRight + diffUp + diffDown) / 4
          if (edgeStrength > 40) {
            dotIntensity += 2 // 엣지는 추가로 강조
          }
        }

        const posX = (x - width / 2) * 0.8
        const posY = -(y - height / 2) * 0.8 - 50

        // 입체감을 위한 Z축 깊이 계산
        let depthZ = 0

        // 밝기에 따른 입체감 (밝은 부분 = 앞으로 나온 부분)
        if (brightness > 180) {
          depthZ = 15 + Math.random() * 10 // 코, 이마, 턱 등 앞으로 나온 부분
        } else if (brightness > 120) {
          depthZ = 5 + Math.random() * 5 // 중간 깊이 (뺨, 입술 등)
        } else {
          depthZ = -5 + Math.random() * 5 // 어두운 부분 (눈 주위, 그림자)
        }

        // 얼굴 중심부는 더 앞으로 나오게
        const centerX = width / 2
        const centerY = height / 2
        const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
        const maxDistance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2))
        const centerBoost = (1 - distanceFromCenter / maxDistance) * 10

        const posZ = depthZ + centerBoost

        // 실제 이미지 색상을 홀로그램 색상으로 변환
        const hologramR = (r / 255) * 0.3 + 0.2 // 약간의 빨강 추가
        const hologramG = (g / 255) * 0.8 + 0.4 // 주로 초록/청록
        const hologramB = (b / 255) * 0.6 + 0.8 // 파란색 베이스

        // 깊이에 따른 색상 변화 (앞으로 나온 부분은 더 밝게)
        const depthFactor = (posZ + 15) / 30 // 0-1 범위로 정규화
        const finalR = hologramR * (0.5 + depthFactor * 0.5)
        const finalG = hologramG * (0.5 + depthFactor * 0.5)
        const finalB = hologramB * (0.7 + depthFactor * 0.3)

        // 명암과 엣지에 따른 파티클 생성 (고품질 텍스처)
        for (let d = 0; d < dotIntensity; d++) {
          newTargetPositions.push(
            posX + (Math.random() - 0.5) * 0.3,
            posY + (Math.random() - 0.5) * 0.3,
            posZ + (Math.random() - 0.5) * 2, // Z축 변화 더 크게
            finalR,
            finalG,
            finalB, // 색상 정보 추가
          )
        }
      }
    }
  }

  console.log('Generated particles:', newTargetPositions.length / 6) // 파티클 개수 디버그 (6개 값)
  targetPositions = newTargetPositions
  morphParticles()
}

const morphParticles = () => {
  if (!particleSystem || targetPositions.length === 0) return

  const positions = particleSystem.geometry.attributes.position.array
  const colors = particleSystem.geometry.attributes.color.array
  const sizes = particleSystem.geometry.attributes.size.array
  const alpha = particleSystem.geometry.attributes.alpha.array
  const targetCount = Math.floor(targetPositions.length / 6) // 6개 값 (x,y,z,r,g,b)

  // 사용될 파티클들을 타겟 위치로 이동
  for (let i = 0; i < targetCount && i < positions.length / 3; i++) {
    const particleIndex = i * 3
    const targetIndex = i * 6 // 6개 값 (x,y,z,r,g,b)

    if (targetIndex + 5 < targetPositions.length) {
      // 부드러운 이동 애니메이션
      const speed = 0.12 // 0.08 -> 0.12 (더 빠른 모핑)
      positions[particleIndex] += (targetPositions[targetIndex] - positions[particleIndex]) * speed
      positions[particleIndex + 1] +=
        (targetPositions[targetIndex + 1] - positions[particleIndex + 1]) * speed
      positions[particleIndex + 2] +=
        (targetPositions[targetIndex + 2] - positions[particleIndex + 2]) * speed

      // 실제 이미지 기반 색상 적용
      colors[particleIndex] = targetPositions[targetIndex + 3] // R
      colors[particleIndex + 1] = targetPositions[targetIndex + 4] // G
      colors[particleIndex + 2] = targetPositions[targetIndex + 5] // B

      // 동적 크기 조절 (깊이에 따라)
      const depth = targetPositions[targetIndex + 2] // Z값
      const brightness =
        (colors[particleIndex] + colors[particleIndex + 1] + colors[particleIndex + 2]) / 3
      sizes[i] = 0.8 + brightness * 1.5 + Math.max(0, depth * 0.05)

      // 동적 투명도
      alpha[i] = Math.min(1.0, 0.6 + brightness * 0.4)
    }
  }

  // 사용되지 않는 파티클들은 숨김
  for (let i = targetCount; i < positions.length / 3; i++) {
    const particleIndex = i * 3
    positions[particleIndex] = 0
    positions[particleIndex + 1] = 0
    positions[particleIndex + 2] = 0
    colors[particleIndex] = 0
    colors[particleIndex + 1] = 0
    colors[particleIndex + 2] = 0
    sizes[i] = 0
    alpha[i] = 0
  }

  particleSystem.geometry.attributes.position.needsUpdate = true
  particleSystem.geometry.attributes.color.needsUpdate = true
  particleSystem.geometry.attributes.size.needsUpdate = true
  particleSystem.geometry.attributes.alpha.needsUpdate = true
}

const morphToDriver = (newIndex) => {
  if (isTransitioning) return

  isTransitioning = true

  // 파티클 분산
  const positions = particleSystem.geometry.attributes.position.array
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += (Math.random() - 0.5) * 200
    positions[i + 1] += (Math.random() - 0.5) * 200
    positions[i + 2] += (Math.random() - 0.5) * 100
  }

  // 즉시 드라이버 정보 업데이트
  currentDriverIndex.value = newIndex

  setTimeout(() => {
    loadDriverImage(newIndex)
    isTransitioning = false
  }, 500)
}

// 배경 Matrix 효과 초기화
const initBackgroundThreeJS = () => {
  const canvas = backgroundCanvas.value
  if (!canvas) return

  console.log('DriverBackground: Initializing Three.js')

  backgroundClock = new THREE.Clock()

  // Scene 설정
  backgroundScene = new THREE.Scene()
  backgroundCamera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000,
  )
  backgroundRenderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  backgroundRenderer.setSize(window.innerWidth, window.innerHeight)
  backgroundRenderer.setClearColor(0x111111, 0.1)
  backgroundRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Matrix 효과 제거
  // createMatrixEffect() // 아래에서 위로 올라가는 문자들
  // console.log('DriverBackground: Matrix effect created')

  // 카메라 초기 위치 - 더 넓은 시야
  backgroundCamera.position.set(0, 0, 1200)

  // 애니메이션 시작
  animateBackground()
}

const createMatrixEffect = () => {
  // Matrix 스타일 문자들이 아래에서 위로 올라가는 효과 (좌우에서 시작)
  const matrixStreams = []
  const characters = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'F1',
    'MPH',
    'KPH',
    'RPM',
    'LAP',
    'DRS',
    'ERS',
  ]

  // 드라이버 카드 양쪽에서 시작하는 스트림들 생성
  const streamCount = 30

  for (let streamIndex = 0; streamIndex < streamCount; streamIndex++) {
    // 드라이버 카드 왼쪽과 오른쪽 영역에서만 시작 (중앙 완전 제외)
    let streamX
    if (streamIndex < streamCount / 2) {
      // 왼쪽 영역: 화면 왼쪽 끝에서 시작
      streamX = -800 + streamIndex * 40 + (Math.random() - 0.5) * 20
    } else {
      // 오른쪽 영역: 화면 오른쪽에서 시작
      const rightIndex = streamIndex - streamCount / 2
      streamX = 500 + rightIndex * 40 + (Math.random() - 0.5) * 20
    }
    const streamZ = -100 + Math.random() * 200

    // 각 스트림마다 여러 문자들을 연속배치
    const charactersInStream = 12

    for (let charIndex = 0; charIndex < charactersInStream; charIndex++) {
      // 캔버스에 문자 그리기
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 32
      canvas.height = 32

      context.font = 'bold 20px monospace'
      context.fillStyle = `hsl(${120 + Math.random() * 60}, 80%, ${50 + Math.random() * 30}%)` // 초록-청록 계열, 더 밝게
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      const char = characters[Math.floor(Math.random() * characters.length)]
      context.fillText(char, 16, 16)

      // 스프라이트 생성
      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8 - charIndex * 0.05, // 위쪽으로 갈수록 투명
        blending: THREE.AdditiveBlending,
      })

      const sprite = new THREE.Sprite(material)
      sprite.scale.set(25, 25, 1)

      // 화면 맨 아래부터 연속 배치 (세로로)
      sprite.position.set(
        streamX,
        -1200 + charIndex * -50, // 화면 맨 아래에서 시작
        streamZ,
      )

      sprite.userData = {
        streamIndex: streamIndex,
        charIndex: charIndex,
        velocity: 80 + Math.random() * 40, // 위로 올라가는 속도
        baseOpacity: material.opacity,
        changeTimer: Math.random() * 180, // 문자 변경 주기
        streamX: streamX, // 원래 스트림의 X 위치 저장
        streamZ: streamZ,
        character: char,
      }

      backgroundScene.add(sprite)
      matrixStreams.push(sprite)
    }
  }

  subtleParticles.push(...matrixStreams)
}

const animateBackground = () => {
  backgroundAnimationId = requestAnimationFrame(animateBackground)
  const deltaTime = backgroundClock.getDelta()

  // Matrix 효과 애니메이션
  subtleParticles.forEach((sprite) => {
    const userData = sprite.userData
    if (userData && userData.velocity) {
      // 위로 이동
      sprite.position.y += userData.velocity * deltaTime

      // 화면 위로 벗어나면 원래 왼쪽/오른쪽 위치에서 다시 시작
      if (sprite.position.y > 900) {
        sprite.position.set(
          userData.streamX + (Math.random() - 0.5) * 15, // 원래 스트림 위치 유지
          -1200 - Math.random() * 300, // 화면 맨 아래에서 다시 시작
          userData.streamZ,
        )

        // 투명도 리셋
        sprite.material.opacity = userData.baseOpacity
      }

      // 실시간 문자 변경 (계속해서 변함)
      userData.changeTimer++
      if (userData.changeTimer > 30 + Math.random() * 60) {
        // 0.5-1.5초마다
        userData.changeTimer = 0

        const characters = [
          '0',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
          'G',
          'H',
          'I',
          'J',
          'K',
          'L',
          'M',
          'N',
          'O',
          'P',
          'Q',
          'R',
          'S',
          'T',
          'U',
          'V',
          'W',
          'X',
          'Y',
          'Z',
          'F1',
          'MPH',
          'KPH',
          'RPM',
          'LAP',
          'DRS',
          'ERS',
        ]
        const newChar = characters[Math.floor(Math.random() * characters.length)]

        // 새 캔버스로 문자 업데이트
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 32
        canvas.height = 32

        context.font = 'bold 20px monospace'
        context.fillStyle = `hsl(${120 + Math.random() * 60}, 80%, ${50 + Math.random() * 30}%)`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(newChar, 16, 16)

        sprite.material.map.dispose()
        sprite.material.map = new THREE.CanvasTexture(canvas)
        sprite.material.needsUpdate = true
        userData.character = newChar
      }

      // Y위치에 따른 페이드 효과 (화면 전체에서 위로 갈수록 투명)
      const fadeY = Math.max(0.1, Math.min(1, (900 - sprite.position.y) / 1600))
      sprite.material.opacity = userData.baseOpacity * fadeY
    }
  })

  backgroundRenderer.render(backgroundScene, backgroundCamera)
}

const handleBackgroundResize = () => {
  if (!backgroundCamera || !backgroundRenderer) return

  backgroundCamera.aspect = window.innerWidth / window.innerHeight
  backgroundCamera.updateProjectionMatrix()
  backgroundRenderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  const time = Date.now() * 0.001

  if (particleSystem) {
    // 파티클 모핑
    morphParticles()

    // 쉐이더 유니폼 업데이트
    if (particleSystem.material.uniforms) {
      particleSystem.material.uniforms.time.value = time
      // 주기적인 글리치 효과
      const glitchPhase = Math.sin(time * 0.5) * 0.5 + 0.5
      particleSystem.material.uniforms.glitchIntensity.value = 0.05 + glitchPhase * 0.15
    }

    // 둥둥 떠다니는 홀로그램 효과 (더 미묘하게)
    particleSystem.position.y = -50 + Math.sin(time * 0.8) * 3
    particleSystem.position.x = Math.sin(time * 0.4) * 1.5
    particleSystem.position.z = Math.sin(time * 0.6) * 2

    // 미세한 흔들림 (홀로그램 불안정 효과)
    particleSystem.rotation.x = Math.sin(time * 3) * 0.008
    particleSystem.rotation.z = Math.cos(time * 2.5) * 0.006
  }

  // 글로우 효과 애니메이션
  scene.children.forEach((child) => {
    if (child.material && child.material.uniforms && child.material.uniforms.time) {
      child.material.uniforms.time.value = time
    }

    // 링 효과 애니메이션
    if (child.userData && child.userData.rotationSpeed) {
      child.rotation.z += child.userData.rotationSpeed

      // 펄스 효과
      const pulse = Math.sin(time * child.userData.pulseSpeed) * 0.5 + 0.5
      child.material.opacity = child.userData.baseOpacity + pulse * 0.1
      child.scale.setScalar(1 + pulse * 0.05)
    }
  })

  renderer.render(scene, camera)
}

onMounted(() => {
  if (hologramCanvas.value) {
    // 2D Canvas 초기화
    canvas2D = document.createElement('canvas')
    ctx = canvas2D.getContext('2d')

    initThreeJS()
    createParticleSystem()
    loadDriverImage(0)

    // 자동재생 시작
    setTimeout(startAutoPlay, 2000) // 2초 후 시작
  }

  // 배경 Matrix 효과 초기화
  if (backgroundCanvas.value) {
    initBackgroundThreeJS()
    window.addEventListener('resize', handleBackgroundResize)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }

  // 배경 정리
  if (backgroundAnimationId) {
    cancelAnimationFrame(backgroundAnimationId)
  }
  if (backgroundRenderer) {
    backgroundRenderer.dispose()
  }
  window.removeEventListener('resize', handleBackgroundResize)
})
</script>

<style scoped>
.lusion-hologram-system {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  position: relative;
  color: white;
}

.hologram-main {
  position: relative;
  width: 100%;
  height: 120vh; /* 200vh -> 120vh로 줄임 */
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10;
}

.hologram-canvas {
  width: min(800px, 50vw); /* 화면 크기에 비례 */
  height: min(800px, 50vw); /* 정사각형 유지 */
  position: absolute;
  left: 50%; /* 컨테이너 중앙 */
  top: 5%; /* 15% -> 5% (더 높이 올림) */
  transform: translateX(-50%); /* 가로 중앙 정렬 */
  z-index: 9999;
  opacity: 1;
  pointer-events: none;
}

/* 우측 하단 상세정보 */
.driver-details {
  position: absolute;
  bottom: 35%; /* 50% -> 35% (내림) */
  right: 15%;
  max-width: 400px;
  z-index: 20;
}

.section-title {
  font-size: 3rem;
  font-weight: 300;
  letter-spacing: 0.3em;
  margin: 0 0 2rem 0;
  color: white;
}

.driver-name {
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: white;
  animation: sparkle 2s ease-in-out infinite alternate;
}

@keyframes sparkle {
  0% {
    text-shadow:
      0 0 30px rgba(255, 255, 255, 0.3),
      0 0 60px rgba(0, 212, 255, 0.4);
  }
  100% {
    text-shadow:
      0 0 50px rgba(255, 255, 255, 0.6),
      0 0 80px rgba(0, 212, 255, 0.8),
      0 0 100px rgba(255, 255, 255, 0.4);
  }
}

.driver-team {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 2rem 0;
}

.driver-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00d4ff;
}

/* 좌측 하단 진행률 */
.progress-section {
  position: absolute;
  bottom: 35%; /* 50% -> 35% (내림) */
  left: 8%;
  z-index: 20;
}

.progress-dots {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.progress-dot.active {
  background: #00d4ff;
  box-shadow: 0 0 10px #00d4ff;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #00d4ff;
}

/* 원기둥 바 (시간표시 없음) */
.timer-container {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.timer-track {
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1.5px;
  overflow: hidden;
  position: relative;
}

.timer-progress {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0099cc);
  border-radius: 1.5px;
  transform-origin: left;
  transition: transform 0.05s linear;
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
}

/* 하단 팀별 드라이버 선택 카드들 */
.driver-selection {
  position: absolute;
  top: 75%; /* 55% -> 75% (많이 내림) */
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 90%;
  max-width: 1200px;
}

.team-groups {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.team-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.team-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-align: center;
  margin-bottom: 4px;
  min-height: 16px;
}

.team-drivers {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.driver-card-mini {
  flex-shrink: 0;
  width: 80px;
  height: 100px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
}

.driver-card-mini.active {
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}

.driver-card-mini:hover {
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.card-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 6px;
}

.card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.card-number {
  font-size: 0.8rem;
  color: #00d4ff;
  font-weight: 600;
}

.card-name {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

/* 배경 Matrix 효과 스타일 */
.driver-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

.background-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
