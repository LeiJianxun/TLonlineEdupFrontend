<template>
  <div class="dashboard admin-dashboard">
    <!-- 地图区域 -->
    <div class="map-container">
      <div ref="chinaMap" class="china-map"></div>
    </div>

    <!-- 实时数据面板 -->
    <div class="real-time-panel">
      <a-card title="实时访问" class="panel-card">
        <a-timeline>
          <a-timeline-item
            v-for="log in accessLogs"
            :key="log.time"
            :color="log.type === 'warn' ? 'orange' : 'green'"
          >
            {{ log.time }} - {{ log.message }}
          </a-timeline-item>
        </a-timeline>
      </a-card>

      <a-card title="系统健康度" class="panel-card">
        <div class="health-metrics">
          <a-progress
            v-for="metric in healthMetrics"
            :key="metric.name"
            :percent="metric.value"
            :status="metric.status"
          >
            <template #format>
              <span>{{ metric.name }}</span>
            </template>
          </a-progress>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import chinaJson from '../../assets/map/json/china.json'

// 静态数据
const accessLogs = ref([
  { time: '10:00', message: '用户A 登录系统', type: 'info' },
  { time: '10:05', message: '用户B 访问课程', type: 'info' },
  { time: '10:10', message: '系统负载过高', type: 'warn' }
])

const healthMetrics = ref([
  { name: 'CPU使用率', value: 75, status: 'normal' },
  { name: '内存使用率', value: 60, status: 'normal' },
  { name: '磁盘空间', value: 85, status: 'exception' }
])

// 初始化地图
const initChinaMap = () => {
  echarts.registerMap('china', chinaJson)
  const mapInstance = echarts.init(document.querySelector('.china-map'))
  const option = {
    title: { text: '实时访问分布', left: 'center' },
    tooltip: { trigger: 'item' },
    visualMap: {
      min: 0,
      max: 1000,
      left: 'right',
      inRange: { color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4'] }
    },
    series: [{
      name: '访问量',
      type: 'map',
      map: 'china',
      roam: true,
      emphasis: { label: { show: true } },
      data: [
        { name: '北京', value: 1000 },
        { name: '上海', value: 800 },
        { name: '广东', value: 1200 }
      ]
    }]
  }
  mapInstance.setOption(option)
}

onMounted(initChinaMap)
</script>

<style lang="scss">
.admin-dashboard {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  height: 100vh;
  padding: 24px;
  background: #f5f7fa;
  margin-top: 8vh;

  .map-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .china-map {
      width: 100%;
      height: 800px;
    }
  }

  .real-time-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .panel-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .health-metrics {
        .ant-progress {
          margin: 16px 0;
        }
      }
    }
  }
}
</style>
