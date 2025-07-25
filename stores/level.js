import { defineStore } from 'pinia'
import { getServiceLevels } from '@/api/user.js'

// 定义服务等级 Store
export const useLevelStore = defineStore('level', {
  // 定义 state
  state: () => ({
    serviceLevels: [],
    isLoading: false,
    lastUpdateTime: null
  }),
  
  // 定义 getters
  getters: {
    // 获取排序后的等级列表
    sortedServiceLevels: (state) => {
      return [...state.serviceLevels].sort((a, b) => a.level_order - b.level_order)
    },
    
    // 检查是否需要更新数据（超过1小时）
    needUpdate: (state) => {
      if (!state.lastUpdateTime) return true
      const now = Date.now()
      const oneHour = 60 * 60 * 1000 // 1小时
      return (now - state.lastUpdateTime) > oneHour
    }
  },
  
  // 定义 actions
  actions: {
    // 设置服务等级列表
    setServiceLevels(levels) {
      this.serviceLevels = levels
      this.lastUpdateTime = Date.now()
    },
    
    // 获取服务等级列表
    async fetchServiceLevels() {
      // 如果已有数据且不需要更新，直接返回
      if (this.serviceLevels.length > 0 && !this.needUpdate) {
        return this.serviceLevels
      }
      
      this.isLoading = true
      try {
        const response = await getServiceLevels()
        if (response.data && response.data.code === 0 && response.data.data) {
          const levels = response.data.data || []
          this.setServiceLevels(levels)
          return levels
        }
        return []
      } catch (error) {
        console.error('获取服务等级列表失败:', error)
        return []
      } finally {
        this.isLoading = false
      }
    },
    
    // 清除数据
    clearServiceLevels() {
      this.serviceLevels = []
      this.lastUpdateTime = null
    }
  },
  
  // 持久化配置
  persist: {
    key: 'level-store',
    paths: ['serviceLevels', 'lastUpdateTime']
  }
}) 