"use strict";const e=require("../common/vendor.js"),r=e.defineStore("user",{state:()=>({userInfo:{}}),getters:{},actions:{setUserInfo(s){this.userInfo=s,e.index.__f__("log","at stores/user.js:20","userInfo",this.userInfo)},clearUserInfo(){this.userInfo={}}},persist:{key:"user-store",paths:["userInfo"]}});exports.useUserStore=r;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/user.js.map
