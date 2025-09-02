<template>
  <div class="chat-page">
    <!-- 顶部导航栏 -->
    <div class="navigation-bar">
      <div class="nav-tabs">
        <div class="nav-tab" :class="{ active: currentTab === 'marketplace' }" @click="currentTab = 'marketplace'">
          <span>应用市场</span>
        </div>
        <div class="nav-tab" :class="{ active: currentTab === 'workspace' }" @click="currentTab = 'workspace'">
          <span>我的工作室</span>
        </div>
      </div>
      <!-- 用户信息区域 -->
      <div class="user-info">
        <el-dropdown @command="handleUserCommand">
          <div class="user-profile">
            <el-avatar :src="authStore.userAvatar" :size="40">
              <el-icon>
                <User />
              </el-icon>
            </el-avatar>
            <div class="user-details">
              <div class="username">{{ authStore.displayName }}</div>
                <div class="badge-number">{{ authStore.user.badgeNumber }}</div>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">
                <el-icon>
                  <Setting />
                </el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item  v-if="authStore.isLoggedIn" command="logout">
                <el-icon>
                  <SwitchButton />
                </el-icon>
                退出登录
              </el-dropdown-item>
              <el-dropdown-item v-else command="login">
                <el-icon>
                  <Key />
                </el-icon>
                登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-workspace">
      <!-- 左侧历史面板 -->
      <conversation-list class="history-panel" v-show="currentTab === 'workspace'" />

      <!-- 应用市场内容 -->
      <div class="marketplace-content" v-show="currentTab === 'marketplace'">
        <div class="marketplace-placeholder">
          <div class="placeholder-icon">
            <el-icon size="64" color="#909399">
              <Shop />
            </el-icon>
          </div>
          <h2>应用市场</h2>
          <p>应用市场功能正在开发中，敬请期待...</p>
        </div>
      </div>

      <!-- 工作室内容 -->
      <div class="workspace-content" v-show="currentTab === 'workspace'">
        <!-- 编排区域 -->
        <div class="arrangement-section">
          <div class="arrangement-header">
            <div class="arrangement-left">
              <span class="arrangement-title">编排</span>
            </div>
            <div class="arrangement-center">
              <!-- 空白区域 -->
            </div>
            <div class="arrangement-right">
              <!-- 模型选择下拉框 -->
              <el-select v-model="modelSettings.model" placeholder="选择模型" size="small" class="model-select">
                <el-option v-for="model in modelOptions" :key="model.value" :label="model.label" :value="model.value" />
              </el-select>

              <!-- 模型参数设置按钮 -->
              <el-dropdown trigger="click" placement="bottom" style="margin-right: 10px;">
                <el-button size="medium" type="text" class="settings-btn">
                  <el-icon>
                    <Setting />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="model-settings-dropdown">
                    <div class="model-settings-content">
                      <el-form :model="modelSettings" label-width="100px" size="small">
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>Temperature</span>
                              <el-tooltip content="控制生成文本的随机性，值越高越随机，值越低越确定。范围：0-1" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.temperature" :min="0" :max="1" :step="0.1"
                            :precision="1" size="small" style="width: 120px;" />
                        </el-form-item>
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>最大Token</span>
                              <el-tooltip content="限制生成文本的最大长度，1个Token约等于0.75个英文单词或1个中文字符" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.maxTokens" :min="1" :max="4096" :step="1" size="small"
                            style="width: 120px;" />
                        </el-form-item>
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>Top P</span>
                              <el-tooltip content="核采样参数，控制候选词汇的概率质量。值越小生成越集中，值越大生成越多样" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.topP" :min="0" :max="1" :step="0.1" :precision="1"
                            size="small" style="width: 120px;" />
                        </el-form-item>
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>Top K</span>
                              <el-tooltip content="限制每次生成时考虑的候选词汇数量，值越小生成越集中" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.topK" :min="1" :max="100" :step="1" size="small"
                            style="width: 120px;" />
                        </el-form-item>
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>重复惩罚</span>
                              <el-tooltip content="控制重复内容的生成程度，值大于1会减少重复，值小于1会增加重复" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.repetitionPenalty" :min="0.1" :max="2.0" :step="0.05"
                            :precision="2" size="small" style="width: 120px;" />
                        </el-form-item>
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>频率惩罚</span>
                              <el-tooltip content="根据词汇在文本中的出现频率进行惩罚，正值减少高频词使用，负值增加高频词使用" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.frequencyPenalty" :min="-2.0" :max="2.0" :step="0.1"
                            :precision="1" size="small" style="width: 120px;" />
                        </el-form-item>
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>存在惩罚</span>
                              <el-tooltip content="根据词汇是否已出现进行惩罚，正值鼓励生成新词汇和话题，负值倾向于重复已有内容" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.presencePenalty" :min="-2.0" :max="2.0" :step="0.1"
                            :precision="1" size="small" style="width: 120px;" />
                        </el-form-item>
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>最小概率</span>
                              <el-tooltip content="设置候选词汇的最小概率阈值，低于此值的词汇将被过滤掉" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.minP" :min="0" :max="1" :step="0.01" :precision="2"
                            size="small" style="width: 120px;" />
                        </el-form-item>
                        <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>种子值</span>
                              <el-tooltip content="用于生成可重现的结果，相同的种子值在相同条件下会产生相同的输出" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input-number v-model="modelSettings.seed" :min="0" :max="999999" :step="1" size="small"
                            style="width: 120px;" placeholder="留空为随机" />
                        </el-form-item>
                        <!-- <el-form-item>
                          <template #label>
                            <div style="display: flex; align-items: center; gap: 4px;">
                              <span>停止序列</span>
                              <el-tooltip content="当生成的文本包含这些序列时会停止生成，每行输入一个停止序列" placement="top">
                                <el-icon class="param-help-icon" style="font-size: 12px; color: #909399; cursor: help;">
                                  <QuestionFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                          </template>
                          <el-input v-model="stopSequencesText" type="textarea" :rows="2" placeholder="每行一个停止序列"
                            @input="handleStopSequencesUpdate" size="small" style="width: 100%;" />
                        </el-form-item> -->
                      </el-form>
                    </div>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

              <!-- 保存配置按钮 -->
              <el-dropdown trigger="click" placement="bottom-end">
                <el-button size="small" type="primary" class="save-btn">
                  保存
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="config-dropdown">
                    <el-dropdown-item @click="saveConfig">
                      <el-icon>
                        <DocumentAdd />
                      </el-icon>
                      保存配置
                    </el-dropdown-item>
                    <el-dropdown-item @click="exportConfig" :disabled="!authStore.isLoggedIn">
                      <el-icon>
                        <Download />
                      </el-icon>
                      导出配置
                    </el-dropdown-item>
                    <el-dropdown-item @click="importConfig" :disabled="!authStore.isLoggedIn">
                      <el-icon>
                        <Upload />
                      </el-icon>
                      导入配置
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <!-- 主要内容区域：提示词设置和调试运行各占一半 -->
        <div class="main-content">
          <control-panel ref="controlPanelRef" class="settings-panel" />
          <div class="chat-container">
            <div class="debug-preview-wrapper">
              <div class="chat-header">
                <h1>调试与预览</h1>
                <div class="header-controls">
                  <el-button circle type="warn" @click="handleClear" size="small" class="clear-button">
                    <svg width="16" height="16" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M938.336973 255.26894c-16.685369-6.020494-35.090879 2.752226-40.939358 19.437594l-24.770032 69.493701c-29.070385-65.537376-74.998152-123.162103-133.48295-166.337645-185.947253-137.611288-450.848984-100.112212-590.180413 83.942886C81.534688 350.908785 52.980346 460.653788 68.805644 570.742819c15.825298 110.605073 74.48211 208.481102 164.789518 275.394591 75.686209 55.904586 164.273476 83.082815 252.172686 83.082815 128.494541 0 255.26894-57.624727 338.007727-166.853687 36.639006-48.335965 61.581052-102.348396 74.48211-160.833193 3.78431-17.373425-7.224593-34.402822-24.426004-38.187133-17.201411-3.78431-34.402822 7.052579-38.187133 24.426004-10.836889 49.36805-31.994625 95.123803-62.957164 135.891147-118.173694 156.016798-342.996136 187.839409-500.90509 70.869814-76.546279-56.592642-126.086343-139.33143-139.503444-232.907106-13.417101-93.059634 10.664875-185.775239 67.77356-261.11742C318.05409 144.491853 542.704519 112.497228 700.785486 229.466823c57.280699 42.315471 100.112212 100.972283 123.334117 167.197715l-110.261045-43.003528c-16.513355-6.364522-35.090879 1.720141-41.627415 18.233496-6.536536 16.513355 1.720141 35.090879 18.233496 41.627415l162.38132 63.473207c3.78431 1.548127 7.740635 2.236183 11.69696 2.236183 0.516042 0 1.032085-0.172014 1.548127-0.172014 1.204099 0.172014 2.408198 0.688056 3.612296 0.688056 13.245087 0 25.630102-8.256677 30.274483-21.32975l57.796741-161.693264C963.623047 279.694944 955.022342 261.289434 938.336973 255.26894z"
                        fill="currentColor" />
                    </svg>
                  </el-button>
                </div>
              </div>
              <div class="messages-container" ref="messagesContainer">
                <template v-if="messages.length">
                  <chat-message v-for="message in messages" :key="message.id" :message="message"
                    :loading="message.loading" @update="handleMessageUpdate" @delete="handleMessageDelete"
                    @regenerate="handleRegenerate" />
                </template>
                <div v-else class="empty-state">
                  <el-empty description="开始对话吧" />
                </div>
              </div>
              <chat-input :loading="chatStore.isLoading" @send="handleSend" @clear="handleClear" @stop="handleStop" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置面板 -->
    <settings-panel v-model="showSettingsPanel" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, SwitchButton, Setting, Shop, QuestionFilled, ArrowDown, DocumentAdd, Download, Upload, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { chatApi } from '@/utils/api'
