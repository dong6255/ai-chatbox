<template>
  <div class="chat-page">
    <conversation-list class="history-panel" />
    <control-panel class="settings-panel" />
    <div class="chat-container">
      <div class="chat-header">
        <h1>AI Chat</h1>
      </div>
      <div class="messages-container" ref="messagesContainer">
        <template v-if="messages.length">
          <chat-message
            v-for="message in messages"
            :key="message.id"
            :message="message"
            :loading="message.loading"
            @update="handleMessageUpdate"
            @delete="handleMessageDelete"
            @regenerate="handleRegenerate"
          />
        </template>
        <div v-else class="empty-state">
          <el-empty description="开始对话吧" />
        </div>
      </div>
      <chat-input :loading="isLoading" @send="handleSend" @clear="handleClear" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { chatApi } from '../utils/api'
import { messageHandler } from '../utils/messageHandler'
import ChatMessage from '../components/ChatMessage.vue'
import ChatInput from '../components/ChatInput.vue'
import ConversationList from '../components/ConversationList.vue'
import ControlPanel from '../components/ControlPanel.vue'
import { useSettingsStore } from '../stores/settings'

const chatStore = useChatStore()
const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const messagesContainer = ref(null)

// 初始化时确保有默认对话
onMounted(() => {
  chatStore.initializeDefaultConversation()
})

watch(
  messages,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  },
  { deep: true }
)

const handleSend = async (content) => {
  chatStore.addMessage(messageHandler.formatMessage('user', content))
  chatStore.addMessage(messageHandler.formatMessage('assistant', ''))
  chatStore.isLoading = true
  try {
    const settingsStore = useSettingsStore()
    
    // 构建发送给API的消息列表
    let apiMessages = messages.value.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content
    }))
    
    // 如果当前对话有系统提示词，添加到消息列表开头
    const currentConversation = chatStore.currentConversation
    if (currentConversation && currentConversation.systemPrompt && currentConversation.systemPrompt.trim()) {
      apiMessages.unshift({
        role: 'system',
        content: currentConversation.systemPrompt
      })
    }
    
    // 获取当前对话的模型配置
    const modelConfig = currentConversation && currentConversation.modelConfig 
      ? currentConversation.modelConfig 
      : null
    
    const response = await chatApi.sendMessage(
      apiMessages,
      settingsStore.streamResponse,
      modelConfig
    )
    if (settingsStore.streamResponse) {
      await messageHandler.processStreamResponse(response, {
        updateMessage: content => chatStore.updateLastMessage(content),
        updateTokenCount: usage => chatStore.updateTokenCount(usage)
      })
    } else {
      const result = await messageHandler.processSyncResponse(response, content => {
        chatStore.updateLastMessage(content)
      })
      if (result.usage) {
        chatStore.updateTokenCount(result.usage)
      }
    }
  } catch (error) {
    chatStore.updateLastMessage('抱歉，发生了错误，请稍后重试。')
  } finally {
    chatStore.isLoading = false
  }
}

const handleClear = () => {
  chatStore.clearMessages()
}

const handleMessageUpdate = async updatedMessage => {
  if (!chatStore.activeConversationId) return
  
  const conversation = chatStore.conversations[chatStore.activeConversationId]
  if (!conversation) return
  
  const index = conversation.messages.findIndex(m => m.id === updatedMessage.id)
  if (index !== -1) {
    conversation.messages.splice(index, 2)
    conversation.updatedAt = new Date().toISOString()
    await handleSend(updatedMessage.content)
  }
}

const handleMessageDelete = message => {
  if (!chatStore.activeConversationId) return
  
  const conversation = chatStore.conversations[chatStore.activeConversationId]
  if (!conversation) return
  
  const index = conversation.messages.findIndex(m => m.id === message.id)
  if (index !== -1) {
    conversation.messages.splice(index, 2)
    conversation.updatedAt = new Date().toISOString()
  }
}

const handleRegenerate = async message => {
  if (!chatStore.activeConversationId) return
  
  const conversation = chatStore.conversations[chatStore.activeConversationId]
  if (!conversation) return
  
  const index = conversation.messages.findIndex(m => m.id === message.id && m.role === 'assistant')
  if (index !== -1 && index > 0) {
    const userMessage = conversation.messages[index - 1]
    conversation.messages.splice(index - 1, 2)
    conversation.updatedAt = new Date().toISOString()
    
    if (isLoading.value) return
    chatStore.isLoading = true
    try {
      await handleSend(userMessage.content)
    } catch (error) {
      console.error('重新生成失败:', error)
      conversation.messages.splice(index, 0, message)
    } finally {
      chatStore.isLoading = false
    }
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh;
}
.history-panel {
  width: 200px;
  border-right: 1px solid var(--border-color);
}
.settings-panel {
  width: 60%;
  border-right: 1px solid var(--border-color);
}
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chat-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}
.chat-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color-primary);
}
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: var(--bg-color-secondary);
}
.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
