/*
 * @Author: Hovace
 * @Email: i@funlee.cn
 * @Date: 2020-4-9 10:00:16
 * @Last Modified time: 2020-4-9 10:00:16
 * @Description: map
 */
// import * as topojson from 'topojson'
// import root from './world.json'
// import config from './tool/config'
// import {tooltip} from './tool/utils'
import * as d3 from 'd3'
import * as _ from 'jquery'
import 'd3-geo'
import 'd3-geo-projection'
import './style.scss'
// import Config from './config'
import MapBuilder from './mapBuilder'
import Tip from './tip'
import EffectBar from './bar'
import EffectLine from './line'
import EffectPoint from './point'
import EffectFly from './fly'

var defs = `
<!-- 条形图样式 -->
<linearGradient id="f-bar" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" stop-color="#02CBFE"></stop>
    <stop offset="100%" stop-color="#0D365D"></stop>
</linearGradient>
<linearGradient id="f-bar-hover" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" stop-color="#C94BC3"></stop>
    <stop offset="100%" stop-color="#0D365D"></stop>
</linearGradient>

<!-- 连线样式 -->
<linearGradient id="f-line" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="transparent" />
    <stop offset=".33" stop-color="#A17095" />
    <stop offset=".67" stop-color="#D04DC1" />
    <stop offset="1" stop-color="#D1EACC" />
</linearGradient>

<!-- 连线点样式 -->
<radialGradient id="f-line-point">
    <stop offset="0%" style="stop-color: transparent;" />
    <stop offset="40%" style="stop-color: #FF7770;" />
    <stop offset="100%" style="stop-color: #D1F9D6;" />
</radialGradient>

<!-- 飞线样式 -->
<linearGradient id="f-fly" gradientUnits="objectBoundingBox">
    <stop offset="0" stop-color="#0e374f" />
    <stop offset=".33" stop-color="#069a2b" />
    <stop offset=".67" stop-color="#d6f252" />
    <stop offset="1" stop-color="#ffffff" />
</linearGradient>

<!-- 扩散点样式 -->
<radialGradient id="f-point">
    <stop offset="0%" style="stop-color: transparent;" />
    <stop offset="40%" style="stop-color: transparent;" />
    <stop offset="100%" style="stop-color: #00F6FF;" />
</radialGradient>


<!-- 地图伪3D阴影效果 -->
<filter id="f-shadow">
    <feColorMatrix type="matrix" values="
    0 0 0 0 0
    0 0 0 .8 0
    0 0 0 .8 0
    0 0 0 0.5 0
  "></feColorMatrix>
    <feGaussianBlur stdDeviation="1" result="colorBlur1"></feGaussianBlur>

    <feOffset result="offsetBlur0" in="colorBlur1" dx="1" dy="1" />
    <feOffset result="offsetBlur1" in="colorBlur1" dx="3" dy="3" />
    <feOffset result="offsetBlur2" in="colorBlur1" dx="5" dy="5" />

    <feSpecularLighting in="SourceGraphic" lighting-color="#ffb8b8" surfaceScale="1" specularConstant="1" specularExponent="115"
        result="light">
        <feDistantLight elevation="1" azimuth="1"></feDistantLight>
    </feSpecularLighting>
    <feComposite in="light" in2="SourceGraphic" operator="in" result="light-effect"></feComposite>

    <feBlend in="light" in2="SourceGraphic" mode="screen"></feBlend>
    <feMerge>
        <feMergeNode in="offsetBlur0" />
        <feMergeNode in="offsetBlur1" />
        <feMergeNode in="offsetBlur2" />
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="light-effect" />
    </feMerge>
</filter>
`

// 地图变形变量,zoom时需要
var __TRANSFORM = { x: 0, y: 0, k: 0, ix: 0, iy: 0 }
// 默认配置
var Config = {}