import { messageHandler } from '@/utils/messageHandler'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import ConversationList from '@/components/ConversationList.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { useSettingsStore, modelOptions } from '@/stores/settings'

// 证书登录相关
import pnxclient from '@/utils/pnxclient'
import { getRandom, returnSignResult } from '@/api/auth'
import msComm from '@/utils/ms_comm.js'

const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const messages = computed(() => chatStore.messages)

// 导航标签页状态
const currentTab = ref('workspace')
const isLoading = computed(() => chatStore.isLoading)
const messagesContainer = ref(null)
const controlPanelRef = ref(null)
const showSettingsPanel = ref(false)

// 编排区域相关状态
const modelSettings = reactive({
  model: settingsStore.model,
  temperature: settingsStore.temperature,
  maxTokens: settingsStore.maxTokens,
  topP: settingsStore.topP,
  topK: settingsStore.topK || 50,
  repetitionPenalty: settingsStore.repetitionPenalty || 1.1,
  frequencyPenalty: settingsStore.frequencyPenalty || 0.0,
  presencePenalty: settingsStore.presencePenalty || 0.0,
  minP: settingsStore.minP || 0.0,
  seed: settingsStore.seed || null,
  stopSequences: settingsStore.stopSequences || []
})

// 停止序列文本
const stopSequencesText = ref(modelSettings.stopSequences.join('\n'))

