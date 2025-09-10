import { ref, onMounted, watchEffect } from 'vue'

export function useSEO() {
  const title = ref('')
  const description = ref('')
  const keywords = ref('')
  const ogImage = ref('')
  const ogUrl = ref('')

  // 기본 메타 태그 설정
  const defaultMeta = {
    title: 'Emola - 감정과 전략이 만나는 F1 트랙',
    description: 'EMOLA. AI 기반 드라이버 매칭, 실시간 통계, F1 뉴스와 커뮤니티를 만나보세요.',
    keywords: 'F1, 포뮬러원, Formula1, 드라이버, 레이싱, 자동차, 스포츠, AI추천, 통계, 뉴스',
    ogImage: '/images/og-image.jpg',
    ogUrl: window?.location?.href || 'https://emola.com',
  }

  // 메타 태그 업데이트
  const updateMeta = () => {
    // Title
    document.title = title.value || defaultMeta.title

    // Description
    updateMetaTag('description', description.value || defaultMeta.description)
    updateMetaTag('og:description', description.value || defaultMeta.description)
    updateMetaTag('twitter:description', description.value || defaultMeta.description)

    // Keywords
    updateMetaTag('keywords', keywords.value || defaultMeta.keywords)

    // Open Graph
    updateMetaTag('og:title', title.value || defaultMeta.title)
    updateMetaTag('og:image', ogImage.value || defaultMeta.ogImage)
    updateMetaTag('og:url', ogUrl.value || defaultMeta.ogUrl)
    updateMetaTag('og:type', 'website')
    updateMetaTag('og:site_name', 'Emola')

    // Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title.value || defaultMeta.title)
    updateMetaTag('twitter:image', ogImage.value || defaultMeta.ogImage)

    // 추가 F1 관련 메타태그
    updateMetaTag('theme-color', '#dc2626')
    updateMetaTag('msapplication-TileColor', '#dc2626')
  }

  // 메타 태그 업데이트 헬퍼
  const updateMetaTag = (name, content) => {
    if (!content) return

    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)

    if (!meta) {
      meta = document.createElement('meta')
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        meta.setAttribute('property', name)
      } else {
        meta.setAttribute('name', name)
      }
      document.head.appendChild(meta)
    }

    meta.setAttribute('content', content)
  }

  // 구조화된 데이터 추가
  const addStructuredData = (data) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  // F1 웹사이트 구조화 데이터
  const setF1StructuredData = () => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Emola',
      description: 'EMOLA',
      url: 'https://emola.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://emola.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Emola',
        logo: {
          '@type': 'ImageObject',
          url: 'https://emola.com/logo.png',
        },
      },
      sameAs: [
        'https://youtube.com/@emola',
        'https://instagram.com/emola',
        'https://twitter.com/emola',
      ],
    }

    addStructuredData(structuredData)
  }

  // 페이지별 SEO 설정
  const setSEO = (options = {}) => {
    title.value = options.title
    description.value = options.description
    keywords.value = options.keywords
    ogImage.value = options.ogImage
    ogUrl.value = options.ogUrl

    updateMeta()
  }

  // 반응형 메타 업데이트
  watchEffect(() => {
    updateMeta()
  })

  onMounted(() => {
    setF1StructuredData()
    updateMeta()
  })

  return {
    setSEO,
    title,
    description,
    keywords,
    ogImage,
    ogUrl,
  }
}