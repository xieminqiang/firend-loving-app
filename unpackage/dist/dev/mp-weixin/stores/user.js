"use strict";
const common_vendor = require("../common/vendor.js");
const useUserStore = common_vendor.defineStore("user", {
  // 定义 state
  state: () => ({
    userInfo: {}
  }),
  // 定义 getters
  getters: {
    // doubleCount: (state) => state.count * 2
  },
  // 定义 actions
  actions: {
    //设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      common_vendor.index.__f__("log", "at stores/user.js:20", "userInfo", this.userInfo);
    },
    //清除用户信息
    clearUserInfo() {
      this.userInfo = {};
    }
  },
  // 持久化配置
  persist: {
    storage: {
      getItem(key) {
        return common_vendor.index.getStorageSync(key);
      },
      setItem(key, value) {
        common_vendor.index.setStorageSync(key, value);
      }
    }
  }
});
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/user.js.map
