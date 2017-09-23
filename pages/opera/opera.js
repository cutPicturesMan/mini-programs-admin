Page({
  data: {
    // 新增客户的开关
    addCustomerToggle: false,
  },
  // 添加客户
  addCustomer () {
    console.log('123');
    this.setData({
      addCustomerToggle: !this.data.addCustomerToggle
    });

    wx.request({
      url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=8oBtYoYGHQSieTlfcamtkw5iWXIEXNyYFWTX2UXqwGFlS_FWJG1w71PGbOh5ZIPnZULL2Eb7Gdt1LtSmCico5XnUwGJBHig-MzOsvFGDx5XjAixhbDW2cqi0eTegwHw7EJHgACASXV',
      method: 'POST',
      data: {
        page: 'pages/my/my',
      },
      success: function(){

      }
    })
  },
  onLoad: function (options) {
    // options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    // var scene = decodeURIComponent(options.scene);
    // console.log(scene);
  }
})
