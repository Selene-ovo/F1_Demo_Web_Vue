<template>
  <div class="world-map-container">
    <div class="map-wrapper" ref="mapContainer" @click="handleMapContainerClick">
      <!-- Three.js 캔버스 -->
      <canvas ref="threeCanvas" class="three-canvas"></canvas>

      <!-- 세계지도 이미지 -->
      <div class="map-image-container">
        <img
          src="/src/assets/images/BackGrounds/World.webp"
          alt="F1 World Map"
          class="world-map-image"
        />

        <!-- 서킷 마커들 -->
        <div
          v-for="(circuit, index) in circuits"
          :key="circuit.id"
          class="circuit-marker"
          :class="{
            'marker-active': activeTooltip?.id === circuit.id,
            'marker-hovered': hoveredCircuit?.id === circuit.id,
          }"
          :style="{
            left: circuit.position.x + '%',
            top: circuit.position.y + '%',
            zIndex: getMarkerZIndex(circuit, index),
          }"
          @mouseenter="handleMarkerMouseEnter(circuit, $event)"
          @mouseleave="handleMarkerMouseLeave(circuit)"
          @click="selectCircuit(circuit)"
        >
          <div class="marker-dot" :class="{ 'dot-expanded': hoveredCircuit?.id === circuit.id }">
            <div class="marker-pulse"></div>
          </div>
        </div>
      </div>

      <!-- 툴팁 -->
      <div v-if="activeTooltip" class="circuit-tooltip" :style="tooltipStyle">
        <div class="tooltip-content">
          <img :src="activeTooltip.circuitImage" :alt="activeTooltip.name" class="tooltip-image" />
          <div class="tooltip-info">
            <h3>{{ activeTooltip.name }}</h3>
            <p class="tooltip-location">{{ activeTooltip.location }}</p>
            <p class="tooltip-length">{{ activeTooltip.length }}</p>
            <p class="tooltip-turns">{{ activeTooltip.laps }} laps</p>
          </div>
        </div>
        <!-- Country 배경 이미지 -->
        <div class="tooltip-country-background">
          <img
            :src="activeTooltip.countryImage"
            :alt="activeTooltip.location"
            class="country-background-image"
            :style="{
              objectFit: fullCoverCircuits.includes(activeTooltip.id) ? 'cover' : 'contain',
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'

const mapContainer = ref(null)
const threeCanvas = ref(null)
const activeTooltip = ref(null)
const hoveredCircuit = ref(null)
const tooltipStyle = ref({})
const isZoomedIn = ref(false)
const selectedCircuit = ref(null)

let scene, camera, renderer, currentCircuitModel, animationId
const circuitModels = new Map()

