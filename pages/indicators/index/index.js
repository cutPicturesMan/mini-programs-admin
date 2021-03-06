import http from '../../../public/js/http'
import api from '../../../public/js/api'
import regeneratorRuntime from '../../../public/js/regenerator'
import utils from '../../../public/js/utils'

Page({
  data: {
    name: '',
    headData: {},
    salesman: [],
    customer: [],
    roles: [],
    admin: ''
  },
  async onLoad(option) {
    let info = await getApp().getUserInfo()
    console.log(info)
    let admin = info.id
    let roles = []
    info.roles.forEach(e => {
      roles.push(e.id)
    })
    this.setData({ admin, roles })
    this.onShow(admin)
  },
  onShow(admin) {
    let self = this
    if (admin) {} else if (this.data.admin) {
      admin = this.data.admin
    } else {
      return
    }
    // 考核指标头部信息
    http.request({
      url: api.indicatorsHead + admin,
      success(res) {
        let headData = res.data.data
        if (headData.startTime && headData.endTime) {
          headData.timeProgress = ((headData.endTime - new Date()) / (headData.endTime - headData.startTime)).toPrecision(4) * 100
          headData.timeProgress > 0 ? headData.timeProgress += '%' : headData.timeProgress = '已到期'
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
      success(res) {
        self.setData({ salesman: res.data.data })
      }
    })
    // 客户列表
    http.request({
      url: api.indicatorsTableCustomer + admin,
      success(res) {
        res.data.data.forEach(e => {
          e.lastTime = utils.formatDate(e.lastTime, 'YYYY-MM-DD')
        })
        self.setData({ customer: res.data.data })
      }
    })
  },
  moified: function () {
    wx.navigateTo({
      url: '../modified/modified'
    })
  },
  procurement(e) {
    let customerid = e.currentTarget.dataset.customerid
    wx.navigateTo({
      url: '../procurement/procurement?customerid=' + customerid
    })
  },
  personIndicators(e) {
    let adminid = e.currentTarget.dataset.adminid
    wx.navigateTo({
      url: '../person/index?adminid=' + adminid
    })
  }
})
