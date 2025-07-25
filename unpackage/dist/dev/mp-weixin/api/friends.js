"use strict";
const common_vendor = require("../common/vendor.js");
const config_http = require("../config/http.js");
const searchCompanions = (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== void 0 && params[key] !== null && params[key] !== "") {
      cleanParams[key] = params[key];
    }
  });
  common_vendor.index.__f__("log", "at api/friends.js:27", "API调用参数:", cleanParams);
  return config_http.http({
    url: "/front/companion/search",
    method: "GET",
    data: cleanParams
  });
};
const getCityServices = (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== void 0 && params[key] !== null && params[key] !== "") {
      cleanParams[key] = params[key];
    }
  });
  common_vendor.index.__f__("log", "at api/friends.js:63", "获取城市服务API调用参数:", cleanParams);
  return config_http.http({
    url: "/front/companion/city-services",
    method: "GET",
    data: cleanParams
  });
};
exports.getCityServices = getCityServices;
exports.searchCompanions = searchCompanions;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/friends.js.map
