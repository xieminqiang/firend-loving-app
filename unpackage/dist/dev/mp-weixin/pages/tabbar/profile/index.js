"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const stores_user = require("../../../stores/user.js");
const api_user = require("../../../api/user.js");
const api_order = require("../../../api/order.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const statusBarHeight = common_vendor.ref(0);
    const isRefreshing = common_vendor.ref(false);
    const applicationInfo = common_vendor.ref(null);
    const applicationStatus = common_vendor.ref("");
    const isLoggedIn = common_vendor.computed(() => {
      return userStore.userInfo && Object.keys(userStore.userInfo).length > 0;
    });
    const userInfo = common_vendor.computed(() => {
      if (isLoggedIn.value) {
        return userStore.userInfo;
      }
    });
    const orderCounts = common_vendor.ref({
      pending: 0,
      inProgress: 0
    });
    const handleLoginSuccess = (data) => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:211", "收到登录成功事件:", data);
      loadUserData();
      loadOrderCount();
    };
    const handleLogoutSuccess = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:220", "收到退出登录事件");
      orderCounts.value = {
        pending: 0,
        inProgress: 0
      };
      applicationInfo.value = null;
      applicationStatus.value = "";
    };
    const handleApplicationStatusChanged = (data) => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:233", "收到申请状态变化事件:", data);
      loadApplicationInfo();
    };
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      loadUserData();
      common_vendor.index.$on("loginSuccess", handleLoginSuccess);
      common_vendor.index.$on("logoutSuccess", handleLogoutSuccess);
      common_vendor.index.$on("applicationStatusChanged", handleApplicationStatusChanged);
    });
    common_vendor.onShow(() => {
      if (isLoggedIn.value) {
        loadOrderCount();
      }
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", handleLoginSuccess);
      common_vendor.index.$off("logoutSuccess", handleLogoutSuccess);
      common_vendor.index.$off("applicationStatusChanged", handleApplicationStatusChanged);
    });
    const loadUserData = async () => {
      var _a;
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:279", "开始加载用户数据 - isLoggedIn:", isLoggedIn.value);
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:280", "当前用户状态:", userStore.userInfo);
      if (isLoggedIn.value) {
        try {
          common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:285", "用户已登录，开始请求用户信息");
          const response = await api_user.getUserInfo();
          common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:287", "用户信息请求成功:", response);
          if (response.data && response.data.code === 0) {
            const userData = response.data.data;
            common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:292", "解析用户数据:", userData);
            userStore.setUserInfo(userData);
          } else {
            common_vendor.index.__f__("warn", "at pages/tabbar/profile/index.vue:301", "获取用户信息失败:", ((_a = response.data) == null ? void 0 : _a.msg) || "未知错误");
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/tabbar/profile/index.vue:304", "获取用户信息失败:", error);
        }
        await loadApplicationInfo();
        await loadOrderCount();
      } else {
        common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:312", "用户未登录，跳过获取用户信息");
      }
    };
    const loadApplicationInfo = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:319", "开始请求申请信息");
        const response = await api_user.getApplicatioInfo();
        common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:321", "申请信息请求成功:", response);
        if (response.data && response.data.code === 0) {
          applicationInfo.value = response.data.data;
        }
      } catch (error) {
      }
    };
    const loadOrderCount = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:335", "开始请求订单数量统计");
        const response = await api_order.getOrderCount();
        common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:337", "订单数量统计请求成功:", response);
        if (response.data && response.data.code === 0) {
          const data = response.data.data;
          common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:341", "待服务订单数:", data.pending_service_count);
          common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:342", "待付款订单数:", data.pending_payment_count);
          common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:343", "进行中订单数:", data.in_service_count);
          orderCounts.value = {
            pending: data.pending_payment_count || 0,
            pending_service: data.pending_service_count || 0,
            inProgress: data.in_service_count || 0
          };
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/profile/index.vue:353", "获取订单数量失败:", error);
      }
    };
    const navigateToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/login/index"
      });
    };
    const navigateToUserDetail = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/login/index"
      });
    };
    const navigateToOrders = (status) => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:376", "跳转到订单页面，状态:", status);
      const encodedStatus = encodeURIComponent(status);
      common_vendor.index.navigateTo({
        url: `/subPackages/order/index?status=${encodedStatus}`
      });
    };
    const navigateToPartnerRegistration = () => {
      if (applicationInfo.value && applicationInfo.value.status === "approved") {
        common_vendor.index.navigateTo({
          url: "/subPackages/partner/index"
        });
      } else {
        common_vendor.index.navigateTo({
          url: "/subPackages/friend/apply/index"
        });
      }
    };
    const navigateToCustomerService = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/customer-service/index"
      });
    };
    const navigateToSystemSettings = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/settings/pages/index/index"
      });
    };
    const onRefresh = async () => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:422", "开始下拉刷新");
      isRefreshing.value = true;
      try {
        await loadUserData();
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/profile/index.vue:433", "刷新失败:", error);
        common_vendor.index.showToast({
          title: "刷新失败",
          icon: "none",
          duration: 1500
        });
      } finally {
        isRefreshing.value = false;
      }
    };
    const onRefreshRestore = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:445", "刷新动画结束");
      isRefreshing.value = false;
    };
    const formatPhone = (phone) => {
      if (!phone)
        return "未绑定手机号";
      return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    };
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: isLoggedIn.value
      }, isLoggedIn.value ? common_vendor.e({
        b: userInfo.value.head_img
      }, userInfo.value.head_img ? {
        c: _ctx.$imgBaseUrl + userInfo.value.head_img
      } : {
        d: common_vendor.t(((_a = userInfo.value.nickname) == null ? void 0 : _a.charAt(0)) || "用")
      }, {
        e: common_vendor.t(userInfo.value.nickname || ""),
        f: common_vendor.t(formatPhone(userInfo.value.phone) || "未绑定手机号"),
        g: common_vendor.o(navigateToUserDetail)
      }) : {
        h: common_assets._imports_0$1,
        i: common_assets._imports_1$4,
        j: common_assets._imports_2$2,
        k: common_vendor.o(navigateToLogin)
      }, {
        l: statusBarHeight.value + "px",
        m: common_assets._imports_0,
        n: common_vendor.o(($event) => navigateToOrders("all")),
        o: common_assets._imports_4$2,
        p: orderCounts.value.pending > 0
      }, orderCounts.value.pending > 0 ? {
        q: common_vendor.t(orderCounts.value.pending)
      } : {}, {
        r: common_vendor.o(($event) => navigateToOrders("pending_payment")),
        s: common_assets._imports_5,
        t: orderCounts.value.pending_service > 0
      }, orderCounts.value.pending_service > 0 ? {
        v: common_vendor.t(orderCounts.value.pending_service)
      } : {}, {
        w: common_vendor.o(($event) => navigateToOrders("pending_service")),
        x: common_assets._imports_6$2,
        y: orderCounts.value.inProgress > 0
      }, orderCounts.value.inProgress > 0 ? {
        z: common_vendor.t(orderCounts.value.inProgress)
      } : {}, {
        A: common_vendor.o(($event) => navigateToOrders("in_service")),
        B: common_assets._imports_7,
        C: common_vendor.o(($event) => navigateToOrders("completed")),
        D: common_assets._imports_8$1,
        E: applicationInfo.value && applicationInfo.value.status && applicationInfo.value.status === "approved"
      }, applicationInfo.value && applicationInfo.value.status && applicationInfo.value.status === "approved" ? {} : {}, {
        F: common_assets._imports_0,
        G: common_vendor.o(navigateToPartnerRegistration),
        H: common_assets._imports_9,
        I: common_assets._imports_0,
        J: common_vendor.o(() => {
        }),
        K: common_vendor.o(navigateToCustomerService),
        L: common_assets._imports_10,
        M: common_assets._imports_0,
        N: common_vendor.o(navigateToSystemSettings),
        O: isRefreshing.value,
        P: common_vendor.o(onRefresh),
        Q: common_vendor.o(onRefreshRestore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4cb51321"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/profile/index.js.map
