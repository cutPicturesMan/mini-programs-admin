// 管理端小程序
// http://ovweugbfd.bkt.clouddn.com/admin-test.jpg
// appid: wxca2c78f63ed513c5
// appsecret: 176e04d9001b35e8d264dd6c7e8b0d19
import http from './public/js/http.js';
import api from './public/js/api.js';

App({
  // 用户当前角色代码
  roleCode: '',
  // 用户整体信息
  userInfo: {},
  // 获取用户信息，返回一个promise
  getUserInfo () {
    let p = new Promise((resolve, reject) => {
      // 如果还未获取用户角色，则请求并设置
      if (!this.userInfo.id) {
        wx.showLoading();

        http.request({
          url: api.user
        }).then((res) => {
          let userInfo = res.data;
          wx.hideLoading();

          if (res.errorCode === 200) {
            // 对角色roles字段进行排序，业务员 -> 经理 -> 财务 -> 仓管
            userInfo.roles.sort((prev, next) => {
              if (prev.id > next.id) {
                return 1;
              } else if (prev.id < next.id) {
                return -1;
              } else {
                return 0;
              }
            });

            // 设置用户信息
            this.userInfo = res.data;
            // 设置用户当前角色，默认选择多角色中的第一个
            this.roleCode = userInfo.roles.length != 0 ? userInfo.roles[0].name : '';
            resolve(res.data);
          } else {
            wx.showModal({
              title: '提示',
              content: '用户数据获取失败，请重新进入小程序'
            })
            reject(res.data);
          }
        });
      } else {
        // 已经请求过用户角色，则直接返回用户数据
        resolve(this.userInfo);
      }
    })

    return p;
  }
})
