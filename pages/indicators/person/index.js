import http from '../../../public/js/http'
import api from '../../../public/js/api'
import utils from '../../../public/js/utils'

Page({
  data: {
    name: '',
    headData: {},
    salesman: [],
    customer: [],
    admin: ''
  },
  onLoad (option) {
    console.info(option)
    let admin = option.adminid
    this.setData({ admin })
    this.onShow(admin)
  },
  onShow (admin) {
    let self = this
    if (admin) {
    } else if (this.data.admin) {
      admin = this.data.admin
    } else {
      return
    }
    // 考核指标头部信息
    http.request({
      url: api.indicatorsHead + admin,
      success (res) {
        let headData = res.data.data
        if (headData.startTime && headData.endTime) {
          headData.timeProgress = ((headData.endTime - new Date()) / (headData.endTime - headData.startTime)).toPrecision(4) * 100
          headData.startTime = utils.formatDate(headData.startTime, 'YYYY-MM-DD')
          headData.endTime = utils.formatDate(headData.endTime, 'YYYY-MM-DD')
        }
        headData.goalProgress = (headData.finish / headData.goal).toPrecision(4) * 100
        self.setData({ headData })
      }
    })
    // 业务员列表
    http.request({
      url: api.indicatorsTableSalesman + admin,
      success (res) {
        self.setData({ salesman: res.data.data })
      }
    })
    // 客户列表
    http.request({
      url: api.indicatorsTableCustomer + admin,
      success (res) {
        self.setData({ customer: res.data.data })
      }
    })
  },
  moified: function () {
    wx.navigateTo({
      url: '../modified/modified'
    })
  },
  procurement: function () {
    let customerId = e.currentTarget.dataset.customerId
    wx.navigateTo({
      url: '../procurement/procurement?customerId=' + customerId
    })
  },
  personIndicators: function (e) {
    let adminid = e.currentTarget.dataset.adminid
    wx.navigateTo({
      url: '../person/index?adminid=' + adminid
    })
  }
})
