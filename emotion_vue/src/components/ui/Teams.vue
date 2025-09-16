<template>
  <div class="teams-container">
    <div class="teams-grid">
      <div 
        v-for="(team, index) in teams" 
        :key="team.id"
        class="team-card"
        :class="{ 
          active: selectedTeam?.id === team.id, 
          hovered: hoveredTeam?.id === team.id
        }"
        :style="{ 
          '--card-index': index % 3,
          '--team-primary': getTeamColors(team.id).primary,
          '--team-secondary': getTeamColors(team.id).secondary,
          '--team-accent': getTeamColors(team.id).accent
        }"
        @click="selectTeam(team)"
        @mouseenter="hoveredTeam = team"
        @mouseleave="hoveredTeam = null"
      >
        <div class="team-card-inner">
          <img :src="getTeamLogo(team.logo)" :alt="team.name" class="team-logo-circle" />
        </div>
      </div>
    </div>

    <!-- 자동차 + 상세정보 애니메이션 -->
    <div v-if="selectedTeam" class="car-detail-animation" @click="closeModal">
      <!-- 닫기 버튼 -->
      <button class="close-btn" @click="closeModal">&times;</button>
      
      <!-- 자동차 이미지 -->
      <div class="animated-car" :class="{ 'car-entering': carEntering, 'car-centered': carCentered }">
        <img :src="getCarImage(selectedTeam.carImage)" :alt="selectedTeam.name" class="car-image" />
        
        <!-- 공기역학 흐름 -->
        <div class="airflow-container">
          <!-- 위쪽 흐름선들 -->
          <div class="airflow-line upper-flow-1"></div>
          <div class="airflow-line upper-flow-2"></div>
          <div class="airflow-line upper-flow-3"></div>
          
          <!-- 아래쪽 흐름선들 -->
          <div class="airflow-line lower-flow-1"></div>
          <div class="airflow-line lower-flow-2"></div>
          <div class="airflow-line lower-flow-3"></div>
        </div>
      </div>
      
      <!-- 상세정보 패널들 -->
      <div class="info-panels" :class="{ 'panels-assembling': panelsAssembling }">
        <!-- 팀 헤더 패널 -->
        <div class="info-panel team-header-panel" :style="{ '--delay': '0.2s', '--team-color': getTeamColors(selectedTeam.id).primary }">
          <img :src="getTeamLogo(selectedTeam.logo)" :alt="selectedTeam.name" class="team-logo-large" />
          <div class="team-title">
            <h2>{{ selectedTeam.name }}</h2>
            <p>{{ selectedTeam.country }}</p>
          </div>
        </div>
        
        <!-- 슬로건 패널 -->
        <div class="info-panel slogan-panel" :style="{ '--delay': '0.4s', '--team-color': getTeamColors(selectedTeam.id).primary }">
          <p class="slogan">"{{ selectedTeam.slogan }}"</p>
          <p class="founded">{{ selectedTeam.founded }} | {{ selectedTeam.teamPrincipal }}</p>
        </div>
        
        <!-- 성과 패널 -->
        <div class="info-panel stats-panel" :style="{ '--delay': '0.6s', '--team-color': getTeamColors(selectedTeam.id).primary }">
          <div class="stat-item">
            <span class="stat-number">{{ selectedTeam.championships }}</span>
            <span class="stat-label">Championships</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ selectedTeam.wins }}</span>
            <span class="stat-label">Wins</span>
          </div>
        </div>
        
        <!-- 기술 스펙 패널 -->
        <div class="info-panel tech-panel" :style="{ '--delay': '0.8s' }">
          <div class="tech-item">
            <span>엔진:</span> <span>{{ selectedTeam.engine }}</span>
          </div>
          <div class="tech-item">
            <span>최고속도:</span> <span>{{ selectedTeam.avgSpeed }}</span>
          </div>
          <div class="tech-item">
            <span>연료효율:</span> <span>{{ selectedTeam.fuelEfficiency }}</span>
          </div>
          <div class="tech-item">
            <span>핵심기술:</span> <span>{{ selectedTeam.technology }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const canvasRef = ref(null)
const teamsCanvasRef = ref(null)
const selectedTeam = ref(null)
const hoveredTeam = ref(null)
const carEntering = ref(false)
const carCentered = ref(false)
const panelsAssembling = ref(false)

// Teams 3D 관련 변수들
let teamsScene, teamsCamera, teamsRenderer, teamsAnimationId
let teamSpheres = []
let raycaster, mouse

const teams = [
  {
    id: 1,
    name: 'Red Bull Racing',
    country: 'Austria',
    championships: 6,
    wins: 118,
    carImage: 'Red_Bull_Racing_RB21.jpg',
    logo: 'Red_Bull_Racing.svg',
    color: 0x1E3A8A,
    slogan: 'Gives You Wings',
    engine: 'Honda RBPT',
    avgSpeed: '325 km/h',
    fuelEfficiency: '105 kg/race',
    technology: '어드밴스드 에어로다이나믹스',
    keyFeature: '터보차지 파워유닛',
    founded: '2005년',
    teamPrincipal: '크리스티안 호르너'
  },
  {
    id: 2,
    name: 'Ferrari',
    country: 'Italy',
    championships: 16,
    wins: 243,
    carImage: 'Ferrari_SF-25.jpg',
    logo: 'Ferrari.svg',
    color: 0xDC143C,
    slogan: 'The Prancing Horse',
    engine: 'Ferrari 066/12',
    avgSpeed: '320 km/h',
    fuelEfficiency: '110 kg/race',
    technology: '이탈리아 정통 엔지니어링',
    keyFeature: '혁신적 하이브리드 시스템',
    founded: '1950년',
    teamPrincipal: '프레드 박세'
  },
  {
    id: 3,
    name: 'Mercedes-AMG',
    country: 'Germany',
    championships: 8,
    wins: 125,
    carImage: 'Mercedes-AMG_F1_W16_E_Performance.jpg',
    logo: 'Mercedes.svg',
    color: 0x00D2BE,
    slogan: 'The Best or Nothing',
    engine: 'Mercedes-AMG M15',
    avgSpeed: '315 km/h',
    fuelEfficiency: '108 kg/race',
    technology: '독일 정밀 엔지니어링',
    keyFeature: 'EQS 전기 기술 적용',
    founded: '2010년',
    teamPrincipal: '토토 볼프'
  },
  {
    id: 4,
    name: 'McLaren',
    country: 'United Kingdom',
    championships: 8,
    wins: 183,
    carImage: 'McLaren_MCL39.jpg',
    logo: 'McLaren.svg',
    color: 0xFF8700,
    slogan: 'For The Fearless',
    engine: 'Mercedes-AMG M15',
    avgSpeed: '318 km/h',
    fuelEfficiency: '107 kg/race',
    technology: '카본파이버 모노코크',
    keyFeature: '어댑티브 서스펜션',
    founded: '1966년',
    teamPrincipal: '안드리아 스텔라'
  },
  {
    id: 5,
    name: 'Aston Martin',
    country: 'United Kingdom',
    championships: 0,
    wins: 1,
    carImage: 'Aston_Martin_AMR25.jpg',
    logo: 'Aston_Martin.svg',
    color: 0x006F62,
    slogan: 'Intensity Driven',
    engine: 'Mercedes-AMG M15',
    avgSpeed: '312 km/h',
    fuelEfficiency: '109 kg/race',
    technology: '럭셔리 퍼포먼스 융합',
    keyFeature: '어쿠스틱 엔지니어링',
    founded: '2021년',
    teamPrincipal: '마이크 크랙'
  },
  {
    id: 6,
    name: 'Alpine',
    country: 'France',
    championships: 2,
    wins: 21,
    carImage: 'Alpine_A525.jpg',
    logo: 'Alpine.webp',
    color: 0x0090FF,
    slogan: 'Unlock Your Potential',
    engine: 'Alpine E-Tech RE25',
    avgSpeed: '310 km/h',
    fuelEfficiency: '111 kg/race',
    technology: '프랑스 르노 기술',
    keyFeature: 'E-Tech 하이브리드',
    founded: '1981년',
    teamPrincipal: '올리버 오크스'
  },
  {
    id: 7,
    name: 'Williams',
    country: 'United Kingdom',
    championships: 9,
    wins: 114,
    carImage: 'Williams_FW47.jpg',
    logo: 'Williams.svg',
    color: 0x005AFF,
    slogan: 'Driven by Excellence',
    engine: 'Mercedes-AMG M15',
    avgSpeed: '308 km/h',
    fuelEfficiency: '112 kg/race',
    technology: '경량화 전문 기술',
    keyFeature: '에어로 효율성 극대화',
    founded: '1977년',
    teamPrincipal: '제임스 바울즈'
  },
  {
    id: 8,
    name: 'Racing Bulls',
    country: 'Italy',
    championships: 0,
    wins: 2,
    carImage: 'Racing_Bulls_RB_VCARB_02.jpg',
    logo: 'Racing_Bulls.webp',
    color: 0x6692FF,
    slogan: 'Young Energy Unleashed',
    engine: 'Honda RBPT',
    avgSpeed: '305 km/h',
    fuelEfficiency: '113 kg/race',
    technology: '젊은 드라이버 육성',
    keyFeature: '에너지 드링크 파워',
    founded: '2020년',
    teamPrincipal: '로랑 메키즈'
  },
  {
    id: 9,
    name: 'Haas',
    country: 'United States',
    championships: 0,
    wins: 0,
    carImage: 'Haas_VF-25.jpg',
    logo: 'Haas.svg',
    color: 0xFFFFFF,
    slogan: 'American Spirit',
    engine: 'Ferrari 066/12',
    avgSpeed: '302 km/h',
    fuelEfficiency: '114 kg/race',
    technology: '아메리칸 이노베이션',
    keyFeature: '스틸 머시닝 정밀도',
    founded: '2016년',
    teamPrincipal: '아야오 코마츠자키'
  },
  {
    id: 10,
    name: 'Sauber',
    country: 'Switzerland',
    championships: 0,
    wins: 1,
    carImage: 'Sauber_C45.jpg',
    logo: 'Sauber.svg',
    color: 0x52E252,
    slogan: 'Swiss Precision',
    engine: 'Ferrari 066/12',
    avgSpeed: '300 km/h',
    fuelEfficiency: '115 kg/race',
    technology: '스위스 정밀 기계공학',
    keyFeature: '친환경 지속가능성',
    founded: '1993년',
    teamPrincipal: '알레산드로 알룬니-브라비'
  }
]

const getCarImage = (filename) => {
  return new URL(`../../assets/images/Cars/${filename}`, import.meta.url).href
}

const getTeamLogo = (filename) => {
  return new URL(`../../assets/images/Teams/${filename}`, import.meta.url).href
}

const getTeamColors = (teamId) => {
  const colorMap = {
    1: { primary: 'rgba(100, 140, 255, 0.7)', secondary: '#000000', accent: 'rgba(30, 58, 138, 0.6)' }, // Red Bull - 밝은 블루
    2: { primary: 'rgba(255, 100, 120, 0.7)', secondary: '#000000', accent: 'rgba(220, 20, 60, 0.6)' }, // Ferrari - 밝은 레드  
    3: { primary: 'rgba(100, 255, 230, 0.7)', secondary: '#000000', accent: 'rgba(0, 210, 190, 0.6)' }, // Mercedes - 밝은 터쿠아즈
    4: { primary: 'rgba(255, 180, 80, 0.7)', secondary: '#000000', accent: 'rgba(255, 135, 0, 0.6)' }, // McLaren - 밝은 오렌지
    5: { primary: 'rgba(100, 200, 180, 0.7)', secondary: '#000000', accent: 'rgba(0, 111, 98, 0.6)' }, // Aston Martin - 밝은 그린
    6: { primary: 'rgba(120, 180, 255, 0.7)', secondary: '#000000', accent: 'rgba(255, 105, 180, 0.6)' }, // Alpine - 밝은 블루
    7: { primary: 'rgba(100, 150, 255, 0.7)', secondary: '#000000', accent: 'rgba(0, 90, 255, 0.6)' }, // Williams - 밝은 블루
    8: { primary: 'rgba(150, 190, 255, 0.7)', secondary: '#1E3A8A', accent: 'rgba(102, 146, 255, 0.6)' }, // Racing Bulls - 밝은 라이트 블루
    9: { primary: 'rgba(255, 255, 255, 0.9)', secondary: '#000000', accent: 'rgba(255, 255, 255, 0.6)' }, // Haas - 밝은 화이트
    10: { primary: 'rgba(150, 255, 150, 0.7)', secondary: '#000000', accent: 'rgba(82, 226, 82, 0.6)' } // Sauber - 밝은 그린
  }
  return colorMap[teamId] || { primary: 'rgba(255, 255, 255, 0.7)', secondary: '#000000', accent: 'rgba(0, 144, 255, 0.6)' }
}

const initThreeJS = async () => {
  if (!canvasRef.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x111111)

  camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
  camera.position.set(0, 0, 8)

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25

  // Post-processing setup
  composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
  )
  composer.addPass(bloomPass)

  controls = new OrbitControls(camera, canvasRef.value)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 5
  controls.maxDistance = 12
  controls.enablePan = false
  controls.maxPolarAngle = Math.PI / 1.8
  controls.minPolarAngle = Math.PI / 3

  // Enhanced lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
  directionalLight.position.set(5, 5, 5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
  scene.add(ambientLight)

  // Rim light for dramatic effect
  const rimLight = new THREE.DirectionalLight(selectedTeam.value?.color || 0x0090FF, 2)
  rimLight.position.set(-5, 0, 2)
  scene.add(rimLight)

  // Load car texture and create 3D car model
  await loadCarTexture()
  createEnhanced3DCarModel()

  animate()
}

const loadCarTexture = async () => {
  if (!selectedTeam.value) return
  
  const loader = new THREE.TextureLoader()
  try {
    const imagePath = getCarImage(selectedTeam.value.carImage)
    carTexture = await new Promise((resolve, reject) => {
      loader.load(imagePath, resolve, undefined, reject)
    })
    carTexture.wrapS = THREE.ClampToEdgeWrapping
    carTexture.wrapT = THREE.ClampToEdgeWrapping
    carTexture.flipY = false
  } catch (error) {
    console.warn('Failed to load car texture:', error)
    carTexture = null
  }
}

const createEnhanced3DCarModel = () => {
  const group = new THREE.Group()
  
  // Create a more realistic 3D car shape using multiple planes
  if (carTexture) {
    // Main car body (front view)
    const frontGeometry = new THREE.PlaneGeometry(6, 3)
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: carTexture,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true
    })
    const frontPlane = new THREE.Mesh(frontGeometry, frontMaterial)
    frontPlane.position.set(0, 0, 0.1)
    group.add(frontPlane)
    
    // Side panels for 3D depth
    const sideGeometry = new THREE.PlaneGeometry(1.5, 3)
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: selectedTeam.value?.color || 0x1E3A8A,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: 0.8
    })
    
    // Left side
    const leftSide = new THREE.Mesh(sideGeometry, sideMaterial)
    leftSide.position.set(-3.2, 0, 0)
    leftSide.rotation.y = Math.PI / 2
    group.add(leftSide)
    
    // Right side
    const rightSide = new THREE.Mesh(sideGeometry, sideMaterial)
    rightSide.position.set(3.2, 0, 0)
    rightSide.rotation.y = -Math.PI / 2
    group.add(rightSide)
    
    // Top and bottom for more depth
    const topBottomGeometry = new THREE.PlaneGeometry(6, 1.5)
    const topBottomMaterial = new THREE.MeshStandardMaterial({
      color: selectedTeam.value?.color || 0x1E3A8A,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.6
    })
    
    // Top
    const top = new THREE.Mesh(topBottomGeometry, topBottomMaterial)
    top.position.set(0, 1.6, 0)
    top.rotation.x = -Math.PI / 2
    group.add(top)
    
    // Bottom
    const bottom = new THREE.Mesh(topBottomGeometry, topBottomMaterial)
    bottom.position.set(0, -1.6, 0)
    bottom.rotation.x = Math.PI / 2
    group.add(bottom)
  } else {
    // Fallback: simple colored box
    const carGeometry = new THREE.BoxGeometry(6, 3, 1.5)
    const carMaterial = new THREE.MeshStandardMaterial({
      color: selectedTeam.value?.color || 0x1E3A8A,
      metalness: 0.8,
      roughness: 0.2
    })
    const carMesh = new THREE.Mesh(carGeometry, carMaterial)
    group.add(carMesh)
  }
  
  // Add subtle glow effect
  const glowGeometry = new THREE.SphereGeometry(4, 32, 16)
  const glowMaterial = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    uniforms: {
      c: { value: 0.3 },
      p: { value: 6.0 },
      glowColor: { value: new THREE.Color(selectedTeam.value?.color || 0x0090FF) }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float c;
      uniform float p;
      uniform vec3 glowColor;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
        gl_FragColor = vec4(glowColor, intensity * 0.3);
      }
    `
  })
  
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
  group.add(glowMesh)
  
  car = group
  scene.add(car)
}

const createParticleSystem = (parentGroup) => {
  const particleCount = 200
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  const teamColor = new THREE.Color(selectedTeam.value?.color || 0x0090FF)
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    
    // Create particles in a car-shaped distribution
    const angle = (i / particleCount) * Math.PI * 2
    const radius = 4 + Math.random() * 2
    
    positions[i3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 2
    positions[i3 + 1] = Math.sin(angle) * radius * 0.5 + (Math.random() - 0.5) * 1
    positions[i3 + 2] = (Math.random() - 0.5) * 3
    
    colors[i3] = teamColor.r + Math.random() * 0.2
    colors[i3 + 1] = teamColor.g + Math.random() * 0.2
    colors[i3 + 2] = teamColor.b + Math.random() * 0.2
  }
  
  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })
  
  const particles = new THREE.Points(particleGeometry, particleMaterial)
  parentGroup.add(particles)
}

const animate = () => {
  requestAnimationFrame(animate)
  
  if (controls) {
    controls.update()
  }
  
  if (car) {
    // Smooth Y-axis rotation (like the Three.js example)
    car.rotation.y += 0.005
    
    // Subtle floating animation
    car.position.y = Math.sin(Date.now() * 0.0008) * 0.2
    
    // Slight tilt for dynamic look
    car.rotation.x = Math.sin(Date.now() * 0.0006) * 0.05
    car.rotation.z = Math.cos(Date.now() * 0.0004) * 0.03
  }

  if (composer && scene && camera) {
    composer.render()
  }
}

const selectTeam = async (team) => {
  selectedTeam.value = team
  
  // 스크롤 막기
  document.body.style.overflow = 'hidden'
  
  // 애니메이션 시퀀스 시작
  setTimeout(() => {
    carEntering.value = true
  }, 50)
  
  setTimeout(() => {
    carCentered.value = true
  }, 800)
  
  setTimeout(() => {
    panelsAssembling.value = true
  }, 1200)
}

const closeModal = () => {
  // 스크롤 복원
  document.body.style.overflow = ''
  
  // 애니메이션 상태 초기화
  carEntering.value = false
  carCentered.value = false
  panelsAssembling.value = false
  
  setTimeout(() => {
    selectedTeam.value = null
  }, 300)
}

const resizeRenderer = () => {
  if (!renderer || !camera || !canvasRef.value) return
  
  const container = canvasRef.value.parentElement
  const width = container.clientWidth
  const height = container.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  
  if (composer) {
    composer.setSize(width, height)
  }
  
  if (bloomPass) {
    bloomPass.setSize(width, height)
  }
}

// Teams 3D \uc124\uc815
const initTeams3D = () => {
  if (!teamsCanvasRef.value) return

  // Three.js \uae30\ubcf8 \uc124\uc815
  teamsScene = new THREE.Scene()
  
  teamsCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  teamsCamera.position.set(0, 0, 15)
  
  teamsRenderer = new THREE.WebGLRenderer({ canvas: teamsCanvasRef.value, alpha: true, antialias: true })
  teamsRenderer.setSize(window.innerWidth, window.innerHeight)
  teamsRenderer.setPixelRatio(window.devicePixelRatio)
  
  // \ub9c8\uc6b0\uc2a4 \ub808\uc774\ucea90\uc2a4\ud305
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  
  // \ud300 \uad6c\uccb4\ub4e4 \uc0dd\uc131
  createTeamSpheres()
  
  // \uc774\ubca4\ud2b8 \ub9ac\uc2a4\ub108
  teamsCanvasRef.value.addEventListener('click', onTeamSphereClick)
  teamsCanvasRef.value.addEventListener('mousemove', onTeamSphereHover)
  window.addEventListener('resize', onTeamsResize)
  
  // \uc560\ub2c8\uba54\uc774\uc158 \uc2dc\uc791
  animateTeamSpheres()
}

const createTeamSpheres = () => {
  teams.forEach((team, index) => {
    // \uad6c\uccb4 \uae30\ud558\ud559\uacfc \uc7ac\uc9c8
    const geometry = new THREE.SphereGeometry(0.8, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: team.color,
      metalness: 0.7,
      roughness: 0.2,
      emissive: new THREE.Color(team.color).multiplyScalar(0.1)
    })
    
    const sphere = new THREE.Mesh(geometry, material)
    
    // 초기 위치 (원형으로 배치)
    const angle = (index / teams.length) * Math.PI * 2
    const radius = 6
    sphere.position.x = Math.cos(angle) * radius
    sphere.position.y = Math.sin(angle) * radius * 0.5
    sphere.position.z = Math.random() * 4 - 2
    
    // 초기 속도
    sphere.userData = {
      team: team,
      velocity: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01
      },
      originalPosition: sphere.position.clone(),
      hovered: false
    }
    
    teamSpheres.push(sphere)
    teamsScene.add(sphere)
  })
  
  // 조명 추가
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  teamsScene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(10, 10, 5)
  teamsScene.add(directionalLight)
}

const animateTeamSpheres = () => {
  teamsAnimationId = requestAnimationFrame(animateTeamSpheres)
  
  // 각 구체 애니메이션
  teamSpheres.forEach((sphere) => {
    const { velocity } = sphere.userData
    
    // 위치 업데이트 (바운싱 효과)
    sphere.position.add(new THREE.Vector3(velocity.x, velocity.y, velocity.z))
    
    // 경계 충돌 처리
    if (Math.abs(sphere.position.x) > 8) velocity.x *= -1
    if (Math.abs(sphere.position.y) > 4) velocity.y *= -1
    if (Math.abs(sphere.position.z) > 3) velocity.z *= -1
    
    // 느린 회전
    sphere.rotation.x += 0.01
    sphere.rotation.y += 0.01
    
    // 호버 효과
    if (sphere.userData.hovered) {
      sphere.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1)
    } else {
      sphere.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
    }
  })
  
  teamsRenderer.render(teamsScene, teamsCamera)
}

const onTeamSphereClick = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  
  raycaster.setFromCamera(mouse, teamsCamera)
  const intersects = raycaster.intersectObjects(teamSpheres)
  
  if (intersects.length > 0) {
    const clickedSphere = intersects[0].object
    const team = clickedSphere.userData.team
    selectTeam(team)
  }
}

const onTeamSphereHover = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  
  raycaster.setFromCamera(mouse, teamsCamera)
  const intersects = raycaster.intersectObjects(teamSpheres)
  
  // 모든 구체 호버 상태 초기화
  teamSpheres.forEach(sphere => {
    sphere.userData.hovered = false
  })
  
  if (intersects.length > 0) {
    const hoveredSphere = intersects[0].object
    hoveredSphere.userData.hovered = true
    hoveredTeam.value = hoveredSphere.userData.team
    document.body.style.cursor = 'pointer'
  } else {
    hoveredTeam.value = null
    document.body.style.cursor = 'default'
  }
}

const onTeamsResize = () => {
  if (!teamsCamera || !teamsRenderer) return
  
  teamsCamera.aspect = window.innerWidth / window.innerHeight
  teamsCamera.updateProjectionMatrix()
  teamsRenderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  window.addEventListener('resize', resizeRenderer)
  
  // Teams 3D 초기화
  nextTick(() => {
    initTeams3D()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeRenderer)
  window.removeEventListener('resize', onTeamsResize)
  
  // Teams 3D 정리
  if (teamsAnimationId) {
    cancelAnimationFrame(teamsAnimationId)
  }
  if (teamsRenderer) {
    teamsRenderer.dispose()
  }
  
  if (renderer) {
    renderer.dispose()
  }
  if (composer) {
    composer.dispose()
  }
  if (carTexture) {
    carTexture.dispose()
  }
})
</script>

<style scoped>
.teams-container {
  padding: 2rem;
  background: transparent;
  min-height: 100vh;
  position: relative;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(2, 120px);
  justify-content: flex-start;
  align-items: center;
  gap: 2rem;
  max-width: 300px;
  margin: 0rem 0 0 4rem;
  padding: 2rem 0;
  position: relative;
  z-index: 2;
}

.team-card {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, 
    var(--team-primary, #1E3A8A), 
    var(--team-secondary, #000000));
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid var(--team-accent, #FFD700);
  backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.team-logo-circle {
  width: 60px;
  height: 60px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  padding: 8px;
  z-index: 2;
}

.team-tooltip {
  position: absolute;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  border: 1px solid var(--team-accent, #FFD700);
  z-index: 10;
}

.team-tooltip.visible {
  opacity: 1;
}

.team-tooltip h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.team-tooltip p {
  margin: 0;
  font-size: 0.7rem;
  color: #ccc;
}

.team-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent, 
    var(--team-accent, #FFD700), 
    transparent);
  opacity: 0.1;
  transition: opacity 0.3s ease;
}

.team-card.hovered {
  transform: scale(1.2);
  border-width: 4px;
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.4),
    0 0 25px var(--team-accent, #FFD700);
  z-index: 10;
}


/* 팀별 개별 스타일링 */
.team-card::before {
  background: linear-gradient(45deg, 
    transparent, 
    var(--team-accent, #FFD700), 
    transparent);
  opacity: 0.1;
}

.team-card .team-logo {
  filter: drop-shadow(0 0 8px var(--team-accent, #FFD700));
}

.team-card.hovered::before {
  opacity: 0.3;
}

.team-card.active {
  border-color: #ff6b6b;
  box-shadow: 0 20px 40px rgba(255, 107, 107, 0.4);
}

.team-card-inner {
  position: relative;
  z-index: 2;
}


.team-logo-circle {
  width: 60px;
  height: 60px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  padding: 8px;
  z-index: 2;
}

.team-tooltip {
  position: absolute;
  top: 140px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  border: 1px solid var(--team-accent, #FFD700);
  z-index: 10;
}

.team-tooltip.visible {
  opacity: 1;
}

.team-tooltip h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.team-tooltip p {
  margin: 0;
  font-size: 0.7rem;
  color: #ccc;
}




/* 자동차 + 상세정보 애니메이션 컨테이너 */
.car-detail-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 100;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* 자동차 애니메이션 */
.animated-car {
  position: absolute;
  left: -300px;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animated-car.car-entering {
  left: 50%;
  transform: translate(-50%, -50%);
}

.animated-car.car-centered {
  transform: translate(-50%, -50%) scale(1.1);
}

.animated-car .car-image {
  width: 400px;
  height: 200px;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
  position: relative;
  z-index: 2;
}

/* 공기역학 흐름 컨테이너 */
.airflow-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
}

/* 스태그네이션 포인트 (앞쪽 충돌점) */
.stagnation-point {
  position: absolute;
  top: 50%;
  right: 20px;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #ff6b6b, transparent);
  border-radius: 50%;
  transform: translateY(-50%);
  animation: pulse 2s ease-in-out infinite;
}

/* 공기 흐름선 기본 스타일 */
.airflow-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  border-radius: 1px;
  opacity: 0.6;
}

/* 위쪽 흐름선들 - 자동차 위쪽 공기흐름 */
.upper-flow-1 {
  top: 35%;
  left: 25%;
  width: 350px;
  background: linear-gradient(90deg, #00d2ff, transparent);
  animation: flowLeft 2s linear infinite;
  animation-delay: 0s;
  transform: rotate(-12deg);
}

.upper-flow-2 {
  top: 38%;
  left: 30%;
  width: 320px;
  background: linear-gradient(90deg, #0090ff, transparent);
  animation: flowLeft 2s linear infinite;
  animation-delay: 0.3s;
  transform: rotate(-6deg);
}

.upper-flow-3 {
  top: 42%;
  left: 35%;
  width: 300px;
  background: linear-gradient(90deg, #ff69b4, transparent);
  animation: flowLeft 2s linear infinite;
  animation-delay: 0.6s;
  transform: rotate(-2deg);
}

/* 아래쪽 흐름선들 - 자동차 아래쪽 공기흐름 */
.lower-flow-1 {
  top: 58%;
  left: 35%;
  width: 300px;
  background: linear-gradient(90deg, #ffd700, transparent);
  animation: flowLeft 2s linear infinite;
  animation-delay: 0.9s;
  transform: rotate(2deg);
}

.lower-flow-2 {
  top: 62%;
  left: 30%;
  width: 320px;
  background: linear-gradient(90deg, #ff8700, transparent);
  animation: flowLeft 2s linear infinite;
  animation-delay: 1.2s;
  transform: rotate(6deg);
}

.lower-flow-3 {
  top: 65%;
  left: 25%;
  width: 350px;
  background: linear-gradient(90deg, #9370db, transparent);
  animation: flowLeft 2s linear infinite;
  animation-delay: 1.5s;
  transform: rotate(12deg);
}

/* 후류 와류 */
.wake-turbulence {
  position: absolute;
  top: 50%;
  left: -30px;
  width: 40px;
  height: 60px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translateY(-50%);
  animation: swirl 3s ease-in-out infinite;
}

/* 애니메이션 키프레임 */
@keyframes flowLeft {
  0% {
    transform: translateX(-300px) scaleX(0);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
    transform: translateX(-200px) scaleX(1);
  }
  80% {
    opacity: 0.8;
    transform: translateX(50px) scaleX(1.5);
  }
  100% {
    opacity: 0;
    transform: translateX(200px) scaleX(0.5);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translateY(-50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-50%) scale(1.3);
    opacity: 1;
  }
}

@keyframes swirl {
  0% {
    transform: translateY(-50%) rotate(0deg) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-50%) rotate(180deg) scale(1.2);
    opacity: 0.6;
  }
  100% {
    transform: translateY(-50%) rotate(360deg) scale(1);
    opacity: 0.3;
  }
}

/* 자동차가 중앙에 위치했을 때 공기역학 효과 활성화 */
.car-centered .airflow-container {
  opacity: 1;
}

/* 정보 패널들 */
.info-panels {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 1000px;
  height: 500px;
}

.info-panel {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1.2rem;
  color: white;
  opacity: 0;
  transform: scale(0.8) translateY(10px);
  transition: all 0.4s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.panels-assembling .info-panel {
  opacity: 1;
  transform: scale(1) translateY(0px);
  transition-delay: var(--delay);
}

/* 개별 패널 위치 */
.team-header-panel {
  top: -120px;
  right: -200px;
  transform: scale(0.5) rotateY(90deg);
  width: 300px;
  text-align: center;
}

.panels-assembling .team-header-panel {
  transform: scale(1) rotateY(0deg);
  right: 20px;
}

.slogan-panel {
  bottom: -50px;
  right: -300px;
  width: 280px;
}

.panels-assembling .slogan-panel {
  right: -20px;
}

.stats-panel {
  bottom: -150px;
  left: 50%;
  transform: translateX(-50%) scale(0.5) rotateY(90deg);
  width: 400px;
  display: flex;
  justify-content: space-around;
  padding: 2rem 1.5rem;
}

.panels-assembling .stats-panel {
  transform: translateX(-50%) scale(1) rotateY(0deg);
}

.tech-panel {
  top: -30px;
  left: -380px;
  width: 300px;
}

.panels-assembling .tech-panel {
  left: -100px;
}

/* 패널 내부 스타일 */
.team-logo-large {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  margin-bottom: 1rem;
  padding: 10px;
  background: rgba(255, 255, 255, 0.95);
}

.team-title h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: var(--team-color, #00d2ff);
  font-weight: bold;
}

.slogan {
  font-size: 1.2rem;
  font-style: italic;
  color: var(--team-color, #ffd700);
  margin: 0 0 1rem 0;
  text-align: center;
}

.founded {
  font-size: 0.9rem;
  color: #ccc;
  text-align: center;
  margin: 0;
}

.stat-item {
  text-align: center;
  flex: 1;
  padding: 0 1rem;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #ccc;
  text-transform: uppercase;
  white-space: nowrap;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}

.tech-item span:first-child {
  color: #ccc;
}

.tech-item span:last-child {
  color: white;
  font-weight: 600;
}


.team-stats {
  color: white;
}

.team-motto {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 3px solid var(--team-accent, #FFD700);
}

.slogan {
  font-size: 1.2rem;
  font-weight: 600;
  font-style: italic;
  color: var(--team-color, #ffd700);
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.founded {
  font-size: 0.9rem;
  color: #ccc;
  margin: 0;
  text-align: center;
}

.tech-specs {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tech-item:last-child {
  border-bottom: none;
}

.tech-label {
  font-size: 0.9rem;
  color: #999;
  font-weight: 500;
}

.tech-value {
  font-size: 0.9rem;
  color: white;
  font-weight: 600;
  text-align: right;
}

.team-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.modal-team-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 10px;
}

.team-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.modal-country {
  margin: 0.5rem 0 0 0;
  color: #888;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  gap: 1.5rem;
}

.stat {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.stat-number {
  display: block;
  font-size: 3rem;
  font-weight: bold;
  color: var(--team-color, #00d2ff);
  margin-bottom: 0.5rem;
}

.stat-label {
  display: block;
  color: #ccc;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes glow-pulse {
  from {
    box-shadow: 
      0 25px 50px rgba(0, 255, 136, 0.4),
      0 0 30px rgba(0, 255, 136, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  to {
    box-shadow: 
      0 25px 50px rgba(0, 255, 136, 0.6),
      0 0 40px rgba(0, 255, 136, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: scale(0.8) rotateY(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
  }
}

.team-card {
  animation: float-in 0.6s ease-out forwards;
}

.team-card:nth-child(1) { animation-delay: 0.1s; }
.team-card:nth-child(2) { animation-delay: 0.2s; }
.team-card:nth-child(3) { animation-delay: 0.3s; }
.team-card:nth-child(4) { animation-delay: 0.4s; }
.team-card:nth-child(5) { animation-delay: 0.5s; }
.team-card:nth-child(6) { animation-delay: 0.6s; }
.team-card:nth-child(7) { animation-delay: 0.7s; }
.team-card:nth-child(8) { animation-delay: 0.8s; }
.team-card:nth-child(9) { animation-delay: 0.9s; }
.team-card:nth-child(10) { animation-delay: 1.0s; }

.modal-overlay {
  animation: modal-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.car-image {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.team-card.hovered .car-image {
  transform: scale(1.02);
  filter: brightness(1.05) saturate(1.1);
}

.team-logo {
  transition: all 0.3s ease;
}

.team-card.hovered .team-logo {
  transform: scale(1.05);
  filter: drop-shadow(0 0 12px var(--team-accent, #FFD700));
}

@media (max-width: 768px) {
  .modal-content {
    grid-template-columns: 1fr;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .teams-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>