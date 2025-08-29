import { useSettingsStore } from '../stores/settings'

const API_BASE_URL = 'https://api.siliconflow.cn/v1'

/**
 * 获取当前模型的配置信息
 * @returns {Object} 包含apiKey和baseUrl的配置对象
 */
const getCurrentModelConfig = () => {
    const settingsStore = useSettingsStore()
    
    // 检查是否为自定义模型
    const customModel = settingsStore.customModels.find(model => model.name === settingsStore.model)
    
    if (customModel) {
        return {
            apiKey: customModel.apiKey,
            baseUrl: customModel.baseUrl
        }
    }
    
    // 默认配置
    return {
        apiKey: settingsStore.apiKey,
        baseUrl: API_BASE_URL
    }
}

/**
 * 创建请求头
 * @returns {Object} 请求头对象
 */
const createHeaders = () => {
    const config = getCurrentModelConfig()
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
    }
}

export const chatApi = {
    async sendMessage(messages, stream = false) {
        const settingsStore = useSettingsStore()
        
        const payload = {
            model: settingsStore.model,
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens,
            stream,
            top_p: 0.7,
            top_k: 50,
            frequency_penalty: 0.5,
            n: 1,
            response_format: {
                type: "text"
            },
            tools: [{
                type: "function",
                function: {
                    description: "<string>",
                    name: "<string>",
                    parameters: {},
                    strict: true
                }
            }]
        }

        const config = getCurrentModelConfig()
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                ...createHeaders(),
                ...(stream && { 'Accept': 'text/event-stream' })
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (stream) {
            return response
        }

        return await response.json()
    },

    async sendAsyncMessage(messages) {
        const settingsStore = useSettingsStore()
        
        const payload = {
            model: settingsStore.model,
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens
        }

        const config = getCurrentModelConfig()
        const response = await fetch(`${config.baseUrl}/async/chat/completions`, {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    },

    async getAsyncResult(taskId) {
        const config = getCurrentModelConfig()
        const response = await fetch(`${config.baseUrl}/async-result/${taskId}`, {
            method: 'GET',
            headers: createHeaders()
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    }
}