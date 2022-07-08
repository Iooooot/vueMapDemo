<template>
  <div>
    <h2>{{history[history.length-1]}}</h2>
    <div class="btns">
      <el-button icon="el-icon-circle-plus-outline" size="mini" plain @click="scaleMap(0)"></el-button>
      <el-button icon="el-icon-remove-outline" size="mini" plain @click="scaleMap(1)"></el-button>
    </div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item v-for="(v,i) in history" :key="i" @click.native="clickNav(v)">{{v}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div id="map"/>
  </div>
</template>

<script>
import * as echarts from "echarts";


export default {
  data(){
    return {
      history:[],
      option:{
        tooltip: {
          trigger: "item",
        }, 
        series: [
          {
            type: "map",
            mapType: 'China',
            zoom:1,
            roam:true,
            scaleLimit:{
              min:0.5
            },
            label: {
              normal: {
                show: true,
              },
              emphasis: {
                show: true,
              }
            },
            select: {
              disabled: true
            },
            itemStyle: {
              normal: {
                borderColor: "#000",
              },
              emphasis: {
                areaColor: "#B5D0E8",
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            },
            data: [],
            graph:{}
          },
        ],
      }
    }
  },
  methods: {
    async showMap(mapName) {
      const newMapJson = await this.$http.get('/data/' + mapName + '.json')
      echarts.registerMap(mapName, newMapJson.data)
      this.option.series[0].mapType = mapName
      if(!this.history.includes(mapName)){
        this.history.push(mapName);
      }
      this.graph.setOption(this.option, true);    
    },
    clickNav(mapName){
      for(let i = this.history.length-1;i >= 0;i--){
        if(this.history[i] == mapName){
          break;
        }
        this.history.pop();
      }
      this.showMap(mapName)
    },
    scaleMap(flag){
      let currentZoom = this.graph.getOption().series[0].zoom;//当前缩放比例
      let increaseAmplitude = 1.2;
      //0为放大1为缩小
      if (flag == 1) {
            increaseAmplitude = 0.8
      }
      let result = currentZoom * increaseAmplitude
      if(result < 0.5){
        result = 0.5
      } 
      this.graph.setOption({
        series:[{zoom:result}]
      })
    },
  },
  mounted() {
      this.graph = echarts.init(document.getElementById("map"));
      this.graph.on("click",params => {
        if (params.seriesType == 'map') {
          if(this.history.length != 0 && params.name != this.history[this.history.length-1])
          this.showMap(params.name)
        }
      })
      this.showMap('中国');
  },
};
</script>
