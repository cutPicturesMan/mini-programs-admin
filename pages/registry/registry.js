import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import Auth from '../../public/js/auth.js';

let app = getApp();
let auth = new Auth();

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
    // 是否出现扫码错误
    isScanError: false,
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
    let { name, phone, adminId, isSubmit } = this.data;
    let { signature, rawData, encryptedData, iv } = this.data.info;

    // 防止重复提交
    if (isSubmit) {
      return false;
    }

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

    this.setData({
      isSubmit: true
    });

    wx.showLoading();
    http.request({
      url: api.user,
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
      // 提交成功，则跳转到待处理页面
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo || '提交成功'
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/pending/pending'
          });
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
    auth.login()
      .then(() => {
        // 二维码带的查询字符串
        let scene = decodeURIComponent(options.scene);

        // 这是测试时使用查询字符串来模拟扫码的scene参数
        // 正式上线时要注释掉，替换成下面的代码
        // if (options.adminId != undefined) {
        //   this.setData({
        //     adminId: options.adminId
        //   });
        //
        //   this.getUserInfo();
        // } else {
        // 正式上线代码
        // 如果扫码正常
        if (scene.adminId != undefined) {
          this.setData({
            adminId: scene.adminId
          });

          this.getUserInfo();
        } else {
          // 如果扫码出现错误，查询字符串中没有经理的id，则提示
          wx.showModal({
            title: '提示',
            content: '扫码出错，该二维码无经理adminId参数'
          })

          this.setData({
            isScanError: true
          });
        }
      }, () => {
        wx.showModal({
          title: '提示',
          content: '登录失败，请重新进入小程序'
        })
      });
  }
})
