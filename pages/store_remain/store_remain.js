import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

Page({
  data: {
    // 订单列表
    list: [],
    // 数据是否加载完毕
    isLoaded: false
  },
  // 获取列表数据
  getData () {
    wx.showLoading();

    http.request({
      url: api.stock,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        this.setData({
          list: res.data,
          isLoaded: true
        });
      }
    })
  },
  // 减
  reduce (e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;
    let num = list[index].qtyAvailable;

    num--;
    // 库存数量不能小于0
    if(num < 0){
      num = 0;
    }

    list[index].qtyAvailable = num;

    this.setData({
      list: list
    })
  },
  // 输入数字
  inputNumber (e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;
    let num = e.detail.value;

    // 库存数量不能小于0
    if(num < 0){
      num = 0;
    }

    list[index].qtyAvailable = num;

    this.setData({
      list: list
    })
  },
  // 加
  add (e) {
    let { index } = e.currentTarget.dataset;
    let { list } = this.data;
    let num = list[index].qtyAvailable;

    num++;
    list[index].qtyAvailable = num;

    this.setData({
      list: list
    })
  },
  onLoad () {
    this.getData();
  }
})
