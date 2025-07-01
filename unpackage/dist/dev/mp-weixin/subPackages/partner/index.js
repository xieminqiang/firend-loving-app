"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_user = require("../../api/user.js");
if (!Math) {
  (Workbench + Profile)();
}
const Workbench = () => "./components/Workbench.js";
const Profile = () => "./components/Profile.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const currentTabIndex = common_vendor.ref(0);
    const applicationInfo = common_vendor.ref(null);
    const dataReady = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      const info = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = info.statusBarHeight || 0;
      loadApplicationInfo();
      common_vendor.index.$on("applicationStatusChanged", handleApplicationStatusChanged);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("applicationStatusChanged", handleApplicationStatusChanged);
    });
    const handleApplicationStatusChanged = (event) => {
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:114", "收到申请状态变化事件:", event);
      if (event.type === "video_uploaded") {
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:118", "视频上传成功，刷新申请信息");
        loadApplicationInfo();
      }
    };
    const loadApplicationInfo = async () => {
      var _a;
      try {
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:132", "开始请求申请信息");
        const response = await api_user.getApplicatioInfo();
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:134", "申请信息请求成功:", response);
        if (response.data && response.data.code === 0) {
          applicationInfo.value = response.data.data;
          common_vendor.index.__f__("log", "at subPackages/partner/index.vue:138", "申请信息:", applicationInfo.value);
          dataReady.value = true;
          common_vendor.index.__f__("log", "at subPackages/partner/index.vue:142", "数据准备完成，可以渲染Workbench组件");
        } else {
          common_vendor.index.__f__("warn", "at subPackages/partner/index.vue:144", "获取申请信息失败:", ((_a = response.data) == null ? void 0 : _a.msg) || "未知错误");
          dataReady.value = true;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/index.vue:149", "获取申请信息失败:", error);
        dataReady.value = true;
      }
    };
    const switchTab = (index) => {
      currentTabIndex.value = index;
    };
    const onSwiperChange = (e) => {
      currentTabIndex.value = e.detail.current;
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_assets._imports_0$4,
        c: common_vendor.o(goBack),
        d: !dataReady.value
      }, !dataReady.value ? {} : {
        e: common_vendor.p({
          applicationInfo: applicationInfo.value
        }),
        f: common_vendor.p({
          applicationInfo: applicationInfo.value
        }),
        g: currentTabIndex.value,
        h: common_vendor.o(onSwiperChange)
      }, {
        i: dataReady.value
      }, dataReady.value ? {
        j: currentTabIndex.value === 0 ? "/static/icons/tabbar/grid-fill.png" : "/static/icons/tabbar/grid.png",
        k: currentTabIndex.value === 0 ? 1 : "",
        l: common_vendor.o(($event) => switchTab(0)),
        m: currentTabIndex.value === 1 ? "/static/icons/tabbar/account-fill.png" : "/static/icons/tabbar/account.png",
        n: currentTabIndex.value === 1 ? 1 : "",
        o: common_vendor.o(($event) => switchTab(1))
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-16ee0c05"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/partner/index.js.map
