"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const stores_level = require("../../../stores/level.js");
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
    const props = __props;
    const levelStore = stores_level.useLevelStore();
    const showVideoUploadModal = common_vendor.ref(false);
    const currentLevel = common_vendor.computed(() => {
      var _a;
      if (!((_a = props.applicationInfo) == null ? void 0 : _a.level_order) || !levelStore.sortedServiceLevels.length) {
        return null;
      }
      return levelStore.sortedServiceLevels.find((level) => level.level_order === props.applicationInfo.level_order);
    });
    const getOrderStatusClass = (canAcceptOrders) => {
      return canAcceptOrders === "Y" ? "status-success" : "status-warning";
    };
    const goToDataEdit = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/partner/DataEdetion/index"
      });
    };
    const goToLevelPage = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/partner/level/index"
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
        case "level":
          common_vendor.index.navigateTo({
            url: "/subPackages/partner/level/index"
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
      common_vendor.index.__f__("log", "at subPackages/partner/components/Profile.vue:207", "视频上传成功:", data);
      common_vendor.index.$emit("applicationStatusChanged", data);
    };
    common_vendor.onMounted(async () => {
      await levelStore.fetchServiceLevels();
      common_vendor.index.$on("applicationStatusChanged", handleApplicationStatusChanged);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("applicationStatusChanged", handleApplicationStatusChanged);
    });
    const handleApplicationStatusChanged = (data) => {
      common_vendor.index.__f__("log", "at subPackages/partner/components/Profile.vue:228", "收到申请状态变化事件:", data);
      common_vendor.index.$emit("refreshApplicationInfo");
      if (data.status === "updated") {
        common_vendor.index.showToast({
          title: data.message || "资料更新成功",
          icon: "success",
          duration: 2e3
        });
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
        d: currentLevel.value
      }, currentLevel.value ? {
        e: currentLevel.value.icon_url,
        f: common_vendor.t(currentLevel.value.level_name),
        g: common_vendor.t((currentLevel.value.commission_rate * 100).toFixed(0)),
        h: common_vendor.o(goToLevelPage)
      } : {}, {
        i: ((_b = __props.applicationInfo) == null ? void 0 : _b.growth_value) !== void 0
      }, ((_c = __props.applicationInfo) == null ? void 0 : _c.growth_value) !== void 0 ? {
        j: common_vendor.t(__props.applicationInfo.growth_value || 0)
      } : {}, {
        k: __props.applicationInfo && __props.applicationInfo.can_accept_orders == "N"
      }, __props.applicationInfo && __props.applicationInfo.can_accept_orders == "N" ? {
        l: common_vendor.t(__props.applicationInfo.can_accept_orders_name || "--"),
        m: common_vendor.n(getOrderStatusClass(__props.applicationInfo.can_accept_orders)),
        n: common_vendor.o(showVideoUpload)
      } : {}, {
        o: common_assets._imports_0$3,
        p: common_vendor.o(goToDataEdit),
        q: common_vendor.o(($event) => handleBalanceAction("withdraw")),
        r: common_vendor.o(($event) => handleBalanceAction("detail")),
        s: common_assets._imports_0$3,
        t: common_vendor.o(($event) => handleFunctionClick("service")),
        v: common_assets._imports_0$3,
        w: common_vendor.o(($event) => handleFunctionClick("review")),
        x: common_assets._imports_0$3,
        y: common_vendor.o(($event) => handleFunctionClick("statistics")),
        z: common_assets._imports_0$3,
        A: common_vendor.o(($event) => handleFunctionClick("level")),
        B: common_assets._imports_0$3,
        C: common_vendor.o(($event) => handleFunctionClick("settings")),
        D: common_vendor.o(hideVideoUploadModal),
        E: common_vendor.o(handleVideoUploadSuccess),
        F: common_vendor.p({
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
