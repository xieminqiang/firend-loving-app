"use strict";
const common_vendor = require("../common/vendor.js");
const api_home = require("../api/home.js");
const useCityStore = common_vendor.defineStore("city", () => {
  const cityList = common_vendor.ref([]);
  const cityIndex = common_vendor.ref(0);
  const userLocation = common_vendor.ref(null);
  const currentCity = common_vendor.computed(() => {
    var _a;
    if (cityList.value.length > 0) {
      return ((_a = cityList.value[cityIndex.value]) == null ? void 0 : _a.name) || "选择区域";
    }
    return "选择区域";
  });
  const currentCityCode = common_vendor.computed(() => {
    var _a;
    if (cityList.value.length > 0) {
      return ((_a = cityList.value[cityIndex.value]) == null ? void 0 : _a.code) || null;
    }
    return null;
  });
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          common_vendor.index.__f__("log", "at stores/city.js:45", "获取位置成功:", res);
          userLocation.value = {
            latitude: res.latitude,
            longitude: res.longitude
          };
          resolve(res);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at stores/city.js:53", "获取位置失败:", err);
          resolve(null);
        }
      });
    });
  };
  const selectNearestCity = () => {
    if (!userLocation.value || cityList.value.length === 0) {
      cityIndex.value = 0;
      return;
    }
    let nearestIndex = 0;
    let minDistance = Infinity;
    cityList.value.forEach((city, index) => {
      if (city.latitude && city.longitude) {
        const distance = calculateDistance(
          userLocation.value.latitude,
          userLocation.value.longitude,
          city.latitude,
          city.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      }
    });
    cityIndex.value = nearestIndex;
    common_vendor.index.__f__("log", "at stores/city.js:88", `选择最近的城市: ${cityList.value[nearestIndex].name}, 距离: ${minDistance.toFixed(2)}km`);
  };
  const loadCityList = async () => {
    try {
      const response = await api_home.getCityList();
      if (response.data && response.data.code === 0 && response.data.data) {
        cityList.value = response.data.data.map((city) => ({
          name: city.name,
          code: city.city_code,
          latitude: parseFloat(city.lat) || null,
          longitude: parseFloat(city.lng) || null
        }));
        common_vendor.index.__f__("log", "at stores/city.js:105", "原始城市数据:", response.data.data);
        common_vendor.index.__f__("log", "at stores/city.js:106", "处理后的城市数据:", cityList.value);
        if (cityList.value.length > 0) {
          selectNearestCity();
        }
        common_vendor.index.__f__("log", "at stores/city.js:113", "城市列表加载成功:", cityList.value);
      } else {
        common_vendor.index.__f__("warn", "at stores/city.js:115", "获取城市列表失败，使用默认城市列表");
        cityList.value = [];
      }
    } catch (error) {
      common_vendor.index.__f__("error", "at stores/city.js:119", "获取城市列表失败:", error);
      cityList.value = [];
    }
  };
  const selectCity = async (index) => {
    if (index >= 0 && index < cityList.value.length) {
      cityIndex.value = index;
      common_vendor.index.__f__("log", "at stores/city.js:128", `手动选择城市: ${cityList.value[index].name}`);
    }
  };
  const selectCityByName = (cityName) => {
    const index = cityList.value.findIndex((city) => city.name === cityName);
    if (index !== -1) {
      cityIndex.value = index;
      common_vendor.index.__f__("log", "at stores/city.js:137", `根据名称选择城市: ${cityName}`);
    }
  };
  const initCityData = async () => {
    await getUserLocation();
    await loadCityList();
  };
  return {
    // 状态
    cityList,
    cityIndex,
    userLocation,
    // 计算属性
    currentCity,
    currentCityCode,
    // 方法
    calculateDistance,
    getUserLocation,
    selectNearestCity,
    loadCityList,
    selectCity,
    selectCityByName,
    initCityData
  };
}, {
  persist: {
    key: "city-store",
    storage: {
      getItem(key) {
        return common_vendor.index.getStorageSync(key);
      },
      setItem(key, value) {
        common_vendor.index.setStorageSync(key, value);
      }
    }
  }
});
exports.useCityStore = useCityStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/city.js.map
