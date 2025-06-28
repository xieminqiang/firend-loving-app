"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
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
  "./subPackages/friend/apply/index.js";
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  }
};
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__file", "/Users/mac/Documents/firend-loving-app/App.vue"]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  app.config.globalProperties.$imgBaseUrl = "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com";
  app.use(stores_index.pinia);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
