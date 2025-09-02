import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSettingsStore } from './settings.js'

export const useChatStore = defineStore('chat', {
    state: () => ({
        // 当前活跃的对话ID
        activeConversationId: null,
        // 所有对话的集合
        conversations: {},
        // 对话列表（用于显示顺序）
        conversationList: [],
        isLoading: false,
        tokenCount: {
            total: 0,
            prompt: 0,
            completion: 0
        }
    }),

    getters: {
        // 获取当前对话的消息
        messages: (state) => {
            if (!state.activeConversationId || !state.conversations[state.activeConversationId]) {
                return []
            }
            return state.conversations[state.activeConversationId].messages
        },
        
        // 获取当前对话信息
        currentConversation: (state) => {
            if (!state.activeConversationId) return null
            return state.conversations[state.activeConversationId]
        }
    },

    actions: {
        /**
         * 创建新对话
         * 使用推荐的默认模型配置参数
         * @returns {string} 新创建的对话ID
         */
        createNewConversation() {
            const id = Date.now().toString()
            const settingsStore = useSettingsStore()
            const recommendedDefaults = settingsStore.getRecommendedDefaults()
            
            const conversation = {
                id,
                title: '新对话',
                messages: [],
                systemPrompt: '', // 每个对话独立的系统提示词
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // 为每个对话添加独立的模型配置，使用推荐的默认值
                modelConfig: {
                    model: recommendedDefaults.model,
                    temperature: recommendedDefaults.temperature,
                    maxTokens: recommendedDefaults.maxTokens,
                    topP: recommendedDefaults.topP,
                    topK: recommendedDefaults.topK,
                    repetitionPenalty: recommendedDefaults.repetitionPenalty
                }
            }
            
            this.conversations[id] = conversation
            this.conversationList.unshift(id)
            this.activeConversationId = id
            
            return id
        },
        
        // 切换对话
        switchConversation(conversationId) {
            if (this.conversations[conversationId]) {
                this.activeConversationId = conversationId
            }
        },
        
        // 删除对话
        deleteConversation(conversationId) {
            if (this.conversations[conversationId]) {
                delete this.conversations[conversationId]
                const index = this.conversationList.indexOf(conversationId)
                if (index > -1) {
                    this.conversationList.splice(index, 1)
                }
                
                // 如果删除的是当前对话，切换到第一个对话或创建新对话
                if (this.activeConversationId === conversationId) {
                    if (this.conversationList.length > 0) {
                        this.activeConversationId = this.conversationList[0]
                    } else {
                        this.createNewConversation()
                    }
                }
            }
        },
        
        // 更新对话标题
        updateConversationTitle(conversationId, title) {
            if (this.conversations[conversationId]) {
                this.conversations[conversationId].title = title
                this.conversations[conversationId].updatedAt = new Date().toISOString()
            }
        },
        
        // 更新对话的系统提示词
        updateConversationSystemPrompt(conversationId, systemPrompt) {
            if (this.conversations[conversationId]) {
                this.conversations[conversationId].systemPrompt = systemPrompt
                this.conversations[conversationId].updatedAt = new Date().toISOString()
            }
        },
        
        // 更新对话的模型配置
        updateConversationModelConfig(conversationId, modelConfig) {
            if (this.conversations[conversationId]) {
                this.conversations[conversationId].modelConfig = { ...modelConfig }
                this.conversations[conversationId].updatedAt = new Date().toISOString()
            }
        },
        addMessage(message) {
            // 确保有活跃的对话
            if (!this.activeConversationId) {
                this.createNewConversation()
            }
            
            const conversation = this.conversations[this.activeConversationId]
            if (conversation) {
                conversation.messages.push({
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    ...message
                })
                conversation.updatedAt = new Date().toISOString()
                
                // 如果是用户消息且对话标题还是默认的，更新标题
                if (message.role === 'user' && conversation.title === '新对话') {
                    const title = message.content.length > 20 
                        ? message.content.substring(0, 20) + '...' 
                        : message.content
                    this.updateConversationTitle(this.activeConversationId, title)
                }
            }
        },

        updateLastMessage(content) {
            if (!this.activeConversationId) return
            
            const conversation = this.conversations[this.activeConversationId]
            if (conversation && conversation.messages.length > 0) {
                const lastMessage = conversation.messages[conversation.messages.length - 1]
                lastMessage.content = content
                conversation.updatedAt = new Date().toISOString()
            }
        },

        updateTokenCount(usage) {
            this.tokenCount.prompt += usage.prompt_tokens
            this.tokenCount.completion += usage.completion_tokens
            this.tokenCount.total += usage.total_tokens
        },

        // 设置加载状态
        setLoading(loading) {
            this.isLoading = loading
        },

        clearMessages() {
            if (!this.activeConversationId) return
            
            const conversation = this.conversations[this.activeConversationId]
            if (conversation) {
                conversation.messages = []
                conversation.updatedAt = new Date().toISOString()
            }
        },
        
        /**
         * 初始化默认对话（如果没有对话）
         * 为现有对话添加推荐的默认配置
         */
        initializeDefaultConversation() {
            const settingsStore = useSettingsStore()
            const recommendedDefaults = settingsStore.getRecommendedDefaults()
            
            // 为现有对话添加 systemPrompt 和 modelConfig 字段（兼容性处理）
            this.conversationList.forEach(id => {
                if (this.conversations[id]) {
                    // 添加 systemPrompt 字段
                    if (!this.conversations[id].hasOwnProperty('systemPrompt')) {
                        this.conversations[id].systemPrompt = ''
                    }
                    // 添加 modelConfig 字段，使用推荐的默认值
                    if (!this.conversations[id].hasOwnProperty('modelConfig')) {
                        this.conversations[id].modelConfig = {
                            model: recommendedDefaults.model,
                            temperature: recommendedDefaults.temperature,
                            maxTokens: recommendedDefaults.maxTokens,
                            topP: recommendedDefaults.topP,
                            topK: recommendedDefaults.topK,
                            repetitionPenalty: recommendedDefaults.repetitionPenalty
                        }
                    } else {
                        // 如果已有modelConfig但某些字段为null，则使用推荐默认值
                        const config = this.conversations[id].modelConfig
                        if (config.model === null) config.model = recommendedDefaults.model
                        if (config.temperature === null) config.temperature = recommendedDefaults.temperature
                        if (config.maxTokens === null) config.maxTokens = recommendedDefaults.maxTokens
                        if (config.topP === null) config.topP = recommendedDefaults.topP
                        if (config.topK === null) config.topK = recommendedDefaults.topK
                        if (config.repetitionPenalty === null) config.repetitionPenalty = recommendedDefaults.repetitionPenalty
                    }
                }
            })
            
            if (this.conversationList.length === 0) {
                this.createNewConversation()
            } else if (!this.activeConversationId) {
                this.activeConversationId = this.conversationList[0]
            }
        }
    },

    persist: {
        key: 'ai-chat-history',
        storage: localStorage,
    },
})