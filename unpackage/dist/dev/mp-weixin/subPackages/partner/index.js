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
    common_vendor.onMounted(() => {
      const info = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = info.statusBarHeight || 0;
      loadApplicationInfo();
    });
    const loadApplicationInfo = async () => {
      var _a;
      try {
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:97", "开始请求申请信息");
        const response = await api_user.getApplicatioInfo();
        common_vendor.index.__f__("log", "at subPackages/partner/index.vue:99", "申请信息请求成功:", response);
        if (response.data && response.data.code === 0) {
          applicationInfo.value = response.data.data;
          common_vendor.index.__f__("log", "at subPackages/partner/index.vue:103", "申请信息:", applicationInfo.value);
        } else {
          common_vendor.index.__f__("warn", "at subPackages/partner/index.vue:105", "获取申请信息失败:", ((_a = response.data) == null ? void 0 : _a.msg) || "未知错误");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/index.vue:108", "获取申请信息失败:", error);
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
      return {
        a: statusBarHeight.value + "px",
        b: common_assets._imports_0$4,
        c: common_vendor.o(goBack),
        d: common_vendor.p({
          applicationInfo: applicationInfo.value
        }),
        e: currentTabIndex.value,
        f: common_vendor.o(onSwiperChange),
        g: currentTabIndex.value === 0 ? "/static/icons/tabbar/grid-fill.png" : "/static/icons/tabbar/grid.png",
        h: currentTabIndex.value === 0 ? 1 : "",
        i: common_vendor.o(($event) => switchTab(0)),
        j: currentTabIndex.value === 1 ? "/static/icons/tabbar/account-fill.png" : "/static/icons/tabbar/account.png",
        k: currentTabIndex.value === 1 ? 1 : "",
        l: common_vendor.o(($event) => switchTab(1))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-16ee0c05"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/partner/index.js.map
