Page({
  data: {
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
  onLoad: function () {

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
  }
})