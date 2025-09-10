import { ref, onMounted, nextTick } from 'vue'

export function usePerformance() {
  const isLoading = ref(true)
  const loadTime = ref(0)
  const performanceMetrics = ref({})

  // Core Web Vitals 측정
  const measureWebVitals = () => {
    // Largest Contentful Paint (LCP)
    const measureLCP = () => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      })
    }

    // Cumulative Layout Shift (CLS)
    const measureCLS = () => {
      return new Promise((resolve) => {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          resolve(clsValue)
        })
        observer.observe({ entryTypes: ['layout-shift'] })
        
        // 5초 후 측정 완료
        setTimeout(() => resolve(clsValue), 5000)
      })
    }

    // Time to Interactive (TTI) 간단 측정
    const measureTTI = () => {
      return performance.now()
    }

    return {
      measureLCP,
      measureCLS,
      measureTTI
    }
  }

  // 이미지 지연 로딩
  const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    }, {
      rootMargin: '50px'
    })

    // lazy 클래스를 가진 모든 이미지 관찰
    const lazyImages = document.querySelectorAll('img[data-src]')
    lazyImages.forEach(img => imageObserver.observe(img))
  }

  // 초기화
  onMounted(async () => {
    await nextTick()
    
    lazyLoadImages()
    
    // 페이지 로드 완료 후 로딩 상태 해제
    setTimeout(() => {
      isLoading.value = false
    }, 1500)
  })

  return {
    isLoading,
    loadTime,
    performanceMetrics,
    lazyLoadImages
  }
}