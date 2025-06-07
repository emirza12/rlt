<template>
  <div 
    class="wave-container"
    @mousemove="handleMouseMove"
    @mouseleave="resetRotation"
    ref="container"
  >
    <img 
      :src="src" 
      :alt="alt" 
      class="wave-image"
      :style="rotationStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  src: string
  alt: string
}>()

const container = ref<HTMLElement | null>(null)
const rotation = ref({ x: 0, y: 0 })
const waveOffset = ref(0)
let animationFrame: number

const rotationStyle = computed(() => ({
  transform: `perspective(1000px) 
    rotateX(${rotation.value.x + Math.sin(waveOffset.value) * 8}deg) 
    rotateY(${rotation.value.y + Math.cos(waveOffset.value) * 8}deg)`
}))

function handleMouseMove(event: MouseEvent) {
  if (!container.value) return
  
  const rect = container.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  rotation.value = {
    x: -((y - rect.height / 2) / rect.height) * 30,
    y: ((x - rect.width / 2) / rect.width) * 30
  }
}

function resetRotation() {
  rotation.value = { x: 0, y: 0 }
}

function animate() {
  waveOffset.value = (waveOffset.value + 0.03) % (Math.PI * 2)
  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.wave-container {
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  overflow: hidden;
}

.wave-image {
  width: 100%;
  height: auto;
  transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  transform-style: preserve-3d;
  will-change: transform;
  cursor: pointer;
}
</style>
