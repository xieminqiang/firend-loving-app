"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_user = require("../../../api/user.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    common_vendor.ref(false);
    const isSubmitting = common_vendor.ref(false);
    const formData = common_vendor.reactive({
      nickname: "",
      gender: "",
      age: "",
      height: "",
      weight: "",
      city: "深圳市"
    });
    const photos = common_vendor.ref([]);
    const serviceSkills = common_vendor.ref([
      "陪拍写真",
      "陪护就医",
      "陪伴购物",
      "陪同观影",
      "礼仪模特",
      "探店体验",
      "陪诊服务",
      "陪伴聊天"
    ]);
    const selectedSkills = common_vendor.ref([]);
    const skillToServiceMap = {
      "陪拍写真": 1,
      "陪护就医": 2,
      "陪伴购物": 3,
      "陪同观影": 4,
      "礼仪模特": 5,
      "探店体验": 6,
      "陪诊服务": 7,
      "陪伴聊天": 8
    };
    const selectGender = (gender) => {
      formData.gender = gender;
    };
    const selectCity = () => {
      common_vendor.index.showActionSheet({
        itemList: ["深圳市", "广州市", "上海市", "北京市", "杭州市", "南京市", "苏州市", "成都市", "重庆市", "武汉市", "西安市"],
        success: (res) => {
          const cities = ["深圳市", "广州市", "上海市", "北京市", "杭州市", "南京市", "苏州市", "成都市", "重庆市", "武汉市", "西安市"];
          formData.city = cities[res.tapIndex];
        }
      });
    };
    const addPhoto = () => {
      common_vendor.index.chooseImage({
        count: 6 - photos.value.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          photos.value.push(...res.tempFilePaths);
        }
      });
    };
    const previewPhoto = (index) => {
      common_vendor.index.previewImage({
        urls: photos.value,
        current: index
      });
    };
    const deletePhoto = (index) => {
      photos.value.splice(index, 1);
    };
    const toggleSkill = (skill) => {
      const index = selectedSkills.value.indexOf(skill);
      if (index > -1) {
        selectedSkills.value.splice(index, 1);
      } else {
        selectedSkills.value.push(skill);
      }
    };
    const viewAgreement = () => {
      common_vendor.index.showToast({
        title: "协议功能待开发",
        icon: "none"
      });
    };
    const handleBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const submitApplication = async () => {
      if (isSubmitting.value) {
        return;
      }
      if (!formData.nickname.trim()) {
        common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
        return;
      }
      if (formData.nickname.length > 50) {
        common_vendor.index.showToast({ title: "昵称不能超过50个字符", icon: "none" });
        return;
      }
      if (!formData.gender) {
        common_vendor.index.showToast({ title: "请选择性别", icon: "none" });
        return;
      }
      const age = parseInt(formData.age);
      const height = parseInt(formData.height);
      const weight = parseInt(formData.weight);
      if (!age || age < 18 || age > 65) {
        common_vendor.index.showToast({ title: "年龄必须在18-65岁之间", icon: "none" });
        return;
      }
      if (!height || height < 100 || height > 250) {
        common_vendor.index.showToast({ title: "身高必须在100-250cm之间", icon: "none" });
        return;
      }
      if (!weight || weight < 30 || weight > 200) {
        common_vendor.index.showToast({ title: "请输入合理的体重", icon: "none" });
        return;
      }
      if (!formData.city.trim()) {
        common_vendor.index.showToast({ title: "请选择城市", icon: "none" });
        return;
      }
      if (photos.value.length === 0) {
        common_vendor.index.showToast({ title: "请上传至少一张生活照", icon: "none" });
        return;
      }
      if (photos.value.length > 9) {
        common_vendor.index.showToast({ title: "最多只能上传9张照片", icon: "none" });
        return;
      }
      if (selectedSkills.value.length === 0) {
        common_vendor.index.showToast({ title: "请至少选择一项服务技能", icon: "none" });
        return;
      }
      common_vendor.index.showModal({
        title: "确认提交",
        content: "确定要提交入驻申请吗？提交后将进入审核流程。",
        success: async (res) => {
          if (res.confirm) {
            await doSubmit();
          }
        }
      });
    };
    const doSubmit = async () => {
      isSubmitting.value = true;
      try {
        const submitData = {
          nickname: formData.nickname.trim(),
          gender: formData.gender === "male" ? "男" : "女",
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          city: formData.city,
          photos: photos.value,
          services: selectedSkills.value.map((skill) => ({
            service_id: skillToServiceMap[skill],
            level: 1
            // 认证等级固定为1
          }))
        };
        common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:495", "提交数据:", submitData);
        const response = await api_user.createCompanionApplication(submitData);
        common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:500", "接口响应:", response);
        if (response && response.data && response.data.code === 0) {
          common_vendor.index.showModal({
            title: "申请提交成功 🎉",
            content: "您的友伴入驻申请已成功提交！我们会在3-5个工作日内完成审核，请耐心等待。审核结果将通过消息通知您。",
            showCancel: false,
            confirmText: "我知道了",
            success: () => {
              common_vendor.index.navigateBack();
            }
          });
        } else {
          const errorMsg = response && response.data && response.data.message || "提交失败，请稍后重试";
          common_vendor.index.showModal({
            title: "提交失败",
            content: errorMsg,
            showCancel: false,
            confirmText: "我知道了"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:528", "提交失败:", error);
        let errorMessage = "提交失败，请稍后重试";
        if (error && error.message) {
          if (error.message.includes("网络")) {
            errorMessage = "网络连接异常，请检查网络后重试";
          } else if (error.message.includes("参数")) {
            errorMessage = "提交信息有误，请检查后重试";
          } else if (error.message.includes("重复")) {
            errorMessage = "您已提交过申请，请勿重复提交";
          } else {
            errorMessage = error.message;
          }
        }
        common_vendor.index.showModal({
          title: "提交失败",
          content: errorMessage,
          showCancel: false,
          confirmText: "我知道了"
        });
      } finally {
        isSubmitting.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$3,
        b: common_vendor.o(handleBack),
        c: formData.nickname,
        d: common_vendor.o(($event) => formData.nickname = $event.detail.value),
        e: common_assets._imports_1$1,
        f: formData.gender === "male" ? 1 : "",
        g: common_vendor.o(($event) => selectGender("male")),
        h: common_assets._imports_2,
        i: formData.gender === "female" ? 1 : "",
        j: common_vendor.o(($event) => selectGender("female")),
        k: formData.age,
        l: common_vendor.o(($event) => formData.age = $event.detail.value),
        m: formData.height,
        n: common_vendor.o(($event) => formData.height = $event.detail.value),
        o: formData.weight,
        p: common_vendor.o(($event) => formData.weight = $event.detail.value),
        q: common_vendor.t(formData.city),
        r: common_vendor.o(selectCity),
        s: common_vendor.f(photos.value, (photo, index, i0) => {
          return {
            a: photo,
            b: common_vendor.o(($event) => deletePhoto(index), index),
            c: index,
            d: common_vendor.o(($event) => previewPhoto(index), index)
          };
        }),
        t: photos.value.length < 6
      }, photos.value.length < 6 ? {
        v: common_vendor.o(addPhoto)
      } : {}, {
        w: common_vendor.f(serviceSkills.value, (skill, k0, i0) => {
          return {
            a: common_vendor.t(skill),
            b: selectedSkills.value.includes(skill) ? 1 : "",
            c: skill,
            d: common_vendor.o(($event) => toggleSkill(skill), skill)
          };
        }),
        x: common_vendor.o(viewAgreement),
        y: !isSubmitting.value
      }, !isSubmitting.value ? {} : {}, {
        z: isSubmitting.value ? 1 : "",
        A: common_vendor.o(submitApplication)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-eb2c0b40"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/friend/apply/index.js.map
