"use strict";
const common_vendor = require("../common/vendor.js");
const stores_user = require("../stores/user.js");
const config_config = require("./config.js");
const baseURL = config_config.config.development.baseUrl;
const httpInterceptor = {
  // 拦截前触发
  invoke(options) {
    var _a;
    if (!options.url.startsWith("http")) {
      options.url = baseURL + options.url;
    }
    options.timeout = 6e5;
    options.header = {
      ...options.header,
      "source-client": "miniapp"
    };
    const userStore = stores_user.useUserStore();
    const token = (_a = userStore.userInfo) == null ? void 0 : _a.access_token;
    if (token) {
      options.header.Authorization = "Bearer " + token;
    }
  }
};
common_vendor.index.addInterceptor("request", httpInterceptor);
common_vendor.index.addInterceptor("uploadFile", httpInterceptor);
const http = (options) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...options,
      // 响应成功
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          common_vendor.index.__f__("log", "at config/http.js:73", "222");
          if (res.data && res.data.code !== void 0 && res.data.code !== 0) {
            reject(res);
            return;
          }
          resolve(res);
        } else if (res.statusCode === 401) {
          common_vendor.index.showToast({
            icon: "none",
            title: "请先登录"
          });
          reject(res);
        } else {
          common_vendor.index.showToast({
            icon: "none",
            title: res.data.msg || "请求错误"
          });
          reject(res);
        }
      },
      // 响应失败
      fail(err) {
        common_vendor.index.showToast({
          icon: "none",
          title: "网络错误，换个网络试试"
        });
        reject(err);
      }
    });
  });
};
exports.http = http;
//# sourceMappingURL=../../.sourcemap/mp-weixin/config/http.js.map
