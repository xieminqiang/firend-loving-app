"use strict";
const config_http = require("../config/http.js");
const getServiceDetail = (id) => {
  return config_http.http({
    url: `/service/detail/${id}`,
    method: "GET"
  });
};
const getPriceTemplateDetail = (id) => {
  return config_http.http({
    url: `/price-template/detail/${id}`,
    method: "GET"
  });
};
exports.getPriceTemplateDetail = getPriceTemplateDetail;
exports.getServiceDetail = getServiceDetail;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/home.js.map
