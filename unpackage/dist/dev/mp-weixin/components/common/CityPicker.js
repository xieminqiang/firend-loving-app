"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_city = require("../../stores/city.js");
const _sfc_main = {
  __name: "CityPicker",
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:visible", "city-selected"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const cityStore = stores_city.useCityStore();
    const cityList = common_vendor.computed(() => cityStore.cityList);
    const currentCityIndex = common_vendor.computed(() => cityStore.cityIndex);
    const handleOverlayClick = () => {
      emit("update:visible", false);
    };
    const handleClose = () => {
      emit("update:visible", false);
    };
    const handleCitySelect = (index) => {
      cityStore.selectCity(index);
      emit("city-selected", index);
      emit("update:visible", false);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? {
        b: common_vendor.o(handleClose),
        c: common_vendor.f(cityList.value, (cityItem, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(cityItem.name),
            b: currentCityIndex.value === index
          }, currentCityIndex.value === index ? {} : {}, {
            c: index,
            d: common_vendor.n({
              active: currentCityIndex.value === index
            }),
            e: common_vendor.o(($event) => handleCitySelect(index), index)
          });
        }),
        d: common_vendor.o(() => {
        }),
        e: common_vendor.o(handleOverlayClick)
      } : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-14543794"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/common/CityPicker.js.map