// 2025 F1 서킷 데이터 (정확한 파일명 매칭)
const circuits = ref([
  // 오세아니아

  // 호주
  {
    id: 1,
    name: 'Australian Grand Prix',
    location: 'Melbourne, Australia',
    position: { x: 81.5, y: 73.5 },
    circuitImage: '/src/assets/images/Circuits/Albert_Park.webp',
    countryImage: '/src/assets/images/Country/Albert_Park_B.webp',
    length: '5.278 km',
    laps: 58,
  },

  // 아시아

  // 일본
  {
    id: 2,
    name: 'Japanese Grand Prix',
    location: 'Suzuka, Japan',
    position: { x: 80.0, y: 27.9 },
    circuitImage: '/src/assets/images/Circuits/Suzuka.webp',
    countryImage: '/src/assets/images/Country/Suzuka_B.svg',
    length: '5.807 km',
    laps: 53,
  },

  // 중국
  {
    id: 3,
    name: 'Chinese Grand Prix',
    location: 'Shanghai, China',
    position: { x: 76.8, y: 30.5 },
    circuitImage: '/src/assets/images/Circuits/ShangHai.webp',
    countryImage: '/src/assets/images/Country/ShangHai_B.webp',
    length: '5.451 km',
    laps: 56,
  },

  // 싱가포르
  {
    id: 23,
    name: 'Singapore Grand Prix',
    location: 'Singapore',
    position: { x: 73.6, y: 48.8 },
    circuitImage: '/src/assets/images/Circuits/Marina.webp',
    countryImage: '/src/assets/images/Country/Marina_B.webp',
    length: '5.063 km',
    laps: 61,
  },

  // 중동

  // 바레인
  {
    id: 4,
    name: 'Bahrain Grand Prix',
    location: 'Sakhir, Bahrain',
    position: { x: 59, y: 33.1 },
    circuitImage: '/src/assets/images/Circuits/Bahrain.svg',
    countryImage: '/src/assets/images/Country/Bahrain_B.webp',
    length: '5.412 km',
    laps: 57,
  },

  // 사우디 아라비아
  {
    id: 5,
    name: 'Saudi Arabian Grand Prix',
    location: 'Jeddah, Saudi Arabia',
    position: { x: 57.1, y: 36.5 },
    circuitImage: '/src/assets/images/Circuits/Jeddah.webp',
    countryImage: '/src/assets/images/Country/Jeddah_B.svg',
    length: '6.174 km',
    laps: 50,
  },

  // 카타르
  {
    id: 6,
    name: 'Qatar Grand Prix',
    location: 'Lusail, Qatar',
    position: { x: 60, y: 34.1 },
    circuitImage: '/src/assets/images/Circuits/Lusail.webp',
    countryImage: '/src/assets/images/Country/Lusail_B.webp',
    length: '5.38 km',
    laps: 57,
  },

  // 아랍에미리트
  {
    id: 7,
    name: 'Abu Dhabi Grand Prix',
    location: 'Abu Dhabi, UAE',
    position: { x: 61, y: 35 },
    circuitImage: '/src/assets/images/Circuits/Yas_Marina.webp',
    countryImage: '/src/assets/images/Country/Yas_Marina_B.webp',
    length: '5.281 km',
    laps: 58,
  },

  // 아제르바이잔
  {
    id: 8,
    name: 'Azerbaijan Grand Prix',
    location: 'Baku, Azerbaijan',
    position: { x: 59.1, y: 25.1 },
    circuitImage: '/src/assets/images/Circuits/Baku.webp',
    countryImage: '/src/assets/images/Country/Baku_B.webp',
    length: '6.003 km',
    laps: 51,
  },

  // 유럽

  // 영국
  {
    id: 9,
    name: 'British Grand Prix',
    location: 'Silverstone, United Kingdom',
    position: { x: 47.6, y: 17.4 },
    circuitImage: '/src/assets/images/Circuits/SilverStone.webp',
    countryImage: '/src/assets/images/Country/SilverStone_B.webp',
    length: '5.891 km',
    laps: 52,
  },

  // 네덜란드
  {
    id: 10,
    name: 'Dutch Grand Prix',
    location: 'Zandvoort, Netherlands',
    position: { x: 48.8, y: 17.5 },
    circuitImage: '/src/assets/images/Circuits/Zandvoort.webp',
    countryImage: '/src/assets/images/Country/Zandvoort_B.webp',
    length: '4.259 km',
    laps: 72,
  },

  // 벨기에
  {
    id: 11,
    name: 'Belgian Grand Prix',
    location: 'Spa-Francorchamps, Belgium',
    position: { x: 49, y: 19.5 },
    circuitImage: '/src/assets/images/Circuits/Francorchamps.svg',
    countryImage: '/src/assets/images/Country/Francorchamps_B.webp',
    length: '7.004 km',
    laps: 44,
  },

  // 모나코
  {
    id: 12,
    name: 'Monaco Grand Prix',
    location: 'Monte Carlo, Monaco',
    position: { x: 49.1, y: 23.4 },
    circuitImage: '/src/assets/images/Circuits/Monaco.webp',
    countryImage: '/src/assets/images/Country/Monaco_B.svg',
    length: '3.337 km',
    laps: 78,
  },

  // 이탈리아 - 몬자
  {
    id: 13,
    name: 'Italian Grand Prix',
    location: 'Monza, Italy',
    position: { x: 50, y: 22 },
    circuitImage: '/src/assets/images/Circuits/Monza.webp',
    countryImage: '/src/assets/images/Country/Monza_B.webp',
    length: '5.793 km',
    laps: 53,
  },

  // 오스트리아
  {
    id: 14,
    name: 'Austrian Grand Prix',
    location: 'Spielberg, Austria',
    position: { x: 51.2, y: 20 },
    circuitImage: '/src/assets/images/Circuits/Red_Bull_Ring.webp',
    countryImage: '/src/assets/images/Country/Red_Bull_Ring_B.svg',
    length: '4.318 km',
    laps: 71,
  },

  // 헝가리
  {
    id: 15,
    name: 'Hungarian Grand Prix',
    location: 'Budapest, Hungary',
    position: { x: 52.2, y: 21 },
    circuitImage: '/src/assets/images/Circuits/Hungaroring.webp',
    countryImage: '/src/assets/images/Country/Hungaroring_B.webp',
    length: '4.381 km',
    laps: 70,
  },

  // 스페인
  {
    id: 16,
    name: 'Spanish Grand Prix',
    location: 'Barcelona, Spain',
    position: { x: 48, y: 24.4 },
    circuitImage: '/src/assets/images/Circuits/Barcelona.webp',
    countryImage: '/src/assets/images/Country/Barcelona_B.webp',
    length: '4.675 km',
    laps: 66,
  },

  // 이탈리아 - 이몰라
  {
    id: 24,
    name: 'Emilia Romagna Grand Prix',
    location: 'Imola, Italy',
    position: { x: 50.3, y: 23.2 },
    circuitImage: '/src/assets/images/Circuits/Autodromo.webp',
    countryImage: '/src/assets/images/Country/Autodromo_B.webp',
    length: '4.909 km',
    laps: 63,
  },

  // 북미

  // 캐나다
  {
    id: 17,
    name: 'Canadian Grand Prix',
    location: 'Montreal, Canada',
    position: { x: 31.3, y: 21.7 },
    circuitImage: '/src/assets/images/Circuits/Gilles.webp',
    countryImage: '/src/assets/images/Country/Gilles_B.webp',
    length: '4.361 km',
    laps: 70,
  },

  // 미국 - 텍사스
  {
    id: 18,
    name: 'United States Grand Prix',
    location: 'Austin, Texas, USA',
    position: { x: 23.8, y: 31.3 },
    circuitImage: '/src/assets/images/Circuits/Americas.webp',
    countryImage: '/src/assets/images/Country/Americas_B.svg',
    length: '5.513 km',
    laps: 56,
  },

  // 미국 - 마이애미
  {
    id: 19,
    name: 'Miami Grand Prix',
    location: 'Miami, Florida, USA',
    position: { x: 27.9, y: 33.7 },
    circuitImage: '/src/assets/images/Circuits/Miami.webp',
    countryImage: '/src/assets/images/Country/Miami_B.webp',
    length: '5.41 km',
    laps: 57,
  },

  // 미국 - 라스베가스
  {
    id: 20,
    name: 'Las Vegas Grand Prix',
    location: 'Las Vegas, Nevada, USA',
    position: { x: 19.9, y: 28.2 },
    circuitImage: '/src/assets/images/Circuits/Las_Vegas.webp',
    countryImage: '/src/assets/images/Country/Las_Vegas_B.webp',
    length: '6.12 km',
    laps: 50,
  },

  // 멕시코
  {
    id: 21,
    name: 'Mexico City Grand Prix',
    location: 'Mexico City, Mexico',
    position: { x: 23.2, y: 38 },
    circuitImage: '/src/assets/images/Circuits/Hermanos.webp',
    countryImage: '/src/assets/images/Country/Hermanos_B.webp',
    length: '4.304 km',
    laps: 71,
  },

  // 남미

  // 브라질
  {
    id: 22,
    name: 'Brazilian Grand Prix',
    location: 'São Paulo, Brazil',
    position: { x: 36.1, y: 64.6 },
    circuitImage: '/src/assets/images/Circuits/Carlos.webp',
    countryImage: '/src/assets/images/Country/Carlos_B.webp',
    length: '4.309 km',
    laps: 71,
  },
])

