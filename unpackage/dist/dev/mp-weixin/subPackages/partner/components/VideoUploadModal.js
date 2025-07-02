"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_user = require("../../../api/user.js");
const api_file = require("../../../api/file.js");
const _sfc_main = {
  __name: "VideoUploadModal",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    applicationInfo: {
      type: Object,
      default: null
    }
  },
  emits: ["close", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const videoUrl = common_vendor.ref("");
    const isUploading = common_vendor.ref(false);
    const uploadProgress = common_vendor.ref(0);
    common_vendor.watch(() => props.show, (newVal) => {
      var _a;
      if (newVal && props.applicationInfo && props.applicationInfo.intro_video_url) {
        videoUrl.value = props.applicationInfo.intro_video_url;
      } else if (!newVal) {
        if (!((_a = props.applicationInfo) == null ? void 0 : _a.intro_video_url)) {
          videoUrl.value = "";
        }
        isUploading.value = false;
        uploadProgress.value = 0;
      }
    });
    const handleOverlayClick = () => {
      handleClose();
    };
    const handleClose = () => {
      emit("close");
    };
    const selectVideo = () => {
      videoUrl.value = "";
      common_vendor.index.chooseVideo({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        maxDuration: 60,
        camera: "back",
        success: async (res) => {
          const tempFilePath = res.tempFilePath;
          const duration = res.duration;
          const size = res.size;
          if (duration < 3 || duration > 60) {
            common_vendor.index.showToast({
              title: "视频时长必须在3-60秒之间",
              icon: "none"
            });
            return;
          }
          if (size > 500 * 1024 * 1024) {
            common_vendor.index.showToast({
              title: "视频文件大小不能超过500MB",
              icon: "none"
            });
            return;
          }
          common_vendor.index.showLoading({
            title: "上传中...",
            mask: true
          });
          try {
            const fileInfo = await getFileInfo(tempFilePath);
            const uploadResult = await api_file.uploadFile({
              filePath: tempFilePath,
              name: `intro_video_${Date.now()}.${fileInfo.extension}`
            });
            const fileData = api_file.getUploadResult(uploadResult);
            if (!fileData || !fileData.url) {
              throw new Error("上传结果解析失败");
            }
            videoUrl.value = "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + fileData.url;
            common_vendor.index.hideLoading();
          } catch (error) {
            common_vendor.index.hideLoading();
            common_vendor.index.__f__("error", "at subPackages/partner/components/VideoUploadModal.vue:204", "视频上传失败:", error);
            common_vendor.index.showToast({
              title: "上传失败，请重试",
              icon: "none"
            });
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at subPackages/partner/components/VideoUploadModal.vue:212", "选择视频失败:", error);
          if (error.errMsg && !error.errMsg.includes("cancel")) {
            common_vendor.index.showToast({
              title: "选择视频失败",
              icon: "none"
            });
          }
        }
      });
    };
    const submitVideo = async () => {
      if (!videoUrl.value) {
        common_vendor.index.showToast({
          title: "请先选择视频",
          icon: "none"
        });
        return;
      }
      if (isUploading.value) {
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "提交审核中..." });
        const response = await api_user.uploadCompanionVideo({
          intro_video_url: videoUrl.value
        });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "视频提交成功，等待审核",
          icon: "success"
        });
        handleClose();
        emit("success", {
          type: "video_uploaded",
          message: "视频已提交审核"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at subPackages/partner/components/VideoUploadModal.vue:262", "提交视频失败:", error);
        if (!error.data) {
          common_vendor.index.showToast({
            title: "提交失败，请重试",
            icon: "none"
          });
        }
      }
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
            common_vendor.index.__f__("error", "at subPackages/partner/components/VideoUploadModal.vue:287", "获取文件信息失败:", error);
            const extension = filePath.split(".").pop().toLowerCase() || "mp4";
            resolve({
              size: 0,
              extension
            });
          }
        });
      });
    };
    const getVideoStatusText = (status) => {
      switch (status) {
        case "pending":
          return "待审核";
        case "approved":
          return "已通过";
        case "rejected":
          return "已拒绝";
        default:
          return "未知状态";
      }
    };
    const getVideoStatusDesc = (status) => {
      switch (status) {
        case "pending":
          return "您的视频正在审核中，请耐心等待";
        case "approved":
          return "视频审核已通过，可以正常上线接单";
        case "rejected":
          return props.applicationInfo.remark != "" ? "原因：" + props.applicationInfo.remark : "视频审核未通过，请重新上传";
        default:
          return "请上传自我介绍视频";
      }
    };
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case "pending":
          return "status-pending";
        case "approved":
          return "status-approved";
        case "rejected":
          return "status-rejected";
        default:
          return "";
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.show
      }, __props.show ? common_vendor.e({
        b: common_vendor.o(handleClose),
        c: __props.applicationInfo && __props.applicationInfo.intro_video_url
      }, __props.applicationInfo && __props.applicationInfo.intro_video_url ? {
        d: common_vendor.t(getVideoStatusText(__props.applicationInfo.video_review_status)),
        e: common_vendor.n(getStatusBadgeClass(__props.applicationInfo.video_review_status)),
        f: common_vendor.t(getVideoStatusDesc(__props.applicationInfo.video_review_status))
      } : {}, {
        g: videoUrl.value && videoUrl.value != ""
      }, videoUrl.value && videoUrl.value != "" ? {
        h: videoUrl.value,
        i: common_vendor.o(selectVideo)
      } : {
        j: common_vendor.o(selectVideo)
      }, {
        k: isUploading.value
      }, isUploading.value ? {
        l: uploadProgress.value + "%",
        m: common_vendor.t(uploadProgress.value)
      } : {}, {
        n: common_vendor.o(handleClose),
        o: __props.applicationInfo && __props.applicationInfo.intro_video_url
      }, __props.applicationInfo && __props.applicationInfo.intro_video_url ? {
        p: common_vendor.t(isUploading.value ? "上传中..." : "重新提交")
      } : {
        q: common_vendor.t(isUploading.value ? "上传中..." : "提交审核")
      }, {
        r: !videoUrl.value || isUploading.value ? 1 : "",
        s: common_vendor.o(submitVideo),
        t: common_vendor.o(() => {
        }),
        v: common_vendor.o(handleOverlayClick)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bb09f897"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/subPackages/partner/components/VideoUploadModal.js.map
