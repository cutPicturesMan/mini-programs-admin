import utils from "../../../public/js/utils";

Page({
  data: {
    totalGoal: '100000',
    unallocatedGoal: '5000',
    startTime: '',
    endTine: '',
    task: [
      { profile: '', name: '李业务', task: null },
      { profile: '', name: '李业务', task: null },
      { profile: '', name: '李业务', task: null },
      { profile: '', name: '李业务', task: null },
    ]
  },
  onReady: function () {
    utils.defaultProfile.call(this, 'task')
  },
  bindStartChange: function (e) {
    this.setData({ startTime: e.detail.value })
  },
  bindEndChange: function (e) {
    this.setData({ endTime: e.detail.value })
  }
})