"use strict";
const config_http = require("../config/http.js");
const wxLogin = (data) => {
  return config_http.http({
    url: "/user/wx",
    method: "POST",
    data
  });
};
const getUserInfo = () => {
  return config_http.http({
    url: "/user/center/info",
    method: "GET"
  });
};
const getApplicatioInfo = () => {
  return config_http.http({
    url: "/companion/application/my",
    method: "GET"
  });
};
const getServicesByCities = (cityCodes) => {
  const queryParams = cityCodes.map((code) => `city_codes=${code}`).join("&");
  return config_http.http({
    url: `/companion/services/cities?${queryParams}`,
    method: "GET"
  });
};
const createCompanionApplication = (data) => {
  return config_http.http({
    url: "/companion/application",
    method: "POST",
    data
  });
};
exports.createCompanionApplication = createCompanionApplication;
exports.getApplicatioInfo = getApplicatioInfo;
exports.getServicesByCities = getServicesByCities;
exports.getUserInfo = getUserInfo;
exports.wxLogin = wxLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
