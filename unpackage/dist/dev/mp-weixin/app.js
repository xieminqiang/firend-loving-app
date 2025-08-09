"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_level = require("./stores/level.js");
require("./stores/user.js");
const stores_index = require("./stores/index.js");
if (!Math) {
  "./pages/tabbar/home/index.js";
  "./pages/tabbar/friends/index.js";
  "./pages/tabbar/discover/index.js";
  "./pages/tabbar/profile/index.js";
  "./subPackages/login/index.js";
  "./subPackages/home/detail.js";
  "./subPackages/settings/pages/index/index.js";
  "./subPackages/settings/pages/account/index.js";
  "./subPackages/settings/pages/privacy/index.js";
  "./subPackages/settings/pages/about/index.js";
  "./subPackages/partner/index.js";
  "./subPackages/partner/DataEdetion/index.js";
  "./subPackages/partner/level/index.js";
  "./subPackages/partner/order/index.js";
  "./subPackages/partner/components/DataSelect.js";
  "./subPackages/partner/order/detail.js";
  "./subPackages/friend/apply/index.js";
  "./subPackages/friend/detail.js";
  "./subPackages/friend/friend-select.js";
  "./subPackages/order/index.js";
  "./subPackages/order/detail.js";
  "./subPackages/order/submit.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Launch");
    this.clearServiceLevels();
    this.initServiceLevels();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:14", "App Show");
    this.checkAndUpdateServiceLevels();
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:19", "App Hide");
  },
  methods: {
    // 清除服务等级列表
    clearServiceLevels() {
      try {
        const levelStore = stores_level.useLevelStore();
        levelStore.clearServiceLevels();
        common_vendor.index.__f__("log", "at App.vue:27", "服务等级列表已清除");
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:29", "清除服务等级列表失败:", error);
      }
    },
    // 检查并更新服务等级列表
    async checkAndUpdateServiceLevels() {
      try {
        const levelStore = stores_level.useLevelStore();
        if (levelStore.needUpdate || levelStore.serviceLevels.length === 0) {
          common_vendor.index.__f__("log", "at App.vue:39", "检测到等级列表需要更新，重新获取...");
          await levelStore.fetchServiceLevels();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:43", "检查更新服务等级列表失败:", error);
      }
    },
    async initServiceLevels() {
      try {
        const levelStore = stores_level.useLevelStore();
        await levelStore.fetchServiceLevels();
        common_vendor.index.__f__("log", "at App.vue:51", "服务等级列表初始化完成");
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:53", "初始化服务等级列表失败:", error);
      }
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$imgBaseUrl = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com";
  app.use(stores_index.pinia);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
