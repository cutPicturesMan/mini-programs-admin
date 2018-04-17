import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import WXPage from '../Page';

let days = [];

for(let i = 1; i <= 31; i++){
  days.push(i);
}

new WXPage({
  data: {
    id: 0,
    avatar: '',
    nick: '',
    dayIndex: 0,
    name: '',
    scale: 0,
    // 具体天数
    days,
    // 还款方式，默认第一种
    repaymentType: 0,
    // 数据是否加载完毕
    isLoaded: false,
    // 是否正在提交中
    isSubmit: false
  },
  // 处理客户折扣
  changeDiscount (e) {
    this.setData({
      scale: e.detail.value
    })
  },
  // 处理账期还款时间
  bindAtTimeInput (e) {
    this.setData({
      dayIndex: e.detail.value
    })
  },
  // 开启关闭账期开关
  switch2Change(){
    let { state } = this.data;

    this.setData({
        state: !state
    });
  },
  // 选择还款方式
  selectRepayment (e) {
    let { type } = e.currentTarget.dataset;

    this.setData({
      repaymentType: type
    });
  },
  // 提交数据
  submit () {
    let { id, scale, days, dayIndex, state, isSubmit } = this.data;

    // 防止重复提交
    if (isSubmit) {
      return;
    }

    try {
      // 如果还未获取客户id
      if (!id) {
        throw new Error('客户id未获取');
      }
      // // 如果客户折扣未填写
      // if (!scale) {
      //   throw new Error('客户折扣未填写');
      // }
    } catch (e) {
      return this.toast.error({
        content: e.message,
        duration: 4000
      })
    }

    this.setData({
      isSubmit: true
    });

    wx.showLoading();
    http.request({
      url: `${api.customer_setting}${id}`,
      method: 'PUT',
      data: {
        // scale: scale/100,
        atTime: days[dayIndex],
        state
      }
    }).then((res) => {
      wx.hideLoading();

      // 提交成功，则返回上一层
      if (res.errorCode === 200) {
        this.toast.success({
          content: res.moreInfo || '提交成功'
        })

        this.setData({
          isSubmit: false
        });
      } else {
        // 提交失败，则提示
        this.toast.error({
          content: res.moreInfo
        })

        setTimeout(() => {
          this.setData({
            isSubmit: false
          });
        }, 1500)
      }
    })
  },
  getData (id) {
    wx.showLoading();

    http.request({
      url: `${api.customer}${id}`,
    }).then((res) => {
      wx.hideLoading();

      if (res.errorCode === 200) {
        this.setData({
          isLoaded: true,
          id: id,
          avatar: res.data.avatar,
          nick: res.data.nick,
          name: res.data.name,
          phone: res.data.phone,
          companyName: res.data.companyName,
          state: res.data.state,
          scale: res.data.scale * 100,
          dayIndex: (res.data.data > 0) ? (res.data.data - 1) : 0
        });
      }
    })
  },
  onLoad (params) {
    this.getData(params.id || 2);
  }
})
