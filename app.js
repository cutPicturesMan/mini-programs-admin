// 管理端小程序
// appid: wxca2c78f63ed513c5
// appsecret: 176e04d9001b35e8d264dd6c7e8b0d19

import http from './public/js/http.js';
import api from './public/js/api.js';

App({
  globalData: {
    info: {},
  },
  onLaunch () {
    // this.getUserInfo();
  },
  // 获取用户信息，返回一个promise
  getUserInfo: function () {
    let p = new Promise((resolve, reject) => {
      // 如果还未获取用户角色，则请求并设置
      if (!this.globalData.info.id) {
        wx.showLoading();

        http.request({
          url: api.user
        }).then((res) => {
          wx.hideLoading();
          if (res.errorCode === 200) {
            this.globalData.info = res.data;
            resolve(res.data);
          } else {
            wx.showToast({
              title: '用户数据获取失败',
              image: '../../icons/close-circled.png'
            })
            reject(res);
          }
        });
      } else {
        // 已经请求过用户角色，则直接返回用户数据
        resolve(this.globalData.info);
      }
    })

    return p;
  },
})
