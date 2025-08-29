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
import { ref, computed, watch, nextTick } from 'vue'
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
    const response = await chatApi.sendMessage(
      messages.value.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      })),
      settingsStore.streamResponse
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
  const index = chatStore.messages.findIndex(m => m.id === updatedMessage.id)
  if (index !== -1) {
    chatStore.messages.splice(index, 2)
    await handleSend(updatedMessage.content)
  }
}

const handleMessageDelete = message => {
  const index = chatStore.messages.findIndex(m => m.id === message.id)
  if (index !== -1) {
    chatStore.messages.splice(index, 2)
  }
}

const handleRegenerate = async message => {
  const index = chatStore.messages.findIndex(m => m.id === message.id && m.role === 'assistant')
  if (index !== -1 && index > 0) {
    const userMessage = chatStore.messages[index - 1]
    chatStore.messages.splice(index - 1, 2)
    if (isLoading.value) return
    chatStore.isLoading = true
    try {
      await handleSend(userMessage.content)
    } catch (error) {
      console.error('重新生成失败:', error)
      chatStore.messages.splice(index, 0, message)
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
  width: 300px;
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
