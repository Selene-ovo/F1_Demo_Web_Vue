<template>
  <div class="rules-periodic-system">
    <!-- Matrix Background Effect -->
    <div class="matrix-background" :class="{ visible: hasStartedDragging }">
      <div 
        v-for="column in matrixColumns" 
        :key="column.id"
        class="matrix-column"
        :style="{
          left: column.left + '%',
          animationDelay: column.delay + 's',
          animationDuration: column.duration + 's'
        }"
      >
        <div 
          v-for="(char, index) in column.characters" 
          :key="index"
          class="matrix-char"
          :style="{
            animationDelay: (index * 0.1 + column.delay) + 's'
          }"
        >
          {{ char }}
        </div>
      </div>
    </div>
    
    <!-- DRAG Text Indicator (Intro) -->
    <div class="move-indicator" :class="{ hidden: hasStartedDragging }">
      <div class="move-text">DRAG</div>
    </div>

    <!-- 3D Container -->
    <div ref="containerRef" class="rules-container"></div>

    <!-- Controls -->
    <div class="controls-panel">
      <div class="section-title">F1 RULES</div>
      <div class="view-controls">
        <button 
          v-for="view in views" 
          :key="view.name"
          @click="transformTo(view.name)"
          :class="['view-btn', { active: currentView === view.name }]"
        >
          {{ view.name }}
        </button>
      </div>
      <div class="info-panel">
        <div class="rule-count">{{ rules.length }} Rules</div>
        <div class="selected-info" v-if="selectedRule">
          <h3>{{ selectedRule.name }}</h3>
          <p>{{ selectedRule.description }}</p>
          <div class="rule-details" v-if="expandedRule">
            <p class="details-text">{{ selectedRule.details }}</p>
            <div class="rule-meta">
              <span class="rule-id">#{{ selectedRule.id }}</span>
              <span class="rule-category-badge">{{ selectedRule.category }}</span>
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

const containerRef = ref(null)
const currentView = ref('TABLE')
const selectedRule = ref(null)
const expandedRule = ref(null)
const originalPosition = ref(null)
const originalRotation = ref(null)
const hasStartedDragging = ref(false)

