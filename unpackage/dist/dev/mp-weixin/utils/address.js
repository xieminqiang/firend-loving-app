"use strict";
const common_vendor = require("../common/vendor.js");
function processAddress(address, maxLength = 255) {
  if (!address || typeof address !== "string") {
    return "";
  }
  let processedAddress = address.trim();
  processedAddress = processedAddress.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
  processedAddress = processedAddress.replace(/\s+/g, " ");
  if (processedAddress.length > maxLength) {
    common_vendor.index.__f__("warn", "at utils/address.js:27", `地址长度超过${maxLength}字符，进行截断处理`);
    common_vendor.index.__f__("log", "at utils/address.js:28", "- 原始地址:", address);
    common_vendor.index.__f__("log", "at utils/address.js:29", "- 原始长度:", address.length);
    common_vendor.index.__f__("log", "at utils/address.js:30", "- 处理后地址:", processedAddress);
    common_vendor.index.__f__("log", "at utils/address.js:31", "- 处理后长度:", processedAddress.length);
    processedAddress = processedAddress.substring(0, maxLength);
    common_vendor.index.__f__("log", "at utils/address.js:34", "- 截断后地址:", processedAddress);
    common_vendor.index.__f__("log", "at utils/address.js:35", "- 截断后长度:", processedAddress.length);
  }
  return processedAddress;
}
function analyzeAddress(address) {
  if (!address || typeof address !== "string") {
    return {
      length: 0,
      byteLength: 0,
      hasHiddenChars: false,
      charCodes: [],
      processed: ""
    };
  }
  const processed = processAddress(address);
  const byteLength = new TextEncoder().encode(processed).length;
  const hasHiddenChars = /[\u0000-\u001F\u007F-\u009F]/.test(address);
  const charCodes = Array.from(processed).map((char) => char.charCodeAt(0));
  return {
    original: address,
    originalLength: address.length,
    length: processed.length,
    byteLength,
    hasHiddenChars,
    charCodes,
    processed
  };
}
exports.analyzeAddress = analyzeAddress;
exports.processAddress = processAddress;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/address.js.map
