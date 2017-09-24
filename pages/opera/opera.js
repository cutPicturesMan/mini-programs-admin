import http from '../../public/js/http.js';
import api from '../../public/js/api.js';

let app = getApp();
console.log(app.globalData.info.role);
Page({
  data: {
    // 新增客户的开关
    addCustomerToggle: false,
    // 用户角色
    role: '',
    img: '',
    // 数据是否加载完毕，这里指的是用户的info信息是否返回，返回则设置角色
    isLoaded: false,
  },
  // 添加客户
  addCustomer () {
    this.setData({
      addCustomerToggle: !this.data.addCustomerToggle
    });

    http.request({
      url: api.twocode,
      data: {
        scene: 'adminId=2',
        width: 430,
        auto_color: false,
        r: '0',
        g: '0',
        b: '0'
      },
      success: function (res) {
        console.log(res.data);

      }
    })
  },
  onLoad: function () {
    console.log('load')
    app.getUserInfo().then((res) => {
      this.setData({
        role: res.role
      });
    });
  }
})
