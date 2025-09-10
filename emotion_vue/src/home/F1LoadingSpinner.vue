<template>
  <div class="f1-spinner" :class="{ 'large': size === 'large', 'small': size === 'small' }">
    <!-- 외부 트랙 -->
    <div class="track-outer">
      <div class="track-line"></div>
      <div class="track-line track-line-2"></div>
    </div>
    
    <!-- F1 자동차 아이콘 -->
    <div class="f1-car">
      <div class="car-body">🏎️</div>
      <div class="speed-lines">
        <div class="speed-line" v-for="n in 3" :key="n" :style="{ animationDelay: `${n * 0.1}s` }"></div>
      </div>
    </div>
    
    <!-- 내부 원 -->
    <div class="inner-circle">
      <div class="logo-mini">
        <span class="text-f1-red font-racing">E1A</span>
      </div>
    </div>
    
    <!-- 진행률 표시 (선택사항) -->
    <div v-if="showProgress" class="progress-text">
      {{ progress }}%
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  color: {
    type: String,
    default: '#dc2626'
  }
})

const spinnerSize = computed(() => {
  switch (props.size) {
    case 'small': return '40px'
    case 'large': return '120px'
    default: return '80px'
  }
})
</script>

<style scoped>
.f1-spinner {
  @apply relative inline-flex items-center justify-center;
  width: v-bind(spinnerSize);
  height: v-bind(spinnerSize);
}

.f1-spinner.small {
  width: 40px;
  height: 40px;
}

.f1-spinner.large {
  width: 120px;
  height: 120px;
}

/* 외부 트랙 */
.track-outer {
  @apply absolute inset-0 rounded-full;
  border: 2px solid rgba(220, 38, 38, 0.2);
  animation: rotate 2s linear infinite;
}

.track-line {
  @apply absolute inset-0 rounded-full;
  border: 2px solid transparent;
  border-top-color: #dc2626;
  border-right-color: #dc2626;
  animation: rotate 1.5s linear infinite;
}

.track-line-2 {
  border-top-color: #fbbf24;
  border-right-color: #fbbf24;
  animation: rotate 1s linear infinite reverse;
  transform: scale(0.8);
}

/* F1 자동차 */
.f1-car {
  @apply absolute z-10;
  animation: race 2s linear infinite;
  transform-origin: center;
}

.car-body {
  @apply text-lg;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: bounce 0.5s ease-in-out infinite alternate;
}

.f1-spinner.small .car-body {
  @apply text-sm;
}

.f1-spinner.large .car-body {
  @apply text-2xl;
}

/* 속도선 효과 */
.speed-lines {
  @apply absolute top-1/2 right-full;
  transform: translateY(-50%);
}

.speed-line {
  @apply absolute h-0.5 bg-f1-red;
  width: 8px;
  opacity: 0;
  animation: speedLine 0.8s ease-out infinite;
}

.speed-line:nth-child(1) { top: -2px; }
.speed-line:nth-child(2) { top: 0px; }
.speed-line:nth-child(3) { top: 2px; }

/* 내부 원 */
.inner-circle {
  @apply absolute inset-2 rounded-full bg-f1-surface border border-gray-700;
  @apply flex items-center justify-center;
  animation: rotate 3s linear infinite reverse;
}

.logo-mini {
  @apply text-xs font-bold;
  animation: counter-rotate 3s linear infinite;
}

.f1-spinner.large .logo-mini {
  @apply text-sm;
}

/* 진행률 텍스트 */
.progress-text {
  @apply absolute -bottom-8 left-1/2 transform -translate-x-1/2;
  @apply text-sm font-semibold text-f1-red;
}

/* 애니메이션 정의 */
@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes race {
  0% { transform: rotate(0deg) translateX(25px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(25px) rotate(-360deg); }
}

@keyframes counter-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}

@keyframes bounce {
  0% { transform: translateY(0px) scale(1); }
  100% { transform: translateY(-2px) scale(1.1); }
}

@keyframes speedLine {
  0% { 
    opacity: 1; 
    transform: translateX(0px) scaleX(1); 
  }
  100% { 
    opacity: 0; 
    transform: translateX(-15px) scaleX(0.5); 
  }
}

/* 반응형 조정 */
@media (max-width: 640px) {
  .f1-spinner {
    width: 60px;
    height: 60px;
  }
  
  .f1-spinner.large {
    width: 80px;
    height: 80px;
  }
  
  .car-body {
    @apply text-base;
  }
}
</style>