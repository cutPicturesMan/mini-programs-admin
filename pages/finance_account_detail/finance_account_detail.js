import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import utils from '../../public/js/utils.js';

Page({
  data: {
    id: 0,
    date: utils.formatDate(new Date(), 'YYYY-MM'),
    list: [],
    // 数据是否加载完毕
    isLoaded: false,
    // 是否正在提交中
    isSubmit: false
  },
  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  // 获取列表数据
  getData () {
    let { id } = this.data;
    wx.showLoading();

    http.request({
      url: `${api.finance_collect}${id}`,
      data: {
        not: 1
      }
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        this.setData({
          list: res.data,
          isLoaded: true
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '数据获取失败'
        })
      }
    })
  },
  submit () {
    let { id, isSubmit } = this.data;
    wx.showLoading();

    try {
      if (isSubmit) {
        throw new Error('正在销账中');
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

    http.request({
      url: `${api.finance_collect}${id}`,
      method: 'PUT',
      data: {
        status: 1
      }
    }).then((res) => {
      if (res.errorCode === 200) {
        wx.showToast({
          title: res.moreInfo || '销账成功'
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '销账失败，请重试'
        })
      }

      this.setData({
        isSubmit: false
      });
    })
  },
  onLoad (params) {
    let id = params.id;

    if(!id){
      wx.showModal({
        title: '提示',
        content: '对不起，请传入账期id'
      })
    } else {
      this.setData({
        id
      });

      this.getData();
    }
  }
})
