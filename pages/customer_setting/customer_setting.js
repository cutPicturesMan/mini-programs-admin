import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    id: 0,
    avatar: '',
    nick: '',
    atTime: 0,
    name: '',
    scale: 0,
    // 还款方式，默认第一种
    repaymentType: 0,
    // 数据是否加载完毕
    isLoaded: false,
    // 是否正在提交中
    isSubmit: false
  },
  // 处理客户折扣
  bindScaleInput (e) {
    this.setData({
      scale: e.detail.value
    })
  },
  // 处理账期还款时间
  bindAtTimeInput (e) {
    this.setData({
      atTime: e.detail.value
    })
  },
  // 选择还款方式
  selectRepayment (e) {
    let { type } = e.currentTarget.dataset;

    this.setData({
      repaymentType: type
    });
  },
  // 提交数据
  submit () {
    let { id, scale, atTime, isSubmit } = this.data;

    // 防止重复提交
    if (isSubmit) {
      return;
    }

    try {
      // 如果还未获取客户id
      if (!id) {
        throw new Error('客户id未获取');
      }
      // 如果客户折扣未填写
      if (!scale) {
        throw new Error('客户折扣未填写');
      }
      // 如果账期还款时间未填写
      if (!atTime) {
        throw new Error('还款时间未填写');
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
      url: `${api.customer_setting}${id}`,
      method: 'PUT',
      data: {
        scale,
        atTime
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功，则返回上一层
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
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
  getData (id) {
    wx.showLoading();

    http.request({
      url: `${api.customer}${id}`,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        this.setData({
          isLoaded: true,
          id: id,
          avatar: res.data.avatar,
          nick: res.data.nick,
          name: res.data.name,
          scale: res.data.scale,
          atTime: res.data.data
        });
      }
    })
  },
  onLoad (params) {
    this.getData(params.id || 2);
  }
})
