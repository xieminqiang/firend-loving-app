"use strict";
const common_vendor = require("../common/vendor.js");
require("../config/http.js");
const config_config = require("../config/config.js");
const baseURL = config_config.config.development.baseUrl;
const uploadFile = (fileData) => {
  return new Promise((resolve, reject) => {
    common_vendor.index.__f__("log", "at api/file.js:18", "开始上传文件:", fileData);
    common_vendor.index.__f__("log", "at api/file.js:20", "开始上传文件:eeee", baseURL + "/file/upload");
    common_vendor.index.uploadFile({
      url: baseURL + "/file/upload",
      filePath: fileData.filePath,
      name: "file",
      header: {
        "Authorization": common_vendor.index.getStorageSync("token") || ""
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data);
          } else {
            reject(new Error(data.message || "上传失败"));
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at api/file.js:37", "响应数据解析失败:", error, res.data);
          reject(new Error("响应数据解析失败"));
        }
      },
      fail: (error) => {
        common_vendor.index.__f__("error", "at api/file.js:42", "网络请求失败:", error);
        reject(new Error("网络请求失败"));
      }
    });
  });
};
const getUploadResult = (uploadResult) => {
  if (uploadResult && uploadResult.data) {
    return {
      objectKey: uploadResult.data.object_key,
      url: uploadResult.data.url,
      cover: uploadResult.data.cover,
      isVideo: uploadResult.data.is_video
    };
  }
  return null;
};
exports.getUploadResult = getUploadResult;
exports.uploadFile = uploadFile;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/file.js.map
