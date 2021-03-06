import { ROLE, ROLE_LIST } from '../../public/js/role.js';

let app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: {},
    // 用户当前角色代码
    roleCode: '',
    // 用户角色列表对象
    roleObj: {},
    // 管理员角色列表
    ROLE,
    // 是否正在加载数据
    isLoaded: false
  },
  onShow () {
    // 获取用户的信息
    app.getUserInfo()
      .then((res) => {
        // 如果用户审核通过(1)，则进入系统
        if (res.status.id == 1) {
          let roleObj = {};
          res.roles.forEach((item)=>{
            roleObj[item.name] = true;
          });

          this.setData({
            roleObj
          });
        } else if (res.status.id == 2) {
          // 如果正在审核中(2)、则页面显示正在审核，不进入系统
        } else if (res.status.id == -1 || res.status.id == 0) {
          // 如果用户未审核(-1)、审核拒绝(0)，则提示扫码注册
          wx.showModal({
            title: '提示',
            content: '对不起，您还未注册，请扫码注册'
          })
        }

        // 不论status.id为什么状态，都要设置当前页面的用户信息
        this.setData({
          userInfo: res,
          roleCode: app.roleCode
        });
      }, () => {});
  }
})
