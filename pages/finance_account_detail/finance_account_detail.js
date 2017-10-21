import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import utils from '../../public/js/utils.js';

Page({
  data: {
    id: 0,
    date: utils.formatDate(new Date(), 'YYYY-MM'),
    list: []
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
      url: `${api.finance_collect}${id}`
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