// 꽉채울 배경 이미지를 가진 서킷들
const fullCoverCircuits = [1, 8, 7, 13, 24, 9, 11, 17, 18, 19, 20, 21, 22, 23] // 모든 서킷에 동일한 스타일 적용

// 마커 Z-index 계산
const getMarkerZIndex = (circuit, index) => {
  if (activeTooltip.value?.id === circuit.id) return 15
  if (hoveredCircuit.value?.id === circuit.id) return 12
  return 5 + (index % 5)
}

// 마커 마우스 이벤트 처리
const handleMarkerMouseEnter = (circuit, event) => {
  hoveredCircuit.value = circuit
  showTooltip(circuit, event)
}

const handleMarkerMouseLeave = (circuit) => {
  hoveredCircuit.value = null
  hideTooltip()
}

// 툴팁 표시
const showTooltip = (circuit, event) => {
  // 이미 같은 서킷의 툴팁이 표시 중이면 위치만 업데이트
  if (activeTooltip.value && activeTooltip.value.id === circuit.id) {
    updateTooltipPosition(circuit, event)
    return
  }

  activeTooltip.value = circuit
  updateTooltipPosition(circuit, event)
}

// 툴팁 위치 업데이트
const updateTooltipPosition = (circuit, event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const mapRect = document.querySelector('.map-wrapper').getBoundingClientRect()

  tooltipStyle.value = {
    left: rect.left - mapRect.left + rect.width / 2 + 'px',
    top: rect.top - mapRect.top + rect.height + 10 + 'px',
    display: 'block',
    transform: 'translateX(-50%)',
    opacity: '1',
    transition: 'opacity 0.2s ease-in-out',
  }
}

