"use strict";
const config_http = require("../config/http.js");
const wxLogin = (data) => {
  return config_http.http({
    url: "/user/wx",
    method: "POST",
    data
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
exports.getServicesByCities = getServicesByCities;
exports.wxLogin = wxLogin;
