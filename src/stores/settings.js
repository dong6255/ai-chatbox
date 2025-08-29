// 引入 Pinia 的 defineStore 方法，用于定义一个新的 store
import { defineStore } from 'pinia'

// 定义一个名为 'settings' 的 store
export const useSettingsStore = defineStore('settings', {
    // 定义 store 的状态
    state: () => ({
        // 是否启用深色模式，默认为 false
        isDarkMode: false,
        // 温度参数，控制生成文本的随机性，默认值为 0.7
        temperature: 0.7,
        // 最大 token 数量，默认值为 1000
        maxTokens: 1000,
        // 使用的模型名称，默认为 'THUDM/glm-4-9b-chat'
        model: 'Qwen/Qwen3-8B',
        // API 密钥，默认为空字符串
        apiKey: 'sk-nzipogwhzfiwbqwzjlmqdhzioxj',
        // 是否启用流式响应，默认为 true
        streamResponse: true,
        // Top P 参数
        topP: 0.7,
        // Top K 参数
        topK: 50,
        // 重复惩罚参数，控制重复内容的生成
        repetitionPenalty: 1.1,
        // 频率惩罚参数，降低高频词汇的使用
        frequencyPenalty: 0.0,
        // 存在惩罚参数，鼓励生成新的主题
        presencePenalty: 0.0,
        // 停止序列，遇到这些序列时停止生成
        stopSequences: [],
        // 种子值，用于生成可重现的结果
        seed: null,
        // 最小概率阈值
        minP: 0.0,
        // 系统提示词，默认为空字符串
        systemPrompt: '',
        // 自定义模型配置
        customModels: [
            {
                name: 'Qwen/Qwen3-Coder-30B-A3B-Instruct',
                label: 'Qwen3-Coder-30B',
                apiKey: 'sk-nzipogwhzfiwbqwzjlmqdhzioxj',
                baseUrl: 'https://api.siliconflow.cn/v1'
            }
        ],
    }),

    // 定义 store 的动作
    actions: {
        // 切换深色模式
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode
            // 根据当前的深色模式状态设置 HTML 元素的 data-theme 属性
            document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
        },

        // 更新设置
        updateSettings(settings) {
            // 使用 Object.assign 方法将传入的设置对象合并到当前 store 的状态中
            Object.assign(this.$state, settings)
        },
    },

    // 配置持久化选项
    persist: {
        // 存储键名
        key: 'ai-chat-settings',
        // 存储方式，这里使用的是 localStorage
        storage: localStorage,
    },
})

// 导出模型选项供其他组件使用
export const modelOptions = [
    // { label: 'GLM-4-9B', value: 'THUDM/glm-4-9b-chat' },
    // { label: 'Qwen2.5-7B', value: 'Qwen/Qwen2.5-7B-Instruct' },
    // { label: 'Qwen2.5-Coder-7B', value: 'Qwen/Qwen2.5-Coder-7B-Instruct' },
    { label: 'Qwen3-Coder-30B', value: 'Qwen/Qwen3-Coder-30B-A3B-Instruct' },
    { label: 'Qwen3-8B', value: 'Qwen/Qwen3-8B' },
    { label: 'DeepSeek-R1-0528-Qwen3-8B', value: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B' },
    // { label: 'Meta-Llama-3.1-8B', value: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
    // { label: 'Gemma-2-9B', value: 'google/gemma-2-9b-it' },  //不知道为什么用不了
    // { label: 'DeepSeek-V2.5', value: 'deepseek-ai/DeepSeek-V2.5' },
]