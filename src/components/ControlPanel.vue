<template>
  <div class="control-panel">

    <div class="prompt-section">
      <div class="section-header">
        <h3>提示词设置</h3>
        <div class="optimize-section">
          <el-button class="optimize-btn" type="primary" size="small" @click="optimizePrompt">
            优化
          </el-button>
        </div>
      </div>
      <el-input v-model="prompt" type="textarea" :rows="32" placeholder="请输入提示词，例如：你是一个专业的编程助手..." />

    </div>
    
    <!-- 知识库模块 -->
    <div class="kb-section">
      <div class="section-header">
        <h3>知识库设置</h3>
        <div class="kb-actions">
          <el-button type="primary" size="small" @click="showKnowledgeBaseDialog = true">
            添加
          </el-button>
        </div>
      </div>
      <div class="kb-content">
        <div class="kb-list" v-if="selectedKnowledgeBases.length > 0">
          <div v-for="kb in selectedKnowledgeBases" :key="kb.id" class="kb-item">
            <span class="kb-name">{{ kb.name }}</span>
            <el-button type="text" size="small" @click="removeKnowledgeBase(kb.id)">
              移除
            </el-button>
          </div>
        </div>
        <div v-else class="kb-empty">
          <span class="empty-text">暂未选择知识库</span>
        </div>
      </div>
      </div>

      <!-- 数据源配置 -->
      <div class="kb-section">
        <div class="section-header">
          <h3>数据源配置</h3>
          <el-button 
            type="primary" 
            size="small" 
            @click="showDataSourceDialog = true"
          >
            添加
          </el-button>
        </div>
        
        <div class="kb-content">
          <div class="kb-list" v-if="selectedDataSources.length > 0">
            <div 
              v-for="dataSource in selectedDataSources" 
              :key="dataSource.id" 
              class="kb-item"
            >
              <span class="kb-name">{{ dataSource.name }}</span>
              <el-button 
                type="text" 
                size="small" 
                @click="removeDataSource(dataSource.id)"
              >
                移除
              </el-button>
            </div>
          </div>
          
          <div v-else class="kb-empty">
            <span class="empty-text">暂无配置的数据源</span>
          </div>
        </div>
      </div>

      <!-- 数据源选择弹窗 -->
      <el-dialog
        v-model="showDataSourceDialog"
        title="选择数据源"
        width="500px"
        @close="handleDataSourceDialogClose"
      >
        <div class="kb-dialog-content">
          <div v-if="availableDataSources.length === 0" class="no-kb-message">
            <span class="empty-text">暂无可用数据源</span>
          </div>
          <div v-else class="kb-selection-list">
            <el-checkbox-group v-model="tempSelectedDataSources">
              <div 
                v-for="dataSource in availableDataSources" 
                :key="dataSource.id" 
                class="kb-selection-item"
              >
                <el-checkbox :label="dataSource.id">
                  {{ dataSource.name }}
                </el-checkbox>
                <div v-if="dataSource.description" class="kb-description">
                  {{ dataSource.description }}
                </div>
              </div>
            </el-checkbox-group>
          </div>
        </div>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDataSourceDialog = false">取消</el-button>
            <el-button 
              type="primary" 
              @click="confirmDataSourceSelection"
              :disabled="availableDataSources.length === 0"
            >
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
    
    <!-- 知识库选择弹窗 -->
    <el-dialog
      v-model="showKnowledgeBaseDialog"
      title="选择知识库"
      width="500px"
      :before-close="handleDialogClose"
    >
      <div class="kb-dialog-content">
        <div v-if="availableKnowledgeBases.length === 0" class="no-kb-message">
          <el-empty description="暂无可用知识库" />
        </div>
        <div v-else class="kb-selection-list">
          <div v-for="kb in availableKnowledgeBases" :key="kb.id" class="kb-selection-item">
            <el-checkbox
              v-model="kb.selected"
              @change="handleKnowledgeBaseSelection(kb)"
            >
              {{ kb.name }}
            </el-checkbox>
            <span class="kb-description">{{ kb.description }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showKnowledgeBaseDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmKnowledgeBaseSelection">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, toRef } from "vue";
import { useSettingsStore, modelOptions } from "@/stores/settings";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";
import { QuestionFilled, ArrowDown } from "@element-plus/icons-vue";

const authStore = useAuthStore();
/**
 * 导出配置
 */
const exportConfig = () => {
    if (!authStore.isLoggedIn) {
    ElMessage.warning("请先登录后再导出配置");
    return;
  }
  if (!chatStore.activeConversationId) {
    ElMessage.warning("请先创建或选择一个对话");
    return;
  }

  const config = {
    systemPrompt: prompt.value,
    modelConfig: {
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      topP: settings.topP,
      topK: settings.topK,
      repetitionPenalty: settings.repetitionPenalty,
      frequencyPenalty: settings.frequencyPenalty,
      presencePenalty: settings.presencePenalty,
      stopSequences: settings.stopSequences,
      seed: settings.seed,
      minP: settings.minP,
    },
    exportTime: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chat-config-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  ElMessage.success("配置已导出");
};

/**
 * 导入配置
 */
const uploadRef = ref();
const importConfig = (file) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning("请先登录后再导入配置");
    return false; // 阻止上传
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result);

      // 验证配置格式
      if (!config.systemPrompt && !config.modelConfig) {
        ElMessage.error("配置文件格式不正确");
        return;
      }

      if (!chatStore.activeConversationId) {
        ElMessage.warning("请先创建或选择一个对话");
        return;
      }

      // 导入系统提示词
      if (config.systemPrompt) {
        prompt.value = config.systemPrompt;
        // 保存到当前对话
        chatStore.updateConversationSystemPrompt(
          chatStore.activeConversationId,
          config.systemPrompt
        );
        // 同时更新全局设置以触发持久化
        settingsStore.updateSettings({ systemPrompt: config.systemPrompt });
      }

      // 导入模型配置
      if (config.modelConfig) {
        Object.assign(settings, config.modelConfig);
        // 保存到当前对话
        chatStore.updateConversationModelConfig(
          chatStore.activeConversationId,
          config.modelConfig
        );
        // 同时更新全局设置以触发持久化
        settingsStore.updateSettings(config.modelConfig);
      }

      // 强制触发界面更新
      nextTick(() => {
        // 重新获取当前对话的配置以确保界面同步
        const newSystemPrompt = getCurrentSystemPrompt();
        const newModelConfig = getCurrentModelConfig();
        prompt.value = newSystemPrompt;
        Object.assign(settings, newModelConfig);

        // 验证导入是否成功并显示详细信息
        setTimeout(() => {
          try {
            const chatData = localStorage.getItem("ai-chat-history");
            const settingsData = localStorage.getItem("ai-chat-settings");

            let successMessages = [];

            // 检查导入的内容
            if (config.systemPrompt) {
              successMessages.push("✓ 系统提示词已导入");
            }

            if (config.modelConfig) {
              const configKeys = Object.keys(config.modelConfig);
              successMessages.push(
                `✓ 模型配置已导入 (${configKeys.join(", ")})`
              );
            }

            // 检查localStorage状态
            if (chatData && chatData !== "null") {
              successMessages.push("✓ 对话数据已保存到localStorage");
            }

            if (settingsData && settingsData !== "null") {
              successMessages.push("✓ 全局设置已保存到localStorage");
            } else {
              successMessages.push("⚠ 全局设置未保存（可能是首次使用）");
            }

            // 显示详细的成功信息
            if (successMessages.length > 0) {
              ElMessage({
                message: `配置导入完成！\n\n${successMessages.join(
                  "\n"
                )}\n\n请刷新页面验证配置是否生效。`,
                type: "success",
                duration: 1000,
                dangerouslyUseHTMLString: false,
              });
            } else {
              ElMessage.warning("配置导入完成，但未检测到有效配置项");
            }

            // 输出调试信息到控制台
            console.log("导入配置调试信息:", {
              config,
              chatData: chatData ? "已存在" : "不存在",
              settingsData: settingsData ? "已存在" : "不存在",
              activeConversationId: chatStore.activeConversationId,
            });
          } catch (error) {
            console.error("验证导入状态时出错:", error);
            ElMessage.error("配置导入验证失败，请查看控制台错误信息");
          }
        }, 200); // 增加等待时间确保数据已保存
      });
    } catch (error) {
      ElMessage.error("配置文件解析失败");
    }
  };
  reader.readAsText(file);
  return false; // 阻止自动上传
};

