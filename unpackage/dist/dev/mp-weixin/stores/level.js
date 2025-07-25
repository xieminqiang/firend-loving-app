"use strict";
const common_vendor = require("../common/vendor.js");
const api_user = require("../api/user.js");
const useLevelStore = common_vendor.defineStore("level", {
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
      return [...state.serviceLevels].sort((a, b) => a.level_order - b.level_order);
    },
    // 检查是否需要更新数据（超过1小时）
    needUpdate: (state) => {
      if (!state.lastUpdateTime)
        return true;
      const now = Date.now();
      const oneHour = 60 * 60 * 1e3;
      return now - state.lastUpdateTime > oneHour;
    }
  },
  // 定义 actions
  actions: {
    // 设置服务等级列表
    setServiceLevels(levels) {
      this.serviceLevels = levels;
      this.lastUpdateTime = Date.now();
    },
    // 获取服务等级列表
    async fetchServiceLevels() {
      if (this.serviceLevels.length > 0 && !this.needUpdate) {
        return this.serviceLevels;
      }
      this.isLoading = true;
      try {
        const response = await api_user.getServiceLevels();
        if (response.data && response.data.code === 0 && response.data.data) {
          const levels = response.data.data || [];
          this.setServiceLevels(levels);
          return levels;
        }
        return [];
      } catch (error) {
        common_vendor.index.__f__("error", "at stores/level.js:54", "获取服务等级列表失败:", error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    // 清除数据
    clearServiceLevels() {
      this.serviceLevels = [];
      this.lastUpdateTime = null;
    }
  },
  // 持久化配置
  persist: {
    key: "level-store",
    paths: ["serviceLevels", "lastUpdateTime"]
  }
});
exports.useLevelStore = useLevelStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/level.js.map
