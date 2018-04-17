import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import Auth from '../../public/js/auth.js';
import utils from '../../public/js/utils.js';
import WXPage from '../Page';

let app = getApp();
let auth = new Auth();

new WXPage({
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

    // 姓名输入框聚焦
    isNameFocus: false,
    // 电话输入框聚焦
    isPhoneFocus: false,

    // 数据是否加载完毕
    isLoaded: false,
    // 是否允许使用个人信息
    isAllowInfo: true,
    // 是否出现扫码错误
    isScanError: false,
    // 是否正在提交
    isSubmit: false
  },
  // 点击姓名区域，自动聚焦
  bindNameTap: function() {
    this.setData({
        isNameFocus: true
    })
  },
  // 输入姓名
  bindNameInput (e) {
    this.setData({
      name: e.detail.value
    })
  },
  // 点击电话区域，自动聚焦
  bindPhoneTap: function() {
    this.setData({
        isPhoneFocus: true
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
      return this.toast.error({
        content: e.message,
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
      wx.hideLoading();

      // 提交成功，则跳转到待处理页面
      if (res.errorCode === 200) {
        // 从后台进入前台时，刷新当前用户信息
        app.userInfo = null;

        this.toast.success({
          content: res.moreInfo || '提交成功'
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/pending/pending'
          });
        }, 1500)
      } else {
        // 提交失败，则提示
        this.toast.error({
          content: res.moreInfo
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
  onLoad (params = {}) {
    // 获取用户的信息
    app.getUserInfo()
      .then((res) => {
        if (res.status && res.status.id == 1) {
          this.toast.error({
            content: '您已注册，自动跳转中'
          })

          setTimeout(() => {
            wx.switchTab({
              url: `/pages/pending/pending`
            });
          }, 1500)
        } else {
          auth.login()
            .then(() => {
              // 如果是通过扫码进来的
              if (params.scene) {
                let scene = utils.parseQueryString(decodeURIComponent(params.scene));
                let adminId = 0;
                scene.adminId && (adminId = scene.adminId);

                this.setData({
                  adminId
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
      }, () => {
        wx.showModal({
          title: '提示',
          content: '获取用户信息失败，请重新进入小程序'
        })
      })
  }
})
