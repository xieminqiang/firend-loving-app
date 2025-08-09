"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const stores_level = require("../../stores/level.js");
if (!Math) {
  (Workbench + Profile)();
}
const Workbench = () => "./components/Workbench.js";
const Profile = () => "./components/Profile.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const levelStore = stores_level.useLevelStore();
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
      common_vendor.index.$on("refreshApplicationInfo", handleRefreshApplicationInfo);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("applicationStatusChanged", handleApplicationStatusChanged);
      common_vendor.index.$off("refreshApplicationInfo", handleRefreshApplicationInfo);
    });
    const handleApplicationStatusChanged = (event) => {
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:125", "收到申请状态变化事件:", event);
      if (event.type === "video_uploaded") {
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:129", "视频上传成功，刷新申请信息");
        loadApplicationInfo();
        levelStore.clearServiceLevels();
      }
    };
    const handleRefreshApplicationInfo = () => {
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:145", "收到刷新申请信息事件");
      loadApplicationInfo();
    };
    const onRefresh = async () => {
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:151", "开始下拉刷新");
      refreshing.value = true;
      try {
        await loadApplicationInfo();
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/index.vue:160", "下拉刷新失败:", error);
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
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:178", "刷新状态恢复");
    };
    const onRefreshAbort = () => {
      common_vendor.index.__f__("log", "at subPackages/partner/index.vue:183", "刷新状态中止");
      refreshing.value = false;
    };
    const loadApplicationInfo = async () => {
      var _a, _b;
      try {
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:190", "开始请求申请信息");
        const response = await api_user.getApplicatioInfo();
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:192", "申请信息请求成功:", response);
        if (response.data && response.data.code === 0) {
          applicationInfo.value = response.data.data;
          common_vendor.index.__f__("log", "at subPackages/partner/index.vue:196", "申请信息:", applicationInfo.value);
          dataReady.value = true;
          common_vendor.index.__f__("log", "at subPackages/partner/index.vue:200", "数据准备完成，可以渲染Workbench组件");
        } else {
          common_vendor.index.__f__("warn", "at subPackages/partner/index.vue:202", "获取申请信息失败:", ((_a = response.data) == null ? void 0 : _a.msg) || "未知错误");
          dataReady.value = true;
          throw new Error(((_b = response.data) == null ? void 0 : _b.msg) || "获取申请信息失败");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/index.vue:210", "获取申请信息失败:", error);
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !dataReady.value
      }, !dataReady.value ? {} : {
        b: common_vendor.p({
          applicationInfo: applicationInfo.value
        }),
        c: common_vendor.p({
          applicationInfo: applicationInfo.value
        }),
        d: currentTabIndex.value,
        e: common_vendor.o(onSwiperChange),
        f: refreshing.value,
        g: common_vendor.o(onRefresh),
        h: common_vendor.o(onRefreshRestore),
        i: common_vendor.o(onRefreshAbort)
      }, {
        j: dataReady.value
      }, dataReady.value ? {
        k: currentTabIndex.value === 0 ? "/static/icons/tabbar/grid-fill.png" : "/static/icons/tabbar/grid.png",
        l: currentTabIndex.value === 0 ? 1 : "",
        m: common_vendor.o(($event) => switchTab(0)),
        n: currentTabIndex.value === 1 ? "/static/icons/tabbar/profile-fill.png" : "/static/icons/tabbar/profile.png",
        o: currentTabIndex.value === 1 ? 1 : "",
        p: common_vendor.o(($event) => switchTab(1))
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-16ee0c05"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/partner/index.js.map
