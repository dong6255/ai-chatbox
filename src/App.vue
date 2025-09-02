<template>
  <el-config-provider >
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </el-config-provider>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const isDarkMode = ref(settingsStore.isDarkMode)

// 监听主题变化
watch(() => settingsStore.isDarkMode, async (newValue) => {
  document.documentElement.setAttribute('data-theme', newValue ? 'dark' : 'light')
}, { immediate: true })

// 在组件挂载时初始化主题和认证状态
onMounted(() => {
  document.documentElement.setAttribute('data-theme', settingsStore.isDarkMode ? 'dark' : 'light')
  // 初始化认证状态
  authStore.initAuth()
})
</script>
<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}


</style>

