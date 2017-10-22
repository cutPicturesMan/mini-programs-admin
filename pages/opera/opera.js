import http from '../../public/js/http.js';
import api from '../../public/js/api.js';
import { ROLE_LIST } from '../../public/js/role.js';

let app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: {},
    // 用户当前角色代码
    roleCode: '',
    // 二维码地址
    twoCodeUrl: '',
    // 管理员角色列表
    ...ROLE_LIST,
    // 数据是否加载完毕
    isLoaded: false,
    // 新增客户的开关
    addUserToggle: false,
  },
  // 添加用户
  // 1表示新增客户，生成的二维码是客户端的
  // 2表示新增业务员，生成的二维码是管理端的
  addUser (type = 1) {
    let { userInfo } = this.data;
    let scene = encodeURIComponent(`adminId=${userInfo.id}`);
    let twoCodeUrl = '';

    if(type == 1){
      twoCodeUrl = `${api.site_twocode}?scene=${scene}`
    } else {
      twoCodeUrl = `${api.admin_twocode}?scene=${scene}`
    }

    this.setData({
      twoCodeUrl,
      addUserToggle: !this.data.addUserToggle
    });
  },
  // 查看二维码
  viewTwoCode () {
    let { twoCodeUrl } = this.data;

    wx.previewImage({
      urls: [twoCodeUrl]
    })
  },
  // 显示页面
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
        } else if (res.status.id == -1 || res.status.id == 0){
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
