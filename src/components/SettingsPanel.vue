<template>
  <!-- 设置抽屉组件，用于展示和编辑应用设置 -->
  <el-drawer 
    style="background-color: var(--bg-color);"
    v-model="visible"
    title="设置"
    direction="rtl"
    size="400px"
  >
    <div class="settings-container">
      <!-- 使用element-plus的表单组件来展示和编辑设置 -->
      <el-form :model="settings" label-width="120px">
        <!-- 深色模式切换 -->
        <el-form-item label="深色模式">
          <el-switch
            v-model="settings.isDarkMode"
            @change="handleDarkModeChange"
          />
        </el-form-item>

        <!-- 模型选择 -->
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

        <!-- Temperature设置 -->
        <el-form-item label="Temperature">
          <el-slider
            v-model="settings.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>

        <!-- 最大Token设置 -->
        <el-form-item label="最大Token">
          <el-input-number
            v-model="settings.maxTokens"
            :min="1"
            :max="4096"
            :step="1"
          />
        </el-form-item>

        <!-- API Key输入 -->
        <el-form-item label="API Key">
          <el-input
            v-model="settings.apiKey"
            type="password"
            show-password
            placeholder="请输入API Key"
          />
        </el-form-item>

        <!-- 流式响应切换 -->
        <el-form-item label="流式响应">
          <el-switch
            v-model="settings.streamResponse"
          />
          <div class="form-item-tip">开启后将实时显示AI回复</div>
        </el-form-item>

        <!-- Top P -->
        <el-form-item label="Top P">
          <el-slider
            v-model="settings.topP"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>

        <!-- Top K -->
        <el-form-item label="Top K">
          <el-input-number
            v-model="settings.topK"
            :min="1"
            :max="100"
            :step="1"
          />
        </el-form-item>
      </el-form>

      <!-- 保存设置按钮 -->
      <div class="settings-footer">
        <el-button type="primary" @click="handleSave">保存设置</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useSettingsStore, modelOptions } from '@/stores/settings'
import { ElMessage } from 'element-plus'

// 定义组件的props
const props = defineProps({
  modelValue: Boolean
})

// 定义组件的emits
const emit = defineEmits(['update:modelValue'])

// 使用设置存储
const settingsStore = useSettingsStore()

// 可见性计算属性，同步抽屉的可见性状态
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/**
 * 获取当前模型的API密钥
 * @returns {string} 当前模型对应的API密钥
 */
const getCurrentApiKey = () => {
  // 首先检查自定义模型
  const customModel = settingsStore.customModels.find(model => model.name === settingsStore.model)
  if (customModel) {
    return customModel.apiKey
  }
  
  // 从modelOptions中查找当前模型的默认API密钥
  const modelConfig = modelOptions.find(option => option.value === settingsStore.model)
  if (modelConfig && modelConfig.defaultApiKey) {
    return settingsStore.apiKey || modelConfig.defaultApiKey
  }
  
  return settingsStore.apiKey
}

// 设置对象，使用reactive进行响应式处理
const settings = reactive({
  isDarkMode: settingsStore.isDarkMode,
  model: settingsStore.model,
  temperature: settingsStore.temperature,
  maxTokens: settingsStore.maxTokens,
  apiKey: getCurrentApiKey(),
  streamResponse: settingsStore.streamResponse,
  topP: settingsStore.topP,
  topK: settingsStore.topK
})

// 监听模型变化，自动更新API密钥显示
watch(() => settings.model, (newModel) => {
  const customModel = settingsStore.customModels.find(model => model.name === newModel)
  if (customModel) {
    settings.apiKey = customModel.apiKey
  } else {
    // 从modelOptions中查找当前模型的默认API密钥
    const modelConfig = modelOptions.find(option => option.value === newModel)
    settings.apiKey = modelConfig ? modelConfig.defaultApiKey : settingsStore.apiKey
  }
})

// 处理深色模式切换
const handleDarkModeChange = (value) => {
  settingsStore.toggleDarkMode()
}

// 保存设置
const handleSave = () => {
  console.log('🔧 === 保存设置调试信息 ===')
  console.log('🔧 handleSave 函数被调用')
  console.log('🔧 保存前 - settingsStore.model:', settingsStore.model)
  console.log('🔧 保存前 - settings.model:', settings.model)
  console.log('🔧 保存前 - localStorage值:', localStorage.getItem('ai-chat-settings'))
  
  // 检查当前模型是否为自定义模型
  const customModelIndex = settingsStore.customModels.findIndex(model => model.name === settings.model)
  
  if (customModelIndex !== -1) {
    // 如果是自定义模型，更新customModels中的apiKey
    settingsStore.customModels[customModelIndex].apiKey = settings.apiKey
  } else {
    // 如果是默认模型，更新settingsStore的apiKey
    settingsStore.apiKey = settings.apiKey
  }
  
  // 直接更新 store 的 model 属性
  settingsStore.model = settings.model
  
  // 更新其他设置
  settingsStore.updateSettings({
    isDarkMode: settings.isDarkMode,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    streamResponse: settings.streamResponse,
    topP: settings.topP,
    topK: settings.topK
  })
  
  console.log('🔧 保存后 - settingsStore.model:', settingsStore.model)
  console.log('🔧 保存后 - localStorage值:', localStorage.getItem('ai-chat-settings'))
  console.log('🔧 === 保存设置完成 ===')
  
  ElMessage.success('设置已保存')
  visible.value = false
}
</script>

<style lang="scss" scoped>

// 设置页面样式
.settings-container {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 保存按钮布局
.settings-footer {
  margin-top: auto;
  padding-top: 1rem;
  text-align: right;
}

// 全宽样式，用于表单项
.w-full {
  width: 100%;
}

// 表单项提示样式
.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>