import * as _ from 'jquery'
import 'd3-geo'
import 'd3-geo-projection'
import './style.scss'
var Config = window.Config

var __IDGEN = 100

class Comment {
  resize () {

  }

  GenId () {
    return ++__IDGEN
  }
}
export default class Point extends Comment {
  // 地图上绘制点
  setData (arr) {
    Config.GLOBAL_SVG.selectAll('circle.v-point')
      .data([])
      .exit()
      .remove()
    Config.GLOBAL_SVG.selectAll('circle.v-point')
      .data(arr)
      .enter()
      .append('circle')
      .attr('class', 'v-point')
      .attr('cx', d => Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(d))[0])
      .attr('cy', d => Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(d))[1] - 12)
      .attr('r', Config.Point.Start)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('attributeType', 'xml')
      .attr('form', Config.Point.RadiusMin)
      .attr('to', Config.Point.RadiusMax)
      .attr('begin', '0s')
      .attr('dur', d => _.random(Config.Point.EffectMin, Config.Point.EffectMax) / 1000 + 's')
      .attr('repeatCount', 'indefinite')
  }

  resize () {
    Config.GLOBAL_SVG.selectAll('circle.v-point')
      .attr('cx', d => Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(d))[0])
      .attr('cy', d => Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(d))[1] - 12)
  }
}
