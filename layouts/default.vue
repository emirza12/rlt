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
            <div v-if="wallet.isConnected.value" class="flex items-center space-x-4">
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">{{ shortAddress }}</div>
                <div class="text-xs text-gray-500">{{ wallet.balance.value }} XRP</div>
              </div>
              <button
                @click="wallet.disconnect"
                class="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
              >
                Disconnect
              </button>
            </div>
            <div v-else>
              <button
                @click="showWalletModal = true"
                class="bg-[#00DBCE] text-white px-6 py-2 rounded-lg hover:bg-[#00DBCE]/90 transition-colors"
              >
                Connect XRPL Wallet
              </button>
            </div>
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

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Wallet Connection Modal -->
    <div
      v-if="showWalletModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showWalletModal = false"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Connect Wallet</h2>
            <button
              @click="showWalletModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <XRPLWalletConnect @connected="showWalletModal = false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CustomLink from '@/components/CustomLink.vue'
import Footer from '@/components/Footer.vue'
import XRPLWalletConnect from '@/components/XRPLWalletConnect.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { wallet } from '~/composables/useWallet'

const showWalletModal = ref(false)

const shortAddress = computed(() => {
  if (!wallet.address.value) return ''
  return wallet.address.value.slice(0, 8) + '...' + wallet.address.value.slice(-6)
})

// Auto-close modal when wallet connects
watch(() => wallet.isConnected.value, (isConnected) => {
  if (isConnected) {
    showWalletModal.value = false
  }
})
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