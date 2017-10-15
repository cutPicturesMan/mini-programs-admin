import { ROLE, ROLE_LIST } from '../../public/js/role.js';

let app = getApp();

Page({
  data: {
    // 用户信息
    userInfo: {},
    // 用户当前角色代码
    roleCode: '',
    // 管理员角色列表
    ROLE,
    // 是否正在加载数据
    isLoaded: false,
    // 扫码是否出错
    isError: false
  },
  // // 选择角色
  // selectRole (e) {
  //   let { index } = e.currentTarget.dataset;
  //   let { userInfo, ROLE } = this.data;
  //   let roleList = userInfo.roles;
  //   let nowRole = ROLE[roleList[index].name];
  //
  //   wx.showModal({
  //     title: '提示',
  //     content: `您确定要将当前角色更换为"${nowRole.name}"`,
  //     success: (res) => {
  //       if (res.confirm) {
  //         app.roleCode = nowRole.code;
  //         this.setData({
  //           roleCode:nowRole.code
  //         });
  //       }
  //     }
  //   })
  // },
  onLoad () {
    // 获取用户的信息
    app.getUserInfo()
      .then((res) => {
        // 如果用户审核通过(1)，则进入系统
        if (res.status.id == 1) {
          this.setData({
            isLoaded: true,
            userInfo: res,
            roleCode: app.roleCode
          });
        } else if (res.status.id == 2) {
          // 如果正在审核中(2)、则页面显示正在审核，不进入系统
        } else if (res.status.id == -1 || res.status.id == 0) {
          // 如果用户未审核(-1)、审核拒绝(0)，则提示跳到信息申请页
          wx.showModal({
            title: '提示',
            content: '对不起，您还未注册，请先注册',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/registry/registry'
                });
              }
            }
          })
        }
      }, () => {
        // 请求失败
        wx.showModal({
          title: '提示',
          content: '扫码出错，未获取到经理的adminId'
        })

        this.setData({
          isError: true
        });
      });
  }
})
