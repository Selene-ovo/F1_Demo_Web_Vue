<template>
  <header class="emola-header" :class="{ 'header-scrolled': isScrolled }">
    <!-- Header Background Blur -->
    <div class="header-bg"></div>
    
    <!-- Main Header Content -->
    <div class="header-content">
      <!-- Logo -->
      <div class="header-logo">
        <RouterLink to="/" class="logo-link">
          EMOLA
        </RouterLink>
      </div>

      <!-- Actions -->
      <div class="header-actions">
        <button 
          class="contact-btn"
          @click="scrollToContact"
        >
          <span>LET'S TALK</span>
          <div class="btn-bg"></div>
        </button>
        
        <button 
          class="menu-btn"
          @click="toggleMenu"
          :class="{ active: isMenuOpen }"
        >
          <span class="menu-text">MENU</span>
          <div class="menu-icon">
            <span class="menu-line"></span>
            <span class="menu-line"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Full Screen Menu Overlay -->
    <Transition name="menu">
      <div v-if="isMenuOpen" class="menu-overlay" @click="closeMenu">
        <nav class="main-nav" @click.stop>
          <!-- Close Button -->
          <div class="nav-header">
            <button class="close-btn" @click="closeMenu">
              <span class="close-text">CLOSE</span>
              <div class="close-icon">×</div>
            </button>
          </div>
          
          <!-- Navigation Menu -->
          <ul class="nav-menu">
            <li 
              class="nav-item" 
              v-for="(item, index) in navigation" 
              :key="item.name"
              :style="{ '--delay': `${index * 0.1}s` }"
            >
              <RouterLink :to="item.path" class="nav-link" @click="closeMenu">
                <span class="nav-number">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="nav-text">{{ item.name }}</span>
                <span class="nav-dot">•</span>
              </RouterLink>
            </li>
          </ul>

          <!-- Newsletter Section -->
          <div class="menu-newsletter">
            <h3>Subscribe to our newsletter</h3>
            <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
              <input 
                type="email" 
                placeholder="Your email" 
                v-model="email"
                class="newsletter-input"
              >
              <button type="submit" class="newsletter-btn">
                <span>→</span>
              </button>
            </form>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const isScrolled = ref(false)
const isMenuOpen = ref(false)
const email = ref('')

const navigation = [
  { name: 'HOME', path: '/' },
  { name: 'DRIVERS', path: '/#drivers' },
  { name: 'TEAMS', path: '/#teams' },
  { name: 'RULES', path: '/#rules' },
  { name: 'RECORDS', path: '/#records' },
  { name: 'WITH', path: '/#with' },
  { name: 'ABOUT', path: '/#about' }
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  // Body scroll lock
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
  document.body.style.overflow = 'auto'
}

const scrollToContact = () => {
  console.log('scrollToContact called')
  
  // 여러 방법으로 footer 찾기 시도
  const footer = document.querySelector('.emola-footer') || 
                 document.querySelector('footer') ||
                 document.querySelector('[class*="footer"]')
  
  console.log('Found footer:', footer)
  
  if (footer) {
    console.log('Scrolling to footer')
    footer.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    console.log('Footer not found, scrolling to bottom')
    // fallback: scroll to bottom
    window.scrollTo({ 
      top: document.documentElement.scrollHeight || document.body.scrollHeight, 
      behavior: 'smooth' 
    })
  }
}


const subscribeNewsletter = () => {
  if (!email.value) return
  
  // 실제로는 API 호출
  console.log('Newsletter subscription:', email.value)
  alert('뉴스레터 구독이 완료되었습니다!')
  email.value = ''
  closeMenu()
}

