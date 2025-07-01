"use strict";
const common_vendor = require("../../../common/vendor.js");
const common_assets = require("../../../common/assets.js");
const api_user = require("../../../api/user.js");
const api_home = require("../../../api/home.js");
const api_file = require("../../../api/file.js");
const stores_user = require("../../../stores/user.js");
const cacheExpireTime = 5 * 60 * 1e3;
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    common_vendor.ref(false);
    const isSubmitting = common_vendor.ref(false);
    const agreementAccepted = common_vendor.ref(false);
    const formData = common_vendor.reactive({
      nickname: "",
      gender: "",
      age: "",
      height: "",
      weight: "",
      city: "深圳市"
      // 保留原有字段用于兼容
    });
    const showCityPicker = common_vendor.ref(false);
    const selectedCities = common_vendor.ref([]);
    const tempSelectedCities = common_vendor.ref([]);
    const cityList = common_vendor.ref([]);
    const cityLoading = common_vendor.ref(false);
    const photos = common_vendor.ref([]);
    const serviceSkills = common_vendor.ref([]);
    const selectedSkills = common_vendor.ref([]);
    const servicesLoading = common_vendor.ref(false);
    const skillCategories = common_vendor.ref([]);
    const selectedTags = common_vendor.ref([]);
    const showTagPicker = common_vendor.ref(false);
    const tempSelectedTags = common_vendor.ref([]);
    const tagsLoading = common_vendor.ref(false);
    const currentTagType = common_vendor.ref(4);
    const currentTagList = common_vendor.ref([]);
    const tagsCache = common_vendor.ref(/* @__PURE__ */ new Map());
    const cacheTimestamps = common_vendor.ref(/* @__PURE__ */ new Map());
    const tagNavItems = common_vendor.ref([
      { type: 4, name: "个性特质" },
      { type: 5, name: "我的爱好" },
      { type: 6, name: "外貌风格" },
      { type: 7, name: "专业技能" },
      { type: 8, name: "热门推荐" }
    ]);
    const loadServicesByCity = async () => {
      if (selectedCities.value.length === 0) {
        serviceSkills.value = [];
        skillCategories.value = [];
        return;
      }
      servicesLoading.value = true;
      try {
        const cityCodes = selectedCities.value.map((cityName) => {
          const city = cityList.value.find((c) => c.name === cityName);
          return city ? city.code : null;
        }).filter((code) => code !== null);
        if (cityCodes.length === 0) {
          common_vendor.index.__f__("warn", "at subPackages/friend/apply/index.vue:536", "未找到有效的城市代码");
          serviceSkills.value = [];
          skillCategories.value = [];
          return;
        }
        const response = await api_user.getServicesByCities(cityCodes);
        if (response.data && response.data.code === 0 && response.data.data) {
          serviceSkills.value = response.data.data;
          groupServicesByCategory();
          common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:550", "服务技能列表加载成功:", serviceSkills.value);
          common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:551", "服务技能分组:", skillCategories.value);
        } else {
          common_vendor.index.__f__("warn", "at subPackages/friend/apply/index.vue:553", "获取服务技能列表失败");
          serviceSkills.value = [];
          skillCategories.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:558", "获取服务技能列表失败:", error);
        serviceSkills.value = [];
        skillCategories.value = [];
      } finally {
        servicesLoading.value = false;
      }
    };
    const groupServicesByCategory = () => {
      const categoryMap = {};
      serviceSkills.value.forEach((service) => {
        const categoryId = service.category;
        const categoryName = service.category_name || "其他";
        if (!categoryMap[categoryId]) {
          categoryMap[categoryId] = {
            id: categoryId,
            name: categoryName,
            services: []
          };
        }
        categoryMap[categoryId].services.push(service);
      });
      skillCategories.value = Object.values(categoryMap).sort((a, b) => a.id - b.id);
    };
    const loadCityList = async () => {
      cityLoading.value = true;
      try {
        const response = await api_home.getCityList();
        if (response.data && response.data.code === 0 && response.data.data) {
          cityList.value = response.data.data.map((city) => ({
            name: city.name,
            code: city.city_code
            // 保持字段名一致
          }));
          common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:603", "申请页面区域列表加载成功:", cityList.value);
        } else {
          common_vendor.index.__f__("warn", "at subPackages/friend/apply/index.vue:605", "获取区域列表失败");
          cityList.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:609", "获取区域列表失败:", error);
        cityList.value = [];
      } finally {
        cityLoading.value = false;
      }
    };
    const selectGender = (gender) => {
      formData.gender = gender;
    };
    const showCitySelector = () => {
      tempSelectedCities.value = [...selectedCities.value];
      showCityPicker.value = true;
    };
    const hideCitySelector = () => {
      tempSelectedCities.value = [];
      showCityPicker.value = false;
    };
    const toggleCitySelection = (cityName) => {
      const index = tempSelectedCities.value.indexOf(cityName);
      if (index > -1) {
        tempSelectedCities.value.splice(index, 1);
      } else {
        tempSelectedCities.value.push(cityName);
      }
      common_vendor.index.vibrateShort({
        type: "light"
      });
    };
    const removeCityFromSelection = (cityName) => {
      const index = selectedCities.value.indexOf(cityName);
      if (index > -1) {
        selectedCities.value.splice(index, 1);
        common_vendor.index.vibrateShort({
          type: "light"
        });
      }
    };
    const confirmCitySelection = async () => {
      if (tempSelectedCities.value.length === 0) {
        common_vendor.index.showToast({
          title: "请至少选择一个服务区域",
          icon: "none"
        });
        return;
      }
      selectedCities.value = [...tempSelectedCities.value];
      formData.city = selectedCities.value[0];
      showCityPicker.value = false;
      tempSelectedCities.value = [];
      selectedSkills.value = [];
      skillCategories.value = [];
      await loadServicesByCity();
    };
    const addPhoto = () => {
      const maxCount = 6 - photos.value.length;
      if (maxCount <= 0) {
        common_vendor.index.showToast({
          title: "最多只能上传6张照片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: maxCount,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          common_vendor.index.showLoading({
            title: "上传中...",
            mask: true
          });
          try {
            const uploadPromises = res.tempFilePaths.map(async (filePath, index) => {
              try {
                const fileInfo = await getFileInfo(filePath);
                common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:724", "fileInfo", fileInfo);
                common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:725", "filePath", filePath);
                if (!fileInfo || !fileInfo.extension) {
                  throw new Error("无法获取文件信息");
                }
                const uploadResult = await api_file.uploadFile({
                  filePath,
                  name: `photo_${Date.now()}_${index}.${fileInfo.extension}`
                });
                const fileData = api_file.getUploadResult(uploadResult);
                if (!fileData || !fileData.url) {
                  throw new Error("上传结果解析失败");
                }
                return "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + fileData.url;
              } catch (error) {
                common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:744", `第${index + 1}张照片上传失败:`, error);
                throw error;
              }
            });
            const uploadedUrls = await Promise.all(uploadPromises);
            photos.value.push(...uploadedUrls);
            common_vendor.index.showToast({
              title: `成功上传${uploadedUrls.length}张照片`,
              icon: "success"
            });
          } catch (error) {
            common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:761", "照片上传失败:", error);
            common_vendor.index.showToast({
              title: "照片上传失败，请重试",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:771", "选择照片失败:", error);
          common_vendor.index.showToast({
            title: "选择照片失败",
            icon: "none"
          });
        }
      });
    };
    const getFileInfo = (filePath) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.getFileInfo({
          filePath,
          success: (res) => {
            const extension = filePath.split(".").pop().toLowerCase();
            resolve({
              size: res.size,
              extension
            });
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:794", "获取文件信息失败:", error);
            const extension = filePath.split(".").pop().toLowerCase() || "jpg";
            resolve({
              size: 0,
              extension
            });
          }
        });
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
    const toggleSkill = (service) => {
      const serviceId = service.id;
      const index = selectedSkills.value.indexOf(serviceId);
      if (index > -1) {
        selectedSkills.value.splice(index, 1);
      } else {
        selectedSkills.value.push(serviceId);
      }
      common_vendor.index.vibrateShort({
        type: "light"
      });
    };
    const toggleAgreement = () => {
      agreementAccepted.value = !agreementAccepted.value;
      common_vendor.index.vibrateShort({
        type: "light"
      });
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
      if (!agreementAccepted.value) {
        common_vendor.index.showToast({
          title: "请先同意友伴服务协议",
          icon: "none",
          duration: 2e3
        });
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
      if (selectedCities.value.length === 0) {
        common_vendor.index.showToast({ title: "请至少选择一个服务区域", icon: "none" });
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
        const serviceAreaCodes = selectedCities.value.map((cityName) => {
          const city = cityList.value.find((c) => c.name === cityName);
          return city ? String(city.code) : null;
        }).filter((code) => code !== null);
        if (serviceAreaCodes.length === 0) {
          common_vendor.index.showToast({
            title: "服务区域数据异常，请重新选择",
            icon: "none"
          });
          return;
        }
        const submitData = {
          nickname: formData.nickname.trim(),
          gender: formData.gender === "male" ? "男" : "女",
          age: parseInt(formData.age),
          height: parseInt(formData.height),
          weight: parseInt(formData.weight),
          service_areas: serviceAreaCodes,
          // 服务区域代码字符串数组
          services: selectedSkills.value,
          // 服务ID数组
          can_accept_orders: "N",
          // 不允许接单
          photos: photos.value,
          tags: selectedTags.value.map((tag) => tag.tag_name),
          // 个性标签名称数组
          phone: userStore.userInfo.phone || ""
          // 添加phone参数
        };
        common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1004", "提交数据:", submitData);
        const response = await api_user.createCompanionApplication(submitData);
        common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1009", "接口响应:", response);
        if (response && response.data && response.data.code === 0) {
          const successMessage = "恭喜您！入驻申请已通过，您已成功成为友伴师。";
          common_vendor.index.showModal({
            title: "入驻成功 🎉",
            content: successMessage,
            showCancel: false,
            confirmText: "我知道了",
            success: () => {
              common_vendor.index.$emit("applicationStatusChanged", {
                status: "approved",
                message: "入驻申请已通过"
              });
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
        common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:1046", "提交失败:", error);
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
    common_vendor.onMounted(async () => {
      await loadCityList();
      common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1079", "标签缓存配置:", {
        expireTime: `${cacheExpireTime / 1e3 / 60}分钟`,
        cacheSize: tagsCache.value.size
      });
    });
    const showTagSelector = () => {
      tempSelectedTags.value = [...selectedTags.value];
      showTagPicker.value = true;
      loadTagsByType(4);
    };
    const hideTagSelector = () => {
      tempSelectedTags.value = [];
      showTagPicker.value = false;
    };
    const switchTagType = (tagType) => {
      currentTagType.value = tagType;
      loadTagsByType(tagType);
    };
    const isCacheValid = (tagType) => {
      const timestamp = cacheTimestamps.value.get(tagType);
      if (!timestamp)
        return false;
      const now = Date.now();
      return now - timestamp < cacheExpireTime;
    };
    const getTagsFromCache = (tagType) => {
      return tagsCache.value.get(tagType) || [];
    };
    const setTagsToCache = (tagType, tagList) => {
      tagsCache.value.set(tagType, tagList);
      cacheTimestamps.value.set(tagType, Date.now());
      common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1127", `标签类型${tagType}已缓存，数据量: ${tagList.length}`);
    };
    const loadTagsByType = async (tagType, forceRefresh = false) => {
      if (!forceRefresh && isCacheValid(tagType)) {
        const cachedTags = getTagsFromCache(tagType);
        if (cachedTags.length > 0) {
          common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1152", `使用缓存数据 - 标签类型${tagType}，数据量: ${cachedTags.length}`);
          currentTagList.value = cachedTags;
          return;
        }
      }
      tagsLoading.value = true;
      try {
        common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1160", `开始加载标签类型: ${tagType}`);
        const params = {
          tag_type: tagType,
          page: 1,
          pageSize: 60
        };
        common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1168", "请求参数:", params);
        const response = await api_user.getPersonalityTags(params);
        common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1171", "API响应:", response);
        if (response.data && response.data.code === 0 && response.data.data) {
          const tagList = response.data.data.list || response.data.data;
          currentTagList.value = tagList;
          setTagsToCache(tagType, tagList);
          common_vendor.index.__f__("log", "at subPackages/friend/apply/index.vue:1181", `标签类型${tagType}加载成功:`, tagList);
        } else {
          common_vendor.index.__f__("warn", "at subPackages/friend/apply/index.vue:1183", `获取标签类型${tagType}失败，响应数据:`, response);
          currentTagList.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:1187", `获取标签类型${tagType}失败:`, error);
        common_vendor.index.__f__("error", "at subPackages/friend/apply/index.vue:1188", "错误详情:", error.response || error);
        currentTagList.value = [];
      } finally {
        tagsLoading.value = false;
      }
    };
    const isTagSelected = (tagId) => {
      return tempSelectedTags.value.some((tag) => tag.id === tagId);
    };
    const toggleTagSelection = (tag) => {
      const index = tempSelectedTags.value.findIndex((t) => t.id === tag.id);
      if (index > -1) {
        tempSelectedTags.value.splice(index, 1);
      } else {
        if (tempSelectedTags.value.length >= 5) {
          common_vendor.index.showToast({
            title: "最多只能选择5个标签",
            icon: "none"
          });
          return;
        }
        tempSelectedTags.value.push(tag);
      }
      common_vendor.index.vibrateShort({
        type: "light"
      });
    };
    const confirmTagSelection = () => {
      selectedTags.value = [...tempSelectedTags.value];
      showTagPicker.value = false;
      tempSelectedTags.value = [];
      common_vendor.index.showToast({
        title: `已选择${selectedTags.value.length}个标签`,
        icon: "success"
      });
    };
    const removeTag = (tag) => {
      const index = selectedTags.value.findIndex((t) => t.id === tag.id);
      if (index > -1) {
        selectedTags.value.splice(index, 1);
        common_vendor.index.vibrateShort({
          type: "light"
        });
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
        q: selectedCities.value.length === 0
      }, selectedCities.value.length === 0 ? {} : {
        r: common_vendor.t(selectedCities.value.length)
      }, {
        s: common_vendor.o(showCitySelector),
        t: selectedCities.value.length > 0
      }, selectedCities.value.length > 0 ? {
        v: common_vendor.f(selectedCities.value, (city, k0, i0) => {
          return {
            a: common_vendor.t(city),
            b: city,
            c: common_vendor.o(($event) => removeCityFromSelection(city), city)
          };
        })
      } : {}, {
        w: common_vendor.f(photos.value, (photo, index, i0) => {
          return {
            a: photo,
            b: common_vendor.o(($event) => deletePhoto(index), index),
            c: index,
            d: common_vendor.o(($event) => previewPhoto(index), index)
          };
        }),
        x: photos.value.length < 6
      }, photos.value.length < 6 ? {
        y: common_vendor.o(addPhoto)
      } : {}, {
        z: servicesLoading.value
      }, servicesLoading.value ? {} : selectedCities.value.length === 0 ? {} : skillCategories.value.length > 0 ? {
        C: common_vendor.f(skillCategories.value, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.name),
            b: common_vendor.f(category.services, (service, k1, i1) => {
              return {
                a: common_vendor.t(service.name),
                b: selectedSkills.value.includes(service.id) ? 1 : "",
                c: service.id,
                d: common_vendor.o(($event) => toggleSkill(service), service.id)
              };
            }),
            c: category.id
          };
        })
      } : {}, {
        A: selectedCities.value.length === 0,
        B: skillCategories.value.length > 0,
        D: selectedTags.value.length > 0
      }, selectedTags.value.length > 0 ? {
        E: common_vendor.f(selectedTags.value, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag.tag_name),
            b: tag.id,
            c: common_vendor.o(($event) => removeTag(tag), tag.id)
          };
        })
      } : {}, {
        F: common_vendor.t(selectedTags.value.length),
        G: selectedTags.value.length >= 5 ? 1 : "",
        H: common_vendor.o(($event) => selectedTags.value.length < 5 ? showTagSelector() : null),
        I: agreementAccepted.value
      }, agreementAccepted.value ? {} : {}, {
        J: agreementAccepted.value ? 1 : "",
        K: common_vendor.o(viewAgreement),
        L: common_vendor.o(toggleAgreement),
        M: !isSubmitting.value
      }, !isSubmitting.value ? {} : {}, {
        N: isSubmitting.value || !agreementAccepted.value ? 1 : "",
        O: common_vendor.o(submitApplication),
        P: showCityPicker.value
      }, showCityPicker.value ? common_vendor.e({
        Q: common_vendor.o(hideCitySelector),
        R: cityLoading.value
      }, cityLoading.value ? {} : {
        S: common_vendor.f(cityList.value, (cityItem, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(cityItem.name),
            b: tempSelectedCities.value.includes(cityItem.name)
          }, tempSelectedCities.value.includes(cityItem.name) ? {} : {}, {
            c: index,
            d: common_vendor.n({
              active: tempSelectedCities.value.includes(cityItem.name)
            }),
            e: common_vendor.o(($event) => toggleCitySelection(cityItem.name), index)
          });
        })
      }, {
        T: common_vendor.t(tempSelectedCities.value.length),
        U: common_vendor.o(confirmCitySelection),
        V: common_vendor.o(() => {
        }),
        W: common_vendor.o(hideCitySelector)
      }) : {}, {
        X: showTagPicker.value
      }, showTagPicker.value ? common_vendor.e({
        Y: common_vendor.o(hideTagSelector),
        Z: common_vendor.f(tagNavItems.value, (navItem, k0, i0) => {
          return {
            a: common_vendor.t(navItem.name),
            b: navItem.type,
            c: common_vendor.n({
              active: currentTagType.value === navItem.type
            }),
            d: common_vendor.o(($event) => switchTagType(navItem.type), navItem.type)
          };
        }),
        aa: !tagsLoading.value && tempSelectedTags.value.length >= 5
      }, !tagsLoading.value && tempSelectedTags.value.length >= 5 ? {} : {}, {
        ab: tagsLoading.value
      }, tagsLoading.value ? {} : {
        ac: common_vendor.f(currentTagList.value, (tag, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tag.tag_name),
            b: isTagSelected(tag.id)
          }, isTagSelected(tag.id) ? {} : {}, {
            c: tag.id,
            d: common_vendor.n({
              selected: isTagSelected(tag.id)
            }),
            e: common_vendor.o(($event) => toggleTagSelection(tag), tag.id)
          });
        })
      }, {
        ad: !tagsLoading.value && currentTagList.value.length === 0
      }, !tagsLoading.value && currentTagList.value.length === 0 ? {} : {}, {
        ae: common_vendor.t(tempSelectedTags.value.length),
        af: common_vendor.o(confirmTagSelection),
        ag: common_vendor.o(() => {
        }),
        ah: common_vendor.o(hideTagSelector)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-eb2c0b40"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/friend/apply/index.js.map
