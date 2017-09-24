import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

let app = getApp();

Page({
  data: {
    // 用户信息
    info: {},
    // 微信名称
    nickName: '',
    // 微信头像
    avatarUrl: '',

    // 公司名称
    company: '',
    // 店铺名称
    shop: '',
    // 姓名
    name: '',
    // 电话
    phone: '',
    // 收货地址
    address: '',
    // 经理id
    adminId: 0,

    // 数据是否加载完毕
    isLoaded: false,
    // 是否允许使用个人信息
    isAllowInfo: true,
    // 是否允许使用收货地址
    isAllowAddress: true,
    // 是否正在提交
    isSubmit: false
  },
  // 公司名称
  bindCompanyInput (e) {
    this.setData({
      company: e.detail.value
    })
  },
  // 门店名称
  bindShopInput (e) {
    this.setData({
      shop: e.detail.value
    })
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
  // 输入地址
  bindAddressInput (e) {
    console.log(e.detail.value);
    this.setData({
      address: e.detail.value
    })
  },
  // 选择收货地址
  chooseAddress () {
    wx.chooseAddress({
      success: (res) => {
        this.setData({
          isAllowAddress: true,
          name: res.userName,
          phone: res.telNumber,
          address: res.provinceName + ' ' + res.cityName + ' ' + res.countyName + ' ' + res.detailInfo
        });
      },
      fail: () => {
        // 有2种状态会引发fail
        // 第一种是拒绝授予收货地址权限
        // 第二种是授予权限了，在收货地址页点击取消时，也会触发fail，这不是我们想要的
        // 因此fail函数不作处理
      }
    })
  },
  // 提交数据
  submit () {
    // 防止重复提交
    if (this.data.isSubmit) {
      return;
    }

    let { company, shop, name, phone, address, adminId } = this.data;
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
      if (!company) {
        throw new Error('请填写公司名称');
      }
      // 如果必填字段没有填写
      if (!shop) {
        throw new Error('请填写店铺名称');
      }
      // 如果姓名没有填写
      if (!name) {
        throw new Error('请填写姓名');
      }
      // 如果电话没有填写
      if (!phone) {
        throw new Error('请填写电话');
      }
      // 如果地址没填写
      if (!address) {
        throw new Error('请填写地址');
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
      url: api.add_customer,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      data: {
        signature,
        rawData,
        encryptedData,
        iv,
        companyName: company,
        shopName: shop,
        name,
        phone,
        address,
        adminId
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功，则跳转到待处理页面
      if (res.errorCode === 200) {
        // 提交失败，则提示
        wx.showToast({
          title: res.data.status.friendlyType || '提交成功'
        })
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
  // 查询一下用户是否授权了 收货地址 接口
  checkAddress () {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success: () => {
              this.setData({
                isAllowAddress: true
              });
            },
            fail: () => {
              this.setData({
                isAllowAddress: false
              });
            }
          })
        } else {
          this.setData({
            isAllowAddress: true
          });
        }
      }
    })
  },
  onShow () {
    this.checkAddress();
  },
  onLoad (options) {
    var scene = decodeURIComponent(options.scene);
    this.setData({
      adminId: scene.adminId || 3
    });

    this.checkAddress();
    this.getUserInfo();
  }
})
