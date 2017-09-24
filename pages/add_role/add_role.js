import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

let app = getApp();

Page({
  data: {
    // 用户信息
    info: {},
    // 姓名
    name: '',
    // 电话
    phone: '',
    // 微信名称
    nickName: '',
    // 微信头像
    avatarUrl: '',
    // 经理id
    adminId: 0,
    // 数据是否加载完毕
    isLoaded: false,
    // 是否允许使用个人信息
    isAllowInfo: true,
    // 是否正在提交
    isSubmit: false
  },
  // 输入姓名
  bindNameInput (e) {
    this.setData({
      name: e.detail.value
    })
  },
  // 输入电话
  bindPhoneInput (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  // 提交数据
  submit () {
    // 防止重复提交
    if(this.data.isSubmit){
      return;
    }

    let { name, phone, adminId } = this.data;
    let { signature, rawData, encryptedData, iv } = this.data.info;

    try {
      // 如果用户未授权使用个人信息
      if (!signature || !rawData || !encryptedData || !iv) {
        throw new Error('用户未授权使用个人信息，无法注册。请在右上角的设置中允许授权');
      }
      // 如果还未获取用户角色，则请求并设置
      if (!adminId) {
        app.getUserInfo();
      }
      // 如果必填字段没有填写
      if (!name) {
        throw new Error('请填写姓名');
      }
      // 如果电话没有填写
      if (!phone) {
        throw new Error('请填写电话');
      }
    } catch (e) {
      return wx.showToast({
        title: e.message,
        image: '../../icons/close-circled.png',
        duration: 4000
      })
    }

    wx.showLoading();
    this.setData({
      isSubmit: true
    });

    http.request({
      url: api.user,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      data: {
        signature,
        rawData,
        encryptedData,
        iv,
        name,
        phone,
        adminId
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功，则跳转到待处理页面
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        })
        setTimeout(() => {
          // wx.switchTab({
          //
          // });
        }, 1500)
      } else {
        // 提交失败，则提示
        wx.showToast({
          title: res.moreInfo,
          image: '../../icons/close-circled.png'
        })

        setTimeout(() => {
          this.setData({
            isSubmit: false
          });
        }, 1500)
      }
    })
  },
  // 获取用户微信信息
  getUserInfo () {
    wx.getUserInfo({
      success: (res) => {
        let userInfo = res.userInfo;

        this.setData({
          isLoaded: true,
          isAllowInfo: true,
          info: res,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        });
      },
      fail: () => {
        this.setData({
          isAllowInfo: false
        });
      }
    });
  },
  onLoad (options) {
    var scene = decodeURIComponent(options.scene);
    this.setData({
      adminId: scene.adminId || 3
    });

    this.getUserInfo();
  }
})
