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
    const refreshing = common_vendor.ref(false);
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
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:129", "收到申请状态变化事件:", event);
      if (event.type === "video_uploaded") {
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:133", "视频上传成功，刷新申请信息");
        loadApplicationInfo();
      }
    };
    const onRefresh = async () => {
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:146", "开始下拉刷新");
      refreshing.value = true;
      try {
        await loadApplicationInfo();
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/index.vue:155", "下拉刷新失败:", error);
        common_vendor.index.showToast({
          title: "刷新失败，请重试",
          icon: "error",
          duration: 2e3
        });
      } finally {
        setTimeout(() => {
          refreshing.value = false;
        }, 500);
      }
    };
    const onRefreshRestore = () => {
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:173", "刷新状态恢复");
    };
    const onRefreshAbort = () => {
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:178", "刷新状态中止");
      refreshing.value = false;
    };
    const loadApplicationInfo = async () => {
      var _a, _b;
      try {
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:185", "开始请求申请信息");
        const response = await api_user.getApplicatioInfo();
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:187", "申请信息请求成功:", response);
        if (response.data && response.data.code === 0) {
          applicationInfo.value = response.data.data;
          common_vendor.index.__f__("log", "at subPackages/partner/index.vue:191", "申请信息:", applicationInfo.value);
          dataReady.value = true;
          common_vendor.index.__f__("log", "at subPackages/partner/index.vue:195", "数据准备完成，可以渲染Workbench组件");
        } else {
          common_vendor.index.__f__("warn", "at subPackages/partner/index.vue:197", "获取申请信息失败:", ((_a = response.data) == null ? void 0 : _a.msg) || "未知错误");
          dataReady.value = true;
          throw new Error(((_b = response.data) == null ? void 0 : _b.msg) || "获取申请信息失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/index.vue:205", "获取申请信息失败:", error);
        dataReady.value = true;
        throw error;
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
        h: common_vendor.o(onSwiperChange),
        i: refreshing.value,
        j: common_vendor.o(onRefresh),
        k: common_vendor.o(onRefreshRestore),
        l: common_vendor.o(onRefreshAbort)
      }, {
        m: dataReady.value
      }, dataReady.value ? {
        n: currentTabIndex.value === 0 ? "/static/icons/tabbar/grid-fill.png" : "/static/icons/tabbar/grid.png",
        o: currentTabIndex.value === 0 ? 1 : "",
        p: common_vendor.o(($event) => switchTab(0)),
        q: currentTabIndex.value === 1 ? "/static/icons/tabbar/account-fill.png" : "/static/icons/tabbar/account.png",
        r: currentTabIndex.value === 1 ? 1 : "",
        s: common_vendor.o(($event) => switchTab(1))
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-16ee0c05"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/partner/index.js.map