// 监听模型设置变化，同步到store
watch(modelSettings, (newSettings) => {
  settingsStore.updateSettings(newSettings)
}, { deep: true })

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

// 用于控制请求中断的 AbortController
let currentAbortController = null

/**
 * 处理发送消息
 * @param {string} content - 消息内容
 */
const handleSend = async (content) => {
  // 立即设置loading状态，让用户能够点击停止按钮
  chatStore.setLoading(true)

  // 创建新的 AbortController
  currentAbortController = new AbortController()

  chatStore.addMessage(messageHandler.formatMessage('user', content))
  chatStore.addMessage(messageHandler.formatMessage('assistant', ''))

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
      modelConfig,
      currentAbortController.signal
    )

    if (settingsStore.streamResponse) {
      await messageHandler.processStreamResponse(response, {
        updateMessage: content => chatStore.updateLastMessage(content),
        updateTokenCount: usage => chatStore.updateTokenCount(usage),
        abortSignal: currentAbortController.signal
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
    if (error.name === 'AbortError') {
      console.log('请求已被用户取消')
      // 不更新错误消息，保留已输出的内容
    } else {
      chatStore.updateLastMessage('抱歉，发生了错误，请稍后重试。')
    }
  } finally {
    chatStore.setLoading(false)
    currentAbortController = null
  }
}

/**
 * 停止当前请求
 */
const handleStop = () => {
  if (currentAbortController) {
    currentAbortController.abort()
    chatStore.setLoading(false)
  }
}

const handleClear = () => {
  chatStore.clearMessages()
}

/**
 * 处理停止序列更新
 */
const handleStopSequencesUpdate = () => {
  modelSettings.stopSequences = stopSequencesText.value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

/**
 * 保存配置到本地存储
 */
const saveConfig = () => {
  try {
    const config = {
      modelSettings: { ...modelSettings },
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('chatbox-config', JSON.stringify(config))
    ElMessage.success('配置已保存到本地存储')
  } catch (error) {
    ElMessage.error('保存配置失败')
  }
}

/**
 * 导出配置文件
 */
const exportConfig = () => {
  try {
    const config = {
      modelSettings: { ...modelSettings },
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chatbox-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('配置文件已导出')
  } catch (error) {
    ElMessage.error('导出配置失败')
  }
}

/**
 * 导入配置文件
 */
const importConfig = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result)
      if (config.modelSettings) {
        Object.assign(modelSettings, config.modelSettings)
        stopSequencesText.value = modelSettings.stopSequences.join('\n')
        ElMessage.success('配置已导入')
      } else {
        ElMessage.error('配置文件格式不正确')
      }
    } catch (error) {
      ElMessage.error('导入配置失败：文件格式错误')
    }
  }
  reader.readAsText(file)
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
    chatStore.setLoading(true)
    try {
      await handleSend(userMessage.content)
    } catch (error) {
      console.error('重新生成失败:', error)
      conversation.messages.splice(index, 0, message)
    } finally {
      chatStore.setLoading(false)
    }
  }
}