/**
 * 处理文件选择变化事件
 */
const handleFileChange = (file, fileList) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning("请先登录后再导入配置");
    return;
  }
  console.log("文件选择事件触发:", file);
  if (file && file.raw) {
    importConfig(file.raw);
  }
};

const settingsStore = useSettingsStore();
const chatStore = useChatStore();

// 获取当前对话的系统提示词
const getCurrentSystemPrompt = () => {
  const currentConversation = chatStore.currentConversation;
  return currentConversation ? currentConversation.systemPrompt : "";
};

// 获取当前对话的模型配置
const getCurrentModelConfig = () => {
  const currentConversation = chatStore.currentConversation;
  const defaultConfig = {
    model: settingsStore.model,
    temperature: settingsStore.temperature,
    maxTokens: settingsStore.maxTokens,
    topP: settingsStore.topP,
    topK: settingsStore.topK,
    repetitionPenalty: settingsStore.repetitionPenalty,
    frequencyPenalty: settingsStore.frequencyPenalty,
    presencePenalty: settingsStore.presencePenalty,
    stopSequences: settingsStore.stopSequences,
    seed: settingsStore.seed,
    minP: settingsStore.minP,
  };

  if (currentConversation && currentConversation.modelConfig) {
    const cfg = currentConversation.modelConfig;
    return {
      model: cfg.model ?? defaultConfig.model,
      temperature: cfg.temperature ?? defaultConfig.temperature,
      maxTokens: cfg.maxTokens ?? defaultConfig.maxTokens,
      topP: cfg.topP ?? defaultConfig.topP,
      topK: cfg.topK ?? defaultConfig.topK,
      repetitionPenalty:
        cfg.repetitionPenalty ?? defaultConfig.repetitionPenalty,
      frequencyPenalty: cfg.frequencyPenalty ?? defaultConfig.frequencyPenalty,
      presencePenalty: cfg.presencePenalty ?? defaultConfig.presencePenalty,
      stopSequences: cfg.stopSequences ?? defaultConfig.stopSequences,
      seed: cfg.seed ?? defaultConfig.seed,
      minP: cfg.minP ?? defaultConfig.minP,
    };
  }

  return { ...defaultConfig };
};

