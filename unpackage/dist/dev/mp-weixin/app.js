"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const stores_level = require("./stores/level.js");
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
  "./subPackages/friend/apply/index.js";
  "./subPackages/friend/detail.js";
  "./subPackages/order/index.js";
  "./subPackages/order/detail.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch");
    this.initServiceLevels();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:11", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:14", "App Hide");
  },
  methods: {
    async initServiceLevels() {
      try {
        const levelStore = stores_level.useLevelStore();
        await levelStore.fetchServiceLevels();
        common_vendor.index.__f__("log", "at App.vue:21", "服务等级列表初始化完成");
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:23", "初始化服务等级列表失败:", error);
      }
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$imgBaseUrl = "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com";
  app.use(stores_index.pinia);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
