<template>
    <china :bgColor="bgColor" :inRange="inRange" :mapName="mapName" :tipleft="tipleft" :tipright="tipright" />
</template>

<script>
import china from './china.vue'
    export default {
        name:'test',
        components:{
            china
        },
        data() {
            return {
                // bgColor:'url(https://markdown-1307246189.cos.ap-chongqing.myqcloud.com/learnvue/QQ%E5%9B%BE%E7%89%8720220718152025.jpg)'
                bgColor:'',
                //左侧数据导航条
                inRange: { color: ['#FF6464', '#FFA85A', '#FFEC6F', '#8BBCFE'].reverse()},
                mapName:'中国',
                tipleft: '人口数:',
                tipright: '万人'
            }
        },
    }
</script>

<style>

</style>