"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_user = require("../../../api/user.js");
const stores_level = require("../../../stores/level.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    const isRefreshing = common_vendor.ref(false);
    const currentLevel = common_vendor.ref(null);
    const userGrowthValue = common_vendor.ref(0);
    const levelStore = stores_level.useLevelStore();
    const serviceLevels = common_vendor.computed(() => levelStore.sortedServiceLevels);
    const nextLevel = common_vendor.computed(() => {
      if (!currentLevel.value || !serviceLevels.value.length)
        return null;
      const currentOrder = currentLevel.value.level_order;
      return serviceLevels.value.find((level) => level.level_order > currentOrder);
    });
    const progressPercentage = common_vendor.computed(() => {
      if (!nextLevel.value || !userGrowthValue.value)
        return 0;
      const current = userGrowthValue.value;
      const target = nextLevel.value.min_stars;
      const percentage = current / target * 100;
      return Math.min(percentage, 100);
    });
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const onRefresh = async () => {
      isRefreshing.value = true;
      try {
        await loadData();
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/level/index.vue:236", "刷新数据失败:", error);
      } finally {
        isRefreshing.value = false;
      }
    };
    const onRefreshRestore = () => {
      isRefreshing.value = false;
    };
    const loadServiceLevels = async () => {
      try {
        await levelStore.fetchServiceLevels();
        common_vendor.index.__f__("log", "at subPackages/partner/level/index.vue:250", "服务等级列表加载完成");
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/level/index.vue:252", "获取服务等级列表失败:", error);
        common_vendor.index.showToast({
          title: "获取等级信息失败",
          icon: "none"
        });
      }
    };
    const loadUserApplication = async () => {
      try {
        const response = await api_user.getApplicatioInfo();
        if (response.data && response.data.code === 0 && response.data.data) {
          const application = response.data;
          userGrowthValue.value = application.data.growth_value || 0;
          common_vendor.index.__f__("log", "at subPackages/partner/level/index.vue:267", "userGrowthValue.value", userGrowthValue.value);
          const currentLevelOrder = application.data.level_order;
          common_vendor.index.__f__("log", "at subPackages/partner/level/index.vue:270", "currentLevelOrder", application);
          currentLevel.value = serviceLevels.value.find((level) => level.level_order === currentLevelOrder);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/partner/level/index.vue:274", "获取用户申请信息失败:", error);
      }
    };
    const loadData = async () => {
      await loadServiceLevels();
      await loadUserApplication();
    };
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      loadData();
    });
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g;
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_assets._imports_0$4,
        c: common_vendor.o(goBack),
        d: (_a = currentLevel.value) == null ? void 0 : _a.icon_url,
        e: common_vendor.t(((_b = currentLevel.value) == null ? void 0 : _b.level_name) || "见习"),
        f: common_vendor.t(userGrowthValue.value),
        g: common_vendor.t((((_c = currentLevel.value) == null ? void 0 : _c.commission_rate) || 0.65) * 100),
        h: nextLevel.value
      }, nextLevel.value ? {
        i: ((_d = currentLevel.value) == null ? void 0 : _d.icon_url) || "/static/icons/profile/crown.png",
        j: common_vendor.t(((_e = currentLevel.value) == null ? void 0 : _e.level_name) || "见习"),
        k: nextLevel.value.icon_url,
        l: common_vendor.t(nextLevel.value.level_name),
        m: common_vendor.t(nextLevel.value.description),
        n: common_vendor.t(userGrowthValue.value || 0),
        o: progressPercentage.value + "%",
        p: common_vendor.t(nextLevel.value.min_stars)
      } : {}, {
        q: common_vendor.t((((_f = currentLevel.value) == null ? void 0 : _f.commission_rate) || 0.65) * 100),
        r: common_vendor.t((((_g = currentLevel.value) == null ? void 0 : _g.commission_rate) || 0.65) * 100),
        s: common_vendor.f(serviceLevels.value, (level, k0, i0) => {
          var _a2;
          return {
            a: level.icon_url,
            b: common_vendor.t(level.level_name),
            c: common_vendor.t(level.description),
            d: common_vendor.t(level.commission_rate * 100),
            e: level.id,
            f: level.level_order === ((_a2 = currentLevel.value) == null ? void 0 : _a2.level_order) ? 1 : ""
          };
        }),
        t: isRefreshing.value,
        v: common_vendor.o(onRefresh),
        w: common_vendor.o(onRefreshRestore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-637ded03"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/level/index.js.map
