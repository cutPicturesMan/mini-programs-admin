import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

let app = getApp();

Page({
  data: {
    info: {},
    // 是否正在加载数据
    isLoading: true,
    // 是否已经注册
    isRegisted: false
  },
  // 获取用户数据
  getData () {
    wx.showLoading();

    http.request({
      url: api.user
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        let isRegisted = false;
        // 如果存在用户名和头像
        if (res.data.nickName && res.data.avatarUrl) {
          isRegisted = true;
        }

        this.setData({
          info: res.data,
          isLoading: false,
          isRegisted
        });
      } else {
        wx.showToast({
          title: res.data.moreInfo,
          image: '../../icons/close-circled.png'
        })
      }
    });
  },
  // 注册用户
  registe () {
    wx.getUserInfo({
      success: function(res) {
        var userInfo = res.userInfo
        var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        var gender = userInfo.gender //性别 0：未知、1：男、2：女
        var province = userInfo.province
        var city = userInfo.city
        var country = userInfo.country

        wx.showLoading();

        http.request({
          url: api.user,
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            // rawData:
          }
        }).then((res) => {
          wx.hideLoading();

          if (res.errorCode === 200) {
            let isRegisted = false;
            // 如果存在用户名和头像
            if (res.data.nickName && res.data.avatarUrl) {
              isRegisted = true;
            }

            this.setData({
              info: res.data,
              isLoading: false,
              isRegisted
            });
          } else {
            wx.showToast({
              title: res.data.moreInfo,
              image: '../../icons/close-circled.png'
            })
          }
        });
      }
    })
  },
  onLoad: function () {

  }
})
