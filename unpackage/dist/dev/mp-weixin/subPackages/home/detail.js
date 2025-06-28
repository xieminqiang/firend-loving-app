"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_home = require("../../api/home.js");
require("../../config/http.js");
require("../../stores/user.js");
require("../../config/config.js");
const _sfc_main = {
  __name: "detail",
  setup(__props) {
    const params = common_vendor.ref({});
    const loading = common_vendor.ref(true);
    const error = common_vendor.ref("");
    const serviceDetail = common_vendor.ref({});
    const priceTemplate = common_vendor.ref({});
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      params.value = currentPage.options || {};
      console.log("详情页参数:", params.value);
      if (!params.value.id) {
        error.value = "缺少服务ID参数";
        loading.value = false;
        return;
      }
      loadData();
    });
    const loadData = async () => {
      loading.value = true;
      error.value = "";
      try {
        const serviceRes = await api_home.getServiceDetail(params.value.id);
        if (serviceRes.data && serviceRes.data.code === 0) {
          serviceDetail.value = serviceRes.data.data;
          const templateId = params.value.price_template_id || serviceDetail.value.price_template_id;
          if (templateId) {
            try {
              const templateRes = await api_home.getPriceTemplateDetail(templateId);
              if (templateRes.data && templateRes.data.code === 0) {
                priceTemplate.value = templateRes.data.data;
              }
            } catch (templateError) {
              console.warn("获取价格模板失败:", templateError);
            }
          }
        } else {
          throw new Error(serviceRes.data && serviceRes.data.message || "获取服务详情失败");
        }
      } catch (err) {
        console.error("加载数据失败:", err);
        error.value = err.message || "加载失败，请重试";
      } finally {
        loading.value = false;
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const onImageError = () => {
      console.log("图片加载失败");
    };
    const previewImage = () => {
      if (serviceDetail.value && serviceDetail.value.image_url) {
        const imgBaseUrl = "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com";
        const imageUrl = serviceDetail.value.image_url.startsWith("http") ? serviceDetail.value.image_url : imgBaseUrl + serviceDetail.value.image_url;
        console.log("预览图片URL:", imageUrl);
        common_vendor.index.previewImage({
          urls: [imageUrl],
          current: imageUrl,
          success: () => {
            console.log("图片预览成功");
          },
          fail: (err) => {
            console.error("图片预览失败:", err);
            common_vendor.index.showToast({
              title: "图片预览失败",
              icon: "none"
            });
          }
        });
      } else {
        common_vendor.index.showToast({
          title: "图片加载中，请稍后再试",
          icon: "none"
        });
      }
    };
    const contactService = () => {
      common_vendor.index.showModal({
        title: "咨询服务",
        content: "是否要联系客服咨询此服务？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "正在为您转接客服...",
              icon: "none"
            });
          }
        }
      });
    };
    const bookService = () => {
      common_vendor.index.showModal({
        title: "确认预约",
        content: `确认预约${serviceDetail.value.name}？`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({
              title: "预约成功！",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 2e3);
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : !error.value ? common_vendor.e({
        c: common_assets._imports_0$4,
        d: common_vendor.o(goBack),
        e: _ctx.$imgBaseUrl + serviceDetail.value.image_url,
        f: common_vendor.o(onImageError),
        g: common_assets._imports_1$4,
        h: common_vendor.t(serviceDetail.value.category_name || "服务"),
        i: common_assets._imports_2$3,
        j: common_vendor.o(previewImage),
        k: common_vendor.t(serviceDetail.value.name || "服务详情"),
        l: serviceDetail.value.min_price
      }, serviceDetail.value.min_price ? common_vendor.e({
        m: common_vendor.t(serviceDetail.value.min_price),
        n: priceTemplate.value.unit
      }, priceTemplate.value.unit ? {
        o: common_vendor.t(priceTemplate.value.unit)
      } : {}) : {}, {
        p: serviceDetail.value.tags && serviceDetail.value.tags.length > 0
      }, serviceDetail.value.tags && serviceDetail.value.tags.length > 0 ? {
        q: common_vendor.f(serviceDetail.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        r: priceTemplate.value && priceTemplate.value.levels && priceTemplate.value.levels.length > 0
      }, priceTemplate.value && priceTemplate.value.levels && priceTemplate.value.levels.length > 0 ? {
        s: common_assets._imports_3$2,
        t: common_vendor.f(priceTemplate.value.levels, (level, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(level.level_name),
            b: level.level_order <= 2
          }, level.level_order <= 2 ? {
            c: common_vendor.t(level.level_order === 1 ? "入门" : "推荐")
          } : {}, {
            d: common_vendor.t(level.price),
            e: common_vendor.t(level.unit),
            f: level.id
          });
        })
      } : {}, {
        v: common_assets._imports_1$4,
        w: common_vendor.t(serviceDetail.value.description || "暂无详细说明")
      }) : {}, {
        b: !error.value,
        x: !loading.value && !error.value
      }, !loading.value && !error.value ? {
        y: common_assets._imports_4,
        z: common_vendor.o(contactService),
        A: common_vendor.o(bookService)
      } : {}, {
        B: error.value
      }, error.value ? {
        C: common_vendor.t(error.value),
        D: common_vendor.o(loadData)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5b390ea8"], ["__file", "/Users/mac/Documents/firend-loving-app/subPackages/home/detail.vue"]]);
wx.createPage(MiniProgramPage);
