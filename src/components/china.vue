<template>
  <div :style="{ 'background': bgColor}">
    <h2>{{ history[history.length - 1] }}</h2> <!--  展示当前地区名 -->
    <div class=" btns">
      <!--  放大缩小按钮组 -->
      <el-button icon="el-icon-circle-plus-outline" size="mini" plain @click="scaleMap(0)"></el-button>
      <el-button icon="el-icon-remove-outline" size="mini" plain @click="scaleMap(1)"></el-button>
    </div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!--  左上角访问历史面包屑 -->
      <el-breadcrumb-item v-for="(v, i) in history" :key="i" @click.native="clickNav(v)">{{ v }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="map" /> <!-- 地图绘画区域 -->
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: ['bgColor', 'inRange', 'mapName', 'tipleft','tipright'],
  data() {
    return {
      history: [], //访问历史
      dataList:{},//当前地图人口数据//
      coordinate:[], //地图上散点的经纬数组
      dataMax:-1, //当前区域数据最大值
      dataMin:999999,//当前区域数据最小值
      option: {  //地图的相关配置
        tooltip: {  //鼠标移入的提示标签
          trigger: "item",
          formatter: (params)=>{
            //格式化样式
            return `${this.tipleft}${params.data.value}${this.tipright}`
          }
        },
        geo: {  //地图坐标 方便地图与散点图位置同步
          show: true,
          map: 'China',
          roam: true,
          zoom: 1,
          scaleLimit: {
              min: 0.5
          },
          label: {
            show: true,
            emphasis: {
              show: true,
            }
          },
          itemStyle: {
              normal: {
                borderColor: "#000",
              },
              emphasis: {
                areaColor: "#227825",
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
        },
        //左侧数据导航条
        visualMap:{
          show: true,
          left: '10%',
          bottom: '30%',
          seriesIndex: [0],
          text: ['高', '低'], // 文本，默认为数值文本
          inRange: {color:['#FF6464', '#FFA85A', '#FFEC6F', '#8BBCFE'].reverse()}
        },
        series: [
          {  //地图
            type: "map",
            mapType: 'China',
            geoIndex: 0,
            zoom: 1,
            roam: true,
            scaleLimit: {
              min: 0.5
            },
            label: {
              show: true,
              emphasis: {
                show: true,
              }
            },
            select: {
              disabled: true
            },
            itemStyle: {
              borderColor: "#000",
              emphasis: {
                areaColor: "#2B91B7",
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            },
            data: [],
            graph: {}
          },
          { //散点图
            name: '点',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbol: 'none', //气泡pin
            symbolSize: function(val) { //散点大小
                return 0.01 * (val[2]*0.4) + 18.5;
            },
            label: {
            formatter: function (params) {
              console.log(params);
              return `${params.data.value[2]}`
            },
            show: false,
            textStyle: {
                color: '#fff',
                fontSize: 12,
            } 
            },
            itemStyle: {
                normal: {
                    color: '#2B91B7', //标志颜色
                }
            },
            tooltip:{
              formatter: function (params) {
                return `人口数：${params.data.value[2]}万人`
              }
            },
            zlevel: 6,
            data: [], //散点图的数据
        }
        ],
      },
    }
  },
  methods: {
    async showMap(mapName) { //绘画地图方法
      //1.首先获取地图json  
      const newMapJson = await this.$http.get('/data/' + mapName + '.json')
      console.log(newMapJson);
      //2.注册地图
      echarts.registerMap(mapName, newMapJson.data)
      //记录散点经纬度
      this.coordinateInit(mapName).then(res =>{
        //获取成功后
        //记录历史
        if (!this.history.includes(mapName)) {
          this.history.push(mapName);
        }
        //设置相关数据
        this.option.series[1].data = this.coordinate
        this.option.series[0].mapType = mapName
        this.option.geo.map = mapName
        //设置数据导航条的取值范围
        this.option.visualMap.max = parseInt(this.dataMax)
        this.option.visualMap.min = parseInt(this.dataMin)
        if (this.inRange) {
          this.option.visualMap.inRange = this.inRange 
        }
        //设置option后echarts会自动重新绘画地图
        this.graph.setOption(this.option, true);
      }
      );
      
      
    },
    //点击导航栏跳转地图
    clickNav(mapName) {
      for (let i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i] === mapName) {
          break;
        }
        this.history.pop();
      }
      this.showMap(mapName)
    },
    //放大缩小
    scaleMap(flag) {
      let currentZoom = this.graph.getOption().geo[0].zoom;//当前缩放比例
      let increaseAmplitude = 1.2;
      //0为放大1为缩小
      if (flag == 1) {
        increaseAmplitude = 0.8
      }
      let result = currentZoom * increaseAmplitude
      if (result < 0.5) {
        result = 0.5
      }
      this.graph.setOption({
        geo: { zoom: result }
      })
    },
    
    //展示人口数据以及散点图
    async coordinateInit(mapName){
      //获取人口数据json
      const perNumJson = await this.$http.get('/personNumData/' + mapName + '.json')
      //配置地图的人口数据
      this.option.series[0].data = perNumJson.data
      this.dataMax = -1
      this.dataMin = 9999999
      //格式化保留两位小数，以及获取当前数据最大值和最小值
      this.option.series[0].data.forEach(v=>{
        v.value = parseFloat(v.value)
        v.value = v.value.toFixed(2)
        if(v.value > parseFloat(this.dataMax)){
          this.dataMax = v.value
        }
        if(v.value < parseFloat(this.dataMin)){
          this.dataMin = v.value
        }
      })
      //获取人口
      for(let i = 0;i < perNumJson.data.length;i++){
        this.dataList[perNumJson.data[i].name] = parseFloat(perNumJson.data[i].value)
      }
      //清空坐标数据以免重复渲染
      this.coordinate = []
      //获取该地图各区域数据
      echarts.getMap(mapName).geoJson.features.forEach((v) =>{
        if(v.properties.name != ""){
          let cId = v.properties.centroid ? v.properties.centroid : v.properties.center //获取经纬度
          this.coordinate.push({ //添加对象，属性名为区域名，值为经纬度加人口数的数组
            name: v.properties.name,
            value: cId.concat(this.dataList[v.properties.name]),
          })
        }
      });
    }
  },

  mounted() {
    if (!this.bgColor) {
       // 默认背景图片
       this.bgColor = 'url(' + require('../assets/image/wallhaven-z8eqjv_2560x1920.png') + ')' 
    }
    //指定地图容器
    this.graph = echarts.init(document.querySelector(".map"));
    //绑定单击事件
    this.graph.on("click", params => {
      if (params.seriesType == 'map') { //点击实现下钻，并且如果已经到了最后一层不允许点击
        if (this.history.length != 0 && params.name != this.history[this.history.length - 1])
          this.showMap(params.name)
      }
    })
    //开始时展示的地图
    this.showMap(this.mapName);
    //自适应
    window.onresize = this.graph.resize
  },
};
</script>

<style  scoped>
.map {
  width: 100%;
  height: 100vh;
  margin: 0 auto;
}

h2 {
  position: fixed;
  top: 0%;
  left: 45%;
  z-index: 2;
}

.btns {
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 25%;
  left: 10%;
  z-index: 2;
}

.el-button {
  border: 1px solid black !important;
  font-size: 20px !important;
  margin-left: 0 !important;
  margin-top: 30px !important;
}

.el-breadcrumb {
  position: fixed;
  top: 15%;
  left: 10%;
  font-size: 19px !important;
  z-index: 2;
}

.el-breadcrumb__separator {
  color: #fff !important;
}

.el-breadcrumb__inner {
  color: black !important;
  cursor: pointer !important;
  font-weight: 600 !important;
  opacity: 0.7;
}

.el-breadcrumb__inner:hover {
  opacity: 1;
}
</style>