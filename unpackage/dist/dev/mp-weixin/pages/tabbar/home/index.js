"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_home = require("../../../api/home.js");
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
    const navBarHeight = common_vendor.ref(44);
    common_vendor.onMounted(async () => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 0;
      navBarHeight.value = 44;
      bannerTimer = setInterval(() => {
        nextBanner();
      }, 5e3);
      await cityStore.initCityData();
      await loadSingleTabData(serviceTab.value);
    });
    const cityStore = stores_city.useCityStore();
    common_vendor.computed(() => cityStore.currentCity);
    const currentCityCode = common_vendor.computed(() => cityStore.currentCityCode);
    common_vendor.computed(() => cityStore.cityList);
    common_vendor.computed(() => cityStore.cityIndex);
    const currentBanner = common_vendor.ref(0);
    const serviceTab = common_vendor.ref("服务");
    const serviceTabs = ["服务", "娱乐", "运动"];
    let bannerTimer = null;
    common_vendor.onUnmounted(() => {
      if (bannerTimer) {
        clearInterval(bannerTimer);
      }
      if (swiperChangeTimer) {
        clearTimeout(swiperChangeTimer);
      }
    });
    function nextBanner() {
      if (currentBanner.value < banners.length - 1) {
        currentBanner.value++;
      } else {
        currentBanner.value = 0;
      }
    }
    const banners = [
      {
        title: "友伴招募",
        subtitle: "挑战高薪 | 男女不限",
        img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "监督举报",
        subtitle: "平台禁止私下交易",
        img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "全国热招",
        subtitle: "城市独家运营商",
        img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
      }
    ];
    const allServiceItems = common_vendor.ref({
      "服务": [],
      "娱乐": [],
      "运动": []
    });
    const dataLoaded = common_vendor.ref({
      "服务": false,
      "娱乐": false,
      "运动": false
    });
    const dataLoading = common_vendor.ref({
      "服务": false,
      "娱乐": false,
      "运动": false
    });
    const loadSingleTabData = async (tab, forceRefresh = false) => {
      if (dataLoaded.value[tab] && !dataLoading.value[tab] && !forceRefresh) {
        common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:275", `${tab}数据已缓存，跳过加载`);
        return;
      }
      dataLoading.value[tab] = true;
      common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:280", `开始加载${tab}服务数据，当前城市代码:`, currentCityCode.value, forceRefresh ? "(强制刷新)" : "");
      try {
        const requestParams = {
          category: getTabCategoryId(tab),
          page_size: 10,
          city_code: currentCityCode.value
          // 传递当前选中城市的代码
        };
        common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:289", `${tab}服务请求参数:`, requestParams);
        const response = await api_home.getHotRecommendServices(requestParams);
        if (response.data && response.data.code === 0 && response.data.data && response.data.data.list) {
          allServiceItems.value[tab] = response.data.data.list.map((item) => ({
            id: item.id,
            name: item.name,
            desc: item.description,
            tags: item.tags || [],
            img: item.image_url || "/static/images/service-default.png",
            min_price: item.min_price || 0,
            unit: item.unit || "次",
            // 添加单位字段
            price_template_id: item.price_template_id
            // 添加价格模板ID
          }));
          common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:306", `${tab}服务数据加载成功，共${allServiceItems.value[tab].length}条`);
        } else {
          allServiceItems.value[tab] = [];
          common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:310", `${tab}服务数据为空`);
        }
        dataLoaded.value[tab] = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/home/index.vue:314", `获取${tab}服务数据失败:`, error);
        allServiceItems.value[tab] = [];
        dataLoaded.value[tab] = true;
      } finally {
        dataLoading.value[tab] = false;
      }
    };
    const loadAllServicesData = async () => {
      common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:325", "重新加载所有选项卡数据");
      Object.keys(dataLoaded.value).forEach((tab) => {
        dataLoaded.value[tab] = false;
      });
      await loadSingleTabData(serviceTab.value);
    };
    const getTabCategoryId = (tabName) => {
      switch (tabName) {
        case "服务":
          return 1;
        case "娱乐":
          return 2;
        case "运动":
          return 3;
        default:
          return 0;
      }
    };
    const currentTabIndex = common_vendor.ref(0);
    let swiperChangeTimer = null;
    const switchServiceTab = async (tab) => {
      const oldTab = serviceTab.value;
      const newTab = tab;
      serviceTab.value = newTab;
      currentTabIndex.value = serviceTabs.indexOf(newTab);
      if (oldTab !== newTab && !dataLoaded.value[newTab]) {
        await loadSingleTabData(newTab);
      }
    };
    const onSwiperChange = async (e) => {
      const index = e.detail.current;
      const newTab = serviceTabs[index];
      const oldTab = serviceTab.value;
      currentTabIndex.value = index;
      serviceTab.value = newTab;
      if (swiperChangeTimer) {
        clearTimeout(swiperChangeTimer);
      }
      if (oldTab !== newTab && !dataLoaded.value[newTab]) {
        swiperChangeTimer = setTimeout(async () => {
          await loadSingleTabData(newTab);
        }, 300);
      }
    };
    const getTabServiceItems = (tab) => {
      return allServiceItems.value[tab] || [];
    };
    let touchStartX = 0;
    let touchEndX = 0;
    function onTouchStart(e) {
      touchStartX = e.touches[0].clientX;
    }
    function onTouchMove(e) {
      touchEndX = e.touches[0].clientX;
    }
    function onTouchEnd() {
      if (touchEndX === 0)
        return;
      if (touchEndX - touchStartX > 50 && currentBanner.value > 0) {
        currentBanner.value--;
      } else if (touchStartX - touchEndX > 50 && currentBanner.value < banners.length - 1) {
        currentBanner.value++;
      }
      touchStartX = 0;
      touchEndX = 0;
    }
    function navigateToServiceDetail(serviceId) {
      common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:417", "跳转到服务详情页, ID:", serviceId);
      const currentTabItems = getTabServiceItems(serviceTab.value);
      const serviceItem = currentTabItems.find((item) => item.id === serviceId);
      let url = `/subPackages/home/detail?id=${serviceId}`;
      if (serviceItem && serviceItem.price_template_id) {
        url += `&price_template_id=${serviceItem.price_template_id}`;
      }
      common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:429", "跳转URL:", url);
      common_vendor.index.navigateTo({
        url
      });
    }
    const refreshing = common_vendor.ref(false);
    const isRefreshing = common_vendor.ref(false);
    const onRefresh = async (tab) => {
      if (isRefreshing.value || tab !== serviceTab.value) {
        return;
      }
      isRefreshing.value = true;
      refreshing.value = true;
      try {
        if (cityStore.cityList.length === 0) {
          common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:461", "城市列表为空，重新加载城市列表");
          await cityStore.loadCityList();
        }
        common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:466", `下拉刷新${tab}选项卡数据`);
        await loadSingleTabData(tab, false);
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tabbar/home/index.vue:471", "刷新失败:", error);
      } finally {
        refreshing.value = false;
        isRefreshing.value = false;
      }
    };
    const onRefreshRestore = () => {
      refreshing.value = false;
      isRefreshing.value = false;
    };
    const showCityPicker = common_vendor.ref(false);
    function onCitySelected(index) {
      const oldCityIndex = cityStore.cityIndex;
      if (oldCityIndex !== index) {
        common_vendor.index.__f__("log", "at pages/tabbar/home/index.vue:493", `手动选择城市: ${cityStore.cityList[index].name}`);
        loadAllServicesData();
      }
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => showCityPicker.value = true),
        b: statusBarHeight.value + "px",
        c: common_vendor.f(banners, (b, idx, i0) => {
          return {
            a: b.img,
            b: common_vendor.t(b.title),
            c: common_vendor.t(b.subtitle),
            d: idx
          };
        }),
        d: `translateX(-${currentBanner.value * 100}%)`,
        e: common_vendor.f(banners, (_, index, i0) => {
          return {
            a: index,
            b: common_vendor.n({
              active: currentBanner.value === index
            }),
            c: common_vendor.o(($event) => currentBanner.value = index, index)
          };
        }),
        f: common_vendor.o(onTouchStart),
        g: common_vendor.o(onTouchMove),
        h: common_vendor.o(onTouchEnd),
        i: common_vendor.f(serviceTabs, (tab, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab),
            b: serviceTab.value === tab
          }, serviceTab.value === tab ? {} : {}, {
            c: tab,
            d: common_vendor.n({
              active: serviceTab.value === tab
            }),
            e: common_vendor.o(($event) => switchServiceTab(tab), tab)
          });
        }),
        j: common_vendor.f(serviceTabs, (tab, k0, i0) => {
          return common_vendor.e({
            a: dataLoading.value[tab]
          }, dataLoading.value[tab] ? {} : getTabServiceItems(tab).length > 0 ? {
            c: common_vendor.f(getTabServiceItems(tab), (item, k1, i1) => {
              return {
                a: _ctx.$imgBaseUrl + item.img,
                b: common_vendor.t(item.name),
                c: common_vendor.f(item.tags, (tag, k2, i2) => {
                  return {
                    a: common_vendor.t(tag),
                    b: tag
                  };
                }),
                d: common_vendor.t(item.min_price || 0),
                e: common_vendor.t(item.unit),
                f: item.id,
                g: common_vendor.o(($event) => navigateToServiceDetail(item.id), item.id)
              };
            })
          } : dataLoaded.value[tab] && getTabServiceItems(tab).length === 0 ? {
            e: common_assets._imports_3,
            f: common_vendor.t(tab)
          } : {}, {
            b: getTabServiceItems(tab).length > 0,
            d: dataLoaded.value[tab] && getTabServiceItems(tab).length === 0,
            g: common_vendor.o(($event) => onRefresh(tab), tab),
            h: common_vendor.o(onRefreshRestore, tab),
            i: tab
          });
        }),
        k: refreshing.value,
        l: currentTabIndex.value,
        m: common_vendor.o(onSwiperChange),
        n: common_vendor.o(onCitySelected),
        o: common_vendor.o(($event) => showCityPicker.value = $event),
        p: common_vendor.p({
          visible: showCityPicker.value
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-30d82312"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabbar/home/index.js.map
