<template>
  <div class="control-panel">
    <div class="prompt-section">
      <h3>提示词设置</h3>
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="4"
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSettingsStore, modelOptions } from '../stores/settings'
import { ElMessage } from 'element-plus'

const settingsStore = useSettingsStore()
const prompt = ref('')
const settings = reactive({
  model: settingsStore.model,
  temperature: settingsStore.temperature,
  maxTokens: settingsStore.maxTokens,
  topP: settingsStore.topP,
  topK: settingsStore.topK
})

const savePrompt = () => {
  ElMessage.success('提示词已保存')
}

const saveSettings = () => {
  settingsStore.updateSettings(settings)
  ElMessage.success('设置已保存')
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