// Scroll handler
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// ESC key handler
const handleKeydown = (event) => {
  if (event.key === 'Escape' && isMenuOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
/* Emola Header - Lusion Style */
.emola-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 1.5rem 0;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.emola-header.header-scrolled .header-bg {
  opacity: 1;
}

.emola-header.header-scrolled {
  padding: 1rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
  position: relative;
  z-index: 10;
}

/* Logo */
.header-logo {
  z-index: 10;
}

.logo-link {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo-link:hover {
  color: #ffffff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 10;
}

/* Contact Button */
.contact-btn {
  position: relative;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.contact-btn .btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: -1;
}

.contact-btn:hover .btn-bg {
  transform: translateY(0);
}

.contact-btn:hover {
  color: #000000;
  border-color: #ffffff;
}

/* Menu Button */
.menu-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 0;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.menu-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.menu-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-line {
  width: 24px;
  height: 1px;
  background: #ffffff;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.menu-line:last-child {
  width: 16px;
  margin-left: auto;
}

.menu-btn.active .menu-line:first-child {
  transform: rotate(45deg) translate(3px, 3px);
  width: 20px;
}

.menu-btn.active .menu-line:last-child {
  transform: rotate(-45deg) translate(3px, -3px);
  width: 20px;
  margin-left: 0;
}

.menu-btn:hover .menu-text {
  color: rgba(255, 255, 255, 1);
}

/* Full Screen Menu Overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.98);
  backdrop-filter: blur(30px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-nav {
  position: relative;
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  text-align: center;
}

/* Close Button */
.nav-header {
  position: absolute;
  top: 2.5rem;
  right: 3rem;
  z-index: 10;
}

.close-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  letter-spacing: 2px;
  transition: all 0.3s ease;
}

.close-icon {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.close-btn:hover .close-text,
.close-btn:hover .close-icon {
  color: rgba(255, 255, 255, 1);
}

/* Navigation Menu */
.nav-menu {
  list-style: none;
  padding: 0;
  margin: 4rem 0;
}

.nav-item {
  opacity: 0;
  transform: translateY(30px);
  animation: slideInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: var(--delay);
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.nav-link:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(10px);
}

.nav-number {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  min-width: 40px;
  text-align: left;
}

.nav-text {
  font-size: 1.5rem;
  font-weight: 600;
  flex: 1;
  text-align: center;
  letter-spacing: 2px;
}

.nav-dot {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
  min-width: 40px;
  text-align: right;
}

/* Newsletter Section */
.menu-newsletter {
  margin-top: 4rem;
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  animation: fadeIn 0.6s ease forwards;
  animation-delay: 1.2s;
}

.menu-newsletter h3 {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  font-weight: 400;
  letter-spacing: 1px;
}

.newsletter-form {
  display: flex;
  gap: 0;
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.newsletter-input {
  flex: 1;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.875rem;
  outline: none;
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.newsletter-btn {
  padding: 1rem 1.5rem;
  background: #ffffff;
  border: none;
  color: #000000;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.newsletter-btn:hover {
  background: rgba(255, 255, 255, 0.9);
}

/* Menu Transitions */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.menu-enter-from .main-nav,
.menu-leave-to .main-nav {
  transform: translateY(50px);
  opacity: 0;
}

/* Animations */
@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Laptop/small desktop screens */
@media (max-width: 1024px) {
  .nav-header {
    top: 2rem;
    right: 2rem;
  }
  
  .close-btn {
    background: rgba(0, 0, 0, 0.6);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  .close-text {
    color: rgba(255, 255, 255, 1);
    font-weight: 600;
    font-size: 1rem;
  }
  
  .close-icon {
    color: rgba(255, 255, 255, 1);
    font-size: 2.2rem;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  .close-btn:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

/* Mobile screens */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1.5rem;
  }
  
  .contact-btn {
    display: none;
  }
  
  .nav-header {
    top: 1.5rem;
    right: 1.5rem;
  }
  
  /* Make close button more visible on small screens */
  .close-btn {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .close-text {
    color: rgba(255, 255, 255, 1);
    font-weight: 600;
  }
  
  .close-icon {
    color: rgba(255, 255, 255, 1);
    font-size: 2.5rem;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }
  
  .main-nav {
    padding: 1rem;
  }
  
  .nav-link {
    padding: 1rem 1.5rem;
  }
  
  .nav-text {
    font-size: 1.25rem;
  }
  
  .menu-newsletter {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .nav-link {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .nav-number,
  .nav-dot {
    display: none;
  }
  
  .nav-text {
    font-size: 1.125rem;
    text-align: center;
  }
  
  .newsletter-form {
    flex-direction: column;
    border-radius: 12px;
  }
  
  .newsletter-btn {
    border-radius: 0 0 12px 12px;
  }
}
</style>