"use strict";
const config_http = require("../config/http.js");
const wxLogin = (data) => {
  return config_http.http({
    url: "/user/wx",
    method: "POST",
    data
  });
};
const createCompanionApplication = (data) => {
  return config_http.http({
    url: "/front/companion/application",
    method: "POST",
    data
  });
};
exports.createCompanionApplication = createCompanionApplication;
exports.wxLogin = wxLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
