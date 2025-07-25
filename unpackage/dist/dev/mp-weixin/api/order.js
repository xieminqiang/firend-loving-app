"use strict";
const config_http = require("../config/http.js");
const createOrder = (data) => {
  return config_http.http({
    url: "/front/order/create",
    method: "POST",
    data
  });
};
exports.createOrder = createOrder;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map
