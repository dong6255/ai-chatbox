<template>
  <div class="conversation-list">
    <div class="header">历史对话</div>
    <el-scrollbar class="list">
      <el-menu :default-active="activeId" class="menu" @select="handleSelect">
        <el-menu-item v-for="conv in conversations" :key="conv.id" :index="conv.id">
          {{ conv.prompt }}
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const conversations = ref([
  { id: '1', prompt: '默认提示词一' },
  { id: '2', prompt: '默认提示词二' }
])

const activeId = ref(conversations.value[0]?.id || '')

const handleSelect = (key) => {
  activeId.value = key
}
</script>

<style scoped>
.conversation-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.header {
  padding: 1rem;
  font-weight: bold;
  border-bottom: 1px solid var(--border-color);
}
.list {
  flex: 1;
}
.menu {
  border-right: none;
}
</style>
