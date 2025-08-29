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
    async sendMessage(messages, stream = false, modelConfig = null) {
        const settingsStore = useSettingsStore()
        
        // 如果没有提供模型配置，使用全局设置
        // 如果提供了模型配置但某些值为null，则回退到全局设置
        const modelSettings = {
            model: (modelConfig && modelConfig.model) || settingsStore.model,
            temperature: (modelConfig && modelConfig.temperature !== null) ? modelConfig.temperature : settingsStore.temperature,
            maxTokens: (modelConfig && modelConfig.maxTokens !== null) ? modelConfig.maxTokens : settingsStore.maxTokens,
            topP: (modelConfig && modelConfig.topP !== null) ? modelConfig.topP : settingsStore.topP,
            topK: (modelConfig && modelConfig.topK !== null) ? modelConfig.topK : settingsStore.topK,
            repetitionPenalty: (modelConfig && modelConfig.repetitionPenalty !== null) ? modelConfig.repetitionPenalty : settingsStore.repetitionPenalty,
            frequencyPenalty: (modelConfig && modelConfig.frequencyPenalty !== null) ? modelConfig.frequencyPenalty : settingsStore.frequencyPenalty,
            presencePenalty: (modelConfig && modelConfig.presencePenalty !== null) ? modelConfig.presencePenalty : settingsStore.presencePenalty,
            stopSequences: (modelConfig && modelConfig.stopSequences !== null) ? modelConfig.stopSequences : settingsStore.stopSequences,
            seed: (modelConfig && modelConfig.seed !== null) ? modelConfig.seed : settingsStore.seed,
            minP: (modelConfig && modelConfig.minP !== null) ? modelConfig.minP : settingsStore.minP
        }
        
        const payload = {
            model: modelSettings.model,
            messages,
            temperature: modelSettings.temperature,
            max_tokens: modelSettings.maxTokens,
            stream,
            top_p: modelSettings.topP,
            top_k: modelSettings.topK,
            repetition_penalty: modelSettings.repetitionPenalty,
            frequency_penalty: modelSettings.frequencyPenalty,
            presence_penalty: modelSettings.presencePenalty,
            min_p: modelSettings.minP,
            n: 1,
            response_format: {
                type: "text"
            }
        }
        
        // 添加可选参数
        if (modelSettings.stopSequences && modelSettings.stopSequences.length > 0) {
            payload.stop = modelSettings.stopSequences
        }
        
        if (modelSettings.seed !== null && modelSettings.seed !== undefined) {
            payload.seed = modelSettings.seed
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

    async sendAsyncMessage(messages, modelConfig = null) {
        const settingsStore = useSettingsStore()
        
        // 如果没有提供模型配置，使用全局设置
        // 如果提供了模型配置但某些值为null，则回退到全局设置
        const modelSettings = {
            model: (modelConfig && modelConfig.model) || settingsStore.model,
            temperature: (modelConfig && modelConfig.temperature !== null) ? modelConfig.temperature : settingsStore.temperature,
            maxTokens: (modelConfig && modelConfig.maxTokens !== null) ? modelConfig.maxTokens : settingsStore.maxTokens,
            topP: (modelConfig && modelConfig.topP !== null) ? modelConfig.topP : settingsStore.topP,
            topK: (modelConfig && modelConfig.topK !== null) ? modelConfig.topK : settingsStore.topK,
            repetitionPenalty: (modelConfig && modelConfig.repetitionPenalty !== null) ? modelConfig.repetitionPenalty : settingsStore.repetitionPenalty,
            frequencyPenalty: (modelConfig && modelConfig.frequencyPenalty !== null) ? modelConfig.frequencyPenalty : settingsStore.frequencyPenalty,
            presencePenalty: (modelConfig && modelConfig.presencePenalty !== null) ? modelConfig.presencePenalty : settingsStore.presencePenalty,
            stopSequences: (modelConfig && modelConfig.stopSequences !== null) ? modelConfig.stopSequences : settingsStore.stopSequences,
            seed: (modelConfig && modelConfig.seed !== null) ? modelConfig.seed : settingsStore.seed,
            minP: (modelConfig && modelConfig.minP !== null) ? modelConfig.minP : settingsStore.minP
        }
        
        const payload = {
            model: modelSettings.model,
            messages,
            temperature: modelSettings.temperature,
            max_tokens: modelSettings.maxTokens,
            top_p: modelSettings.topP,
            top_k: modelSettings.topK,
            repetition_penalty: modelSettings.repetitionPenalty,
            frequency_penalty: modelSettings.frequencyPenalty,
            presence_penalty: modelSettings.presencePenalty,
            min_p: modelSettings.minP
        }
        
        // 添加可选参数
        if (modelSettings.stopSequences && modelSettings.stopSequences.length > 0) {
            payload.stop = modelSettings.stopSequences
        }
        
        if (modelSettings.seed !== null && modelSettings.seed !== undefined) {
            payload.seed = modelSettings.seed
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