"use strict";
const common_vendor = require("../common/vendor.js");
const config_http = require("../config/http.js");
const wxLogin = (data) => {
  return config_http.http({
    url: "/front/user/wx",
    method: "POST",
    data
  });
};
const getUserInfo = () => {
  return config_http.http({
    url: "/front/user/center/info",
    method: "GET"
  });
};
const getApplicatioInfo = () => {
  return config_http.http({
    url: "/front/companion/application/my",
    method: "GET"
  });
};
const getServicesByCities = (cityCodes) => {
  const queryParams = cityCodes.map((code) => `city_codes=${code}`).join("&");
  return config_http.http({
    url: `/front/companion/services/cities?${queryParams}`,
    method: "GET"
  });
};
const createCompanionApplication = (data) => {
  return config_http.http({
    url: "/front/companion/application",
    method: "POST",
    data
  });
};
function updateCompanionOnlineStatus(data) {
  return config_http.http({
    url: "/front/companion/online-status",
    method: "POST",
    data
  });
}
const uploadCompanionVideo = (data) => {
  return config_http.http({
    url: "/front/companion/video/upload",
    method: "POST",
    data
  });
};
const getPersonalityTags = (params) => {
  common_vendor.index.__f__("log", "at api/user.js:144", "getPersonalityTags 调用开始", params);
  const queryParts = [];
  if (params.tag_type)
    queryParts.push(`tag_type=${params.tag_type}`);
  if (params.keyword)
    queryParts.push(`keyword=${encodeURIComponent(params.keyword)}`);
  if (params.page)
    queryParts.push(`page=${params.page}`);
  if (params.pageSize)
    queryParts.push(`pageSize=${params.pageSize}`);
  const queryString = queryParts.join("&");
  const url = queryString ? `/front/service/tags?${queryString}` : "/front/service/tags";
  common_vendor.index.__f__("log", "at api/user.js:156", "构建的URL:", url);
  common_vendor.index.__f__("log", "at api/user.js:157", "查询字符串:", queryString);
  return config_http.http({
    url,
    method: "GET"
  });
};
exports.createCompanionApplication = createCompanionApplication;
exports.getApplicatioInfo = getApplicatioInfo;
exports.getPersonalityTags = getPersonalityTags;
exports.getServicesByCities = getServicesByCities;
exports.getUserInfo = getUserInfo;
exports.updateCompanionOnlineStatus = updateCompanionOnlineStatus;
exports.uploadCompanionVideo = uploadCompanionVideo;
exports.wxLogin = wxLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
