"use strict";
const common_vendor = require("../common/vendor.js");
const config_http = require("../config/http.js");
const createOrderV2 = (data) => {
  return config_http.http({
    url: "/front/order/create-v2",
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
const cancelOrder = (data) => {
  return config_http.http({
    url: "/front/order/cancel",
    method: "POST",
    data
  });
};
const deleteOrder = (data) => {
  return config_http.http({
    url: "/front/order/delete",
    method: "POST",
    data
  });
};
const deleteCompanionOrder = (data) => {
  return config_http.http({
    url: "/front/companion/order/delete",
    method: "POST",
    data
  });
};
const applyRefund = (data) => {
  return config_http.http({
    url: "/front/refund/apply",
    method: "POST",
    data
  });
};
const applyRefundAfterDeparture = (data) => {
  return config_http.http({
    url: "/front/refund/apply-after-departure",
    method: "POST",
    data
  });
};
const getCompanionOrderList = (params) => {
  if (!params.companion_id) {
    common_vendor.index.__f__("warn", "at api/order.js:88", "getCompanionOrderList: companion_id is required");
  }
  return config_http.http({
    url: "/front/companion/order/list",
    method: "POST",
    data: params
  });
};
const acceptCompanionOrder = (data) => {
  return config_http.http({
    url: "/front/companion/order/accept",
    method: "POST",
    data
  });
};
const rejectCompanionOrder = (data) => {
  return config_http.http({
    url: "/front/companion/order/reject",
    method: "POST",
    data
  });
};
const arrivedCompanionOrder = (data) => {
  return config_http.http({
    url: "/front/companion/order/arrived",
    method: "POST",
    data
  });
};
const startCompanionService = (data) => {
  return config_http.http({
    url: "/front/companion/order/start",
    method: "POST",
    data
  });
};
const endCompanionService = (data) => {
  return config_http.http({
    url: "/front/companion/order/end",
    method: "POST",
    data
  });
};
const departCompanionOrder = (data) => {
  return config_http.http({
    url: "/front/companion/order/departure",
    method: "POST",
    data
  });
};
const getOrderCount = () => {
  return config_http.http({
    url: "/front/order/count",
    method: "POST"
  });
};
const startService = (data) => {
  return config_http.http({
    url: "/front/order/start-service",
    method: "POST",
    data
  });
};
const getOrderDetail = (params) => {
  return config_http.http({
    url: "/front/order/detail",
    method: "POST",
    data: params
  });
};
const getServiceInfo = (params) => {
  return config_http.http({
    url: "/front/order/service-info",
    method: "POST",
    data: params
  });
};
const calculateDistance = (params) => {
  return config_http.http({
    url: "/front/order/calculate-distance",
    method: "POST",
    data: params
  });
};
const getCompanionAvailableSchedule = (companion_id) => {
  return config_http.http({
    url: "/front/companion/available-schedule",
    method: "GET",
    data: { companion_id }
  });
};
const getCompanionActiveOrders = (data) => {
  return config_http.http({
    url: "/front/companion/order/active",
    method: "POST",
    data
  });
};
exports.acceptCompanionOrder = acceptCompanionOrder;
exports.applyRefund = applyRefund;
exports.applyRefundAfterDeparture = applyRefundAfterDeparture;
exports.arrivedCompanionOrder = arrivedCompanionOrder;
exports.calculateDistance = calculateDistance;
exports.cancelOrder = cancelOrder;
exports.createOrderV2 = createOrderV2;
exports.deleteCompanionOrder = deleteCompanionOrder;
exports.deleteOrder = deleteOrder;
exports.departCompanionOrder = departCompanionOrder;
exports.endCompanionService = endCompanionService;
exports.getCompanionActiveOrders = getCompanionActiveOrders;
exports.getCompanionAvailableSchedule = getCompanionAvailableSchedule;
exports.getCompanionOrderList = getCompanionOrderList;
exports.getOrderCount = getOrderCount;
exports.getOrderDetail = getOrderDetail;
exports.getOrderList = getOrderList;
exports.getServiceInfo = getServiceInfo;
exports.orderParams = orderParams;
exports.rejectCompanionOrder = rejectCompanionOrder;
exports.startCompanionService = startCompanionService;
exports.startService = startService;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/order.js.map
