import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import VueHook from 'alova/vue'

// 创建 Alova 实例
const alovaInstance = createAlova({
  baseURL: '/api', // 使用相对路径，避免连接真实服务器
  statesHook: VueHook,
  requestAdapter: adapterFetch(),
  timeout: 10000,
  
  // 请求拦截器
  beforeRequest(method) {
    // 添加认证 token
    const token = localStorage.getItem('ai-chat-auth')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.token) {
          method.config.headers.Authorization = `Bearer ${authData.token}`
        }
      } catch (error) {
        console.warn('解析认证信息失败:', error)
      }
    }
  },
  
  // 响应拦截器
  responded: {
    onSuccess(response, method) {
      // 对于 404 等错误状态码，直接返回空对象，让 transform 函数处理
      if (response.status === 404) {
        return {}
      }
      // 如果有自定义的 transform 函数，直接返回 response，让 transform 处理
      if (method.config.transform) {
        return response
      }
      // 处理成功响应
      return response.json()
    },
    onError(error, method) {
      // 处理错误响应
      console.error('请求失败:', error)
      throw error
    }
  }
})

export default alovaInstance