// 툴팁 숨기기
const hideTooltip = () => {
  activeTooltip.value = null
}

// Three.js 초기화
const initThreeJS = () => {
  if (!threeCanvas.value || !mapContainer.value) return

  scene = new THREE.Scene()

  const container = mapContainer.value
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  )
  camera.position.z = 8

  renderer = new THREE.WebGLRenderer({
    canvas: threeCanvas.value,
    alpha: true,
    antialias: true,
  })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x000000, 0)

  createCircuitModels()
  animate()
}

// 3D 서킷 모델들 생성
const createCircuitModels = () => {
  const circuitLayouts = {
    1: createAustraliaLayout(),
    2: createJapanLayout(),
    3: createChinaLayout(),
    4: createBahrainLayout(),
    5: createSaudiLayout(),
    6: createQatarLayout(),
    7: createUAELayout(),
    8: createAzerbaijanLayout(),
    9: createBritainLayout(),
    10: createNetherlandsLayout(),
    11: createBelgiumLayout(),
    12: createMonacoLayout(),
    13: createItalyLayout(),
    14: createAustriaLayout(),
    15: createHungaryLayout(),
    16: createSpainLayout(),
    17: createCanadaLayout(),
    18: createUSALayout(),
    19: createMiamiLayout(),
    20: createLasVegasLayout(),
    21: createMexicoLayout(),
    22: createBrazilLayout(),
    23: createSingaporeLayout(),
    24: createImolaLayout(),
  }

  Object.entries(circuitLayouts).forEach(([id, points]) => {
    const circuit = create3DCircuit(points)
    circuit.visible = false
    circuitModels.set(parseInt(id), circuit)
    scene.add(circuit)
  })
}

