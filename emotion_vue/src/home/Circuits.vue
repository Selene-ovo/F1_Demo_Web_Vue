<template>
  <section id="circuits" class="circuits-section">
    <div class="section-container">
      <div class="section-header">
        <span class="section-number">07</span>
        <h2 class="section-title">Circuits</h2>
        <p class="section-subtitle">세계 각지의 F1 서킷을 인터랙티브 맵에서 확인하세요</p>
      </div>
      <div class="circuits-content">
        <InteractiveWorldMap />
      </div>
    </div>
  </section>
</template>

<script setup>
import InteractiveWorldMap from '@/home/InteractiveWorldMap.vue'
</script>

<style scoped>
.circuits-section {
  padding: 6rem 0;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 3rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-number {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  letter-spacing: 2px;
  display: block;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 300;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;
}

.circuits-content {
  margin-top: 3rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-container {
    padding: 4rem 1.5rem;
  }
}
</style>
