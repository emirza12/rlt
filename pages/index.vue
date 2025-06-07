<template>
  <div class="bg-white">
    <!-- Hero Section - Full Screen -->
    <div class="relative h-screen flex flex-col justify-center items-center text-center">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0 translate-y-23">
        <InteractiveImage src="./wave.png" alt="Background Wave" class="w-full h-full object-contain scale-125" />
      </div>
      
      <!-- Content -->
      <div class="relative z-20 translate-x-8 -translate-y-13">
        <h1 class="text-8xl font-bold mb-8 text-black">RL Treasury</h1>
        <p class="text-4xl text-black max-w-2xl mx-auto">
          From Stable to Profitable
        </p>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </div>

    <!-- Scroll Reveal Section -->
    <div class="min-h-screen">
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-24">
        <div class="text-center mb-20 transition-all duration-1000 opacity-0 translate-y-8" ref="titleSection">
          <h2 class="text-4xl font-bold mb-6 text-black">Why Choose RL Treasury</h2>
          <p class="text-xl text-black/80 max-w-3xl mx-auto">
            Deposit your RLUSD and earn competitive returns above 3.5%* APY, 
            with rewards directly linked to T-Bill performance.
          </p>
        </div>

        <!-- Stats Section -->
        <div class="bg-[#f4f4f4] rounded-2xl p-12 shadow-sm transition-all duration-1000 opacity-0 translate-y-8" ref="statsSection">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-16 text-center max-w-4xl mx-auto">
            <div class="flex flex-col items-center justify-center">
              <h3 class="text-5xl font-bold mb-4 text-[#00DBCE]">3.5%+</h3>
              <p class="text-xl text-black/80">Minimum APY</p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <h3 class="text-5xl font-bold mb-4 text-[#00DBCE]">100%</h3>
              <p class="text-xl text-black/80">T-Bill Backed</p>
            </div>
            <div class="flex flex-col items-center justify-center">
              <h3 class="text-5xl font-bold mb-4 text-[#00DBCE]">0</h3>
              <p class="text-xl text-black/80">Lock Period</p>
            </div>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          <!-- Feature 1 -->
          <div class="bg-[#f4f4f4] p-8 rounded-xl shadow-sm">
            <h3 class="text-2xl font-semibold mb-4 text-black">Superior Yields</h3>
            <p class="text-black/80">
              Earn above 3.5%* APY on your RLUSD deposits, with returns directly tied to US Treasury Bill rates.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-[#f4f4f4] p-8 rounded-xl shadow-sm">
            <h3 class="text-2xl font-semibold mb-4 text-black">Real T-Bill Backing</h3>
            <p class="text-black/80">
              Your rewards are backed by actual US Treasury Bills, ensuring security and stability.
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="bg-[#f4f4f4] p-8 rounded-xl shadow-sm">
            <h3 class="text-2xl font-semibold mb-4 text-black">Flexible & Compound</h3>
            <p class="text-black/80">
              No lock-up period. Withdraw anytime, while rewards are automatically reinvested for compound interest.
            </p>
          </div>
          
        </div>

        

        <!-- CTA Section -->
        <div class="text-center mt-24">
          <NuxtLink to="/deposit" class="bg-[#00DBCE] text-white px-12 py-4 rounded-lg text-xl">
            Start Earning Now
          </NuxtLink>
        </div>

        <!-- Disclaimer -->
        <div class="mt-16 text-center text-sm text-black/60">
          *Returns may vary based on T-Bill rates and market conditions. Past performance is not indicative of future results.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InteractiveImage from '@/components/InteractiveImage.vue'
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default'
})

const titleSection = ref<HTMLElement | null>(null)
const feature1 = ref<HTMLElement | null>(null)
const feature2 = ref<HTMLElement | null>(null)
const feature3 = ref<HTMLElement | null>(null)
const statsSection = ref<HTMLElement | null>(null)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('opacity-0', 'translate-y-8')
        entry.target.classList.add('opacity-100', 'translate-y-0')
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  })

  const elements = [
    titleSection.value,
    feature1.value,
    feature2.value,
    feature3.value,
    statsSection.value
  ]

  elements.forEach(element => {
    if (element) {
      observer.observe(element)
    }
  })
})
</script>

<style>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0) translateX(-50%);
  }
  50% {
    transform: translateY(-10px) translateX(-50%);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
</style> 