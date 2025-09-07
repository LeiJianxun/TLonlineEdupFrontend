<template>
  <div class="dashboard public-dashboard">
    <!-- 顶部标题 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">学习系统数据概览</h1>
      <div class="header-actions">
        <a-button type="primary" ghost>了解更多</a-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <a-card hoverable class="stat-card">
        <div class="stat-icon">
          <UserOutlined />
        </div>
        <a-statistic title="平台总用户" :value="12893" />
        <div class="stat-trend">
          <span class="trend-up">+12%</span> 较上月
        </div>
      </a-card>

      <a-card hoverable class="stat-card">
        <div class="stat-icon">
          <BookOutlined />
        </div>
        <a-statistic title="公开课程数" :value="356" />
        <div class="stat-trend">
          <span class="trend-up">+8%</span> 较上月
        </div>
      </a-card>

      <a-card hoverable class="stat-card">
        <div class="stat-icon">
          <TeamOutlined />
        </div>
        <a-statistic title="实时在线" :value="1245" />
        <div class="stat-trend">
          <span class="trend-up">+15%</span> 较上周
        </div>
      </a-card>
    </div>

    <!-- 数据可视化区域 -->
    <div class="visualization-grid">
      <!-- 课程分类饼图 -->
      <a-card title="课程分类分布" class="chart-card">
        <div ref="courseChart" class="chart-container"></div>
      </a-card>

      <!-- 热门课程排行 -->
      <a-card title="热门课程TOP10" class="rank-card">
        <a-list item-layout="horizontal" :data-source="hotCourses">
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  <span class="rank-index">{{ index + 1 }}.</span>
                  {{ item.name }}
                  <span class="hot-tag">🔥 {{ item.hotValue }}</span>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>

    <!-- 底部数据流 -->
    <div class="data-stream">
      <div class="stream-title">实时数据动态</div>
      <div class="stream-content">
        <a-tag color="blue">用户A 加入了课程《Java编程》</a-tag>
        <a-tag color="green">用户B 完成了课程《Python入门》</a-tag>
        <a-tag color="orange">用户C 发布了新问题</a-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { UserOutlined, BookOutlined, TeamOutlined } from '@ant-design/icons-vue'

// 静态数据
const hotCourses = ref([
  { name: 'Java编程入门', hotValue: 1289 },
  { name: 'Python数据分析', hotValue: 1123 },
  { name: '前端开发实战', hotValue: 987 },
  // 更多数据...
])

// 初始化图表
const initChart = () => {
  const chart = echarts.init(document.querySelector('.chart-container'))
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '10%', left: 'center' },
    series: [{
      type: 'pie',
      radius: '65%',
      data: [
        { value: 1048, name: '编程语言' },
        { value: 735, name: '数据结构' },
        { value: 580, name: '算法设计' },
        { value: 484, name: '系统架构' },
        { value: 300, name: '人工智能' }
      ],
      emphasis: { itemStyle: { shadowBlur: 10 } }
    }]
  }
  chart.setOption(option)
}

onMounted(initChart)
</script>

<style lang="scss" scoped>
.public-dashboard {
  padding: 24px;
  background: #f5f7fa;
  margin-top: 8vh;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .dashboard-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a3353;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 24px;

    .stat-card {
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .stat-icon {
        font-size: 24px;
        color: #1890ff;
        margin-bottom: 12px;
      }

      .stat-trend {
        margin-top: 8px;
        font-size: 14px;
        color: #666;

        .trend-up {
          color: #52c41a;
        }
      }
    }
  }

  .visualization-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    margin-bottom: 24px;

    .chart-card, .rank-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .chart-container {
        height: 300px;
      }
    }
  }

  .data-stream {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .stream-title {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .stream-content {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}
</style>
