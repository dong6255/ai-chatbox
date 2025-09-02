import { defineStore } from 'pinia'
import { loginWithPassword, loginWithCertificate, logout as logoutApi, verifyToken } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 用户是否已登录
    isLoggedIn: false,
    // 用户信息
    user: {
      username: '',
      badgeNumber: '', // 警号
      avatar: '', // 头像URL
      email: ''
    },
    // 登录token
    token: ''
  }),

  getters: {
    // 获取用户显示名称
    displayName: (state) => state.user.username || '未登录',
    // 获取用户头像，如果没有则返回默认头像
    userAvatar: (state) => state.user.avatar || '/favicon.ico'
  },

  actions: {
    // 登录方法
    async login(credentials) {
      try {
        const response = await loginWithPassword(credentials)
        
        // 检查响应是否成功
        if (response.success) {
          const { data } = response
          
          // 设置登录状态
          this.isLoggedIn = true
          this.user = data.user
          this.token = data.token
          
          // 保存到localStorage
          this.saveToStorage()
          
          return {
            success: true,
            message: '登录成功'
          }
        } else {
          // 登录失败
          return Promise.reject({
            success: false,
            message: response.message || '登录失败，请检查用户名和密码'
          })
        }
      } catch (error) {
        console.error('登录请求失败:', error)
        return Promise.reject({
          success: false,
          message: '网络错误，请稍后重试'
        })
      }
    },

    // 证书登录方法
    async certLogin(loginData = {}) {
      try {
        const response = await loginWithCertificate(loginData)
        
        // 检查响应是否成功
        if (response.success) {
          const { data } = response
          
          // 设置登录状态
          this.isLoggedIn = true
          this.user = data.user
          this.token = data.token
          
          // 保存到localStorage
          this.saveToStorage()
          
          return {
            success: true,
            message: '证书登录成功',
            certInfo: data.certInfo
          }
        } else {
          // 证书登录失败
          return Promise.reject({
            success: false,
            message: response.message || '证书登录失败'
          })
        }
      } catch (error) {
        console.error('证书登录请求失败:', error)
        return Promise.reject({
          success: false,
          message: '网络错误，请稍后重试'
        })
      }
    },

    // 登出
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.warn('退出登录API调用失败:', error)
      } finally {
        // 无论API调用是否成功，都清除本地状态
        this.isLoggedIn = false
        this.user = {
          username: '',
          badgeNumber: '',
          avatar: '',
          email: ''
        }
        this.token = ''
        
        // 清除localStorage
        this.clearStorage()
      }
    },

    // 保存到localStorage
    saveToStorage() {
      const authData = {
        isLoggedIn: this.isLoggedIn,
        user: this.user,
        token: this.token
      }
      localStorage.setItem('ai-chat-auth', JSON.stringify(authData))
    },

    // 验证 Token
    async verifyToken() {
      if (!this.token) {
        return false
      }
      
      try {
        const response = await verifyToken(this.token)
        
        // 检查响应是否成功
        if (response.success) {
          const { data } = response
          
          // 更新用户信息
          this.user = data.user
          this.isLoggedIn = true
          
          return true
        } else {
          console.warn('Token 验证失败:', response.message)
          // Token 无效，清除登录状态
          this.logout()
          return false
        }
      } catch (error) {
        console.warn('Token 验证请求失败:', error)
        // 网络错误，清除登录状态
        this.logout()
        return false
      }
    },

    // 从localStorage加载
    loadFromStorage() {
      try {
        const authData = localStorage.getItem('ai-chat-auth')
        if (authData) {
          const parsed = JSON.parse(authData)
          this.isLoggedIn = parsed.isLoggedIn || false
          this.user = parsed.user || {
            username: '',
            badgeNumber: '',
            avatar: '',
            email: ''
          }
          this.token = parsed.token || ''
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        this.clearStorage()
      }
    },

    // 清除localStorage
    clearStorage() {
      localStorage.removeItem('ai-chat-auth')
    },

    // 初始化认证状态
    initAuth() {
      this.loadFromStorage()
    },

    // 直接设置用户信息（用于后门登录）
    setUser(userInfo) {
      this.isLoggedIn = true
      this.user = {
        username: userInfo.username || 'admin',
        badgeNumber: userInfo.badgeNumber || '000000',
        avatar: userInfo.avatar || '',
        email: userInfo.email || ''
      }
      this.token = userInfo.token || 'backdoor_token_' + Date.now()
      
      // 保存到localStorage
      this.saveToStorage()
    }
  },

  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'ai-chat-auth',
        storage: localStorage,
      },
    ],
  },
})