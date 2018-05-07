import http from '../../../public/js/http'
import api from '../../../public/js/api'
import regeneratorRuntime from '../../../public/js/regenerator'

Page({
  data: {
    admin: '',
    headData: { name: '', num: '', goal: '', finish: '', startTime: '', endTime: '', timeProgress: '', goalProgress: '', rank: '' },
    salesman: [
      { profile: '', ranking: '1', name: '张先生', achievement: '10万', schedule: '20%' },
      { profile: '', ranking: '2', name: '张先生', achievement: '10万', schedule: '20%' },
      { profile: '', ranking: '3', name: '张先生', achievement: '10万', schedule: '20%' },
      // { profile: '', ranking: '', name: '', achievement: '', schedule: '' }
    ],
    customer: [
      { profile: '', name: '王客户', lastTime: '2017-01-13', orderWeek: '333', orderMonth: '112' },
      { profile: '', name: '王客户', lastTime: '2017-01-13', orderWeek: '333', orderMonth: '112' },
      { profile: '', name: '王客户', lastTime: '2017-01-13', orderWeek: '333', orderMonth: '112' },
      // { profile: '', name: '', lastTime: '', orderWeek: '', orderMonth: '' }
    ]
  },
  async onLoad (option) {
    let info = await getApp().getUserInfo()
    let admin = info.id
    // 考核指标头部信息
    http.request({
      url: api.indicatorsHead + admin
    })
    // 客户列表
    http.request({
      url: api.indicatorsTableCustomer + admin
    })
    // 业务员列表
    http.request({
      url: api.indicatorsTableSalesman + admin
    })
  },
  onReady: function () {
    this.data.salesman.forEach(e => {
      if (!e.profile) {
        e.profile = '/icons/profile.png'
      }
    });
    this.setData({ salesman: this.data.salesman })

    this.data.customer.forEach(e => {
      if (!e.profile) {
        e.profile = '/icons/profile.png'
      }
    });
    this.setData({ customer: this.data.customer })
  },
  moified: function () {
    wx.navigateTo({
      url: '../modified/modified'
    })
  },
  procurement: function () {
    wx.navigateTo({
      url: '../procurement/procurement'
    })
  },
  personIndicators: function () {
    wx.navigateTo({
      url: '../person/index?id=13'
    })
  }
})
