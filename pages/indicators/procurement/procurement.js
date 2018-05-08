import * as echarts from '../../../common/ec-canvas/echarts'
import http from '../../../public/js/http'
import api from '../../../public/js/api'
import regeneratorRuntime from '../../../public/js/regenerator'
import utils from "../../../public/js/utils"

// TODO 这里有一个需要封装的地方，图表懒加载在onReady()获取到图标进行实例化，而数据在Onload里拿到
Page({
  data: {
    ec: {
      lazyLoad: true
    },
    profile: null,
    company: '中国XX有限公司',
    name: '赵先生',
    phone: '135XXXX1234',
    adress: '中国河南省郑州市中原区科学大道100号 ',
    lastTime: '2018-02-13',
    // startTs: 1515104000000, endTs: 1526745600000,
    startTs: '',
    endTs: '',
    customerid: ''
  },
  onLoad: function (option) {
    let customerid = option.customerid
    console.log(option)
    this.setData({ customerid })
    this.setData({ endTs: utils.formatDate(new Date().getTime() + 1000 * 60 * 60 * 24, 'YYYY-MM-DD') })
    this.setData({ startTs: utils.formatDate(new Date().getTime() - 1000 * 60 * 60 * 24 * 30, 'YYYY-MM-DD') })

    let profile, company, name, phone, adress, lastTime
    let { startTs, endTs } = this.data
    http.request({
      url: api.getProcurement + customerid,
      data: { startTs: new Date(startTs).getTime(), endTs: new Date(endTs).getTime() },
      success: ((res) => {
        ({ profile, company, name, phone, adress, lastTime } = res.data.data)
        this.setData({ profile, company, name, phone, adress, lastTime })
        this.ecComponent = this.selectComponent('#procurement-chart')
        this.initChart(res.data.data.chartData)
        // this.initChart([[1525615498000, 100], [1525675498000, 580], [1525761898000, 100], [1525848298000, 450]])
      })
    })
  },
  bindTimeChange (e) {
    let id = e.currentTarget.id
    let value = e.detail.value
    let self = this
    let { customerid, startTs, endTs } = this.data
    this.setData({ [id]: value })

    // GET客户采购统计
    http.request({
      url: api.getProcurement + customerid,
      data: { startTs: new Date(this.data.startTs).getTime(), endTs: new Date(this.data.endTs).getTime() },
      success: ((res) => {
        this.initChart(res.data.data.chartData)
        // option.series[0].data = res.data.data.chartData
        // this.setData({ chartData: res.data.data.chartData })
      })
    })
  },
  initChart (data) {
    this.ecComponent.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      })
      setOption(chart, data)

      this.chart = chart
      return chart
    })
  }
})

function setOption (chart, data) {
  // 转一下x轴和y轴 y轴是时间
  for (let i = 0; i < data.length; i++) {
    let c
    c = data[i][0]
    data[i][0] = data[i][1]
    data[i][1] = c
    // 顺便转一下时间戳
    data[i][1] = utils.formatDate(data[i][1], 'YYYY-MM-DD')
  }


  const option = {
    xAxis: {
      type: 'value',
      splitNumber: 3
    },
    yAxis: {
      type: 'time',
      minInterval: 3600 * 24 * 1000,
    },
    grid: {
      containLabel: true
    },
    series: [{
      type: 'bar',
      barCategoryGap: '50%',
      itemStyle: { normal: { label: { show: true } } },
      smooth: true,
      data: data
    }]
  }
  chart.setOption(option)
}