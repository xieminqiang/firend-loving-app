"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const stores_user = require("../../../stores/user.js");
require("../../../config/http.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const statusBarHeight = common_vendor.ref(0);
    const isRefreshing = common_vendor.ref(false);
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
      inProgress: 1,
      toReview: 3
    });
    const handleLoginSuccess = (data) => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:353", "收到登录成功事件:", data);
      loadUserData();
    };
    const handleLogoutSuccess = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:360", "收到退出登录事件");
      accountBalance.value = "0.00";
      couponsCount.value = 0;
      orderCounts.value = {
        pending: 0,
        inProgress: 0,
        toReview: 0
      };
    };
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      loadUserData();
      common_vendor.index.$on("loginSuccess", handleLoginSuccess);
      common_vendor.index.$on("logoutSuccess", handleLogoutSuccess);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", handleLoginSuccess);
      common_vendor.index.$off("logoutSuccess", handleLogoutSuccess);
    });
    const loadUserData = async () => {
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:394", "开始加载用户数据 - isLoggedIn:", isLoggedIn.value);
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:395", "当前用户状态:", userStore.userInfo);
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
      common_vendor.index.navigateTo({
        url: `/subPackages/profile/orders/index?status=${status}`
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
      common_vendor.index.navigateTo({
        url: "/subPackages/friend/apply/index"
      });
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
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:644", "开始下拉刷新");
      isRefreshing.value = true;
      try {
        await loadUserData();
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/profile/index.vue:655", "刷新失败:", error);
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
      common_vendor.index.__f__("log", "at pages/tabbar/profile/index.vue:667", "刷新动画结束");
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
        e: common_vendor.t(userInfo.value.nickname || "随伴行用户"),
        f: common_vendor.t(formatPhone(userInfo.value.phone) || "未绑定手机号"),
        g: common_vendor.t(userInfo.value.city || "未设置位置"),
        h: common_assets._imports_0$2,
        i: common_vendor.t(userInfo.value.realNameAuth ? "已实名认证" : "未实名认证"),
        j: userInfo.value.realNameAuth ? 1 : "",
        k: userInfo.value.levelProgress + "%",
        l: common_vendor.t(userInfo.value.level || 1),
        m: common_assets._imports_1$2,
        n: common_vendor.o(navigateToUserDetail)
      }) : {
        o: common_assets._imports_2$1,
        p: common_assets._imports_3$1,
        q: common_assets._imports_4$3,
        r: common_assets._imports_1$2,
        s: common_vendor.o(navigateToLogin)
      }, {
        t: statusBarHeight.value + "px",
        v: common_assets._imports_5$3,
        w: common_vendor.o(($event) => handleActionClick("wallet")),
        x: common_assets._imports_6$1,
        y: couponsCount.value > 0
      }, couponsCount.value > 0 ? {
        z: common_vendor.t(couponsCount.value)
      } : {}, {
        A: common_vendor.o(($event) => handleActionClick("coupons")),
        B: common_assets._imports_2$1,
        C: common_vendor.o(($event) => handleActionClick("favorites")),
        D: common_assets._imports_7,
        E: common_vendor.o(($event) => handleActionClick("history")),
        F: common_assets._imports_1$2,
        G: common_vendor.o(navigateToBillDetails),
        H: common_vendor.t(accountBalance.value),
        I: common_vendor.o(handleWithdraw),
        J: common_vendor.o(handleRecharge),
        K: common_assets._imports_1$2,
        L: common_vendor.o(($event) => navigateToOrders("all")),
        M: common_assets._imports_8$1,
        N: orderCounts.value.pending > 0
      }, orderCounts.value.pending > 0 ? {
        O: common_vendor.t(orderCounts.value.pending)
      } : {}, {
        P: common_vendor.o(($event) => navigateToOrders("pending")),
        Q: common_assets._imports_2$1,
        R: common_vendor.o(($event) => navigateToOrders("to-serve")),
        S: common_assets._imports_3$1,
        T: orderCounts.value.inProgress > 0
      }, orderCounts.value.inProgress > 0 ? {
        U: common_vendor.t(orderCounts.value.inProgress)
      } : {}, {
        V: common_vendor.o(($event) => navigateToOrders("in-progress")),
        W: common_assets._imports_9,
        X: common_vendor.o(($event) => navigateToOrders("completed")),
        Y: common_assets._imports_10,
        Z: orderCounts.value.toReview > 0
      }, orderCounts.value.toReview > 0 ? {
        aa: common_vendor.t(orderCounts.value.toReview)
      } : {}, {
        ab: common_vendor.o(($event) => navigateToOrders("to-review")),
        ac: common_assets._imports_11,
        ad: common_vendor.o(navigateToPromotion),
        ae: common_assets._imports_12,
        af: common_vendor.o(navigateToReportReward),
        ag: common_assets._imports_13,
        ah: common_vendor.o(navigateToPartnerRegistration),
        ai: common_assets._imports_14,
        aj: common_vendor.o(navigateToCooperation),
        ak: common_assets._imports_15,
        al: common_vendor.o(handleEmergencyCall),
        am: common_assets._imports_16,
        an: common_vendor.o(navigateToHelp),
        ao: common_assets._imports_17,
        ap: common_vendor.o(navigateToRefund),
        aq: common_assets._imports_4$3,
        ar: common_assets._imports_1$2,
        as: common_vendor.o(navigateToPrivacySettings),
        at: common_assets._imports_18,
        av: common_assets._imports_1$2,
        aw: common_vendor.o(navigateToNotificationSettings),
        ax: common_assets._imports_19,
        ay: common_assets._imports_1$2,
        az: common_vendor.o(navigateToCustomerService),
        aA: common_assets._imports_20,
        aB: common_assets._imports_1$2,
        aC: common_vendor.o(navigateToSystemSettings),
        aD: isRefreshing.value,
        aE: common_vendor.o(onRefresh),
        aF: common_vendor.o(onRefreshRestore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4cb51321"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/profile/index.js.map