// 证书登录（与 LoginView 中逻辑一致）
const certLogin = async () => {
  try {
    const response = await getRandom()
    console.log("response", response)
    if (response.code == '200') {
      const authContent = response.rows[0]
      if (!authContent) {
        ElMessage.error('认证原文不能为空!')
        return
      }
      try {
        pnxclient.JIT_GW_ExtInterface.GetVersion()
      } catch (e) {
        ElMessage.error('未安装控件，请安装控件后重试')
        return
      }
      const initParam = "<?xml version=\"1.0\" encoding=\"utf-8\"?><authinfo><liblist><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX21pcHM2NC5zby4wLjMuMTAuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FGX2FwaV9taXBzNjQuc28uMC4zLjExLjA0MTM=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IEVuaGFuY2VkIENyeXB0b2dyYXBoaWMgUHJvdmlkZXIgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"R0FTUyBDcnlwdG9ncmFwaGljIFNlcnZpY2UgUHJvdmlkZXIgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"ZVNhZmUgQ3J5cHRvZ3JhcGhpYyBTZXJ2aWNlIFByb3ZpZGVyIHYxLjA=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"SKF\" version=\"1.1\" dllname=\"R0FLRVlfU0tGLmRsbA==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"R0FTU19GIENyeXB0b2dyYXBoaWMgU2VydmljZSBQcm92aWRlciB2MS4w\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib></liblist></authinfo>";
      pnxclient.JIT_GW_ExtInterface.ClearFilter()
      pnxclient.JIT_GW_ExtInterface.Initialize("", initParam)
      pnxclient.JIT_GW_ExtInterface.SetChooseSingleCert(1)
      const sign_Result = pnxclient.JIT_GW_ExtInterface.P7SignString(authContent, true, true)
      if (pnxclient.JIT_GW_ExtInterface.GetLastError() != 0) {
        const code = pnxclient.JIT_GW_ExtInterface.GetLastError()
        if (code === 3758096386 || code === 2148532334) {
          ElMessage.warning('用户取消操作')
          return
        } else if (code === -536870815 || code === 3758096481) {
          ElMessage.error('没有找到有效的证书，请确认已插入KEY')
          return
        } else {
          ElMessage.error(pnxclient.JIT_GW_ExtInterface.GetLastErrorMessage())
          return
        }
      }
      if (sign_Result) {
        const res = await returnSignResult({
          signed_data: sign_Result,
          original_vue: authContent,
        })
        console.log("res", res)
        if (res) {
          sessionStorage.setItem('curPlaceId', res.data.rows?.[0]?.placeId || '')
          sessionStorage.setItem('userId', res.data.rows?.[0]?.userId || '')
          const curT = msComm.setCurTitle()
          if (curT && curT.orgTitle) {
            document.title = 'AI Chat'
          }
          sessionStorage.setItem('loginName', res.data.rows?.[0]?.userName || '')
          authStore.setUser({
            id: 'cert_user',
            username: res.data.rows?.[0]?.userName || '证书用户',
            badgeNumber: res.data.rows?.[0]?.userInfo?.alarm || '',
            token: 'cert_token_' + Date.now()
          })
          ElMessage.success('登录成功')
        } else {
          ElMessage.error('登录失败，请重试')
        }
      }
    } else {
      ElMessage.error(res.message || '获取认证原文失败')
    }
  } catch (error) {
    console.error('证书登录失败:', error)
    ElMessage.error('证书登录失败')
  }
}

