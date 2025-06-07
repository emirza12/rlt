<template>
  <div class="bg-background min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-black">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Summary Card -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Portfolio Summary</h2>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Total Value</span>
          <span class="text-2xl font-bold">$0.00</span>
        </div>
        <div class="mt-4">
          <NuxtLink to="/portfolio" class="text-primary hover:text-primary/80 hover:underline">View Details →</NuxtLink>
        </div>
      </div>
      
      <!-- Vault Card -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Vault</h2>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Deposited</span>
          <span class="text-2xl font-bold">$0.00</span>
        </div>
        <div class="mt-4">
          <NuxtLink to="/vault" class="text-primary hover:text-primary/80 hover:underline">View Vault →</NuxtLink>
        </div>
      </div>
      
      <!-- Rewards Card -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-semibold mb-4">Rewards</h2>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Available</span>
          <span class="text-2xl font-bold">0 RLT</span>
        </div>
        <div class="mt-4">
          <NuxtLink to="/rewards" class="text-primary hover:text-primary/80 hover:underline">View Rewards →</NuxtLink>
        </div>
      </div>
    </div>
    
    <div class="mt-10">
      <h2 class="text-2xl font-bold mb-4 text-black">Recent Activity</h2>
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6 text-center text-gray-500">
          No recent activity to display.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script> 