"use strict";
const common_vendor = require("../common/vendor.js");
function getAddressFromLocation(latitude, longitude) {
  return new Promise((resolve, reject) => {
    if (!latitude || !longitude) {
      reject(new Error("经纬度参数不能为空"));
      return;
    }
    common_vendor.index.__f__("log", "at utils/location.js:21", "使用腾讯地图API获取地址:", latitude, longitude);
    common_vendor.index.request({
      url: "https://apis.map.qq.com/ws/geocoder/v1/",
      method: "GET",
      data: {
        key: "4Z3BZ-4JXCJ-EFNFY-DIL4V-6KKKH-YHF6Z",
        location: `${latitude},${longitude}`,
        output: "json"
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/location.js:33", "腾讯地图API响应:", res);
        if (res.statusCode === 200 && res.data && res.data.status === 0 && res.data.result && res.data.result.address) {
          resolve(res.data.result.address);
        } else {
          resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/location.js:42", "腾讯地图API调用失败:", err);
        resolve(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    });
  });
}
function getCurrentLocationAddress() {
  return new Promise((resolve, reject) => {
    common_vendor.index.getLocation({
      type: "gcj02",
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/location.js:59", "获取位置成功:", res);
        const { latitude, longitude } = res;
        getAddressFromLocation(latitude, longitude).then((address) => {
          resolve({
            latitude,
            longitude,
            address
          });
        }).catch((err) => {
          common_vendor.index.__f__("error", "at utils/location.js:72", "获取地址失败:", err);
          resolve({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
        });
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/location.js:82", "获取位置失败:", err);
        reject(new Error("获取位置失败: " + (err.errMsg || err.message || "未知错误")));
      }
    });
  });
}
exports.getCurrentLocationAddress = getCurrentLocationAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/location.js.map
