"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_friends = require("../../../api/friends.js");
const api_order = require("../../../api/order.js");
const stores_level = require("../../../stores/level.js");
const stores_city = require("../../../stores/city.js");
if (!Math) {
  (CitySelector + CityPicker)();
}
const CitySelector = () => "../../../components/common/CitySelector.js";
const CityPicker = () => "../../../components/common/CityPicker.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statusBarHeight = common_vendor.ref(0);
    common_vendor.ref(null);
    const safeAreaRight = common_vendor.ref(0);
    const search = common_vendor.ref("");
    const isRefreshing = common_vendor.ref(false);
    const showCityPicker = common_vendor.ref(false);
    const latitude = common_vendor.computed(() => {
      var _a;
      return ((_a = cityStore.userLocation) == null ? void 0 : _a.latitude) || null;
    });
    const longitude = common_vendor.computed(() => {
      var _a;
      return ((_a = cityStore.userLocation) == null ? void 0 : _a.longitude) || null;
    });
    common_vendor.ref(false);
    const cityStore = stores_city.useCityStore();
    common_vendor.computed(() => cityStore.cityList);
    common_vendor.computed(() => cityStore.currentCity);
    const activeModal = common_vendor.ref("");
    const genderFilter = common_vendor.ref("all");
    const distanceFilter = common_vendor.ref("all");
    const levelFilter = common_vendor.ref("all");
    const sortFilter = common_vendor.ref("recommend");
    const partnersList = common_vendor.ref([]);
    const total = common_vendor.ref(0);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const dataLoaded = common_vendor.ref(false);
    const levelStore = stores_level.useLevelStore();
    const processedPartnersList = common_vendor.computed(function() {
      return partnersList.value.map(function(partner) {
        const visibleTags = partner.tags ? partner.tags.slice(0, 3) : [];
        const extraTags = partner.tags && partner.tags.length > 3 ? partner.tags.length - 3 : 0;
        return {
          ...partner,
          visibleTags,
          extraTags
        };
      });
    });
    const getGenderFilterText = common_vendor.computed(() => {
      const texts = {
        all: "性别",
        female: "女生",
        male: "男生"
      };
      return texts[genderFilter.value] || "性别";
    });
    common_vendor.computed(() => {
      const texts = {
        all: "距离",
        "1km": "1km内",
        "3km": "3km内",
        "5km": "5km内",
        "10km": "10km内"
      };
      return texts[distanceFilter.value] || "距离";
    });
    const getLevelFilterText = common_vendor.computed(() => {
      if (levelFilter.value === "all")
        return "级别";
      const selectedLevel = levelStore.sortedServiceLevels.find((level) => level.level_order.toString() === levelFilter.value);
      return selectedLevel ? selectedLevel.level_name : "级别";
    });
    common_vendor.computed(() => {
      const texts = {
        distance: "距离",
        rating: "评分",
        new: "最新"
      };
      return texts[sortFilter.value] || "排序";
    });
    const getModalTitle = common_vendor.computed(function() {
      const titles = {
        gender: "选择性别",
        distance: "选择距离",
        level: "选择级别",
        sort: "排序方式"
      };
      return titles[activeModal.value] || "";
    });
    const getFilterOptions = common_vendor.computed(function() {
      const options = {
        gender: [
          { value: "all", label: "不限性别" },
          { value: "female", label: "女生", icon: "/static/icons/friend/female.png" },
          { value: "male", label: "男生", icon: "/static/icons/friend/male.png" }
        ],
        level: [
          { value: "all", label: "不限级别" },
          // 动态生成级别选项，使用全局缓存的服务等级列表
          ...levelStore.sortedServiceLevels.map((level) => ({
            value: level.level_order.toString(),
            label: `${level.level_name}级别`,
            icon: level.icon_url || "/static/icons/friend/star.png"
          }))
        ],
        sort: [
          { value: "recommend", label: "推荐排序", icon: "/static/icons/friend/thumbs-up.png" },
          { value: "distance", label: "距离最近", icon: "/static/icons/friend/location.png" },
          { value: "rating", label: "评分最高", icon: "/static/icons/friend/star.png" },
          { value: "new", label: "最新加入", icon: "/static/icons/friend/bolt.png" }
        ]
      };
      return options[activeModal.value] || [];
    });
    const isOptionSelected = (value) => {
      const filters = {
        gender: genderFilter,
        distance: distanceFilter,
        level: levelFilter,
        sort: sortFilter
      };
      return filters[activeModal.value].value === value;
    };
    const selectOption = (value) => {
      const filters = {
        gender: genderFilter,
        distance: distanceFilter,
        level: levelFilter,
        sort: sortFilter
      };
      filters[activeModal.value].value = value;
    };
    const openFilterModal = (modalType) => {
      activeModal.value = modalType;
    };
    const closeModal = () => {
      activeModal.value = "";
    };
    const resetFilter = () => {
      const filters = {
        gender: genderFilter,
        distance: distanceFilter,
        level: levelFilter,
        sort: sortFilter
      };
      filters[activeModal.value].value = "all";
    };
    const applyFilter = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:327", "应用筛选:", {
        gender: genderFilter.value,
        distance: distanceFilter.value,
        level: levelFilter.value,
        sort: sortFilter.value
      });
      closeModal();
      searchCompanionsData(true);
    };
    const refreshRecommend = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:340", "刷新推荐，清除筛选条件");
      genderFilter.value = "all";
      levelFilter.value = "all";
      searchCompanionsData(true);
    };
    const navigateToBooking = async (item) => {
      var _a, _b, _c;
      try {
        common_vendor.index.showLoading({
          title: "创建订单中..."
        });
        const orderData = {
          companion_id: item.id,
          service_id: 3,
          // 取第一个服务ID
          city_code: cityStore.currentCityCode || 110100,
          // 当前选中的城市代码
          quantity: 3,
          // 固定数量
          service_address: "北京市朝阳区三里屯",
          // 固定地址
          service_date: "2025-01-28",
          // 固定日期
          service_time: "14:00-16:00",
          // 固定时间
          remark: "请准时到达",
          // 固定备注
          user_latitude: ((_a = cityStore.userLocation) == null ? void 0 : _a.latitude) || 39.9042,
          // 用户当前纬度
          user_longitude: ((_b = cityStore.userLocation) == null ? void 0 : _b.longitude) || 116.4074
          // 用户当前经度
        };
        common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:373", "创建订单参数:", orderData);
        const response = await api_order.createOrder(orderData);
        common_vendor.index.hideLoading();
        if (response.data && response.data.code === 0) {
          common_vendor.index.showToast({
            title: "邀约成功",
            icon: "success"
          });
          common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:389", "订单创建成功:", response.data.data);
        } else {
          const errorMsg = ((_c = response.data) == null ? void 0 : _c.message) || "创建订单失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:402", "创建订单失败:", error);
        common_vendor.index.showToast({
          title: "创建订单失败，请重试",
          icon: "none"
        });
      }
    };
    const navigateToDetail = (partnerId) => {
      let url = "/subPackages/friend/detail?id=" + partnerId + "&city_code=" + cityStore.currentCityCode;
      if (latitude.value && longitude.value) {
        url += "&latitude=" + latitude.value + "&longitude=" + longitude.value;
      }
      common_vendor.index.navigateTo({
        url
      });
    };
    const searchCompanionsData = async (isRefresh = false) => {
      var _a;
      if (loading.value)
        return;
      loading.value = true;
      try {
        const params = {
          page: isRefresh ? 1 : currentPage.value,
          page_size: pageSize.value
        };
        if (cityStore.currentCityCode) {
          params.city_code = cityStore.currentCityCode;
        }
        if (search.value && search.value.trim()) {
          params.nickname = search.value.trim();
        }
        if (latitude.value && longitude.value) {
          params.latitude = latitude.value;
          params.longitude = longitude.value;
        }
        if (genderFilter.value !== "all") {
          params.gender = genderFilter.value === "female" ? "女" : "男";
        }
        if (levelFilter.value !== "all") {
          params.level_order = parseInt(levelFilter.value);
        }
        common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:509", "搜索参数:", params);
        const response = await api_friends.searchCompanions(params);
        common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:513", "API完整响应:", response);
        if (response.data && response.data.code === 0) {
          const data = response.data.data;
          if (data && data.list) {
            const newData = data.list.map((item) => ({
              id: item.id,
              name: item.nickname,
              gender: item.gender,
              age: item.age,
              height: item.height,
              weight: item.weight,
              distance: item.distance ? parseFloat(item.distance) : 0,
              tags: item.tags || [],
              services: (() => {
                if (typeof item.services === "string") {
                  try {
                    return JSON.parse(item.services);
                  } catch (e) {
                    common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:532", "解析services JSON失败:", e);
                    return [];
                  }
                }
                return item.services || [];
              })(),
              // 安全解析JSON字符串数组
              avatar: item.photos && item.photos.length > 0 ? item.photos[0] : "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
              online: item.is_online === 1,
              bookable: item.can_accept_orders === "Y"
            }));
            if (isRefresh) {
              partnersList.value = newData;
              currentPage.value = 1;
            } else {
              partnersList.value = [...partnersList.value, ...newData];
              currentPage.value++;
            }
            total.value = data.total || 0;
            hasMore.value = newData.length === pageSize.value;
            common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:554", "搜索成功，共获取", newData.length, "条数据，总数:", total.value);
            if (newData.length === 0 && isRefresh) {
            }
          } else {
            common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:565", "API返回数据为空");
            if (isRefresh) {
              partnersList.value = [];
              total.value = 0;
            }
          }
        } else {
          common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:573", "API返回错误:", response.data);
          const errorMsg = ((_a = response.data) == null ? void 0 : _a.message) || "搜索失败";
          common_vendor.index.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
          if (isRefresh) {
            partnersList.value = [];
            total.value = 0;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:587", "搜索伴友师失败:", error);
        common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:588", "错误详情:", error.response || error);
        let errorMsg = "搜索失败，请重试";
        if (error.response && error.response.data) {
          errorMsg = error.response.data.message || errorMsg;
        }
        common_vendor.index.showToast({
          title: errorMsg,
          icon: "none",
          duration: 2e3
        });
        if (isRefresh) {
          partnersList.value = [];
          total.value = 0;
        }
      } finally {
        loading.value = false;
        dataLoaded.value = true;
      }
    };
    const loadMore = () => {
      if (!loading.value && hasMore.value) {
        searchCompanionsData(false);
      }
    };
    const onRefresh = async () => {
      isRefreshing.value = true;
      await searchCompanionsData(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      isRefreshing.value = false;
    };
    const onSearchInput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchCompanionsData(true);
      }, 500);
    };
    let searchTimer = null;
    const onCitySelected = async (index) => {
      common_vendor.index.vibrateShort({
        type: "light"
      });
      await searchCompanionsData(true);
    };
    common_vendor.onMounted(async () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight;
      const menuButtonInfo = common_vendor.index.getMenuButtonBoundingClientRect();
      menuButtonInfo.value = menuButtonInfo;
      const screenWidth = systemInfo.screenWidth;
      const menuButtonRight = menuButtonInfo.right;
      safeAreaRight.value = screenWidth - menuButtonRight + 24;
      await levelStore.fetchServiceLevels();
      await cityStore.initCityData();
      await searchCompanionsData(true);
    });
    common_vendor.onUnmounted(() => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => showCityPicker.value = true),
        b: common_assets._imports_0$1,
        c: common_vendor.o([($event) => search.value = $event.detail.value, onSearchInput]),
        d: search.value,
        e: safeAreaRight.value + "px",
        f: common_assets._imports_1,
        g: common_vendor.o(refreshRecommend),
        h: common_vendor.t(getGenderFilterText.value),
        i: common_assets._imports_1$1,
        j: common_vendor.o(($event) => openFilterModal("gender")),
        k: common_vendor.t(getLevelFilterText.value),
        l: common_assets._imports_1$1,
        m: common_vendor.o(($event) => openFilterModal("level")),
        n: statusBarHeight.value + "px",
        o: loading.value && !dataLoaded.value
      }, loading.value && !dataLoaded.value ? {} : processedPartnersList.value.length > 0 ? {
        q: common_vendor.f(processedPartnersList.value, (p, k0, i0) => {
          return common_vendor.e({
            a: p.avatar,
            b: p.online
          }, p.online ? {} : {}, {
            c: common_vendor.t(p.name),
            d: p.gender === "女"
          }, p.gender === "女" ? {
            e: common_assets._imports_2
          } : {
            f: common_assets._imports_1$2
          }, {
            g: common_vendor.t(p.age),
            h: common_vendor.t(p.height),
            i: common_vendor.t(p.weight),
            j: p.distance > 0
          }, p.distance > 0 ? {
            k: common_assets._imports_5$1,
            l: common_vendor.t(p.distance)
          } : {}, {
            m: common_vendor.f(p.visibleTags, (tag, index, i1) => {
              return {
                a: common_vendor.t(tag),
                b: index
              };
            }),
            n: p.extraTags > 0
          }, p.extraTags > 0 ? {
            o: common_vendor.t(p.extraTags)
          } : {}, {
            p: common_vendor.o(($event) => navigateToBooking(p), p.id),
            q: p.id,
            r: common_vendor.o(($event) => navigateToDetail(p.id), p.id)
          });
        })
      } : dataLoaded.value && processedPartnersList.value.length === 0 ? {
        s: common_assets._imports_0
      } : {}, {
        p: processedPartnersList.value.length > 0,
        r: dataLoaded.value && processedPartnersList.value.length === 0,
        t: common_vendor.o(loadMore),
        v: isRefreshing.value,
        w: common_vendor.o(onRefresh),
        x: activeModal.value
      }, activeModal.value ? {
        y: common_vendor.t(getModalTitle.value),
        z: common_assets._imports_5,
        A: common_vendor.o(closeModal),
        B: common_vendor.f(getFilterOptions.value, (option, k0, i0) => {
          return common_vendor.e({
            a: option.icon
          }, option.icon ? {
            b: option.icon
          } : {}, {
            c: common_vendor.t(option.label),
            d: isOptionSelected(option.value)
          }, isOptionSelected(option.value) ? {
            e: common_assets._imports_8
          } : {}, {
            f: option.value,
            g: common_vendor.n({
              selected: isOptionSelected(option.value)
            }),
            h: common_vendor.o(($event) => selectOption(option.value), option.value)
          });
        }),
        C: common_vendor.o(resetFilter),
        D: common_vendor.o(applyFilter),
        E: common_vendor.o(() => {
        }),
        F: common_vendor.o(closeModal)
      } : {}, {
        G: common_vendor.o(onCitySelected),
        H: common_vendor.o(($event) => showCityPicker.value = $event),
        I: common_vendor.p({
          visible: showCityPicker.value
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5e09aaad"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/friends/index.js.map
