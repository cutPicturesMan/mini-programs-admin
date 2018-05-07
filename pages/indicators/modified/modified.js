import utils from "../../../public/js/utils"
import http from '../../../public/js/http'
import api from '../../../public/js/api'
import regeneratorRuntime from '../../../public/js/regenerator'
import WXPage from '../../Page'

new WXPage({
  data: {
    isGeneralMangager: true,
    goal: '',
    unallocated: '',
    startTime: '',
    endTime: '',
    task: []
  },
  async onLoad () {
    // utils.defaultProfile.call(this, 'task')
    let info = await getApp().getUserInfo()
    let admin = info.id
    let self = this
    // 考核指标头部信息
    http.request({
      url: api.indicatorsHead + admin,
      success (res) {
        let { startTime, endTime, goal } = res.data.data
        startTime ? startTime = utils.formatDate(startTime, 'YYYY-MM-DD') : startTime = ''
        endTime ? endTime = utils.formatDate(endTime, 'YYYY-MM-DD') : endTime = ''
        self.setData({ startTime, endTime, goal })
      }
    })
    // 业务员列表
    http.request({
      url: api.indicatorsTableSalesman + admin,
      success (res) {
        self.setData({ task: res.data.data })
      }
    })
  },
  onReady () {
    // 初始化未分配数值
    this.changeTask()
  },
  bindStartChange: function (e) {
    this.setData({ startTime: e.detail.value })
  },
  bindEndChange: function (e) {
    this.setData({ endTime: e.detail.value })
  },
  changeTask (e) {
    let { task, goal, unallocated } = this.data
    if (e) {
      let adminId = e.currentTarget.id
      let value = parseInt(e.detail.value)
      unallocated = goal
      task.forEach(e => {
        e.adminId == adminId ? e.goal = value : ''
        unallocated -= e.goal
      })
    } else {
      // goal被修改
      unallocated = goal
      task.forEach(e => {
        console.info(e, unallocated)
        unallocated -= e.goal
      });
    }
    this.setData({ task, unallocated })
  },
  cancel () {
    wx.showModal({
      title: '确认取消修改',
      content: '不保存修改，直接返回上级页面？',
      confirmColor: '#FF0000',
      success: function (res) {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
          })
        }
      }
    })
  },
  formSubmit (e) {
    let { task, goal, unallocated, startTime, endTime } = this.data

    try {
      if (!startTime) {
        throw new Error('请填写起始时间')
      } else if (!endTime) {
        throw new Error('请填写终止时间')
      } else if (unallocated < 0) {
        throw new Error('分配金额超出目标金额')
      }
    } catch (e) {
      return this.toast.error({
        content: e.message,
        duration: 4000
      })
    }

    let startTs = new Date(startTime).getTime()
    // 一般结束时间是指当天24点
    let endTs = new Date(endTime).getTime() + 1000 * 60 * 60 * 24

    let self = this
    http.request({
      url: api.indicators,
      data: Object.assign({ totalIndex: goal, startTs, endTs }, e.detail.value),
      method: 'POST',
      success (res) {
        self.toast.success({
          content: res.data.moreInfo,
          duration: 2000
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
          })
        }, 2000);
      }
    })
  },
  setGoal (e) {
    this.setData({ goal: parseInt(e.detail.value) })
    this.changeTask()
  }
})