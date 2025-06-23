"use strict";
const config_http = require("../config/http.js");
const getPlatformServicesList = (params = {}) => {
  return config_http.http({
    url: "/home/page/services",
    method: "GET",
    data: params
  });
};
const getHotRecommendServices = (params = {}) => {
  return getPlatformServicesList({
    page: 1,
    page_size: params.page_size || 6,
    category: params.category || 0
  });
};
exports.getHotRecommendServices = getHotRecommendServices;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/discover.js.map
