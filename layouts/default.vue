<template>
  <div class="min-h-screen bg-lightBg flex flex-col">
    <!-- Top Navigation Bar -->
    <header class="bg-white shadow-sm h-16 flex items-center px-6 z-10">
      <div class="flex justify-between w-full items-center">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-2xl font-bold text-black">RLT</NuxtLink>
        </div>
        <div class="flex items-center space-x-4">
          <div v-if="wallet.isConnected.value" class="text-sm bg-lightBg px-3 py-1 rounded-md">
            <div class="flex items-center">
              <span class="text-gray-500 mr-2">{{ shortAddress }}</span>
              <span class="font-medium">{{ wallet.balance.value }} ETH</span>
            </div>
          </div>
          <BaseButton 
            v-if="!wallet.isConnected.value" 
            @click="wallet.connect" 
            :loading="wallet.isConnecting.value"
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
              <CustomLink to="/">Dashboard</CustomLink>
            </li>
            <li>
              <CustomLink to="/portfolio">Portfolio</CustomLink>
            </li>
            <li>
              <CustomLink to="/vault">Vault</CustomLink>
            </li>
            <li>
              <CustomLink to="/rewards">Rewards</CustomLink>
            </li>
            <li>
              <CustomLink to="/account">Account</CustomLink>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 p-6 overflow-auto">
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