import * as echarts from '../../../common/ec-canvas/echarts'
var option

function initChart (canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  })
  canvas.setChart(chart)
  // grid.containLabel: true
  option = {
    xAxis: {
      type: 'value',
      splitNumber: 3
    },
    yAxis: {
      type: 'time'
    },
    grid: {
      containLabel: true
    },
    // dataZoom属性有bug，找到了issue，等官方库更新
    // dataZoom: [
    //   { type: 'slider', start: 10, end: 40 }, 
    //   { type: 'inside', start: 0, end: 100 }
    // ],
    series: [{
      // type: 'line',
      // data: [
      //   ['2017-1-12', 30000],
      //   ['2017-1-13', 45200],
      //   ['2017-1-14', 20000],
      //   ['2017-1-15', 60000],
      //   ['2017-1-16', 23000],
      //   ['2017-1-17', 11000],
      //   ['2017-1-20', 54000]
      // ],
      type: 'bar',
      data: [
        [30000, '2017-1-01'], [45200, '2017-1-02'], [20000, '2017-1-03'], [60000, '2017-1-04'], [23000, '2017-1-05'],
        // [11000, '2017-1-06'], [30000, '2017-1-07'], [45200, '2017-1-08'], [20000, '2017-1-09'], [60000, '2017-1-10'],
        // [23000, '2017-1-11'], [11000, '2017-1-12'], [45200, '2017-1-13'], [20000, '2017-1-14'], [60000, '2017-1-15'],
        // [30000, '2017-1-16'], [45200, '2017-1-17'], [20000, '2017-1-18'], [60000, '2017-1-19'], [23000, '2017-1-20'], 
        // [30000, '2017-1-21'], [45200, '2017-1-22'], [20000, '2017-1-23'], [60000, '2017-1-24'], [23000, '2017-1-25'], 
        // [30000, '2017-1-26'], [45200, '2017-1-27'], [20000, '2017-1-28'], [60000, '2017-1-29'], [23000, '2017-1-30'], 
      ],
      barCategoryGap: '50%',
      itemStyle: { normal: { label: { show: true } } },
      smooth: true,
    }]
  }

  chart.setOption(option)
  return chart
}

Page({
  data: {
    ec: {
      onInit: initChart
    },
    profile: null,
    company: '中国XX有限公司',
    name: '赵先生',
    phone: '135XXXX1234',
    adress: '中国河南省郑州市中原区科学大道100号 ',
    lastTime: '2018-02-13',
    chartData: null
  },
  onLoad: function () {
    if (!this.data.profile) {
      this.setData({ profile: '/icons/profile.png' })
    }
  },
  getProcurement () {

  }
})