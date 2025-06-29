"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  __name: "Profile",
  setup(__props) {
    const goToDataEdit = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/DataEdetion/index"
      });
    };
    const handleBalanceAction = (action) => {
      switch (action) {
        case "withdraw":
          common_vendor.index.showToast({
            title: "提现功能开发中",
            icon: "none"
          });
          break;
        case "detail":
          common_vendor.index.showToast({
            title: "明细功能开发中",
            icon: "none"
          });
          break;
      }
    };
    const handleFunctionClick = (functionName) => {
      switch (functionName) {
        case "service":
          common_vendor.index.showToast({
            title: "我的服务功能开发中",
            icon: "none"
          });
          break;
        case "review":
          common_vendor.index.showToast({
            title: "我的评价功能开发中",
            icon: "none"
          });
          break;
        case "statistics":
          common_vendor.index.showToast({
            title: "数据统计功能开发中",
            icon: "none"
          });
          break;
        case "settings":
          common_vendor.index.showToast({
            title: "设置功能开发中",
            icon: "none"
          });
          break;
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goToDataEdit),
        b: common_vendor.o(($event) => handleBalanceAction("withdraw")),
        c: common_vendor.o(($event) => handleBalanceAction("detail")),
        d: common_assets._imports_0$2,
        e: common_vendor.o(($event) => handleFunctionClick("service")),
        f: common_assets._imports_0$2,
        g: common_vendor.o(($event) => handleFunctionClick("review")),
        h: common_assets._imports_0$2,
        i: common_vendor.o(($event) => handleFunctionClick("statistics")),
        j: common_assets._imports_0$2,
        k: common_vendor.o(($event) => handleFunctionClick("settings"))
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4724f316"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/components/Profile.js.map
