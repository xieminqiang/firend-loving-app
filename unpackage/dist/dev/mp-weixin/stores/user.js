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
    key: "user-store",
    paths: ["userInfo"]
    // 只持久化 userInfo 字段
  }
});
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/user.js.map
