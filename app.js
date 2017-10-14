// 管理端小程序
// appid: wxca2c78f63ed513c5
// appsecret: 176e04d9001b35e8d264dd6c7e8b0d19

import http from './public/js/http.js';
import api from './public/js/api.js';

let role = wx.getStorageSync('role') || {};

App({
  // 用户角色
  role,
  onLaunch () {
    // this.getUserInfo();
  },
  // 获取用户信息，返回一个promise
  getUserInfo () {
    let p = new Promise((resolve, reject) => {
      // 如果还未获取用户角色，则请求并设置
      if (!this.role.id) {
        wx.showLoading();

        http.request({
          url: api.user
        }).then((res) => {
          wx.hideLoading();

          if (res.errorCode === 200) {
            wx.setStorageSync('role', res.data);

            this.role = res.data;
            resolve(res.data);
          } else {
            wx.showToast({
              title: '用户数据获取失败',
              image: '../../icons/close-circled.png'
            })
            reject(res.data);
          }
        });
      } else {
        // 已经请求过用户角色，则直接返回用户数据
        resolve(this.role);
      }
    })

    return p;
  }
})
