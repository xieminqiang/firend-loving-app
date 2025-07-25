"use strict";
const config_http = require("../config/http.js");
const createOrder = (data) => {
  return config_http.http({
    url: "/front/order/create",
    method: "POST",
    data
  });
};
const getOrderList = (params) => {
  return config_http.http({
    url: "/front/order/list",
    method: "POST",
    data: params
  });
};
const orderParams = (data) => {
  return config_http.http({
    url: "/front/order/params",
    method: "POST",
    data
  });
};
exports.createOrder = createOrder;
exports.getOrderList = getOrderList;
exports.orderParams = orderParams;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map
