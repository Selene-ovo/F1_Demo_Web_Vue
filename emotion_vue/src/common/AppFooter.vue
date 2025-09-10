<template>
  <footer class="musinsa-footer">
    <!-- 메인 푸터 -->
    <div class="footer-main">
      <div class="footer-container">
        <!-- 로고 & 소셜 -->
        <div class="footer-brand">
          <div class="brand-logo">
            <RouterLink to="/" class="logo">EMOLA</RouterLink>
          </div>
          <p class="brand-desc">Formula 1 Experience Platform</p>
          <div class="social-links">
            <a href="#" class="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
            </a>
            <a href="#" class="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                />
              </svg>
            </a>
            <a href="#" class="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- 링크 그룹들 -->
        <div class="footer-links">
          <div class="link-group">
            <h3 class="link-title">Experience</h3>
            <ul class="link-list">
              <li><RouterLink to="/#drivers">Drivers</RouterLink></li>
              <li><RouterLink to="/#teams">Teams</RouterLink></li>
              <li><RouterLink to="/#rules">Rules</RouterLink></li>
              <li><RouterLink to="/#records">Records</RouterLink></li>
              <li><RouterLink to="/#circuits">Circuits</RouterLink></li>
            </ul>
          </div>

          <div class="link-group">
            <h3 class="link-title">Partnership</h3>
            <ul class="link-list">
              <li><RouterLink to="/#with">Sponsors</RouterLink></li>
              <li><a href="#">Official Store</a></li>
              <li><a href="#">Merchandise</a></li>
              <li><a href="#">Tickets</a></li>
              <li><a href="#">Hospitality</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h3 class="link-title">Company</h3>
            <ul class="link-list">
              <li><a href="#">About EMOLA</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h3 class="link-title">Support</h3>
            <ul class="link-list">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Customer Service</a></li>
              <li><a href="#">Size Guide</a></li>
              <li><a href="#">Delivery Info</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>
        </div>

        <!-- 뉴스레터 -->
        <div class="newsletter-section">
          <h3 class="newsletter-title">Stay Updated</h3>
          <p class="newsletter-desc">최신 F1 소식과 독점 콘텐츠를 받아보세요</p>
          <form class="newsletter-form" @submit.prevent="subscribeNewsletter">
            <input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              v-model="email"
              class="newsletter-input"
            />
            <button type="submit" class="newsletter-btn">구독하기</button>
          </form>
        </div>
      </div>
    </div>

    <!-- 하단 푸터 -->
    <div class="footer-bottom">
      <div class="footer-container">
        <div class="bottom-left">
          <p class="copyright">© 2025 EMOLA. All rights reserved.</p>
          <div class="legal-links">
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
            <a href="#">쿠키정책</a>
          </div>
        </div>
        <div class="bottom-right">
          <div class="company-info">
            <span>사업자등록번호: 123-45-67890</span>
            <span>통신판매업신고: 2025-서울강남-1234</span>
          </div>
          <div class="payment-methods">
            <span class="payment-icon">💳</span>
            <span class="payment-icon">🏦</span>
            <span class="payment-icon">📱</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const email = ref('')

const subscribeNewsletter = () => {
  if (!email.value) return

  console.log('Newsletter subscription:', email.value)
  alert('뉴스레터 구독이 완료되었습니다!')
  email.value = ''
}
</script>

<style scoped>
.musinsa-footer {
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
  position: relative;
  z-index: 1000;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 메인 푸터 */
.footer-main {
  padding: 3rem 0;
}

.footer-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* 브랜드 섹션 */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.brand-logo .logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  letter-spacing: 2px;
}

.brand-desc {
  color: #888;
  font-size: 0.875rem;
  margin: 0;
}

.social-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #2a2a2a;
  border-radius: 50%;
  color: #888;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #333;
  color: #fff;
  transform: translateY(-2px);
}

.social-link svg {
  width: 16px;
  height: 16px;
}

/* 링크 그룹 */
.footer-links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.5px;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-list a {
  color: #888;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
  line-height: 1.4;
}

.link-list a:hover {
  color: #fff;
}

/* 뉴스레터 */
.newsletter-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.newsletter-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.5px;
}

.newsletter-desc {
  color: #888;
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.newsletter-input {
  padding: 0.75rem;
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
}

.newsletter-input:focus {
  outline: none;
  border-color: #555;
}

.newsletter-input::placeholder {
  color: #666;
}

.newsletter-btn {
  padding: 0.75rem 1rem;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.newsletter-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

/* 하단 푸터 */
.footer-bottom {
  padding: 1.5rem 0;
  border-top: 1px solid #2a2a2a;
  background: #111;
}

.footer-bottom .footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-template-columns: none;
  gap: 2rem;
}

.bottom-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.copyright {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

.legal-links {
  display: flex;
  gap: 1.5rem;
}

.legal-links a {
  color: #666;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s ease;
}

.legal-links a:hover {
  color: #999;
}

.bottom-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.company-info {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #666;
}

.payment-methods {
  display: flex;
  gap: 0.5rem;
  font-size: 1.25rem;
  opacity: 0.7;
}

/* 반응형 */
@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-bottom .footer-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .bottom-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .bottom-right {
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .footer-main {
    padding: 2rem 0;
  }

  .footer-container {
    padding: 0 1rem;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .company-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