export default class NewMap {
  defaultSetting () {
    // 根元素，容器元素，根元素宽高，高度比例，容器元素高度
    // var ROOT, Container, WIDTH, HEIGHT, PHEIGHT, THEIGHT
    return {
      ROOT: null,
      Container: null,
      WIDTH: 0,
      HEIGHT: 0,
      PHEIGHT: 0,
      THEIGHT: 0,
      width: 4800,
      height: 1540,
      ZOOM: 48 * 0.9,
      CoordMap: {},
      padding: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      },
      circleSty: {
        'maxR': 20
      },
      GLOBAL_SVG: null,
      GLOBAL_BUILDER: null,
      GLOBAL_PROJECTION: null,
      RotateX: 30,
      Zoom: true,
      // 伪3D设置，如果不想用伪3D，则可以设置 Shadow:false 或 Shadow:null,
      Shadow: {
        Left: 5,
        Top: 5,
        Fill: ''
      },
      Bar: {
        Effect: 2000,
        HeightMin: 10,
        HeightMax: 60,
        Width: 8,
        Radius: 2
      },
      Line: {
        EffectMin: 2000,
        EffectMax: 4000,
        PointRadius: 1.5
      },
      Point: {
        EffectMin: 2000,
        EffectMax: 4000,
        RadiusMin: 8,
        RadiusMax: 16
      },
      Fly: {
        EffectMin: 2000,
        EffectMax: 4000
      },
      OnSelect: null
    }
  }

  constructor (json, element, config) {
    // 根元素，容器元素，根元素宽高，高度比例，容器元素高度
    // var ROOT, Container, WIDTH, HEIGHT, PHEIGHT, THEIGHT
    // 合并配置项
    const defaultSetting = this.defaultSetting()
    // Config.extend(defaultSetting)
    // Config.extend(config)
    Config = Object.assign(defaultSetting, config)
    console.log(Config)
    this.ROOT = element
    this.WIDTH = element.clientWidth
    this.HEIGHT = element.clientHeight
    console.log(Config.RotateX)
    this.PHEIGHT = Math.cos(Math.PI * 2 * Config.RotateX / 360)
    this.THEIGHT = this.HEIGHT / this.PHEIGHT
    Config.GLOBAL_BUILDER = new MapBuilder(json, element)
    // 创建svg
    this.Container = d3.select(element)
      .append('div')
      .attr('class', 'v-map')
      .attr('style', 'width:' + this.WIDTH + 'px;height:' + this.THEIGHT + 'px;margin-top:' + (this.HEIGHT - this.THEIGHT) / 2 + 'px;transform: rotateX(' + Config.RotateX + 'deg);')
    console.log(this.Container)
    Config.GLOBAL_SVG = this.Container.append('svg')
      .attr('width', this.WIDTH)
      .attr('height', this.THEIGHT)
    Config.GLOBAL_SVG.append('defs').html(defs)
    window.Config = Config
    this._init(json)
  }

  _init (json) {
    var self = this
    var center = Config.GLOBAL_BUILDER.getCenter()
    var scale = Config.GLOBAL_BUILDER.getFullScale()

    if (Config.Shadow) {
      var projectionBkg = d3.geoMercator()
        .center(center)
        .scale(scale)
        .translate([this.WIDTH / 2 + Config.Shadow.Left, this.THEIGHT / 2 + Config.Shadow.Top])
      var pathBkg = d3.geoPath().projection(projectionBkg)
      Config.GLOBAL_SVG.append('g')
        .attr('class', 'v-group-background')
        .selectAll('path.v-item-background')
        .data(json.features)
        .enter()
        .append('path')
        .attr('class', 'v-item-background')
        .attr('d', pathBkg)
    }
    var groupArea = Config.GLOBAL_SVG.append('g').attr('class', 'v-group')
    Config.GLOBAL_PROJECTION = d3.geoMercator()
      .center(center)
      .scale(scale)
      .translate([this.WIDTH / 2, this.THEIGHT / 2])
    var path = d3.geoPath().projection(Config.GLOBAL_PROJECTION)

    var shapes = groupArea.selectAll('g.v-item')
      .data(json.features)
      .enter()
      .append('g')
      .attr('id', d => '_area_' + d.properties.adcode || d.properties.id || d.properties.name)
      .attr('class', 'v-item')

    shapes.append('path')
      .attr('class', 'v-area')
      .attr('d', path)
    shapes.append('text')
      .attr('class', 'v-label')
      .attr('x', d => Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(d.properties.name))[0])
      .attr('y', d => Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(d.properties.name))[1] + 5)
      .text(d => d.properties.name)

    shapes.on('mouseover', function (d) {
      var html = `
                <h2 class="custom">${d.properties.name}</h2>
            `
      Tip.show(html)
    })
      .on('mouseout', () => Tip.hide())
      .on('click', function (d) {
        shapes.classed('v-item-selected', false)
        d3.select(this).classed('v-item-selected', true)
      })
    if (_.isFunction(Config.OnSelect)) {
      shapes.on('click', function (d) {
        var areaName = d.properties.name
        var id = Config.GLOBAL_BUILDER.getId(areaName)
        Config.GLOBAL_SVG.selectAll('g.v-item').classed('v-item-selected', false)
        Config.GLOBAL_SVG.selectAll('g#_area_' + id).classed('v-item-selected', true)
        Config.OnSelect.call(null, areaName)
      })
    }

    window.addEventListener('resize', function () {
      self._resize()
    })

    if (Config.Zoom) {
      Config.GLOBAL_SVG.call(d3.zoom().on('zoom', self._zoom))
    }
  }

  _resize () {
    this.WIDTH = this.ROOT.clientWidth
    this.HEIGHT = this.ROOT.clientHeight
    this.THEIGHT = this.HEIGHT / this.PHEIGHT

    this.Container.attr('style', 'width:' + this.WIDTH + 'px;height:' + this.THEIGHT + 'px;margin-top:' + (this.HEIGHT - this.THEIGHT) / 2 + 'px;transform: rotateX(' + Config.RotateX + 'deg);')
    Config.GLOBAL_SVG.attr('width', this.WIDTH).attr('height', this.THEIGHT)
    var center = Config.GLOBAL_BUILDER.getCenter()
    var scale = Config.GLOBAL_BUILDER.getFullScale()
    Config.GLOBAL_PROJECTION = d3.geoMercator()
      .center(center)
      .scale(scale)
      .translate([this.WIDTH / 2, this.THEIGHT / 2])
    var path = d3.geoPath().projection(Config.GLOBAL_PROJECTION)
    Config.GLOBAL_SVG.selectAll('path.v-area')
      .attr('d', path)
    Config.GLOBAL_SVG.selectAll('text.v-label')
      .attr('x', d => Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(d.properties.name))[0])
      .attr('y', d => Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(d.properties.name))[1] + 5)

    if (Config.Shadow) {
      var projectionBkg = d3.geoMercator()
        .center(center)
        .scale(scale)
        .translate([this.width / 2 + Config.Shadow.Left, this.theight / 2 + Config.Shadow.Top])
      var pathBkg = d3.geoPath().projection(projectionBkg)
      Config.GLOBAL_SVG.selectAll('path.v-item-background').attr('d', pathBkg)
    }

    /*
    * TODO:模块初始化
    * */
    let Bar = new EffectBar()
    Bar.resize()
    let Line = new EffectLine()
    Line.resize()
    let Point = new EffectPoint()
    Point.resize()
    let Fly = new EffectFly()
    Fly.resize()
  }

  _zoom () {
    let transform = d3.event.transform
    if (transform.k === __TRANSFORM.k) {
      __TRANSFORM.x += transform.x - __TRANSFORM.ix
      __TRANSFORM.y += transform.y - __TRANSFORM.iy
    } else {
      __TRANSFORM.k = transform.k
      __TRANSFORM.ix = transform.x
      __TRANSFORM.iy = transform.y
    }
    Config.GLOBAL_SVG.attr('transform', 'translate(' + __TRANSFORM.x + ',' + __TRANSFORM.y + ') scale(' + __TRANSFORM.k + ')')
  }

  setBars (arr) {
    EffectBar.setData(arr)
  }

  setLines (arr) {
    EffectLine.setData(arr)
  }

  setPoints (arr) {
    EffectPoint.setData(arr)
  }

  setColors (arr) {
    Config.GLOBAL_SVG.selectAll('path.v-area').attr('style', ';')
    arr.map(function (item) {
      var id = Config.GLOBAL_BUILDER.getId(item.area)
      Config.GLOBAL_SVG.select('#_area_' + id + ' .v-area').attr('style', 'fill:' + item.fill)
    })
  }

  // 飞到点内
  fly (from, to, callback) {
    EffectFly.fly(from, to, callback)
  }

  showTip (html, target) {
    if (_.isString(target)) {
      var point = Config.GLOBAL_PROJECTION(Config.GLOBAL_BUILDER.getPoint(target))
      var offset = this.ROOT.getBoundingClientRect()
      Tip.showBy(offset.x + point[0], offset.y + point[1] * this.PHEIGHT, html)
    } else {
      Tip.show(html)
    }
  }

  hideTip () {
    Tip.hide()
  }

  getConfig () {
    return Config
  }
}