const prompt = ref(getCurrentSystemPrompt());
const settings = reactive({ ...getCurrentModelConfig() });

// 知识库相关状态
const showKnowledgeBaseDialog = ref(false);
const selectedKnowledgeBases = ref([]);
const availableKnowledgeBases = ref([]);

// 数据源相关状态
const showDataSourceDialog = ref(false);
const selectedDataSources = ref([]);
const availableDataSources = ref([]);
const tempSelectedDataSources = ref([]);

/**
 * 处理知识库选择变化
 * @param {Object} kb - 知识库对象
 */
const handleKnowledgeBaseSelection = (kb) => {
  console.log('知识库选择变化:', kb);
};

/**
 * 移除已选择的知识库
 * @param {string} kbId - 知识库ID
 */
const removeKnowledgeBase = (kbId) => {
  selectedKnowledgeBases.value = selectedKnowledgeBases.value.filter(kb => kb.id !== kbId);
  ElMessage.success('知识库已移除');
};

/**
 * 确认知识库选择
 */
const confirmKnowledgeBaseSelection = () => {
  const selected = availableKnowledgeBases.value.filter(kb => kb.selected);
  
  // 合并新选择的知识库，避免重复
  selected.forEach(kb => {
    if (!selectedKnowledgeBases.value.find(existing => existing.id === kb.id)) {
      selectedKnowledgeBases.value.push({
        id: kb.id,
        name: kb.name,
        description: kb.description
      });
    }
  });
  
  showKnowledgeBaseDialog.value = false;
  
  if (selected.length > 0) {
    ElMessage.success(`已添加 ${selected.length} 个知识库`);
  }
};

