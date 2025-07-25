// config.js
const config = {
    development: {//https://dev.anzhuhui.com/fresh/v1  http://192.168.1.15:9901/love/v1
         baseUrl: 'http://172.20.10.7:9901/love/v1'
    },
    production: {
         baseUrl: 'https://api.xieminqiang168.cn/love/v1'
    }
};

 // const baseURL = 'http://192.168.1.15:8884/v1'  http://121.196.160.48/gxj/view/#/login
 // https://api.aipointer.com/rest/v1  baseUrl: 'http://121.196.160.48/gxj/v1' https://dev.anzhuhui.com/gxj/v1
 //const baseURL = 'https://gxj.aipointer.com/gxj/v1';

export default config; 