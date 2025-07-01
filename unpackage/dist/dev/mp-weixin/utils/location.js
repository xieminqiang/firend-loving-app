"use strict";
const common_vendor = require("../common/vendor.js");
let locationCache = {
  latitude: null,
  longitude: null,
  address: "",
  timestamp: 0
};
const CACHE_DURATION = 5 * 60 * 1e3;
const LOCATION_THRESHOLD = 100;
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const isLocationSignificantlyChanged = (newLat, newLng) => {
  if (!locationCache.latitude || !locationCache.longitude) {
    return true;
  }
  const distance = calculateDistance(
    locationCache.latitude,
    locationCache.longitude,
    newLat,
    newLng
  );
  return distance > LOCATION_THRESHOLD;
};
const isCacheValid = () => {
  if (!locationCache.timestamp) {
    return false;
  }
  const now = Date.now();
  return now - locationCache.timestamp < CACHE_DURATION;
};
function getAddressFromLocation(latitude, longitude, forceRefresh = false) {
  return new Promise((resolve, reject) => {
    if (!latitude || !longitude) {
      reject(new Error("经纬度参数不能为空"));
      return;
    }
    const shouldCallAPI = forceRefresh || !isCacheValid() || isLocationSignificantlyChanged(latitude, longitude);
    if (!shouldCallAPI && locationCache.address) {
      common_vendor.index.__f__("log", "at utils/location.js:93", "使用缓存地址，位置变化不大:", locationCache.address);
      resolve(locationCache.address);
      return;
    }
    common_vendor.index.__f__("log", "at utils/location.js:98", "调用腾讯地图API获取地址:", latitude, longitude);
    common_vendor.index.request({
      url: "https://apis.map.qq.com/ws/geocoder/v1/",
      method: "GET",
      data: {
        key: "4Z3BZ-4JXCJ-EFNFY-DIL4V-6KKKH-YHF6Z",
        location: `${latitude},${longitude}`,
        output: "json"
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/location.js:110", "腾讯地图API响应:", res);
        if (res.statusCode === 200 && res.data && res.data.status === 0 && res.data.result && res.data.result.address) {
          locationCache = {
            latitude,
            longitude,
            address: res.data.result.address,
            timestamp: Date.now()
          };
          resolve(res.data.result.address);
        } else {
          const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          locationCache = {
            latitude,
            longitude,
            address: fallbackAddress,
            timestamp: Date.now()
          };
          resolve(fallbackAddress);
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/location.js:134", "腾讯地图API调用失败:", err);
        const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        locationCache = {
          latitude,
          longitude,
          address: fallbackAddress,
          timestamp: Date.now()
        };
        resolve(fallbackAddress);
      }
    });
  });
}
function getCurrentLocationAddress(forceRefresh = false) {
  return new Promise((resolve, reject) => {
    common_vendor.index.getLocation({
      type: "gcj02",
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/location.js:160", "获取位置成功:", res);
        const { latitude, longitude } = res;
        const shouldCallAPI = forceRefresh || !isCacheValid() || isLocationSignificantlyChanged(latitude, longitude);
        if (!shouldCallAPI && locationCache.address) {
          common_vendor.index.__f__("log", "at utils/location.js:169", "使用缓存地址，位置变化不大");
          resolve({
            latitude,
            longitude,
            address: locationCache.address
          });
          return;
        }
        getAddressFromLocation(latitude, longitude, forceRefresh).then((address) => {
          resolve({
            latitude,
            longitude,
            address
          });
        }).catch((err) => {
          common_vendor.index.__f__("error", "at utils/location.js:188", "获取地址失败:", err);
          resolve({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
        });
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/location.js:198", "获取位置失败:", err);
        reject(new Error("获取位置失败: " + (err.errMsg || err.message || "未知错误")));
      }
    });
  });
}
function getCacheStatus() {
  return {
    hasCache: !!locationCache.address,
    isValid: isCacheValid(),
    timestamp: locationCache.timestamp,
    address: locationCache.address,
    coordinates: {
      latitude: locationCache.latitude,
      longitude: locationCache.longitude
    }
  };
}
exports.getCacheStatus = getCacheStatus;
exports.getCurrentLocationAddress = getCurrentLocationAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/location.js.map
