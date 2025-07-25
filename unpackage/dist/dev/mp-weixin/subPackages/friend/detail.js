"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_friends = require("../../api/friends.js");
const stores_level = require("../../stores/level.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const params = common_vendor.ref({});
    const levelStore = stores_level.useLevelStore();
    const tabs = ["提供项目", "TA的动态", "客户评价"];
    const activeTab = common_vendor.ref(0);
    function switchTab(idx) {
      activeTab.value = idx;
    }
    const user = common_vendor.ref({});
    const banners = common_vendor.ref([]);
    const services = common_vendor.ref([]);
    const currentLevel = common_vendor.computed(() => {
      if (!user.value.level_order || !levelStore.sortedServiceLevels.length) {
        return null;
      }
      return levelStore.sortedServiceLevels.find((level) => level.level_order === user.value.level_order);
    });
    const comments = [];
    const getCityServicesData = async () => {
      var _a;
      try {
        const requestParams = {
          city_code: params.value.city_code,
          application_id: params.value.id
        };
        if (params.value.latitude && params.value.longitude) {
          requestParams.latitude = parseFloat(params.value.latitude);
          requestParams.longitude = parseFloat(params.value.longitude);
        }
        const response = await api_friends.getCityServices(requestParams);
        common_vendor.index.__f__("log", "at subPackages/friend/detail.vue:183", "城市服务信息响应:", response);
        if (response.data && response.data.code === 0) {
          const data = response.data.data;
          common_vendor.index.__f__("log", "at subPackages/friend/detail.vue:188", "城市服务数据:", data);
          if (data) {
            user.value = {
              avatar: data.photos && data.photos.length > 0 ? data.photos[0] : "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=120&h=160&fit=crop",
              nickname: data.nickname || "未知用户",
              verified: true,
              levelTag: data.level_name || "",
              age: data.age,
              weight: data.weight,
              height: data.height,
              distance: data.distance,
              tags: data.tags || [],
              // 添加用户标签
              level_order: data.level_order,
              // 添加等级序号
              levelIcon: "",
              // 先设为空，通过computed获取
              gender: data.gender || ""
              // 添加性别字段
            };
            if (data.photos && data.photos.length > 0) {
              banners.value = data.photos.map((photo) => ({
                img: photo
              }));
            }
            if (data.services && data.services.length > 0) {
              services.value = data.services.map((service) => ({
                title: service.service_name,
                img: "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + service.service_image_url || "",
                tags: service.service_tags,
                price: service.price,
                service_id: service.service_id,
                unit: service.unit,
                min_quantity: service.min_quantity
              }));
            }
          }
        } else {
          common_vendor.index.__f__("error", "at subPackages/friend/detail.vue:228", "获取城市服务失败:", ((_a = response.data) == null ? void 0 : _a.message) || "未知错误");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/friend/detail.vue:231", "获取城市服务异常:", error);
      }
    };
    function goBack() {
      common_vendor.index.navigateBack();
    }
    common_vendor.onMounted(async () => {
      await levelStore.fetchServiceLevels();
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      params.value = currentPage.options || {};
      common_vendor.index.__f__("log", "at subPackages/friend/detail.vue:248", "页面参数:", params.value);
      common_vendor.index.__f__("log", "at subPackages/friend/detail.vue:249", "经纬度参数:", {
        latitude: params.value.latitude,
        longitude: params.value.longitude
      });
      if (params.value.id && params.value.city_code) {
        getCityServicesData();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$4,
        b: common_vendor.o(goBack),
        c: user.value.avatar,
        d: common_vendor.t(user.value.nickname),
        e: user.value.verified && currentLevel.value
      }, user.value.verified && currentLevel.value ? {
        f: currentLevel.value.icon_url
      } : {}, {
        g: currentLevel.value.level_name
      }, currentLevel.value.level_name ? {
        h: common_vendor.t(currentLevel.value.level_name)
      } : {}, {
        i: user.value.tags && user.value.tags.length > 0
      }, user.value.tags && user.value.tags.length > 0 ? {
        j: common_vendor.f(user.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        k: user.value.gender === "女" ? "/static/icons/friend/white_nv.png" : "/static/icons/friend/white_nan.png",
        l: common_vendor.t(user.value.age),
        m: common_vendor.t(user.value.weight),
        n: common_vendor.t(user.value.height),
        o: user.value.distance !== ""
      }, user.value.distance !== "" ? {
        p: common_assets._imports_1$7,
        q: common_vendor.t(user.value.distance)
      } : {}, {
        r: common_vendor.f(banners.value, (item, idx, i0) => {
          return {
            a: item.img,
            b: idx
          };
        }),
        s: common_assets._imports_2$2,
        t: common_assets._imports_3$2,
        v: common_assets._imports_4$1,
        w: common_vendor.f(tabs, (tab, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab),
            b: activeTab.value === idx
          }, activeTab.value === idx ? {} : {}, {
            c: tab,
            d: common_vendor.n({
              active: activeTab.value === idx
            }),
            e: common_vendor.o(($event) => switchTab(idx), tab)
          });
        }),
        x: services.value.length > 0
      }, services.value.length > 0 ? {
        y: common_vendor.f(services.value, (item, k0, i0) => {
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
            f: item.title
          };
        })
      } : {
        z: common_assets._imports_0
      }, {
        A: activeTab.value === 0,
        B: common_assets._imports_0,
        C: activeTab.value === 1,
        D: comments.length > 0
      }, comments.length > 0 ? {
        E: common_vendor.f(comments, (comment, idx, i0) => {
          return {
            a: comment.avatar,
            b: common_vendor.t(comment.name),
            c: common_vendor.f(5, (n, k1, i1) => {
              return {
                a: n,
                b: common_vendor.n({
                  filled: n <= comment.stars
                })
              };
            }),
            d: common_vendor.t(comment.stars >= 4 ? "好评" : "中评"),
            e: common_vendor.f(comment.tags, (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            }),
            f: common_vendor.t(comment.content),
            g: common_vendor.t(comment.date),
            h: idx
          };
        })
      } : {
        F: common_assets._imports_0
      }, {
        G: activeTab.value === 2
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-21c5b98b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/subPackages/friend/detail.js.map
