<template>
  <div class="min-h-screen bg-lightBg flex flex-col">
    <!-- Top Navigation Bar -->
    <header class="bg-white shadow-sm h-16 flex items-center px-6 z-10">
      <div class="flex justify-between w-full items-center">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-black">RLT</h1>
        </div>
        <div class="flex items-center space-x-4">
          <div v-if="wallet.isConnected" class="text-sm bg-lightBg px-3 py-1 rounded-md">
            <div class="flex items-center">
              <span class="text-gray-500 mr-2">{{ shortAddress }}</span>
              <span class="font-medium">{{ wallet.balance }} ETH</span>
            </div>
          </div>
          <BaseButton 
            v-if="!wallet.isConnected" 
            @click="wallet.connect" 
            :loading="wallet.isConnecting"
          >
            Connect Wallet
          </BaseButton>
          <BaseButton 
            v-else 
            variant="outline" 
            @click="wallet.disconnect"
          >
            Disconnect
          </BaseButton>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <!-- Left Sidebar -->
      <aside class="w-64 bg-white shadow-sm">
        <nav class="py-6 px-4">
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/" class="block py-2 px-4 rounded-md hover:bg-lightBg transition-colors" active-class="bg-lightBg text-primary font-medium">
                Dashboard
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/portfolio" class="block py-2 px-4 rounded-md hover:bg-lightBg transition-colors" active-class="bg-lightBg text-primary font-medium">
                Portfolio
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/vault" class="block py-2 px-4 rounded-md hover:bg-lightBg transition-colors" active-class="bg-lightBg text-primary font-medium">
                Vault
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/rewards" class="block py-2 px-4 rounded-md hover:bg-lightBg transition-colors" active-class="bg-lightBg text-primary font-medium">
                Rewards
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/account" class="block py-2 px-4 rounded-md hover:bg-lightBg transition-colors" active-class="bg-lightBg text-primary font-medium">
                Account
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { wallet } from '~/composables/useWallet'

const shortAddress = computed(() => {
  if (!wallet.address.value) return ''
  return wallet.address.value.slice(0, 6) + '...' + wallet.address.value.slice(-4)
})
</script> 