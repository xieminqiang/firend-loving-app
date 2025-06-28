"use strict";
const config = {
  development: {
    //https://dev.anzhuhui.com/fresh/v1  http://192.168.1.11:9901/v1
    baseUrl: "http://192.168.1.15:9901/love/v1/front"
  },
  production: {
    baseUrl: "https://gxj.aipointer.com/gxj/v1"
  }
};
exports.config = config;
