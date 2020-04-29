<template>
  <div class="d2-page-cover">
<!--    <div class="d2-page-cover__logo">-->
<!--      <slot/>-->
<!--    </div>-->
<!--    <p class="d2-page-cover__title">D2 Admin {{$version}}</p>-->
<!--    <p class="d2-page-cover__sub-title">优雅的中后台集成方案</p>-->
<!--    <p class="d2-page-cover__build-time">FINAL BUILD TIME {{$buildTime}}</p>-->
<!--    <slot name="footer"/>-->
<!--    <a target="blank" href="https://github.com/d2-projects/d2-admin">-->
<!--      <img-->
<!--        style="position: absolute; top: 0; right: 0; border: 0; width: 150px;"-->
<!--        src="./image/darkblue@2x.png"-->
<!--        alt="Fork me on GitHub">-->
<!--    </a>-->
    <div class="map-chart" id="mapChart" style="width: 100%;height: 100%;">
    </div>
  </div>
</template>

<script>
import DrawMap from '../map/newMap'
import axios from 'axios'

export default {
  name: 'WordMap',
  data () {
    return {
    }
  },
  mounted () {
    axios.get('./json/world.json')
      .then(response => {
        let data = response.data
        this.render(data)
      })
      .catch(error => {
        console.error(error)
      })
  },
  methods: {
    render (data) {
      const config = {
        width: 2000,
        height: 1500
      }
      // eslint-disable-next-line no-unused-vars
      let a = new DrawMap(data, document.getElementById('mapChart'), config)
      // console.log(a)
    }
  }
}
</script>

<style lang="scss" scoped>
.d2-page-cover {
  @extend %full;
  @extend %unable-select;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  .d2-page-cover__logo {
    img {
      width: 200px;
    }
  }
  .d2-page-cover__title {
    margin: 0px;
    margin-bottom: 20px;
    font-weight: bold;
    color: $color-text-main;
  }
  .d2-page-cover__sub-title {
    margin: 0px;
    margin-bottom: 5px;
    color: $color-text-normal;
  }
  .d2-page-cover__build-time {
    margin: 0px;
    margin-bottom: 10px;
    font-size: 12px;
    color: $color-text-placehoder;
  }
}
</style>