/**
 * 处理弹窗关闭
 */
const handleDialogClose = () => {
  // 重置选择状态
  availableKnowledgeBases.value.forEach(kb => {
    kb.selected = false;
  });
  showKnowledgeBaseDialog.value = false;
};

/**
 * 移除已选择的数据源
 * @param {string} dataSourceId - 数据源ID
 */
const removeDataSource = (dataSourceId) => {
  selectedDataSources.value = selectedDataSources.value.filter(ds => ds.id !== dataSourceId);
  ElMessage.success('数据源已移除');
};

/**
 * 确认数据源选择
 */
const confirmDataSourceSelection = () => {
  const selected = availableDataSources.value.filter(ds => 
    tempSelectedDataSources.value.includes(ds.id)
  );
  
  // 合并新选择的数据源，避免重复
  selected.forEach(ds => {
    if (!selectedDataSources.value.find(existing => existing.id === ds.id)) {
      selectedDataSources.value.push({
        id: ds.id,
        name: ds.name
      });
    }
  });
  
  showDataSourceDialog.value = false;
  tempSelectedDataSources.value = [];
  
  if (selected.length > 0) {
    ElMessage.success(`已添加 ${selected.length} 个数据源`);
  }
};

/**
 * 处理数据源弹窗关闭
 */
const handleDataSourceDialogClose = () => {
  tempSelectedDataSources.value = [];
  showDataSourceDialog.value = false;
};

// 停止序列的文本表示
const stopSequencesText = ref("");

/**
 * 更新停止序列数组
 */
const updateStopSequences = () => {
  const sequences = stopSequencesText.value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  settings.stopSequences = sequences;
};

/**
 * 初始化停止序列文本
 */
const initStopSequencesText = () => {
  if (settings.stopSequences && Array.isArray(settings.stopSequences)) {
    stopSequencesText.value = settings.stopSequences.join("\n");
  } else {
    stopSequencesText.value = "";
  }
};

// 存储初始配置值用于比较
const initialPrompt = ref(getCurrentSystemPrompt());
const initialSettings = reactive({ ...getCurrentModelConfig() });

// 配置是否被修改的状态
const isConfigModified = ref(false);

// 监听当前对话变化，自动更新提示词和模型配置显示
watch(
  () => chatStore.activeConversationId,
  () => {
    prompt.value = getCurrentSystemPrompt();
    // 更新模型配置
    const newModelConfig = getCurrentModelConfig();
    Object.assign(settings, newModelConfig);

    // 初始化停止序列文本
    initStopSequencesText();

    // 重置初始值和修改状态
    initialPrompt.value = prompt.value;
    Object.assign(initialSettings, newModelConfig);
    isConfigModified.value = false;
  },
  { immediate: true }
);

/**
 * 检查配置是否被修改
 */
const checkConfigModified = () => {
  const promptChanged = prompt.value !== initialPrompt.value;
  const settingsChanged =
    JSON.stringify(settings, (key, value) =>
      value === undefined ? null : value
    ) !==
    JSON.stringify(initialSettings, (key, value) =>
      value === undefined ? null : value
    );
  isConfigModified.value = promptChanged || settingsChanged;
};

// 监听提示词变化
watch(prompt, (newPrompt) => {
  checkConfigModified();
  // 实时保存提示词到当前对话（不清空聊天记录）
  if (chatStore.activeConversationId) {
    chatStore.updateConversationSystemPrompt(
      chatStore.activeConversationId,
      newPrompt
    );
  }
});

