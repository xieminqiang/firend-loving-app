"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_friends = require("../../../api/friends.js");
require("../../../config/http.js");
const stores_level = require("../../../stores/level.js");
const stores_city = require("../../../stores/city.js");
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (CitySelector + CityPicker + _easycom_uni_popup)();
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
            label: `${level.level_name}`,
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
      common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:367", "应用筛选:", {
        gender: genderFilter.value,
        distance: distanceFilter.value,
        level: levelFilter.value,
        sort: sortFilter.value
      });
      closeModal();
      searchCompanionsData(true);
    };
    const refreshRecommend = () => {
      common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:380", "刷新推荐，清除筛选条件");
      genderFilter.value = "all";
      levelFilter.value = "all";
      searchCompanionsData(true);
    };
    const servicePopup = common_vendor.ref(null);
    const currentPartnerServices = common_vendor.ref([]);
    const currentPartner = common_vendor.ref(null);
    const scrollTop = common_vendor.ref(0);
    const openServicePopup = async (partner) => {
      currentPartner.value = partner;
      try {
        const requestParams = {
          city_code: cityStore.currentCityCode,
          application_id: partner.id
        };
        if (latitude.value && longitude.value) {
          requestParams.latitude = parseFloat(latitude.value);
          requestParams.longitude = parseFloat(longitude.value);
        }
        const response = await api_friends.getCityServices(requestParams);
        if (response.data && response.data.code === 0) {
          const data = response.data.data;
          if (data && data.services && data.services.length > 0) {
            currentPartnerServices.value = data.services.map((service) => ({
              title: service.service_name,
              img: "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + service.service_image_url || "",
              tags: service.service_tags || [],
              price: service.price,
              service_id: service.service_id,
              price_template_id: service.price_template_id || "",
              unit: service.unit,
              min_quantity: service.min_quantity
            }));
          } else {
            currentPartnerServices.value = [];
          }
        } else {
          currentPartnerServices.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:435", "获取服务信息失败:", error);
        currentPartnerServices.value = [];
      }
      servicePopup.value.open();
    };
    const closeServicePopup = () => {
      servicePopup.value.close();
    };
    const goToSubmit = (item) => {
      common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:449", "选择服务:", item);
      closeServicePopup();
      common_vendor.index.navigateTo({
        url: `/subPackages/order/submit?service_id=${item.service_id}&price_template_id=${item.price_template_id || ""}&companion_id=${currentPartner.value.id}&level_order=${currentPartner.value.level_order || ""}&nickname=${currentPartner.value.name}`
      });
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
        common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:558", "搜索参数:", params);
        const response = await api_friends.searchCompanions(params);
        common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:562", "API完整响应:", response);
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
              distance: item.distance,
              tags: item.tags || [],
              services: (() => {
                if (typeof item.services === "string") {
                  try {
                    return JSON.parse(item.services);
                  } catch (e) {
                    common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:581", "解析services JSON失败:", e);
                    return [];
                  }
                }
                return item.services || [];
              })(),
              // 安全解析JSON字符串数组
              avatar: item.avatar,
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
            common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:603", "搜索成功，共获取", newData.length, "条数据，总数:", total.value);
            if (newData.length === 0 && isRefresh) {
            }
          } else {
            common_vendor.index.__f__("log", "at pages/tabbar/friends/index.vue:614", "API返回数据为空");
            if (isRefresh) {
              partnersList.value = [];
              total.value = 0;
            }
          }
        } else {
          common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:622", "API返回错误:", response.data);
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
        common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:636", "搜索伴友师失败:", error);
        common_vendor.index.__f__("error", "at pages/tabbar/friends/index.vue:637", "错误详情:", error.response || error);
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
        b: common_assets._imports_1,
        c: common_vendor.o([($event) => search.value = $event.detail.value, onSearchInput]),
        d: search.value,
        e: safeAreaRight.value + "px",
        f: common_assets._imports_1$1,
        g: common_vendor.o(refreshRecommend),
        h: common_vendor.t(getGenderFilterText.value),
        i: common_assets._imports_1$2,
        j: common_vendor.o(($event) => openFilterModal("gender")),
        k: common_vendor.t(getLevelFilterText.value),
        l: common_assets._imports_1$2,
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
            f: common_assets._imports_3$1
          }, {
            g: common_vendor.t(p.age),
            h: common_vendor.t(p.height),
            i: common_vendor.t(p.weight),
            j: common_vendor.t(p.distance),
            k: common_vendor.f(p.visibleTags, (tag, index, i1) => {
              return {
                a: common_vendor.t(tag),
                b: index
              };
            }),
            l: p.extraTags > 0
          }, p.extraTags > 0 ? {
            m: common_vendor.t(p.extraTags)
          } : {}, {
            n: common_vendor.o(($event) => openServicePopup(p), p.id),
            o: p.id,
            p: common_vendor.o(($event) => navigateToDetail(p.id), p.id)
          });
        }),
        r: common_assets._imports_4
      } : dataLoaded.value && processedPartnersList.value.length === 0 ? {
        t: common_assets._imports_3
      } : {}, {
        p: processedPartnersList.value.length > 0,
        s: dataLoaded.value && processedPartnersList.value.length === 0,
        v: common_vendor.o(loadMore),
        w: isRefreshing.value,
        x: common_vendor.o(onRefresh),
        y: activeModal.value
      }, activeModal.value ? {
        z: common_vendor.t(getModalTitle.value),
        A: common_assets._imports_6,
        B: common_vendor.o(closeModal),
        C: common_vendor.f(getFilterOptions.value, (option, k0, i0) => {
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
        D: common_vendor.o(resetFilter),
        E: common_vendor.o(applyFilter),
        F: common_vendor.o(() => {
        }),
        G: common_vendor.o(closeModal)
      } : {}, {
        H: common_vendor.o(onCitySelected),
        I: common_vendor.o(($event) => showCityPicker.value = $event),
        J: common_vendor.p({
          visible: showCityPicker.value
        }),
        K: common_assets._imports_6,
        L: common_vendor.o(closeServicePopup),
        M: currentPartnerServices.value.length > 0
      }, currentPartnerServices.value.length > 0 ? {
        N: common_vendor.f(currentPartnerServices.value, (item, k0, i0) => {
          return {
            a: item.img,
            b: common_vendor.t(item.title),
            c: common_vendor.f(item.tags, (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            }),
            d: common_vendor.t(item.price),
            e: common_vendor.t(item.unit || "小时"),
            f: common_vendor.o(($event) => goToSubmit(item), item.title),
            g: item.title
          };
        })
      } : {
        O: common_assets._imports_3
      }, {
        P: scrollTop.value,
        Q: common_vendor.sr(servicePopup, "5e09aaad-2", {
          "k": "servicePopup"
        }),
        R: common_vendor.o(closeServicePopup),
        S: common_vendor.p({
          type: "bottom",
          ["mask-click"]: true,
          round: "20",
          ["safe-area"]: false
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5e09aaad"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/friends/index.js.map
