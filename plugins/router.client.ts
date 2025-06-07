import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // Log navigation events for debugging
  nuxtApp.hook('page:start', () => {
    console.log('Page navigation started')
  })
  
  nuxtApp.hook('page:finish', () => {
    console.log('Page navigation completed')
  })
  
  // Force client-side navigation to use proper routing
  nuxtApp.hook('link:prefetch', (event) => {
    if (typeof window !== 'undefined') {
      console.log('Prefetching:', event)
    }
  })
}) 