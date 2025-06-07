<template>
  <div class="bg-background min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-black">Vault</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Total Deposited</h2>
        <div class="text-3xl font-bold">$0.00</div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Total Earnings</h2>
        <div class="text-3xl font-bold">$0.00</div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm mb-8">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold">Available Vaults</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border rounded-lg p-6 hover:bg-background/30 transition-colors">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Stable Vault</h3>
              <span class="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded text-sm">4.5% APY</span>
            </div>
            <p class="text-gray-600 mb-4">Earn stable returns with minimal risk</p>
            <div class="flex justify-between items-center mb-6">
              <span>Min. Deposit</span>
              <span class="font-medium">$100</span>
            </div>
            <button class="w-full bg-primary text-black font-medium py-2 rounded-md hover:bg-primary/90 transition-colors">Deposit</button>
          </div>
          
          <div class="border rounded-lg p-6 hover:bg-background/30 transition-colors">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Growth Vault</h3>
              <span class="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded text-sm">8.2% APY</span>
            </div>
            <p class="text-gray-600 mb-4">Higher returns with moderate risk</p>
            <div class="flex justify-between items-center mb-6">
              <span>Min. Deposit</span>
              <span class="font-medium">$500</span>
            </div>
            <button class="w-full bg-primary text-black font-medium py-2 rounded-md hover:bg-primary/90 transition-colors">Deposit</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-4 border-b">
        <h2 class="text-xl font-semibold">Your Deposits</h2>
      </div>
      <div class="p-6 text-center text-gray-500">
        No deposits to display.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script> 