// 处理用户操作
const handleUserCommand = async (command) => {
  if (command === 'logout') {
    try {
      await authStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
      console.error('登出失败:', error)
      ElMessage.error('登出失败，请重试')
    }
  } else if (command === 'login') {
    await certLogin()
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 导航栏样式 */
.navigation-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  flex-shrink: 0;
  position: relative;
}

/* 用户信息区域定位到右侧 */
.user-info {
  position: absolute;
  right: 20px;
}

/* 主要工作区域 */
.main-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 工作室内容 */
.workspace-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.main-workspace:has(.history-panel[style*="display: none"]) .workspace-content,
.main-workspace:has(.history-panel[style*="display: none"]) .marketplace-content {
  width: 100%;
}

.main-workspace:has(.history-panel:not([style*="display: none"])) .workspace-content,
.main-workspace:has(.history-panel:not([style*="display: none"])) .marketplace-content {
  flex: 1;
}

.nav-tabs {
  display: flex;
  gap: 8px;
}

.nav-tab {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
  font-weight: 500;
}

.nav-tab:hover {
  background-color: #f0f2f5;
  color: #409eff;
}

.nav-tab.active {
  background-color: #409eff;
  color: white;
}

/* 应用市场样式 */
.marketplace-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  overflow: hidden;
}

.marketplace-placeholder {
  text-align: center;
  color: #909399;
}

.marketplace-placeholder h2 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.marketplace-placeholder p {
  margin: 0;
  font-size: 14px;
}

.history-panel {
  width: 200px;
  border-right: 1px solid var(--border-color);
}

/* 编排区域样式 */
.arrangement-section {
  background-color: #fafafa;
}

.arrangement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  gap: 16px;
}

.arrangement-right {
  display: flex;
  align-items: center;
  /* gap: 12px; */
}

.arrangement-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.arrangement-left .arrangement-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.arrangement-center {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

.model-select {
  width: 200px;
  margin-right: 10px;
}

/* 主要内容区域布局 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.settings-panel {
  width: 50%;
  /* border-right: 1px solid var(--border-color); */
}

.chat-container {
  width: 50%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 16px;
}

.debug-preview-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  padding-bottom: 120px;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 12px 12px 0 0;
}

.chat-header h1 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-profile:hover {
  background-color: var(--el-fill-color-light);
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-primary);
  line-height: 1.2;
}

.badge-number {
  font-size: 12px;
  color: var(--text-color-secondary);
  line-height: 1.2;
  margin-top: 2px;
}

.config-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.mask-content {
  background: var(--bg-color);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
}

.mask-icon {
  font-size: 3rem;
  color: #f56c6c;
  margin-bottom: 1rem;
}

.mask-text {
  font-size: 1.2rem;
  color: var(--text-color-primary);
  margin: 0;
  font-weight: 500;
}

.messages-container.masked {
  filter: blur(4px);
  pointer-events: none;
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clear-button {
  margin-left: auto;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-profile:hover {
  background-color: var(--el-fill-color-light);
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color-primary);
  line-height: 1.2;
}

.badge-number {
  font-size: 12px;
  color: var(--text-color-secondary);
  line-height: 1.2;
  margin-top: 2px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f5f7fa;
  margin: 0 16px 16px 16px;
  border-radius: 12px;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
