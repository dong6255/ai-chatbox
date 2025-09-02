// 引入 Pinia 的 defineStore 方法，用于定义一个新的 store
import { defineStore } from 'pinia'

// 定义一个名为 'settings' 的 store
export const useSettingsStore = defineStore('settings', {
    // 定义 store 的状态
    state: () => ({
        // 是否启用深色模式，默认为 false
        isDarkMode: false,
        // 温度参数，控制生成文本的随机性，推荐默认值为 0.8（平衡创造性和一致性）
        temperature: 0.7,
        // 最大 token 数量，推荐默认值为 2048（适合大多数对话场景）
        maxTokens: 4096,
        // 使用的模型名称，默认为 'Qwen/Qwen3-8B'
        model: 'Qwen/Qwen3-8B',
        // API 密钥，默认为空字符串
        apiKey: 'sk-nzipogwhzfiwbqwzjlmqdhzioxjplvwq',
        // 是否启用流式响应，默认为 true
        streamResponse: true,
        // Top P 参数，推荐默认值为 0.9（保持较好的多样性）
        topP: 0.9,
        // Top K 参数，推荐默认值为 40（平衡质量和多样性）
        topK: 40,
        // 重复惩罚参数，推荐默认值为 1.05（轻微减少重复）
        repetitionPenalty: 1.05,
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
                apiKey: 'sk-nzipogwhzfiwbqwpl',
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

        /**
         * 获取推荐的默认模型配置
         * 用于新对话创建时的初始参数设置
         * @returns {Object} 推荐的默认配置对象
         */
        getRecommendedDefaults() {
            return {
                model: 'qwen3_tool',
                temperature: 0.7,
                maxTokens: 4096,
                topP: 0.7,
                topK: 40,
                repetitionPenalty: 1.05
            }
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

/**
 * 模型配置选项
 * 每个模型包含标签、值、API地址和默认API密钥
 */
export const modelOptions = [
    {
        label: 'Qwen3-Coder-30B',
        value: 'Qwen/Qwen3-Coder-30B-A3B-Instruct',
        baseUrl: 'https://api.siliconflow.cn/v1',
        defaultApiKey: 'sk-nzipogwhzfiwbqwzjlmqdhzqhiwt'
    },
    {
        label: 'Qwen3-8B',
        value: 'Qwen/Qwen3-8B',
        baseUrl: 'https://api.siliconflow.cn/v1',
        defaultApiKey: 'sk-nzipogwhzfiwbqwzjlmqdhzihiwt'
    },
    {
        label: 'DeepSeek-R1',
        value: 'DeepSeek-R1-671B',
        baseUrl: 'http://29.1.124.133:1025/v1',
        defaultApiKey: 'sk-nzipogwhzfiwbqwzjlmqdhzioxjpl'
    },
    // {
    //     label: 'DeepSeek-R1-671B(数据域)',
    //     value: 'DeepSeek-R1-671B',
    //     baseUrl: 'http://134.1.31.82:3300/v1',
    //     defaultApiKey: 'sk-DaRX7GbrEVWCa20D9C9D3'
    // },
    {
        label: 'Qwen2.5-72B',
        value: 'qwen2.5-72b',
        baseUrl: 'http://134.1.31.82:3300/v1',
        defaultApiKey: 'sk-DaRX7GbrEVWRHAMBFfF01f06'
    },
    {
        label: 'Qwen3-32B',
        value: 'qwen3_tool',
        baseUrl: 'http://29.2.16.175:8000/v1',
        defaultApiKey: 'sk-DaRX7GbrEVWRHAMBF9D3'
    }
]