"use strict";const e=require("../common/vendor.js");require("./user.js");require("./level.js");require("./city.js");const r=e.createPinia();r.use(e.createPersistedState({storage:{getItem(t){return e.index.getStorageSync(t)},setItem(t,i){e.index.setStorageSync(t,i)}}}));exports.pinia=r;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/index.js.map
