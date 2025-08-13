import { defineStore } from 'pinia'

// 定义 Store
export const useUserStore = defineStore('user',{
  // 定义 state
  state: () => ({
    userInfo: {
	},
    switch: null, // 添加开关字段

  }),
  // 定义 getters
  getters: {
    // doubleCount: (state) => state.count * 2
  },
  // 定义 actions
  actions: {
    //设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      console.log('userInfo', this.userInfo);
    },
	
    //设置开关状态
    setSwitch(switchData) {
      this.switch = switchData
      console.log('switch', this.switch);
    },

    //清除用户信息
    clearUserInfo() {
      this.userInfo = {}
    },
  },
  // 持久化配置
  persist: {
    key: 'user-store',
    paths: ['userInfo', 'switch'] // 持久化 userInfo 和 switch 字段
  }
})