// 3D 서킷 생성 함수
const create3DCircuit = (points) => {
  const group = new THREE.Group()

  const curve = new THREE.CatmullRomCurve3(points, true)
  const geometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, true)

  const material = new THREE.MeshBasicMaterial({
    color: 0xff4444,
    transparent: true,
    opacity: 1.0,
  })

  const track = new THREE.Mesh(geometry, material)
  group.add(track)

  return group
}

// 서킷 레이아웃들 (24개 전체)
const createAustraliaLayout = () => [
  new THREE.Vector3(-1.2, 0, -1),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(0, 0, 1.3),
  new THREE.Vector3(1.2, 0, 1),
  new THREE.Vector3(1.5, 0, 0),
  new THREE.Vector3(1, 0, -1.2),
  new THREE.Vector3(0, 0, -1.5),
]

const createJapanLayout = () => [
  new THREE.Vector3(-1.2, 0, -1),
  new THREE.Vector3(-1.5, 0, 0),
  new THREE.Vector3(-0.5, 0, 1.2),
  new THREE.Vector3(0.5, 0, 1.5),
  new THREE.Vector3(1.5, 0, 0.5),
  new THREE.Vector3(1, 0, -1),
  new THREE.Vector3(0, 0, -1.5),
]

const createChinaLayout = () => [
  new THREE.Vector3(-1.3, 0, -0.8),
  new THREE.Vector3(-1.2, 0, 1.1),
  new THREE.Vector3(0.2, 0, 1.4),
  new THREE.Vector3(1.3, 0, 0.9),
  new THREE.Vector3(1.4, 0, -0.3),
  new THREE.Vector3(0.8, 0, -1.3),
  new THREE.Vector3(-0.2, 0, -1.4),
]

const createBahrainLayout = () => [
  new THREE.Vector3(-1, 0, -1),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(0, 0, 1.5),
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(1.5, 0, 0),
  new THREE.Vector3(1, 0, -1),
  new THREE.Vector3(0, 0, -1.5),
]

const createSaudiLayout = () => [
  new THREE.Vector3(-1.4, 0, -0.6),
  new THREE.Vector3(-1.1, 0, 1.2),
  new THREE.Vector3(0.3, 0, 1.5),
  new THREE.Vector3(1.4, 0, 0.8),
  new THREE.Vector3(1.3, 0, -0.7),
  new THREE.Vector3(0.5, 0, -1.4),
  new THREE.Vector3(-0.4, 0, -1.3),
]

const createQatarLayout = () => [
  new THREE.Vector3(-1.1, 0, -1.1),
  new THREE.Vector3(-1.3, 0, 0.9),
  new THREE.Vector3(-0.1, 0, 1.4),
  new THREE.Vector3(1.2, 0, 1.1),
  new THREE.Vector3(1.4, 0, -0.2),
  new THREE.Vector3(0.9, 0, -1.2),
  new THREE.Vector3(-0.1, 0, -1.4),
]

const createUAELayout = () => [
  new THREE.Vector3(-1.2, 0, -0.9),
  new THREE.Vector3(-1.1, 0, 1.1),
  new THREE.Vector3(0.1, 0, 1.4),
  new THREE.Vector3(1.3, 0, 1),
  new THREE.Vector3(1.4, 0, -0.1),
  new THREE.Vector3(0.8, 0, -1.3),
  new THREE.Vector3(-0.3, 0, -1.4),
]

const createAzerbaijanLayout = () => [
  new THREE.Vector3(-1.5, 0, -0.5),
  new THREE.Vector3(-1, 0, 1.3),
  new THREE.Vector3(0.5, 0, 1.5),
  new THREE.Vector3(1.5, 0, 0.7),
  new THREE.Vector3(1.2, 0, -0.8),
  new THREE.Vector3(0.3, 0, -1.4),
  new THREE.Vector3(-0.6, 0, -1.2),
]

const createBritainLayout = () => [
  new THREE.Vector3(-1.5, 0, -1),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(0, 0, 1.5),
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(1.5, 0, -0.5),
  new THREE.Vector3(0.5, 0, -1.5),
]

