<template>
  <div class="control-panel">
    <div class="prompt-section">
      <h3>提示词设置</h3>
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="25"
        placeholder="请输入提示词"
      />
      <el-button class="save-btn" type="primary" size="small" @click="savePrompt">
        保存提示词
      </el-button>
    </div>
    <el-divider />
    <div class="model-section">
      <h3>模型与参数</h3>
      <el-form :model="settings" label-width="90px">
        <el-form-item label="模型">
          <el-select v-model="settings.model" class="w-full">
            <el-option
              v-for="model in modelOptions"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Temperature">
          <el-slider v-model="settings.temperature" :min="0" :max="1" :step="0.1" show-input />
        </el-form-item>
        <el-form-item label="最大Token">
          <el-input-number v-model="settings.maxTokens" :min="1" :max="4096" :step="1" />
        </el-form-item>
        <el-form-item label="Top P">
          <el-slider v-model="settings.topP" :min="0" :max="1" :step="0.1" show-input />
        </el-form-item>
        <el-form-item label="Top K">
          <el-input-number v-model="settings.topK" :min="1" :max="100" :step="1" />
        </el-form-item>
      </el-form>
      <el-button class="save-btn" type="primary" size="small" @click="saveSettings">
        保存设置
      </el-button>
    </div>
    <el-divider />
    <div class="kb-section">
      <h3>知识库接入</h3>
      <el-input placeholder="暂未实现" disabled />
    </div>
    <el-divider />
    <div class="data-section">
      <h3>数据源接入</h3>
      <el-input placeholder="暂未实现" disabled />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useSettingsStore, modelOptions } from '../stores/settings'
import { useChatStore } from '../stores/chat'
import { ElMessage } from 'element-plus'

const settingsStore = useSettingsStore()
const chatStore = useChatStore()

// 获取当前对话的系统提示词
const getCurrentSystemPrompt = () => {
  const currentConversation = chatStore.currentConversation
  return currentConversation ? currentConversation.systemPrompt : ''
}

// 获取当前对话的模型配置
const getCurrentModelConfig = () => {
  const currentConversation = chatStore.currentConversation
  if (currentConversation && currentConversation.modelConfig) {
    return currentConversation.modelConfig
  }
  // 如果没有模型配置，使用全局设置作为默认值
  return {
    model: settingsStore.model,
    temperature: settingsStore.temperature,
    maxTokens: settingsStore.maxTokens,
    topP: settingsStore.topP,
    topK: settingsStore.topK
  }
}

const prompt = ref(getCurrentSystemPrompt())
const settings = reactive(getCurrentModelConfig())

// 监听当前对话变化，自动更新提示词和模型配置显示
watch(
  () => chatStore.activeConversationId,
  () => {
    prompt.value = getCurrentSystemPrompt()
    // 更新模型配置
    const newModelConfig = getCurrentModelConfig()
    Object.assign(settings, newModelConfig)
  },
  { immediate: true }
)

/**
 * 保存提示词到当前对话
 */
const savePrompt = () => {
  if (!chatStore.activeConversationId) {
    ElMessage.warning('请先创建或选择一个对话')
    return
  }
  
  chatStore.updateConversationSystemPrompt(chatStore.activeConversationId, prompt.value)
  ElMessage.success('提示词已保存到当前对话')
}

/**
 * 保存模型设置到当前对话
 */
const saveSettings = () => {
  if (!chatStore.activeConversationId) {
    ElMessage.warning('请先创建或选择一个对话')
    return
  }
  
  // 保存到当前对话
  chatStore.updateConversationModelConfig(chatStore.activeConversationId, {
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    topP: settings.topP,
    topK: settings.topK
  })
  
  ElMessage.success('模型设置已保存到当前对话')
}
</script>

<style scoped>
.control-panel {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
.prompt-section,
.model-section,
.kb-section {
  margin-bottom: 1rem;
}
.save-btn {
  margin-top: 0.5rem;
}
.w-full {
  width: 100%;
}
</style>
