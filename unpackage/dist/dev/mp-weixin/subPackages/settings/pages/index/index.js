"use strict";
const common_vendor = require("../../../../common/vendor.js");
const common_assets = require("../../../../common/assets.js");
const stores_user = require("../../../../stores/user.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const isLogin = common_vendor.computed(() => {
      return userStore.userInfo && Object.keys(userStore.userInfo).length > 0;
    });
    const userInfo = common_vendor.computed(() => userStore.userInfo || {});
    const handleLoginSuccess = (data) => {
      console.log("设置页面收到登录成功事件:", data);
    };
    common_vendor.onMounted(() => {
      common_vendor.index.$on("loginSuccess", handleLoginSuccess);
    });
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off("loginSuccess", handleLoginSuccess);
    });
    common_vendor.onLoad(async () => {
      var _a, _b;
      console.log("设置页面载入");
      console.log("当前用户信息:", userStore.userInfo);
      console.log("登录状态:", isLogin.value);
      console.log("用户昵称:", (_a = userInfo.value) == null ? void 0 : _a.nickname);
      console.log("用户头像:", (_b = userInfo.value) == null ? void 0 : _b.avatar);
    });
    const handleAvatarSetting = () => {
      if (!isLogin.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再设置头像",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/subPackages/login/index"
              });
            }
          }
        });
        return;
      }
      common_vendor.index.showToast({
        title: "头像设置功能开发中",
        icon: "none"
      });
    };
    const handleNicknameSetting = () => {
      if (!isLogin.value) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再设置昵称",
          confirmText: "去登录",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({
                url: "/subPackages/login/index"
              });
            }
          }
        });
        return;
      }
      common_vendor.index.showToast({
        title: "昵称设置功能开发中",
        icon: "none"
      });
    };
    const handlePrivacyPolicy = () => {
      common_vendor.index.showToast({
        title: "隐私政策页面开发中",
        icon: "none"
      });
    };
    const handleUserAgreement = () => {
      common_vendor.index.showToast({
        title: "用户协议页面开发中",
        icon: "none"
      });
    };
    const handleAboutUs = () => {
      common_vendor.index.showToast({
        title: "关于我们页面开发中",
        icon: "none"
      });
    };
    const outLogin = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认退出账号？",
        success: async function(res) {
          if (!res.confirm) {
            return;
          }
          userStore.clearUserInfo();
          common_vendor.index.$emit("logoutSuccess");
          common_vendor.index.showToast({
            title: "已退出登录",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack({
              delta: 1
            });
          }, 1e3);
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(isLogin)
      }, common_vendor.unref(isLogin) ? common_vendor.e({
        b: common_vendor.unref(userInfo).avatar
      }, common_vendor.unref(userInfo).avatar ? {
        c: common_vendor.unref(userInfo).avatar
      } : {}, {
        d: common_assets._imports_0$5,
        e: common_vendor.o(handleAvatarSetting)
      }) : {}, {
        f: common_vendor.unref(isLogin)
      }, common_vendor.unref(isLogin) ? {
        g: common_vendor.t(common_vendor.unref(userInfo).nickname || "未设置昵称"),
        h: common_assets._imports_0$5,
        i: common_vendor.o(handleNicknameSetting)
      } : {}, {
        j: common_assets._imports_0$5,
        k: common_vendor.o(handlePrivacyPolicy),
        l: common_assets._imports_0$5,
        m: common_vendor.o(handleUserAgreement),
        n: common_assets._imports_0$5,
        o: common_vendor.o(handleAboutUs),
        p: common_vendor.unref(isLogin)
      }, common_vendor.unref(isLogin) ? {
        q: common_vendor.o(outLogin)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0dc70dea"], ["__file", "/Users/mac/Documents/firend-loving-app/subPackages/settings/pages/index/index.vue"]]);
wx.createPage(MiniProgramPage);
