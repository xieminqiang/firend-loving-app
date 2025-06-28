"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const currentTabIndex = common_vendor.ref(0);
    common_vendor.onMounted(() => {
      const info = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = info.statusBarHeight || 0;
    });
    const switchTab = (index) => {
      currentTabIndex.value = index;
    };
    const onSwiperChange = (e) => {
      currentTabIndex.value = e.detail.current;
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goToDataEdit = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/DataEdetion/index"
      });
    };
    return (_ctx, _cache) => {
      return {
        a: statusBarHeight.value + "px",
        b: common_assets._imports_0$4,
        c: common_vendor.o(goBack),
        d: common_vendor.o(goToDataEdit),
        e: common_assets._imports_1$3,
        f: common_assets._imports_1$3,
        g: common_assets._imports_1$3,
        h: common_assets._imports_1$3,
        i: currentTabIndex.value,
        j: common_vendor.o(onSwiperChange),
        k: currentTabIndex.value === 0 ? "/static/icons/tabbar/grid-fill.png" : "/static/icons/tabbar/grid.png",
        l: currentTabIndex.value === 0 ? 1 : "",
        m: common_vendor.o(($event) => switchTab(0)),
        n: currentTabIndex.value === 1 ? "/static/icons/tabbar/account-fill.png" : "/static/icons/tabbar/account.png",
        o: currentTabIndex.value === 1 ? 1 : "",
        p: common_vendor.o(($event) => switchTab(1))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-16ee0c05"], ["__file", "/Users/mac/Documents/firend-loving-app/subPackages/partner/index.vue"]]);
wx.createPage(MiniProgramPage);
