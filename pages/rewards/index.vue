<template>
  <div class="bg-background min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-black">Rewards</h1>
    
    <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 class="text-lg font-medium text-gray-600 mb-2">Available Rewards</h2>
          <div class="text-3xl font-bold">0 RLT</div>
        </div>
        
        <div>
          <h2 class="text-lg font-medium text-gray-600 mb-2">Earned This Month</h2>
          <div class="text-3xl font-bold">0 RLT</div>
        </div>
        
        <div>
          <h2 class="text-lg font-medium text-gray-600 mb-2">Total Earned</h2>
          <div class="text-3xl font-bold">0 RLT</div>
        </div>
      </div>
      
      <div class="mt-6 border-t pt-6">
        <button class="bg-primary text-black px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">Claim Rewards</button>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm mb-8">
      <div class="p-4 border-b">
        <h2 class="text-xl font-semibold">Earning Opportunities</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="border rounded-lg p-6 hover:bg-background/30 transition-colors">
            <h3 class="text-lg font-semibold mb-3">Stake RLT</h3>
            <p class="text-gray-600 mb-4">Earn rewards by staking your RLT tokens</p>
            <div class="flex justify-between items-center mb-2">
              <span>Reward Rate</span>
              <span class="font-medium">12% APY</span>
            </div>
            <div class="flex justify-between items-center mb-6">
              <span>Lock Period</span>
              <span class="font-medium">30 days min.</span>
            </div>
            <button class="w-full bg-primary text-black font-medium py-2 rounded-md hover:bg-primary/90 transition-colors">Stake RLT</button>
          </div>
          
          <div class="border rounded-lg p-6 hover:bg-background/30 transition-colors">
            <h3 class="text-lg font-semibold mb-3">Liquidity Mining</h3>
            <p class="text-gray-600 mb-4">Provide liquidity and earn RLT rewards</p>
            <div class="flex justify-between items-center mb-2">
              <span>Reward Rate</span>
              <span class="font-medium">Variable</span>
            </div>
            <div class="flex justify-between items-center mb-6">
              <span>Pairs</span>
              <span class="font-medium">RLT/ETH, RLT/USDC</span>
            </div>
            <button class="w-full bg-primary text-black font-medium py-2 rounded-md hover:bg-primary/90 transition-colors">Provide Liquidity</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-4 border-b">
        <h2 class="text-xl font-semibold">Reward History</h2>
      </div>
      <div class="p-6 text-center text-gray-500">
        No reward history to display.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script> 