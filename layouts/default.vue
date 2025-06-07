<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top Navigation Bar -->
    <nav class="bg-white shadow-sm">
      <div class="w-full">
        <div class="flex justify-between h-16">
          <!-- Left Side: Logo and Links -->
          <div class="flex items-center">
            <div class="flex items-center space-x-3 ml-10">
              <img src="/logo.png" alt="RL Treasury Logo" class="h-8 w-auto" />
              <NuxtLink to="/" class="text-2xl font-bold text-black">RL Treasury</NuxtLink>
            </div>
            <div class="flex items-center space-x-8 ml-16">
              <CustomLink to="/">Home</CustomLink>
              <CustomLink to="/deposit">Deposit</CustomLink>
              <CustomLink to="/portfolio">Portfolio</CustomLink>
            </div>
          </div>

          <!-- Right Side: Wallet Connect -->
          <div class="flex items-center mr-10">
            <button class="bg-[#00DBCE] text-white px-6 py-2 rounded-lg hover:bg-[#00DBCE]/90 transition-colors">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="flex-1">
      <slot />
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import CustomLink from '@/components/CustomLink.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.flex-1 {
  margin-top: 4rem; /* Pour compenser la hauteur de la barre de navigation */
}
</style> 