// 监听设置变化
watch(
  settings,
  (newSettings) => {
    checkConfigModified();
    // 实时保存模型配置到当前对话
    if (chatStore.activeConversationId) {
      chatStore.updateConversationModelConfig(
        chatStore.activeConversationId,
        newSettings
      );
    }
    // 同时更新全局设置，确保模型选择生效
    settingsStore.updateSettings({
      model: newSettings.model,
      temperature: newSettings.temperature,
      maxTokens: newSettings.maxTokens,
      topP: newSettings.topP,
      topK: newSettings.topK,
      repetitionPenalty: newSettings.repetitionPenalty,
      frequencyPenalty: newSettings.frequencyPenalty,
      presencePenalty: newSettings.presencePenalty,
      stopSequences: newSettings.stopSequences,
      seed: newSettings.seed,
      minP: newSettings.minP
    });
  },
  { deep: true }
);

/**
 * 应用配置更改（清空聊天记录并重置修改状态）
 */
const savePrompt = () => {
  if (!chatStore.activeConversationId) {
    ElMessage.warning("请先创建或选择一个对话");
    return;
  }

  // 配置已经通过watch实时保存，这里只需要清空聊天记录
  chatStore.clearMessages();

  // 重置配置修改状态
  initialPrompt.value = prompt.value;
  initialSettings.value = JSON.parse(
    JSON.stringify(settings.value, (key, value) =>
      value === undefined ? null : value
    )
  );
  isConfigModified.value = false;

  ElMessage.success("配置已应用，对话记录已清空");
};

/**
 * 提示词优化 - 跳转到优化页面并传递原始提示词
 */
const optimizePrompt = () => {
  window.open("http://29.2.16.115:18181/", "_blank");
};

// 暴露给父组件的状态和方法
defineExpose({
  isConfigModified: toRef(() => isConfigModified.value),
});
</script>

<style scoped>
.control-panel {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

/* 提示词部分样式 - 添加边框和圆角 */
.prompt-section {
  margin-bottom: 1rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.model-section,
.kb-section {
  margin-bottom: 1rem;
}

/* 提示词标题区域 - 浅灰色背景 */
.prompt-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 12px 16px;
  background-color: #f5f7fa;
  /* border-bottom: 1px solid #e4e7ed; */
}

/* 其他section的header保持原样 */
.model-section .section-header,
.kb-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.optimize-section {
  /* margin-top: 10px; */
}

.save-btn,
.optimize-btn,
.export-btn,
.import-btn {
  flex: 1;
  min-width: 80px;
}

.el-upload {
  flex: 1;
  min-width: 80px;
  display: flex;
}

.el-upload .el-button {
  width: 100%;
  flex: 1;
}

.el-upload__input {
  display: none !important;
}

.w-full {
  width: 100%;
}

.param-help-icon {
  margin-left: 8px;
  color: #909399;
  cursor: help;
  font-size: 14px;
  vertical-align: middle;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.param-help-icon:hover {
  color: #409eff;
  border-color: #409eff;
  background-color: #f0f9ff;
}

/* 增加模型参数区域的间距 */
.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  padding-right: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.el-input,
.el-select,
.el-input-number {
  font-size: 14px;
}

.el-textarea .el-textarea__inner {
  font-size: 14px;
  line-height: 1.5;
  padding: 10px;
}

/* 提示词输入框区域内边距 */
.prompt-section .el-input {
  margin: 16px;
  width: calc(100% - 32px);
}

.prompt-section .el-input .el-textarea__inner {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.prompt-section .el-input .el-textarea__inner:focus {
  border-color: #409eff;
}

/* 知识库模块样式 */
.kb-section {
  margin-bottom: 1rem;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.kb-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.kb-content {
  padding: 16px;
  min-height: 60px;
}

.kb-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kb-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.3s;
}

.kb-item:hover {
  background-color: #e9ecef;
  border-color: #409eff;
}

.kb-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.kb-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  color: #909399;
  font-size: 14px;
}

.empty-text {
  color: #909399;
}

/* 知识库弹窗样式 */
.kb-dialog-content {
  min-height: 200px;
}

.no-kb-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.kb-selection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.kb-selection-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  transition: all 0.3s;
}

.kb-selection-item:hover {
  background-color: #f5f7fa;
  border-color: #409eff;
}

.kb-description {
  font-size: 12px;
  color: #909399;
  margin-left: 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
