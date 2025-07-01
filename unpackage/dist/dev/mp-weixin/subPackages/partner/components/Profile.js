"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  __name: "Profile",
  props: {
    applicationInfo: {
      type: Object,
      default: null
    }
  },
  setup(__props) {
    const getStatusClass = (status) => {
      switch (status) {
        case "approved":
          return "status-approved";
        case "pending":
          return "status-pending";
        case "rejected":
          return "status-rejected";
        default:
          return "status-unknown";
      }
    };
    const getStatusText = (status) => {
      switch (status) {
        case "approved":
          return "已入驻";
        case "pending":
          return "审核中";
        case "rejected":
          return "已拒绝";
        default:
          return "未入驻";
      }
    };
    const getOrderStatusClass = (canAcceptOrders) => {
      return canAcceptOrders === "Y" ? "status-success" : "status-warning";
    };
    const goToDataEdit = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/partner/DataEdetion/index"
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
      var _a, _b, _c;
      return common_vendor.e({
        a: __props.applicationInfo && __props.applicationInfo.photos && __props.applicationInfo.photos.length > 0
      }, __props.applicationInfo && __props.applicationInfo.photos && __props.applicationInfo.photos.length > 0 ? {
        b: __props.applicationInfo.photos[0]
      } : {}, {
        c: common_vendor.t(((_a = __props.applicationInfo) == null ? void 0 : _a.nickname) || "友伴用户"),
        d: common_vendor.n(getStatusClass((_b = __props.applicationInfo) == null ? void 0 : _b.status)),
        e: common_vendor.t(getStatusText((_c = __props.applicationInfo) == null ? void 0 : _c.status)),
        f: __props.applicationInfo
      }, __props.applicationInfo ? {
        g: common_vendor.t(__props.applicationInfo.can_accept_orders_name || "--"),
        h: common_vendor.n(getOrderStatusClass(__props.applicationInfo.can_accept_orders))
      } : {}, {
        i: common_assets._imports_0$2,
        j: common_vendor.o(goToDataEdit),
        k: common_vendor.o(($event) => handleBalanceAction("withdraw")),
        l: common_vendor.o(($event) => handleBalanceAction("detail")),
        m: common_assets._imports_0$2,
        n: common_vendor.o(($event) => handleFunctionClick("service")),
        o: common_assets._imports_0$2,
        p: common_vendor.o(($event) => handleFunctionClick("review")),
        q: common_assets._imports_0$2,
        r: common_vendor.o(($event) => handleFunctionClick("statistics")),
        s: common_assets._imports_0$2,
        t: common_vendor.o(($event) => handleFunctionClick("settings"))
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4724f316"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/components/Profile.js.map