const createNetherlandsLayout = () => [
  new THREE.Vector3(-1.3, 0, -0.7),
  new THREE.Vector3(-0.9, 0, 1.2),
  new THREE.Vector3(0.4, 0, 1.4),
  new THREE.Vector3(1.3, 0, 0.8),
  new THREE.Vector3(1.2, 0, -0.6),
  new THREE.Vector3(0.6, 0, -1.3),
  new THREE.Vector3(-0.2, 0, -1.4),
]

const createBelgiumLayout = () => [
  new THREE.Vector3(-1, 0, -1.2),
  new THREE.Vector3(-1.5, 0, 0),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(0, 0, 1.5),
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(1.5, 0, -0.5),
  new THREE.Vector3(0.5, 0, -1.5),
]

const createMonacoLayout = () => [
  new THREE.Vector3(-1, 0, -1),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(0, 0, 1.5),
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(1.5, 0, 0),
  new THREE.Vector3(1, 0, -1),
  new THREE.Vector3(0, 0, -1.5),
]

const createItalyLayout = () => [
  new THREE.Vector3(-1, 0, -1),
  new THREE.Vector3(-1, 0, 0.5),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(1.5, 0, 0),
  new THREE.Vector3(1, 0, -1),
  new THREE.Vector3(0, 0, -1.2),
]

const createAustriaLayout = () => [
  new THREE.Vector3(-1.1, 0, -0.9),
  new THREE.Vector3(-0.8, 0, 1.1),
  new THREE.Vector3(0.3, 0, 1.3),
  new THREE.Vector3(1.1, 0, 0.9),
  new THREE.Vector3(1.3, 0, -0.3),
  new THREE.Vector3(0.8, 0, -1.1),
  new THREE.Vector3(-0.1, 0, -1.3),
]

const createHungaryLayout = () => [
  new THREE.Vector3(-1.2, 0, -0.8),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(0.2, 0, 1.3),
  new THREE.Vector3(1.2, 0, 1),
  new THREE.Vector3(1.4, 0, -0.2),
  new THREE.Vector3(0.7, 0, -1.2),
  new THREE.Vector3(-0.3, 0, -1.3),
]

const createSpainLayout = () => [
  new THREE.Vector3(-1.1, 0, -1),
  new THREE.Vector3(-1.2, 0, 0.8),
  new THREE.Vector3(0, 0, 1.2),
  new THREE.Vector3(1.1, 0, 1),
  new THREE.Vector3(1.3, 0, -0.1),
  new THREE.Vector3(0.9, 0, -1.1),
  new THREE.Vector3(0, 0, -1.3),
]

const createCanadaLayout = () => [
  new THREE.Vector3(-1.3, 0, -0.6),
  new THREE.Vector3(-0.9, 0, 1.1),
  new THREE.Vector3(0.4, 0, 1.3),
  new THREE.Vector3(1.3, 0, 0.7),
  new THREE.Vector3(1.1, 0, -0.5),
  new THREE.Vector3(0.5, 0, -1.3),
  new THREE.Vector3(-0.4, 0, -1.2),
]

const createUSALayout = () => [
  new THREE.Vector3(-1.2, 0, -0.9),
  new THREE.Vector3(-1.1, 0, 1),
  new THREE.Vector3(0.2, 0, 1.3),
  new THREE.Vector3(1.2, 0, 1.1),
  new THREE.Vector3(1.4, 0, -0.3),
  new THREE.Vector3(0.8, 0, -1.2),
  new THREE.Vector3(-0.2, 0, -1.3),
]

const createMiamiLayout = () => [
  new THREE.Vector3(-1, 0, -1),
  new THREE.Vector3(-1, 0, 0.5),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 1),
  new THREE.Vector3(1.5, 0, 0),
  new THREE.Vector3(1, 0, -1),
  new THREE.Vector3(0, 0, -1.2),
]