// Matrix effect data
const matrixColumns = ref([])
const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~`'

// F1 카테고리별 분류 (밈, 용어, 경기, 안전, 기술, 전략)
const rules = ref([
  // 밈 (첫 번째 행)
  { 
    id: 1, 
    name: 'S🅱innala', 
    category: '밈', 
    description: '베텔 스핀 밈', 
    details: 'Sebastian Vettel spinning meme, originated from his Ferrari days when he spun frequently',
    period: 1, 
    group: 1, 
    color: '#ff6b35' 
  },
  { 
    id: 2, 
    name: 'Bono My Tires', 
    category: '밈', 
    description: '해밀턴 타이어 불평 밈', 
    details: 'Lewis Hamilton complaining about tire degradation to race engineer Bono, then setting fastest lap',
    period: 1, 
    group: 2, 
    color: '#ff6b35' 
  },
  { 
    id: 3, 
    name: 'Blue Flags', 
    category: '밈', 
    description: '베텔 분노 무전 밈', 
    details: 'Vettel angry radio: "Blue flags! Blue flags!" when stuck behind slower cars',
    period: 1, 
    group: 3, 
    color: '#ff6b35' 
  },
  { 
    id: 4, 
    name: 'Simply Lovely', 
    category: '밈', 
    description: '키미 무표정 반응', 
    details: 'Kimi Räikkönen deadpan response, became internet sensation',
    period: 1, 
    group: 13, 
    color: '#ff6b35' 
  },
  { 
    id: 5, 
    name: 'Plan B', 
    category: '밈', 
    description: '페라리 전략 실패', 
    details: 'Ferrari strategy failures, "We are checking" became a meme',
    period: 1, 
    group: 14, 
    color: '#ff6b35' 
  },
  { 
    id: 6, 
    name: 'El Plan', 
    category: '밈', 
    description: '알론소 마스터플랜 밈', 
    details: 'Fernando Alonso master plan meme, popular among fans',
    period: 1, 
    group: 15, 
    color: '#ff6b35' 
  },

  // 용어 (두 번째 행)
  { 
    id: 7, 
    name: 'DRS', 
    category: '용어', 
    description: 'Drag Reduction System', 
    details: 'Rear wing opens to reduce drag, available in designated zones when within 1s',
    period: 2, 
    group: 1, 
    color: '#06b6d4' 
  },
  { 
    id: 8, 
    name: 'ERS', 
    category: '용어', 
    description: 'Energy Recovery System', 
    details: 'Hybrid power unit: 160hp boost for 33.3s per lap from MGU-K and MGU-H',
    period: 2, 
    group: 2, 
    color: '#06b6d4' 
  },
  { 
    id: 9, 
    name: 'Porpoising', 
    category: '용어', 
    description: '2022년 바운싱 현상', 
    details: 'Aerodynamic bouncing effect with ground effect cars, major issue in 2022',
    period: 2, 
    group: 3, 
    color: '#06b6d4' 
  },
  { 
    id: 10, 
    name: 'Dirty Air', 
    category: '용어', 
    description: '난기류로 인한 다운포스 손실', 
    details: 'Turbulent air behind cars reduces downforce, makes overtaking difficult',
    period: 2, 
    group: 4, 
    color: '#06b6d4' 
  },
  { 
    id: 11, 
    name: 'Slipstream', 
    category: '용어', 
    description: '후류를 이용한 속도 증가', 
    details: 'Following closely behind reduces drag, increases top speed for overtaking',
    period: 2, 
    group: 13, 
    color: '#06b6d4' 
  },
  { 
    id: 12, 
    name: 'Undercut', 
    category: '용어', 
    description: '일찍 피트인으로 앞서기', 
    details: 'Early pit stop strategy to gain track position with fresher tires',
    period: 2, 
    group: 14, 
    color: '#06b6d4' 
  },
  { 
    id: 13, 
    name: 'Overcut', 
    category: '용어', 
    description: 'Late pit stop strategy', 
    details: 'Late pit stop strategy, staying out longer to gain advantage',
    period: 2, 
    group: 15, 
    color: '#06b6d4' 
  },
  { 
    id: 14, 
    name: 'Box Box', 
    category: '용어', 
    description: '피트인 신호', 
    details: 'Radio call for driver to enter pit lane for pit stop',
    period: 2, 
    group: 16, 
    color: '#06b6d4' 
  },

  // 경기 규칙 (세 번째 행)
  { 
    id: 15, 
    name: 'Qualifying', 
    category: '경기규칙', 
    description: '3단계 예선 시스템', 
    details: 'Q1: 20min (5 slowest eliminated), Q2: 15min (5 eliminated), Q3: 12min (top 10)', 
    period: 3, 
    group: 1, 
    color: '#2563eb' 
  },
  { 
    id: 16, 
    name: 'Points System', 
    category: '경기규칙', 
    description: '순위별 포인트 배점 시스템', 
    details: '25-18-15-12-10-8-6-4-2-1 points for positions 1-10. Fastest lap = +1 point if in top 10',
    period: 3, 
    group: 2, 
    color: '#2563eb' 
  },
  { 
    id: 17, 
    name: 'Sprint Race', 
    category: '경기규칙', 
    description: '토요일 짧은 경기 (약 100km)', 
    details: 'Short format race on Saturday, points awarded to top 8 finishers',
    period: 3, 
    group: 3, 
    color: '#2563eb' 
  },
  { 
    id: 18, 
    name: 'Parc Fermé', 
    category: '경기규칙', 
    description: '예선 후 차량 수정 금지', 
    details: 'Cars cannot be modified between qualifying and race, sealed in parc fermé',
    period: 3, 
    group: 13, 
    color: '#2563eb' 
  },

  // 안전 규칙 (네 번째 행)
  { 
    id: 19, 
    name: 'Yellow Flag', 
    category: '안전', 
    description: '위험 구간 주의, 추월 금지', 
    details: 'Caution: Incident ahead, no overtaking allowed, reduce speed', 
    period: 4, 
    group: 1, 
    color: '#f59e0b' 
  },
  { 
    id: 20, 
    name: 'Safety Car', 
    category: '안전', 
    description: '안전차 출동시 추월 금지', 
    details: 'Safety car deployed to control race pace during dangerous conditions', 
    period: 4, 
    group: 2, 
    color: '#f59e0b' 
  },
  { 
    id: 21, 
    name: 'Virtual SC', 
    category: '안전', 
    description: '가상 안전차로 속도 제한', 
    details: 'Virtual Safety Car: Delta time system limits speed without physical safety car', 
    period: 4, 
    group: 3, 
    color: '#f59e0b' 
  },
  { 
    id: 22, 
    name: 'Halo', 
    category: '안전', 
    description: '드라이버 머리 보호 장치', 
    details: 'Titanium head protection device, introduced in 2018 after controversy', 
    period: 4, 
    group: 13, 
    color: '#f59e0b' 
  },

  // 기술 규칙 (다섯 번째 행)
  { 
    id: 23, 
    name: 'Power Unit', 
    category: '기술', 
    description: '1.6L V6 터보 하이브리드', 
    details: '1.6L V6 turbo + MGU-K + MGU-H, maximum 15,000 RPM',
    period: 5, 
    group: 1, 
    color: '#10b981' 
  },
  { 
    id: 24, 
    name: 'Tire Compounds', 
    category: '기술', 
    description: '피렐리 타이어 컴파운드', 
    details: 'C1-C5 compounds, 3 compounds per weekend (Hard, Medium, Soft)',
    period: 5, 
    group: 2, 
    color: '#10b981' 
  },
  { 
    id: 25, 
    name: 'Weight Limit', 
    category: '기술', 
    description: '최소 중량 798kg', 
    details: 'Minimum weight 798kg including driver (2025), ballast used to reach minimum',
    period: 5, 
    group: 3, 
    color: '#10b981' 
  },
  { 
    id: 26, 
    name: 'Fuel Flow', 
    category: '기술', 
    description: '연료 흐름율 제한', 
    details: 'Maximum 100kg/h fuel flow rate, monitored by FIA sensors',
    period: 5, 
    group: 13, 
    color: '#10b981' 
  },

  // 트리비아 & 재미있는 사실 (여섯 번째 행)
  { 
    id: 27, 
    name: 'Watch Pose', 
    category: '트리비아', 
    description: '인터뷰 시 머리 만지는 이유', 
    details: 'Drivers touch their head/cap to show sponsor watches clearly during interviews',
    period: 6, 
    group: 1, 
    color: '#8b5cf6' 
  },
  { 
    id: 28, 
    name: 'Drink Button', 
    category: '트리비아', 
    description: '키미의 전설적인 무전', 
    details: 'Kimi: "No, you will not have the drink!" - steering wheel drink system failure',
    period: 6, 
    group: 2, 
    color: '#8b5cf6' 
  },
  { 
    id: 29, 
    name: 'Grid Walk', 
    category: '트리비아', 
    description: '마틴 브런들의 그리드 워크', 
    details: 'Martin Brundle awkwardly interviewing celebrities who don\'t know F1',
    period: 6, 
    group: 3, 
    color: '#8b5cf6' 
  },
  { 
    id: 30, 
    name: 'Pirelli Hat', 
    category: '트리비아', 
    description: '시상식 피렐리 모자 던지기', 
    details: 'Winners often throw away Pirelli hats immediately after receiving them',
    period: 6, 
    group: 13, 
    color: '#8b5cf6' 
  },
  { 
    id: 31, 
    name: 'Champagne Shower', 
    category: '트리비아', 
    description: '시상식 샴페인 세레모니', 
    details: 'Podium tradition since 1967, sometimes replaced with local beverages',
    period: 6, 
    group: 14, 
    color: '#8b5cf6' 
  },
  { 
    id: 32, 
    name: 'Formation Lap', 
    category: '트리비아', 
    description: '포메이션 랩의 숨겨진 이유', 
    details: 'Not just warmup - drivers collect rubber marbles to add weight and check rivals',
    period: 6, 
    group: 15, 
    color: '#8b5cf6' 
  },

  // 전략 & 심리전 (일곱 번째 행)
  { 
    id: 33, 
    name: 'Mind Games', 
    category: '심리전', 
    description: '드라이버간 심리전', 
    details: 'Psychological warfare: Senna vs Prost, Hamilton vs Rosberg era tactics',
    period: 7, 
    group: 1, 
    color: '#ec4899' 
  },
  { 
    id: 34, 
    name: 'Team Orders', 
    category: '심리전', 
    description: '팀 오더와 정치적 게임', 
    details: 'Internal team politics, "Fernando is faster than you" - Ferrari 2010',
    period: 7, 
    group: 2, 
    color: '#ec4899' 
  },
  { 
    id: 35, 
    name: 'Sandbagging', 
    category: '심리전', 
    description: '연습 세션에서 속력 숨기기', 
    details: 'Teams deliberately hide pace in practice to mislead rivals about performance',
    period: 7, 
    group: 3, 
    color: '#ec4899' 
  },
  { 
    id: 36, 
    name: 'Garage Secrets', 
    category: '심리전', 
    description: '가라지에서의 스파이 활동', 
    details: 'Teams use screens, fake setup sheets, and decoy mechanics to hide secrets',
    period: 7, 
    group: 13, 
    color: '#ec4899' 
  },
  { 
    id: 37, 
    name: 'Radio Theatre', 
    category: '심리전', 
    description: '가짜 무전으로 속임수', 
    details: 'Teams broadcast fake radio messages knowing rivals listen to manipulate strategy',
    period: 7, 
    group: 14, 
    color: '#ec4899' 
  },
  { 
    id: 38, 
    name: 'Luck Factor', 
    category: '심리전', 
    description: 'F1에서 운의 역할', 
    details: 'Weather, safety cars, mechanical failures can completely change championship fights',
    period: 7, 
    group: 15, 
    color: '#ec4899' 
  }
])

const views = ref([
  { name: 'TABLE', description: 'Periodic table layout' },
  { name: 'SPHERE', description: 'Spherical arrangement' },
  { name: 'HELIX', description: 'Helical structure' },
  { name: 'GRID', description: 'Grid formation' }
])

let scene, camera, renderer, controls
let objects = []
let targets = { table: [], sphere: [], helix: [], grid: [] }
let animationId

const initThreeJS = () => {
  const container = containerRef.value
  if (!container) return

  // Scene setup
  scene = new THREE.Scene()
  
  // Camera
  camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 1, 10000)
  camera.position.set(0, 0, 2500) // Closer initial position for better TABLE view

  // CSS3D Renderer
  renderer = new window.CSS3DRenderer()
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  // Create objects
  createObjects()
  
  // Create target positions
  createTargets()
  
  // Start with TABLE view and ensure initial positioning
  transformTo('TABLE')
  
  // Force initial camera position
  setTimeout(() => {
    camera.position.set(0, 0, 2500)
    camera.lookAt(scene.position)
  }, 100)
  
  // Add controls
  addControls()
  
  // Start animation
  animate()
  
  // Handle resize
  window.addEventListener('resize', onWindowResize)
  
  // Add click listener for closing expanded rule
  container.addEventListener('click', (event) => {
    if (!event.target.closest('.rule-element') && expandedRule.value) {
      closeExpandedRule()
    }
  })
}

const createObjects = () => {
  rules.value.forEach((rule, index) => {
    // Create DOM element
    const element = document.createElement('div')
    element.className = 'rule-element'
    element.innerHTML = `
      <div class="rule-number">${rule.id}</div>
      <div class="rule-name">${rule.name}</div>
      <div class="rule-category">${rule.category}</div>
    `
    // Remove background color, use CSS styling instead
    
    // Create CSS3D object first
    const object = new window.CSS3DObject(element)
    object.userData = { rule, index }
    object.element = element
    
    element.addEventListener('click', (event) => {
      event.stopPropagation()
      expandRule(rule, object)
    })
    
    scene.add(object)
    objects.push(object)
  })
}

const createTargets = () => {
  // TABLE layout (periodic table style)
  rules.value.forEach((rule, i) => {
    const object = new THREE.Object3D()
    object.position.x = (rule.group * 140) - 1330
    object.position.y = -(rule.period * 180) + 900
    object.position.z = 0
    targets.table.push(object)
  })

  // SPHERE layout
  const vector = new THREE.Vector3()
  rules.value.forEach((rule, i) => {
    const phi = Math.acos(-1 + (2 * i) / rules.value.length)
    const theta = Math.sqrt(rules.value.length * Math.PI) * phi
    
    const object = new THREE.Object3D()
    object.position.setFromSphericalCoords(800, phi, theta)
    
    vector.copy(object.position).multiplyScalar(2)
    object.lookAt(vector)
    targets.sphere.push(object)
  })

  // HELIX layout
  rules.value.forEach((rule, i) => {
    const theta = i * 0.175 + Math.PI
    const y = -(i * 8) + 450
    
    const object = new THREE.Object3D()
    object.position.setFromCylindricalCoords(900, theta, y)
    
    vector.x = object.position.x * 2
    vector.y = object.position.y
    vector.z = object.position.z * 2
    object.lookAt(vector)
    targets.helix.push(object)
  })

  // GRID layout
  rules.value.forEach((rule, i) => {
    const object = new THREE.Object3D()
    object.position.x = ((i % 5) * 400) - 800
    object.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800
    object.position.z = (Math.floor(i / 25)) * 800 - 1600 // Reduced Z distance to prevent appearing too large
    targets.grid.push(object)
  })
}

const transformTo = (viewName) => {
  // Close expanded rule when switching views
  if (expandedRule.value) {
    closeExpandedRule()
  }
  
  currentView.value = viewName
  const target = targets[viewName.toLowerCase()]
  
  // Smooth animation to new positions
  objects.forEach((object, i) => {
    // Ensure scale is always reset first
    object.scale.set(1, 1, 1)
    
    // Animate to new positions smoothly
    new window.TWEEN.Tween(object.position)
      .to({
        x: target[i].position.x,
        y: target[i].position.y,
        z: target[i].position.z
      }, Math.random() * 300 + 600) // Staggered animation times
      .easing(window.TWEEN.Easing.Cubic.InOut)
      .start()

    new window.TWEEN.Tween(object.rotation)
      .to({
        x: target[i].rotation.x,
        y: target[i].rotation.y,
        z: target[i].rotation.z
      }, Math.random() * 300 + 600)
      .easing(window.TWEEN.Easing.Cubic.InOut)
      .start()
  })
}

const addControls = () => {
  // Smooth 360 rotation controls with zoom
  let isMouseDown = false
  let targetRotationX = 0, targetRotationY = 0
  let rotationX = 0, rotationY = 0
  let targetRadius = 2500, currentRadius = 2500
  let isCtrlPressed = false

  const container = containerRef.value
  
  container.addEventListener('mousedown', (event) => {
    isMouseDown = true
    container.style.cursor = 'grabbing'
  })
  
  container.addEventListener('mouseup', () => {
    isMouseDown = false
    container.style.cursor = 'grab'
  })
  
  container.addEventListener('mouseleave', () => {
    isMouseDown = false
    container.style.cursor = 'grab'
  })
  
  container.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
      // Once user starts dragging, permanently activate the interface
      hasStartedDragging.value = true
      console.log('Dragging started:', hasStartedDragging.value) // Debug
      console.log('Matrix columns count:', matrixColumns.value.length) // Debug
      
      const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
      const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0
      
      // Smoother rotation with better sensitivity
      targetRotationY += deltaX * 0.008
      targetRotationX += deltaY * 0.008
      
      // Limit vertical rotation for better UX
      targetRotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, targetRotationX))
    }
  })
  
  // Track Ctrl key state
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Control') {
      isCtrlPressed = true
    }
  })

  window.addEventListener('keyup', (event) => {
    if (event.key === 'Control') {
      isCtrlPressed = false
    }
  })

  // Add mouse wheel zoom functionality (only with Ctrl key)
  container.addEventListener('wheel', (event) => {
    if (event.ctrlKey || isCtrlPressed) {
      event.preventDefault()

      const zoomSpeed = 100
      const minRadius = 500
      const maxRadius = 5000

      if (event.deltaY > 0) {
        // Zoom out
        targetRadius = Math.min(targetRadius + zoomSpeed, maxRadius)
      } else {
        // Zoom in
        targetRadius = Math.max(targetRadius - zoomSpeed, minRadius)
      }

      // Stabilize rotation during zoom without changing current values
      // Only prevent extreme movements, don't force position changes
    }
  }, { passive: false })
  
  container.style.cursor = 'grab'
  
  const render = () => {
    // Very smooth rotation and zoom interpolation
    rotationX += (targetRotationX - rotationX) * 0.08
    rotationY += (targetRotationY - rotationY) * 0.08
    currentRadius += (targetRadius - currentRadius) * 0.1

    // Always use orbital camera with dynamic zoom
    camera.position.x = Math.cos(rotationY) * Math.cos(rotationX) * currentRadius
    camera.position.y = Math.sin(rotationX) * currentRadius
    camera.position.z = Math.sin(rotationY) * Math.cos(rotationX) * currentRadius
    
    camera.lookAt(scene.position)
    
    // Update expanded card position if exists
    if (expandedRule.value) {
      const expandedObject = objects.find(obj => obj.userData.rule === expandedRule.value)
      if (expandedObject) {
        const cameraDirection = new THREE.Vector3()
        camera.getWorldDirection(cameraDirection)
        
        const distanceFromCamera = 1000
        const newTargetPosition = new THREE.Vector3()
        newTargetPosition.copy(camera.position).add(cameraDirection.multiplyScalar(distanceFromCamera))

        // Offset upward to avoid UI panel overlap
        newTargetPosition.y += 100
        
        // Smoothly update expanded card position
        expandedObject.position.lerp(newTargetPosition, 0.1)
        
        // Make card always face camera
        const lookAtQuaternion = new THREE.Quaternion()
        const tempMatrix = new THREE.Matrix4()
        tempMatrix.lookAt(expandedObject.position, camera.position, camera.up)
        lookAtQuaternion.setFromRotationMatrix(tempMatrix)
        
        // Add 180 degree flip to show back side
        const flipQuaternion = new THREE.Quaternion()
        flipQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
        lookAtQuaternion.multiply(flipQuaternion)
        
        expandedObject.quaternion.slerp(lookAtQuaternion, 0.1)
      }
    }
  }
  
  scene.userData.render = render
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  window.TWEEN.update()
  
  if (scene.userData.render) {
    scene.userData.render()
  }
  
  renderer.render(scene, camera)
}

const onWindowResize = () => {
  const container = containerRef.value
  if (!container) return
  
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.clientWidth, container.clientHeight)
}

const generateMatrixColumns = () => {
  const columns = []
  const columnCount = 12 // Reduced number of columns
  
  for (let i = 0; i < columnCount; i++) {
    const characters = []
    const charCount = Math.floor(Math.random() * 25) + 20 // Shorter columns
    
    for (let j = 0; j < charCount; j++) {
      characters.push(matrixChars[Math.floor(Math.random() * matrixChars.length)])
    }
    
    columns.push({
      id: i,
      left: i * (100 / columnCount) + Math.random() * 3, // Better spacing
      characters,
      delay: i * 0.8, // Staggered start for smooth continuous effect
      duration: 8 + Math.random() * 2 // More consistent timing
    })
  }
  
  matrixColumns.value = columns
}

onMounted(async () => {
  try {
    // Pre-generate matrix effect immediately
    generateMatrixColumns()
    
    // Pre-warm the matrix animations
    setTimeout(() => {
      // Force a small animation frame to pre-load GPU resources
      const matrixBg = document.querySelector('.matrix-background')
      if (matrixBg) {
        matrixBg.style.opacity = '0.01'
        setTimeout(() => {
          matrixBg.style.opacity = '0'
        }, 10)
      }
    }, 100)
    
    // More optimized character changing
    setInterval(() => {
      // Only update some characters to reduce load
      const columnsToUpdate = Math.floor(matrixColumns.value.length / 3) // Update 1/3 at a time
      for (let i = 0; i < columnsToUpdate; i++) {
        const randomColumnIndex = Math.floor(Math.random() * matrixColumns.value.length)
        const column = matrixColumns.value[randomColumnIndex]
        
        // Only update some characters in each column
        const charsToUpdate = Math.floor(column.characters.length / 4)
        for (let j = 0; j < charsToUpdate; j++) {
          const randomCharIndex = Math.floor(Math.random() * column.characters.length)
          column.characters[randomCharIndex] = matrixChars[Math.floor(Math.random() * matrixChars.length)]
        }
      }
    }, 300) // Slower update for better performance
    
    // Less frequent column regeneration
    setInterval(() => {
      const columnsToUpdate = Math.floor(Math.random() * 4) + 2 // Fewer columns
      for (let i = 0; i < columnsToUpdate; i++) {
        const randomIndex = Math.floor(Math.random() * matrixColumns.value.length)
        const characters = []
        const charCount = Math.floor(Math.random() * 30) + 20 // Shorter for performance
        
        for (let j = 0; j < charCount; j++) {
          characters.push(matrixChars[Math.floor(Math.random() * matrixChars.length)])
        }
        
        matrixColumns.value[randomIndex].characters = characters
        matrixColumns.value[randomIndex].delay = Math.random() * 5
        matrixColumns.value[randomIndex].duration = Math.random() * 4 + 8
      }
    }, 4000) // Less frequent updates
    
    // Load CSS3DRenderer and CSS3DObject
    const { CSS3DRenderer, CSS3DObject } = await import('three/examples/jsm/renderers/CSS3DRenderer.js')
    
    // Load TWEEN
    const TWEEN = await import('three/examples/jsm/libs/tween.module.js')
    
    // Assign to global scope for component use
    window.CSS3DRenderer = CSS3DRenderer
    window.CSS3DObject = CSS3DObject
    window.TWEEN = TWEEN.default
    
    initThreeJS()
  } catch (error) {
    console.error('Failed to load Three.js dependencies:', error)
  }
})

const expandRule = (rule, object) => {
  if (expandedRule.value === rule) return
  
  // Close any currently expanded rule first
  if (expandedRule.value) {
    closeExpandedRule()
  }
  
  expandedRule.value = rule
  selectedRule.value = rule
  
  // Store original position, rotation, and scale
  originalPosition.value = {
    x: object.position.x,
    y: object.position.y,
    z: object.position.z
  }
  originalRotation.value = {
    x: object.rotation.x,
    y: object.rotation.y,
    z: object.rotation.z
  }
  
  // Create detailed content for the back side
  const detailElement = document.createElement('div')
  detailElement.className = 'rule-element-detail'
  detailElement.innerHTML = `
    <div class="detail-header">
      <div class="detail-number">#${rule.id}</div>
      <div class="detail-category">${rule.category}</div>
    </div>
    <div class="detail-name">${rule.name}</div>
    <div class="detail-description">${rule.description}</div>
    <div class="detail-info">${rule.details}</div>
  `
  
  // Replace the element content after flip animation starts
  setTimeout(() => {
    object.element.innerHTML = detailElement.innerHTML
    object.element.className = 'rule-element-detail'
    
    // Add click event to close when clicked
    object.element.addEventListener('click', (event) => {
      event.stopPropagation()
      closeExpandedRule()
    })
  }, 400) // Half way through the flip animation
  
  // Calculate position in front of camera regardless of camera angle
  const cameraDirection = new THREE.Vector3()
  camera.getWorldDirection(cameraDirection)
  
  const distanceFromCamera = 1000 // Much closer for better visibility
  const targetPosition = new THREE.Vector3()
  targetPosition.copy(camera.position).add(cameraDirection.multiplyScalar(distanceFromCamera))

  // Offset upward to avoid UI panel overlap
  targetPosition.y += 100
  
  // Animate to position in front of camera with flip and larger scale
  new window.TWEEN.Tween(object.position)
    .to({ 
      x: targetPosition.x, 
      y: targetPosition.y, 
      z: targetPosition.z 
    }, 800)
    .easing(window.TWEEN.Easing.Back.Out)
    .start()
    
  // Make card face the camera
  const lookAtQuaternion = new THREE.Quaternion()
  const tempMatrix = new THREE.Matrix4()
  tempMatrix.lookAt(targetPosition, camera.position, camera.up)
  lookAtQuaternion.setFromRotationMatrix(tempMatrix)
  
  // Add 180 degree flip to show back side
  const flipQuaternion = new THREE.Quaternion()
  flipQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
  lookAtQuaternion.multiply(flipQuaternion)
  
  const targetEuler = new THREE.Euler()
  targetEuler.setFromQuaternion(lookAtQuaternion)
  
  new window.TWEEN.Tween(object.rotation)
    .to({ 
      x: targetEuler.x, 
      y: targetEuler.y, 
      z: targetEuler.z 
    }, 800)
    .easing(window.TWEEN.Easing.Back.Out)
    .start()
    
  new window.TWEEN.Tween(object.scale)
    .to({ x: 1.8, y: 1.8, z: 1.8 }, 800)
    .easing(window.TWEEN.Easing.Back.Out)
    .start()
}

const closeExpandedRule = () => {
  if (!expandedRule.value) return
  
  const expandedObject = objects.find(obj => obj.userData.rule === expandedRule.value)
  if (!expandedObject) return
  
  const rule = expandedRule.value
  
  // Clear current state first
  expandedRule.value = null
  selectedRule.value = null
  
  // Restore original content after half flip
  setTimeout(() => {
    expandedObject.element.innerHTML = `
      <div class="rule-number">${rule.id}</div>
      <div class="rule-name">${rule.name}</div>
      <div class="rule-category">${rule.category}</div>
    `
    expandedObject.element.className = 'rule-element'
    
    // Re-add original click event
    expandedObject.element.addEventListener('click', (event) => {
      event.stopPropagation()
      expandRule(rule, expandedObject)
    })
  }, 300)
  
  // Animate back to original position with flip back
  new window.TWEEN.Tween(expandedObject.position)
    .to(originalPosition.value, 600)
    .easing(window.TWEEN.Easing.Back.In)
    .start()
    
  new window.TWEEN.Tween(expandedObject.rotation)
    .to(originalRotation.value, 600) // Flip back to original rotation
    .easing(window.TWEEN.Easing.Back.In)
    .start()
    
  new window.TWEEN.Tween(expandedObject.scale)
    .to({ x: 1, y: 1, z: 1 }, 600)
    .easing(window.TWEEN.Easing.Back.In)
    .start()
  
  originalPosition.value = null
  originalRotation.value = null
}

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style scoped>
.rules-periodic-system {
  width: 100%;
  height: 150vh;
  position: relative;
  background: linear-gradient(135deg, #000000, #0a0a0a, #111111);
  overflow: hidden;
}

.matrix-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  transform: translateZ(0);
  will-change: opacity;
}

.matrix-background.visible {
  opacity: 1 !important;
  background: rgba(0, 0, 0, 0.1); /* Debug visibility */
}

.matrix-column {
  position: absolute;
  top: 110vh; /* Start slightly below screen */
  width: 20px;
  height: 120vh; /* Longer columns for overlap */
  animation: matrixRise infinite linear;
  opacity: 0.8;
  transform: translateZ(0);
  will-change: transform;
}

.matrix-char {
  display: block;
  color: #888888;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  line-height: 18px;
  text-shadow: 0 0 8px rgba(200, 200, 200, 0.4);
  animation: matrixGlow 2s infinite alternate;
  margin-bottom: 2px;
  transform: translateZ(0); /* Hardware acceleration */
  will-change: opacity, color;
}

@keyframes matrixRise {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-230vh); /* Move further to ensure complete pass */
  }
}

@keyframes matrixGlow {
  0% {
    opacity: 0.2;
    color: #666666;
    text-shadow: 0 0 5px rgba(150, 150, 150, 0.2);
  }
  50% {
    opacity: 0.8;
    color: #bbbbbb;
    text-shadow: 0 0 12px rgba(200, 200, 200, 0.6), 0 0 25px rgba(220, 220, 220, 0.3);
  }
  100% {
    opacity: 0.2;
    color: #666666;
    text-shadow: 0 0 5px rgba(150, 150, 150, 0.2);
  }
}

.controls-panel {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  color: white;
  background: rgba(20, 20, 20, 0.9);
  padding: 20px 32px;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(150, 150, 150, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-width: 500px;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: white;
  text-align: center;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}


.view-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.view-btn {
  background: linear-gradient(135deg, 
    rgba(60, 60, 60, 0.6) 0%,
    rgba(80, 80, 80, 0.7) 100%);
  border: 1px solid rgba(150, 150, 150, 0.3);
  color: rgba(220, 220, 220, 0.95);
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  min-width: 80px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.view-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left 0.7s ease;
}

.view-btn:hover::before {
  left: 100%;
}

.view-btn:hover {
  border-color: rgba(200, 200, 200, 0.5);
  color: white;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 
    0 12px 28px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 0 20px rgba(200, 200, 200, 0.3);
  background: linear-gradient(135deg, 
    rgba(80, 80, 80, 0.7) 0%,
    rgba(100, 100, 100, 0.8) 100%);
}

.view-btn.active {
  background: linear-gradient(135deg, 
    rgba(120, 120, 120, 0.8) 0%,
    rgba(150, 150, 150, 0.9) 100%);
  border-color: rgba(200, 200, 200, 0.6);
  color: white;
  font-weight: 700;
  transform: scale(1.06);
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.5),
    inset 0 2px 0 rgba(255, 255, 255, 0.2),
    0 0 25px rgba(200, 200, 200, 0.5);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.info-panel {
  border-top: 1px solid rgba(150, 150, 150, 0.3);
  padding-top: 1.5rem;
  text-align: center;
}

.rule-count {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.selected-info {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.selected-info h3 {
  font-size: 1.2rem;
  color: #00d4ff;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.selected-info p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  max-width: 350px;
  margin: 0 auto;
}

.rule-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(150, 150, 150, 0.3);
}

.details-text {
  font-size: 0.85rem !important;
  color: rgba(255, 255, 255, 0.9) !important;
  line-height: 1.6 !important;
  margin-bottom: 1rem !important;
  font-style: italic;
}

.rule-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.rule-id {
  font-size: 0.75rem;
  color: rgba(0, 212, 255, 0.8);
  font-weight: 600;
  background: rgba(0, 212, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.rule-category-badge {
  font-size: 0.7rem;
  color: white;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 255, 255, 0.2));
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(0, 212, 255, 0.4);
}

.rules-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 100;
}

/* DRAG Text Indicator */
.move-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 150;
  pointer-events: none;
  transition: opacity 0.8s ease;
  opacity: 1;
}

.move-indicator.hidden {
  opacity: 0;
}

.move-text {
  font-size: 2.5rem;
  font-weight: 300;
  color: rgba(150, 150, 150, 0.6);
  text-shadow: 0 0 20px rgba(150, 150, 150, 0.3);
  letter-spacing: 0.5em;
  font-family: 'SF Pro Display', -apple-system, system-ui, sans-serif;
  animation: dragGlow 3s infinite ease-in-out;
}

@keyframes dragGlow {
  0%, 100% {
    color: rgba(150, 150, 150, 0.6);
    text-shadow: 0 0 20px rgba(150, 150, 150, 0.3);
  }
  50% {
    color: rgba(180, 180, 180, 0.8);
    text-shadow: 0 0 30px rgba(180, 180, 180, 0.5);
  }
}

/* Rule Element Styles - Subtle Gray Design */
:global(.rule-element) {
  width: 120px;
  height: 120px;
  opacity: 0.9;
  border: 1px solid rgba(150, 150, 150, 0.2);
  border-radius: 12px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: rgba(60, 60, 60, 0.7);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  font-family: 'SF Pro Display', -apple-system, system-ui, sans-serif;
  position: relative;
}

:global(.rule-element:hover) {
  opacity: 1;
  transform: scale(1.08) translateY(-8px);
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 0 30px rgba(200, 200, 200, 0.4),
    0 0 0 2px rgba(200, 200, 200, 0.3);
  border-color: rgba(200, 200, 200, 0.7);
  background: rgba(90, 90, 90, 0.9);
  z-index: 1000;
  animation: cardGlow 1.5s infinite alternate;
}

@keyframes cardGlow {
  0% {
    box-shadow: 
      0 15px 40px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      0 0 30px rgba(200, 200, 200, 0.4),
      0 0 0 2px rgba(200, 200, 200, 0.3);
  }
  100% {
    box-shadow: 
      0 15px 40px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      0 0 35px rgba(255, 255, 255, 0.5),
      0 0 0 2px rgba(255, 255, 255, 0.5);
  }
}

:global(.rule-number) {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.7;
  color: rgba(200, 200, 200, 0.8);
  margin-bottom: 4px;
  text-shadow: 0 0 8px rgba(200, 200, 200, 0.3);
}

:global(.rule-name) {
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.2;
  color: white;
  margin-bottom: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 1;
}

:global(.rule-category) {
  font-size: 0.7rem;
  text-transform: uppercase;
  opacity: 0.8;
  letter-spacing: 0.5px;
  color: rgba(180, 180, 180, 0.9);
  font-weight: 500;
  background: rgba(100, 100, 100, 0.3);
  padding: 2px 8px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

/* Detailed card back styles */
:global(.rule-element-detail) {
  width: 120px;
  height: 120px;
  opacity: 1;
  border: 1px solid rgba(200, 200, 200, 0.4);
  border-radius: 12px;
  padding: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 30px rgba(200, 200, 200, 0.4);
  backdrop-filter: blur(15px);
  font-family: 'SF Pro Display', -apple-system, system-ui, sans-serif;
  position: relative;
  transform: rotateY(180deg); /* Ensure text is readable when flipped */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

:global(.detail-header) {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
  font-size: 0.65rem;
}

:global(.detail-number) {
  color: rgba(200, 200, 200, 0.7);
  font-weight: 600;
}

:global(.detail-category) {
  color: rgba(180, 180, 180, 0.8);
  text-transform: uppercase;
  background: rgba(100, 100, 100, 0.3);
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.6rem;
}

:global(.detail-name) {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
  line-height: 1.1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  -webkit-font-smoothing: antialiased;
}

:global(.detail-description) {
  font-size: 0.7rem;
  margin-bottom: 6px;
  color: rgba(240, 240, 240, 0.95);
  line-height: 1.2;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  -webkit-font-smoothing: antialiased;
}

:global(.detail-info) {
  font-size: 0.65rem;
  color: rgba(220, 220, 220, 0.9);
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  font-style: italic;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  -webkit-font-smoothing: antialiased;
}

:global(.rule-expanded) {
  transform: scale(2) !important;
  z-index: 2000 !important;
  box-shadow: 
    0 20px 60px rgba(0, 212, 255, 0.6),
    inset 0 2px 0 rgba(255, 255, 255, 0.2),
    0 0 50px rgba(0, 255, 255, 0.8) !important;
  border: 2px solid rgba(0, 255, 255, 0.9) !important;
}

:global(.rule-expanded .rule-name) {
  font-size: 1.1rem !important;
  margin-bottom: 12px !important;
}

:global(.rule-expanded .rule-category) {
  font-size: 0.7rem !important;
  padding: 4px 12px !important;
}

:global(.rule-expanded .rule-number) {
  font-size: 0.8rem !important;
  margin-bottom: 8px !important;
}
</style>