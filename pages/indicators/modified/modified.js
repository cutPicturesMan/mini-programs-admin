import utils from "../../../public/js/utils"
import http from '../../../public/js/http'
import api from '../../../public/js/api'
import regeneratorRuntime from '../../../public/js/regenerator'

Page({
  data: {
    goal: '100000',
    unallocated: '10000',
    startTime: '',
    endTime: '',
    task: [
      { profile: '', name: '李业务', task: 0, id: 1 },
      { profile: '', name: '李业务', task: 0, id: 2 }
    ]
  },
  async onLoad () {
    // utils.defaultProfile.call(this, 'task')
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
  },
  bindStartChange: function (e) {
    this.setData({ startTime: e.detail.value })
  },
  bindEndChange: function (e) {
    this.setData({ endTime: e.detail.value })
  },
  changeTask (e) {
    let id = e.currentTarget.id
    let value = parseInt(e.detail.value)
    let { task, goal, unallocated } = this.data
    unallocated = goal
    task.forEach(e => {
      e.id == id ? e.task = value : ''
      unallocated -= e.task
    });
    this.setData({ task, unallocated })
  },
  cancel () {
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    })
  },
  save () {
    let { task, goal, unallocated } = this.data
    // unallocated > 0 TODO

    http.request({
      url: api.indicators,
      method: 'POST',
      success () {
        wx.navigateBack({
          delta: 1, // 回退前 delta(默认为1) 页面
        })
      }
    })
  }
})