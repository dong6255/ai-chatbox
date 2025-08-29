<template>
  <div class="control-panel">
    <div class="prompt-section">
      <div class="section-header">
        <h3>提示词设置</h3>
        <div class="button-group">
          <el-button
            class="save-btn"
            type="primary"
            size="small"
            @click="savePrompt"
          >
            保存配置
          </el-button>
          <el-button
            class="export-btn"
            type="success"
            size="small"
            @click="exportConfig"
          >
            导出配置
          </el-button>
          <el-upload
            ref="uploadRef"
            :show-file-list="false"
            :before-upload="importConfig"
            accept=".json"
            :auto-upload="false"
            :on-change="handleFileChange"
          >
            <el-button class="import-btn" type="warning" size="small">
              导入配置
            </el-button>
          </el-upload>
        </div>
      </div>
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="25"
        placeholder="请输入提示词，例如：你是一个专业的编程助手..."
      />
      <div class="optimize-section">
        <el-button
          class="optimize-btn"
          type="primary"
          size="small"
          @click="optimizePrompt"
        >
          提示词优化
        </el-button>
      </div>
    </div>
    <el-divider />
    <div class="model-section">
      <h3>模型与参数</h3>
      <el-form :model="settings" label-width="120px">
        <el-form-item style="display: flex; align-items: center">
          <template #label>
            <div style="display: flex; align-items: center">
              <span>模型</span>
              <el-tooltip
                content="选择要使用的AI模型，不同模型具有不同的能力和特点"
                placement="top"
              >
                <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-select v-model="settings.model" class="w-full">
            <el-option
              v-for="model in modelOptions"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>Temperature</span>
            <el-tooltip
              content="控制生成文本的随机性，值越高越随机，值越低越确定。范围：0-1"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
            
          </template>
          <el-slider
            v-model="settings.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>最大Token</span>
            <el-tooltip
              content="限制生成文本的最大长度，1个Token约等于0.75个英文单词或1个中文字符"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-input-number
            v-model="settings.maxTokens"
            :min="1"
            :max="4096"
            :step="1"
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>Top P</span>
            <el-tooltip
              content="核采样参数，控制候选词汇的概率质量。值越小生成越集中，值越大生成越多样"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-slider
            v-model="settings.topP"
            :min="0"
            :max="1"
            :step="0.1"
            show-input
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>Top K</span>
            <el-tooltip
              content="限制每次生成时考虑的候选词汇数量，值越小生成越集中"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-input-number
            v-model="settings.topK"
            :min="1"
            :max="100"
            :step="1"
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>重复惩罚</span>
            <el-tooltip
              content="控制重复内容的生成程度，值大于1会减少重复，值小于1会增加重复"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-slider
            v-model="settings.repetitionPenalty"
            :min="0.1"
            :max="2.0"
            :step="0.1"
            show-input
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>频率惩罚</span>
            <el-tooltip
              content="根据词汇在文本中的出现频率进行惩罚，正值减少高频词使用，负值增加高频词使用"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-slider
            v-model="settings.frequencyPenalty"
            :min="-2.0"
            :max="2.0"
            :step="0.1"
            show-input
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>存在惩罚</span>
            <el-tooltip
              content="根据词汇是否已出现进行惩罚，正值鼓励生成新词汇和话题，负值倾向于重复已有内容"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-slider
            v-model="settings.presencePenalty"
            :min="-2.0"
            :max="2.0"
            :step="0.1"
            show-input
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>最小概率</span>
            <el-tooltip
              content="设置候选词汇的最小概率阈值，低于此值的词汇将被过滤掉"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-slider
            v-model="settings.minP"
            :min="0"
            :max="1"
            :step="0.01"
            show-input
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>种子值</span>
            <el-tooltip
              content="用于生成可重现的结果，相同的种子值在相同条件下会产生相同的输出"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-input-number
            v-model="settings.seed"
            :min="0"
            :max="999999"
            :step="1"
            style="width: 200px;"
            placeholder="留空为随机"
          />
        </el-form-item>
        <el-form-item>
          <template #label>
            <div style="display: flex; align-items: center">
              <span>停止序列</span>
            <el-tooltip
              content="当生成的文本包含这些序列时会停止生成，每行输入一个停止序列"
              placement="top"
            >
              <el-icon class="param-help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
            </div>
          </template>
          <el-input
            v-model="stopSequencesText"
            type="textarea"
            :rows="2"
            placeholder="每行一个停止序列"
            @input="updateStopSequences"
          />
        </el-form-item>
      </el-form>
    </div>
    <el-divider />
    <!-- <div class="kb-section">
      <h3>知识库接入</h3>
      <el-input placeholder="暂未实现" disabled />
    </div>
    <el-divider />
    <div class="data-section">
      <h3>数据源接入</h3>
      <el-input placeholder="暂未实现" disabled />
    </div> -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, toRef } from "vue";
import { useSettingsStore, modelOptions } from "../stores/settings";
import { useChatStore } from "../stores/chat";
import { ElMessage } from "element-plus";
import { QuestionFilled } from "@element-plus/icons-vue";

/**
 * 导出配置
 */
const exportConfig = () => {
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
                duration: 5000,
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
 * 提示词优化 - 跳转到百度页面
 */
const optimizePrompt = () => {
  window.open("http://1.95.145.238:18181/", "_blank");
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
.prompt-section,
.model-section,
.kb-section {
  margin-bottom: 1rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.section-header h3 {
  margin: 0;
  color: #333;
}
.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}
.optimize-section {
  margin-top: 10px;
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
</style>
