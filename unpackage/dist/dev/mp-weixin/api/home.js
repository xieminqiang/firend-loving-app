"use strict";
const config_http = require("../config/http.js");
const getServiceDetail = (id) => {
  return config_http.http({
    url: `/front/service/detail/${id}`,
    method: "GET"
  });
};
const getPriceTemplateDetail = (id) => {
  return config_http.http({
    url: `/price-template/detail/${id}`,
    method: "GET"
  });
};
const getHotRecommendServices = (params = {}) => {
  return getPlatformServicesList({
    page: 1,
    page_size: params.page_size || 6,
    category: params.category || 0,
    city_code: params.city_code
  });
};
const getPlatformServicesList = (params = {}) => {
  return config_http.http({
    url: "/front/home/page/services",
    method: "GET",
    data: params
  });
};
const getCityList = () => {
  return config_http.http({
    url: "/front/cities",
    method: "GET"
  });
};
exports.getCityList = getCityList;
exports.getHotRecommendServices = getHotRecommendServices;
exports.getPriceTemplateDetail = getPriceTemplateDetail;
exports.getServiceDetail = getServiceDetail;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/home.js.map
