"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const stores_user = require("../../../stores/user.js");
const api_user = require("../../../api/user.js");
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
      return {
        nickname: "用户昵称",
        phone: "150****1947",
        city: "南昌市",
        avatar: "",
        realNameAuth: false,
        level: 1,
        levelProgress: 10
      };
    });
    const accountBalance = common_vendor.ref("0.00");
    const couponsCount = common_vendor.ref(3);
    const orderCounts = common_vendor.ref({
      pending: 2,
      inProgress: 1
    });
    const handleLoginSuccess = (data) => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:341", "收到登录成功事件:", data);
      loadUserData();
    };
    const handleLogoutSuccess = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:348", "收到退出登录事件");
      accountBalance.value = "0.00";
      couponsCount.value = 0;
      orderCounts.value = {
        pending: 0,
        inProgress: 0
      };
      applicationInfo.value = null;
      applicationStatus.value = "";
    };
    const handleApplicationStatusChanged = (data) => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:363", "收到申请状态变化事件:", data);
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
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", handleLoginSuccess);
      common_vendor.index.$off("logoutSuccess", handleLogoutSuccess);
      common_vendor.index.$off("applicationStatusChanged", handleApplicationStatusChanged);
    });
    const loadUserData = async () => {
      var _a;
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:402", "开始加载用户数据 - isLoggedIn:", isLoggedIn.value);
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:403", "当前用户状态:", userStore.userInfo);
      if (isLoggedIn.value) {
        try {
          common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:408", "用户已登录，开始请求用户信息");
          const response = await api_user.getUserInfo();
          common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:410", "用户信息请求成功:", response);
          if (response.data && response.data.code === 0) {
            const userData = response.data.data;
            common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:415", "解析用户数据:", userData);
            const userInfo2 = {
              nickname: userData.nick_name || "",
              phone: userData.phone || "",
              avatar: userData.head_img || "",
              access_token: userStore.userInfo.access_token || "",
              refresh_token: userStore.userInfo.refresh_token || ""
            };
            userStore.setUserInfo(userInfo2);
          } else {
            common_vendor.index.__f__("warn", "at pages/tabbar/profile/index.vue:432", "获取用户信息失败:", ((_a = response.data) == null ? void 0 : _a.msg) || "未知错误");
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/tabbar/profile/index.vue:435", "获取用户信息失败:", error);
        }
        await loadApplicationInfo();
      } else {
        common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:441", "用户未登录，跳过获取用户信息");
      }
    };
    const loadApplicationInfo = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:448", "开始请求申请信息");
        const response = await api_user.getApplicatioInfo();
        common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:450", "申请信息请求成功:", response);
        if (response.data && response.data.code === 0) {
          applicationInfo.value = response.data.data;
        }
      } catch (error) {
      }
    };
    const navigateToLogin = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/login/index"
      });
    };
    const handleActionClick = (action) => {
      if (!isLoggedIn.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再使用此功能",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              navigateToLogin();
            }
          }
        });
        return;
      }
      switch (action) {
        case "wallet":
          navigateToWallet();
          break;
        case "coupons":
          navigateToCoupons();
          break;
        case "favorites":
          navigateToFavorites();
          break;
        case "history":
          navigateToHistory();
          break;
      }
    };
    const navigateToUserDetail = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/login/index"
      });
    };
    const navigateToWallet = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/wallet/index"
      });
    };
    const navigateToCoupons = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/coupons/index"
      });
    };
    const navigateToFavorites = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/favorites/index"
      });
    };
    const navigateToHistory = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/history/index"
      });
    };
    const navigateToBillDetails = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/bill-details/index"
      });
    };
    const navigateToOrders = (status) => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:540", "跳转到订单页面，状态:", status);
      const encodedStatus = encodeURIComponent(status);
      common_vendor.index.navigateTo({
        url: `/subPackages/order/index?status=${encodedStatus}`
      });
    };
    const navigateToPromotion = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/promotion/index"
      });
    };
    const navigateToReportReward = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/report-reward/index"
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
    const navigateToCooperation = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/cooperation/index"
      });
    };
    const navigateToHelp = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/help/index"
      });
    };
    const navigateToRefund = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/refund/index"
      });
    };
    const navigateToPrivacySettings = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/privacy-settings/index"
      });
    };
    const navigateToNotificationSettings = () => {
      common_vendor.index.navigateTo({
        url: "/subPackages/profile/notification-settings/index"
      });
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
    const handleWithdraw = () => {
      if (!isLoggedIn.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再使用此功能",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              navigateToLogin();
            }
          }
        });
        return;
      }
      common_vendor.index.showToast({
        title: "提现功能待开发",
        icon: "none"
      });
    };
    const handleRecharge = () => {
      if (!isLoggedIn.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再使用此功能",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              navigateToLogin();
            }
          }
        });
        return;
      }
      common_vendor.index.showToast({
        title: "充值功能待开发",
        icon: "none"
      });
    };
    const handleEmergencyCall = () => {
      common_vendor.index.showModal({
        title: "一键报警",
        content: "是否拨打紧急电话 110？",
        confirmText: "拨打",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.makePhoneCall({
              phoneNumber: "110"
            });
          }
        }
      });
    };
    const onRefresh = async () => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:679", "开始下拉刷新");
      isRefreshing.value = true;
      try {
        await loadUserData();
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/profile/index.vue:690", "刷新失败:", error);
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
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:702", "刷新动画结束");
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
        b: userInfo.value.avatar
      }, userInfo.value.avatar ? {
        c: userInfo.value.avatar
      } : {
        d: common_vendor.t(((_a = userInfo.value.nickname) == null ? void 0 : _a.charAt(0)) || "用")
      }, {
        e: common_vendor.t(userInfo.value.nickname || ""),
        f: common_vendor.t(formatPhone(userInfo.value.phone) || "未绑定手机号"),
        g: userInfo.value.levelProgress + "%",
        h: common_vendor.t(userInfo.value.level || 1),
        i: common_vendor.o(navigateToUserDetail)
      }) : {
        j: common_assets._imports_0$4,
        k: common_assets._imports_1$4,
        l: common_assets._imports_4$1,
        m: common_assets._imports_3$3,
        n: common_vendor.o(navigateToLogin)
      }, {
        o: statusBarHeight.value + "px",
        p: common_assets._imports_4$2,
        q: common_vendor.o(($event) => handleActionClick("wallet")),
        r: common_assets._imports_5$2,
        s: couponsCount.value > 0
      }, couponsCount.value > 0 ? {
        t: common_vendor.t(couponsCount.value)
      } : {}, {
        v: common_vendor.o(($event) => handleActionClick("coupons")),
        w: common_assets._imports_0$4,
        x: common_vendor.o(($event) => handleActionClick("favorites")),
        y: common_assets._imports_6,
        z: common_vendor.o(($event) => handleActionClick("history")),
        A: common_assets._imports_0$3,
        B: common_vendor.o(navigateToBillDetails),
        C: common_vendor.t(accountBalance.value),
        D: common_vendor.o(handleWithdraw),
        E: common_vendor.o(handleRecharge),
        F: common_assets._imports_0$3,
        G: common_vendor.o(($event) => navigateToOrders("all")),
        H: common_assets._imports_3$2,
        I: orderCounts.value.pending > 0
      }, orderCounts.value.pending > 0 ? {
        J: common_vendor.t(orderCounts.value.pending)
      } : {}, {
        K: common_vendor.o(($event) => navigateToOrders("pending_payment")),
        L: common_assets._imports_0$4,
        M: common_vendor.o(($event) => navigateToOrders("pending_service")),
        N: common_assets._imports_1$4,
        O: orderCounts.value.inProgress > 0
      }, orderCounts.value.inProgress > 0 ? {
        P: common_vendor.t(orderCounts.value.inProgress)
      } : {}, {
        Q: common_vendor.o(($event) => navigateToOrders("in_service")),
        R: common_assets._imports_9,
        S: common_vendor.o(($event) => navigateToOrders("completed")),
        T: common_assets._imports_10,
        U: common_vendor.o(navigateToPromotion),
        V: common_assets._imports_11,
        W: common_vendor.o(navigateToReportReward),
        X: common_assets._imports_12,
        Y: applicationInfo.value && applicationInfo.value.status && applicationInfo.value.status === "approved"
      }, applicationInfo.value && applicationInfo.value.status && applicationInfo.value.status === "approved" ? {} : {}, {
        Z: common_vendor.o(navigateToPartnerRegistration),
        aa: common_assets._imports_2$1,
        ab: common_vendor.o(navigateToCooperation),
        ac: common_assets._imports_14,
        ad: common_vendor.o(handleEmergencyCall),
        ae: common_assets._imports_15,
        af: common_vendor.o(navigateToHelp),
        ag: common_assets._imports_16,
        ah: common_vendor.o(navigateToRefund),
        ai: common_assets._imports_4$1,
        aj: common_assets._imports_0$3,
        ak: common_vendor.o(navigateToPrivacySettings),
        al: common_assets._imports_17,
        am: common_assets._imports_0$3,
        an: common_vendor.o(navigateToNotificationSettings),
        ao: common_assets._imports_18,
        ap: common_assets._imports_0$3,
        aq: common_vendor.o(navigateToCustomerService),
        ar: common_assets._imports_19,
        as: common_assets._imports_0$3,
        at: common_vendor.o(navigateToSystemSettings),
        av: isRefreshing.value,
        aw: common_vendor.o(onRefresh),
        ax: common_vendor.o(onRefreshRestore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4cb51321"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/profile/index.js.map
