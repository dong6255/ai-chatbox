<template>
  <div class="conversation-list">
    <div class="header">
      <span>历史对话</span>
      <el-button 
        type="primary" 
        size="small" 
        @click="createNewConversation"
        :icon="Plus"
      >
        新对话
      </el-button>
    </div>
    <el-scrollbar class="list">
      <el-menu 
        :default-active="chatStore.activeConversationId" 
        class="menu" 
        @select="handleSelect"
      >
        <el-menu-item 
          v-for="conversationId in chatStore.conversationList" 
          :key="conversationId" 
          :index="conversationId"
          class="conversation-item"
        >
          <div class="conversation-content">
            <span class="conversation-title">
              {{ chatStore.conversations[conversationId]?.title || '新对话' }}
            </span>
            <el-button 
              type="text" 
              size="small" 
              @click.stop="deleteConversation(conversationId)"
              :icon="Delete"
              class="delete-btn"
            />
          </div>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const chatStore = useChatStore()

// 初始化时确保有默认对话
onMounted(() => {
  chatStore.initializeDefaultConversation()
})

/**
 * 处理对话选择
 * @param {string} conversationId - 对话ID
 */
const handleSelect = (conversationId) => {
  chatStore.switchConversation(conversationId)
}

/**
 * 创建新对话
 */
const createNewConversation = () => {
  chatStore.createNewConversation()
  ElMessage.success('已创建新对话')
}

/**
 * 删除对话
 * @param {string} conversationId - 要删除的对话ID
 */
const deleteConversation = async (conversationId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个对话吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    chatStore.deleteConversation(conversationId)
    ElMessage.success('对话已删除')
  } catch {
    // 用户取消删除
  }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list {
  flex: 1;
}

.menu {
  border-right: none;
}

.conversation-item {
  padding: 0 !important;
}

.conversation-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.conversation-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
  color: #f56c6c;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #f56c6c !important;
  background-color: rgba(245, 108, 108, 0.1) !important;
}
</style>