const createLasVegasLayout = () => [
  new THREE.Vector3(-1.5, 0, -0.5),
  new THREE.Vector3(-1, 0, 1),
  new THREE.Vector3(1, 0, 1.2),
  new THREE.Vector3(1.5, 0, 0),
  new THREE.Vector3(1, 0, -1.2),
  new THREE.Vector3(-1, 0, -1),
]

const createMexicoLayout = () => [
  new THREE.Vector3(-1.1, 0, -1),
  new THREE.Vector3(-1.3, 0, 0.7),
  new THREE.Vector3(-0.1, 0, 1.2),
  new THREE.Vector3(1.1, 0, 1.1),
  new THREE.Vector3(1.3, 0, -0.2),
  new THREE.Vector3(0.8, 0, -1.2),
  new THREE.Vector3(-0.2, 0, -1.3),
]

const createBrazilLayout = () => [
  new THREE.Vector3(-1.2, 0, -0.8),
  new THREE.Vector3(-1, 0, 1.1),
  new THREE.Vector3(0.3, 0, 1.3),
  new THREE.Vector3(1.2, 0, 0.9),
  new THREE.Vector3(1.1, 0, -0.4),
  new THREE.Vector3(0.6, 0, -1.2),
  new THREE.Vector3(-0.3, 0, -1.3),
]

const createSingaporeLayout = () => [
  new THREE.Vector3(-1.4, 0, -0.7),
  new THREE.Vector3(-1.1, 0, 1.1),
  new THREE.Vector3(0.2, 0, 1.4),
  new THREE.Vector3(1.3, 0, 0.8),
  new THREE.Vector3(1.2, 0, -0.6),
  new THREE.Vector3(0.4, 0, -1.3),
  new THREE.Vector3(-0.5, 0, -1.2),
]

const createImolaLayout = () => [
  new THREE.Vector3(-1.3, 0, -0.8),
  new THREE.Vector3(-1.1, 0, 1.1),
  new THREE.Vector3(0.1, 0, 1.4),
  new THREE.Vector3(1.2, 0, 1.1),
  new THREE.Vector3(1.4, 0, -0.1),
  new THREE.Vector3(1.0, 0, -1.1),
  new THREE.Vector3(0.2, 0, -1.4),
  new THREE.Vector3(-0.3, 0, -1.3),
]

// 애니메이션 루프
const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (currentCircuitModel) {
    currentCircuitModel.rotation.y += 0.01
    currentCircuitModel.rotation.x = Math.sin(Date.now() * 0.001) * 0.1
  }

  renderer.render(scene, camera)
}

// 서킷 선택 (클릭 시)
const selectCircuit = (circuit) => {
  if (isZoomedIn.value && selectedCircuit.value?.id === circuit.id) {
    zoomOut()
  } else {
    zoomToCircuit(circuit)
  }
}

// 서킷으로 확대
const zoomToCircuit = (circuit) => {
  selectedCircuit.value = circuit
  isZoomedIn.value = true

  hideTooltip()

  const imageContainer = document.querySelector('.map-image-container')
  if (imageContainer) {
    imageContainer.style.transformOrigin = `${circuit.position.x}% ${circuit.position.y}%`
    imageContainer.style.transform = 'scale(4)'
    imageContainer.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  setTimeout(() => {
    show3DCircuit(circuit.id)
  }, 400)
}

// 확대 해제
const zoomOut = () => {
  isZoomedIn.value = false
  selectedCircuit.value = null

  const imageContainer = document.querySelector('.map-image-container')
  if (imageContainer) {
    imageContainer.style.transform = 'scale(1)'
  }

  hide3DCircuit()
}

// 3D 서킷 표시
const show3DCircuit = (circuitId) => {
  if (currentCircuitModel) {
    currentCircuitModel.visible = false
  }

  const circuit = circuitModels.get(circuitId)
  if (circuit) {
    circuit.visible = true
    circuit.scale.set(0.1, 0.1, 0.1)
    circuit.position.set(0, 0, 2)

    animateCircuitIn(circuit)
    currentCircuitModel = circuit
  }
}

// 3D 서킷 숨기기
const hide3DCircuit = () => {
  if (currentCircuitModel) {
    animateCircuitOut(currentCircuitModel)
  }
}

// 서킷 등장 애니메이션
const animateCircuitIn = (circuit) => {
  const startScale = 0.1
  const endScale = 2.5
  const duration = 300
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    const easeProgress = 1 - Math.pow(1 - progress, 3)
    const scale = startScale + (endScale - startScale) * easeProgress

    circuit.scale.set(scale, scale, scale)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  animate()
}

// 서킷 퇴장 애니메이션
const animateCircuitOut = (circuit) => {
  const startScale = 2.5
  const endScale = 0.1
  const duration = 200
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    const scale = startScale + (endScale - startScale) * progress
    circuit.scale.set(scale, scale, scale)

    if (progress >= 1) {
      circuit.visible = false
      if (currentCircuitModel === circuit) {
        currentCircuitModel = null
      }
    } else {
      requestAnimationFrame(animate)
    }
  }
  animate()
}

