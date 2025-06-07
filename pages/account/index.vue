<template>
  <div class="bg-background min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-black">Account</h1>
    
    <BaseCard title="Profile" class="mb-8">
      <div class="max-w-md">
        <div v-if="!wallet.isConnected" class="flex items-center mb-6">
          <div class="bg-background w-16 h-16 rounded-full flex items-center justify-center mr-4">
            <span class="text-2xl font-medium text-gray-600">?</span>
          </div>
          <div>
            <div class="text-lg font-medium">Wallet not connected</div>
            <div class="text-gray-500 text-sm">Connect your wallet to view your profile</div>
          </div>
        </div>
        
        <div v-else class="flex items-center mb-6">
          <div class="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mr-4">
            <span class="text-2xl font-medium text-primary">{{ wallet.address.slice(2, 4) }}</span>
          </div>
          <div>
            <div class="text-lg font-medium">{{ shortAddress }}</div>
            <div class="text-gray-500 text-sm">{{ wallet.balance }} ETH</div>
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
          Disconnect Wallet
        </BaseButton>
      </div>
    </BaseCard>
    
    <BaseCard title="Settings" class="mb-8">
      <div class="max-w-md">
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-4">Notifications</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span>Email Notifications</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <span>Transaction Alerts</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div class="flex items-center justify-between">
              <span>Reward Notifications</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium mb-4">Security</h3>
          <BaseButton variant="outline">Change Password</BaseButton>
        </div>
      </div>
    </BaseCard>
    
    <BaseCard title="Connected Wallets">
      <div v-if="!wallet.isConnected" class="p-6 text-center text-gray-500">
        No wallets connected.
      </div>
      <div v-else>
        <div class="flex justify-between items-center p-2 hover:bg-background/50 rounded-md transition-colors">
          <div class="flex items-center">
            <div class="bg-primary bg-opacity-10 w-10 h-10 rounded-full flex items-center justify-center mr-3">
              <span class="font-medium text-primary">ETH</span>
            </div>
            <div>
              <div class="font-medium">Ethereum Wallet</div>
              <div class="text-sm text-gray-500">{{ shortAddress }}</div>
            </div>
          </div>
          <BaseButton variant="outline" size="sm" @click="wallet.disconnect">Disconnect</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { wallet } from '~/composables/useWallet'

definePageMeta({
  layout: 'default'
})

const shortAddress = computed(() => {
  if (!wallet.address.value) return ''
  return wallet.address.value.slice(0, 6) + '...' + wallet.address.value.slice(-4)
})
</script> 