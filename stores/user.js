import { defineStore } from 'pinia'

// 定义 Store
export const useUserStore = defineStore('user',{
  // 定义 state
  state: () => ({
    userInfo: {},
    token: '', // 添加token字段
    switch: null, // 添加开关字段
  }),
  // 定义 getters
  getters: {
    // 获取token
    getToken: (state) => state.token,
    // doubleCount: (state) => state.count * 2
  },
  // 定义 actions
  actions: {
    //设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      console.log('userInfo', this.userInfo);
    },
    
    //设置token
    setToken(token) {
      this.token = token
      console.log('token', this.token);
    },
	
    //设置开关状态
    setSwitch(switchData) {
      this.switch = switchData
      console.log('switch', this.switch);
    },

    //清除用户信息
    clearUserInfo() {
      this.userInfo = {}
      this.token = '' // 清除token
    },
  },
  // 持久化配置
  persist: {
    key: 'user-store',
    paths: ['userInfo', 'token', 'switch'] // 持久化 userInfo、token 和 switch 字段
  }
})