// 키보드 이벤트 처리
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isZoomedIn.value) {
    zoomOut()
  }
}

// 외부 클릭 처리
const handleMapContainerClick = (event) => {
  if (isZoomedIn.value && !event.target.closest('.circuit-marker')) {
    zoomOut()
  }
}

// 윈도우 리사이즈 처리
const handleResize = () => {
  if (!renderer || !camera || !mapContainer.value) return

  const container = mapContainer.value
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

onMounted(() => {
  nextTick(() => {
    initThreeJS()
  })
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)

  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.world-map-container {
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0f0f, #1a1a1a);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.three-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.map-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
  transform-origin: center center;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.world-map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.9;
}

.circuit-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 4;
  transition: all 0.3s ease;
  /* 호버 끊김 방지를 위한 약간의 여백 */
  padding: 4px;
  margin: -4px;
}

.circuit-marker.marker-active {
  z-index: 10 !important;
}

.circuit-marker:hover {
  z-index: 9 !important;
}

.marker-dot {
  position: relative;
  width: 12px;
  height: 12px;
  background: #dc2626;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  transition: all 0.3s ease;
  z-index: 2;
  cursor: pointer;
}

.marker-dot:hover,
.marker-dot.dot-expanded {
  transform: scale(1.4);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.7);
  background: #ef4444;
}

.marker-hovered .marker-dot {
  transform: scale(1.3);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.6);
  background: #ef4444;
}

.marker-active .marker-dot {
  transform: scale(1.5);
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.8);
  background: #f87171;
  border-color: #fbbf24;
}

.marker-pulse {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 20px;
  height: 20px;
  border: 2px solid #dc2626;
  border-radius: 50%;
  animation: pulse 2s infinite;
  opacity: 0.7;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.circuit-tooltip {
  position: absolute;
  z-index: 5;
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 12px;
  padding: 16px;
  min-width: 320px;
  max-width: 450px;
  width: max-content;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.tooltip-content {
  display: flex;
  gap: 12px;
}

.tooltip-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tooltip-info {
  flex: 1;
}

.tooltip-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
}

.tooltip-location {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.tooltip-length,
.tooltip-turns {
  margin: 0 0 2px 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.tooltip-country-background {
  margin-top: 12px;
  border-top: 1px solid rgba(220, 38, 38, 0.2);
  padding-top: 12px;
}

.country-background-image {
  width: 100%;
  height: 100px;
  object-fit: contain;
  object-position: center;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.9;
  background: rgba(0, 0, 0, 0.1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .world-map-container {
    height: 400px;
  }

  .country-background {
    width: 60px;
    height: 45px;
  }

  .tooltip-content {
    flex-direction: column;
    align-items: center;
  }

  .tooltip-image {
    width: 120px;
    height: 80px;
  }

  .circuit-tooltip {
    width: 280px;
  }

  .country-background-image {
    height: 80px;
  }
}
</style>
