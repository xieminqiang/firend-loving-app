"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_user = require("../../api/user.js");
const stores_user = require("../../stores/user.js");
if (!Array) {
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  _component_uni_popup();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const popup = common_vendor.ref(null);
    const isPopupOpen = common_vendor.ref(true);
    const hasAgreed = common_vendor.ref(false);
    common_vendor.onLoad(async () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      common_vendor.index.__f__("log", "at subPackages/login/index.vue:99", "系统信息:", systemInfo);
      setTimeout(() => {
        if (popup.value) {
          popup.value.open();
        }
      }, 500);
    });
    const handleBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const handleCancel = () => {
      popup.value.close();
      setTimeout(() => {
        handleBack();
      }, 300);
    };
    const handleConfirm = () => {
      hasAgreed.value = true;
      popup.value.close();
      common_vendor.index.showToast({
        title: "感谢您的信任",
        icon: "none",
        duration: 1500
      });
    };
    const onPopupChange = (e) => {
      isPopupOpen.value = e.show;
    };
    const showUserAgreement = () => {
      common_vendor.index.showToast({
        title: "用户协议页面开发中",
        icon: "none"
      });
    };
    const showPrivacyPolicy = () => {
      common_vendor.index.showToast({
        title: "隐私政策页面开发中",
        icon: "none"
      });
    };
    const getPhoneNumber = async (e) => {
      var _a;
      common_vendor.index.__f__("log", "at subPackages/login/index.vue:165", "getPhoneNumber event:", e);
      const res = e.detail;
      if (!res.code) {
        common_vendor.index.showToast({
          title: "授权失败，请重试",
          icon: "none"
        });
        return;
      }
      try {
        const loginRes = await common_vendor.index.login({ provider: "weixin" });
        common_vendor.index.showLoading({
          title: "登录中...",
          mask: true
        });
        const result = await api_user.wxLogin({
          login_code: loginRes.code,
          phone_code: res.code
        });
        common_vendor.index.hideLoading();
        if (result.data && result.data.code === 0) {
          userStore.setUserInfo(result.data.data.token);
          common_vendor.index.$emit("loginSuccess", {
            userInfo: result.data.data
          });
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack({
              delta: 1
              // 返回的页面数，默认值为1，即返回上一级页面
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: ((_a = result.data) == null ? void 0 : _a.msg) || "登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at subPackages/login/index.vue:232", "登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0$3,
        b: common_vendor.o(handleBack),
        c: common_assets._imports_1$5,
        d: common_vendor.o(getPhoneNumber),
        e: common_vendor.o(showUserAgreement),
        f: common_vendor.o(showPrivacyPolicy),
        g: common_vendor.o(handleCancel),
        h: common_vendor.o(handleConfirm),
        i: common_vendor.sr(popup, "a7cd18e8-0", {
          "k": "popup"
        }),
        j: common_vendor.o(onPopupChange),
        k: common_vendor.p({
          safeArea: false,
          type: "center"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a7cd18e8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/login/index.js.map
