"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
if (!Math) {
  VideoUploadModal();
}
const VideoUploadModal = () => "./VideoUploadModal.js";
const _sfc_main = {
  __name: "Profile",
  props: {
    applicationInfo: {
      type: Object,
      default: null
    }
  },
  setup(__props) {
    const showVideoUploadModal = common_vendor.ref(false);
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
    const showVideoUpload = () => {
      showVideoUploadModal.value = true;
    };
    const hideVideoUploadModal = () => {
      showVideoUploadModal.value = false;
    };
    const handleVideoUploadSuccess = (data) => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Profile.vue:168", "视频上传成功:", data);
      common_vendor.index.$emit("applicationStatusChanged", data);
    };
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: __props.applicationInfo && __props.applicationInfo.photos && __props.applicationInfo.photos.length > 0
      }, __props.applicationInfo && __props.applicationInfo.photos && __props.applicationInfo.photos.length > 0 ? {
        b: __props.applicationInfo.photos[0]
      } : {}, {
        c: common_vendor.t(((_a = __props.applicationInfo) == null ? void 0 : _a.nickname) || "友伴用户"),
        d: __props.applicationInfo && __props.applicationInfo.can_accept_orders == "N"
      }, __props.applicationInfo && __props.applicationInfo.can_accept_orders == "N" ? {
        e: common_vendor.t(__props.applicationInfo.can_accept_orders_name || "--"),
        f: common_vendor.n(getOrderStatusClass(__props.applicationInfo.can_accept_orders)),
        g: common_vendor.o(showVideoUpload)
      } : {}, {
        h: common_assets._imports_0$2,
        i: common_vendor.o(goToDataEdit),
        j: common_vendor.o(($event) => handleBalanceAction("withdraw")),
        k: common_vendor.o(($event) => handleBalanceAction("detail")),
        l: common_assets._imports_0$2,
        m: common_vendor.o(($event) => handleFunctionClick("service")),
        n: common_assets._imports_0$2,
        o: common_vendor.o(($event) => handleFunctionClick("review")),
        p: common_assets._imports_0$2,
        q: common_vendor.o(($event) => handleFunctionClick("statistics")),
        r: common_assets._imports_0$2,
        s: common_vendor.o(($event) => handleFunctionClick("settings")),
        t: common_vendor.o(hideVideoUploadModal),
        v: common_vendor.o(handleVideoUploadSuccess),
        w: common_vendor.p({
          show: showVideoUploadModal.value,
          applicationInfo: __props.applicationInfo
        })
      });
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4724f316"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/components/Profile.js.map
