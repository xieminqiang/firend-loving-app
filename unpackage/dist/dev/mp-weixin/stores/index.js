"use strict";
const common_vendor = require("../common/vendor.js");
const pinia = common_vendor.createPinia();
pinia.use(common_vendor.createPersistedState({
  storage: {
    getItem(key) {
      return common_vendor.index.getStorageSync(key);
    },
    setItem(key, value) {
      common_vendor.index.setStorageSync(key, value);
    }
  }
}));
exports.pinia = pinia;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/index.js.map
