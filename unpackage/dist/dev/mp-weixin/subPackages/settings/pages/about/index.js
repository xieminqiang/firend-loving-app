"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.ref({});
    common_vendor.onMounted(() => {
      console.log("关于我们页面加载完成");
    });
    return (_ctx, _cache) => {
      return {};
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f77c1493"], ["__file", "/Users/mac/Documents/firend-loving-app/subPackages/settings/pages/about/index.vue"]]);
wx.createPage(MiniProgramPage);
