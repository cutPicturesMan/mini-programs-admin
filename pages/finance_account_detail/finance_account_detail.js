import utils from '../../public/js/utils.js';

Page({
  data: {
    date: utils.formatDate(new Date(), 'YYYY-MM'),
  },
  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  onLoad: function () {
    // type 表示结算类型
    // 1 表示月结
    // 2 表示隔多少天之后结算
  }
})
