<template>
  <div id="home-container">
    <!-- 视频背景 -->
    <div class="video-container">
      <video class="background-video" autoplay muted loop playsinline
             src="https://cdn-fusionwork.sf-express.com/v1.2/AUTH_FS-BASE-SERVER-PRD-DR/sfosspublic001/survey_icon/pc.m4v"
             poster="https://campus.sf-express.com/upload/oss/static/web/login_bg.jpeg">
      </video>
      <div class="video-overlay"></div>
    </div>

    <!-- 主内容区域 -->
    <main class="content-wrapper">
      <!-- 搜索区域 -->
      <section class="search-section">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="输入课程关键词"
          enter-button="搜索课程"
          size="large"
          @search="handleSearch"
          class="animated-search"
        />
      </section>

      <!-- 学习专区 -->
      <section class="learning-section">
        <h2 class="section-title">探索学习领域</h2>
        <ProgrammingLanguage />
        <LocalClass />
      </section>

      <!-- 数据概览 -->
      <section class="analytics-section">
        <h2 class="section-title">实时数据看板</h2>
        <div class="stats-grid">
          <a-card hoverable class="stat-card">
            <a-statistic
              title="注册用户总数"
              :value="stats.totalUsers"
              :value-style="{ color: '#1890ff' }"
              class="pulse-animation"
            />
          </a-card>

          <a-card hoverable class="stat-card">
            <a-statistic
              title="平台课程总数"
              :value="stats.totalCourses"
              :value-style="{ color: '#52c41a' }"
              class="pulse-animation"
            />
          </a-card>

          <a-card hoverable class="stat-card">
            <a-statistic
              title="实时在线人数"
              :value="stats.onlineUsers"
              :value-style="{ color: '#f5222d' }"
              class="live-indicator"
            >
              <template #suffix>
                <span class="live-dot"></span>
              </template>
            </a-statistic>
          </a-card>
        </div>

        <!-- 课程分类图表 -->
        <div class="chart-container">
          <div ref="categoryChart" class="category-chart"></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';
import axios from 'axios';
import ProgrammingLanguage from '../components/Encomponents/PL_re.vue';
import LocalClass from '../components/Encomponents/class_re.vue';
import router from '@/router';

// 响应式数据
const searchKeyword = ref('');
const stats = ref({
  totalUsers: 0,
  totalCourses: 0,
  onlineUsers: 0
});
let chartInstance = null;
let updateInterval = null;

// 初始化图表
const initChart = () => {
  axios.get('/api/start/getCourseTypeCount').then((res)=>{
    let key = Object.keys(res.data);
    let pieData = [];
    for (let i = 0 ; i < key.length; i++){
      pieData.push({
        name: key[i]=== 'GeneralKnowledge' ? '通识' : key[i]=== 'Programming' ? '编程' : key[i]=== 'SpecializedCourses' ? '专业课' : '其他',
        value: res.data[key[i]]
      })
    }
    chartInstance = echarts.init(document.querySelector('.category-chart'));
    const option = {
      title: {
        text: '课程分类分布',
        left: 'center',
        textStyle: {
          color: '#666'
        }
      },
      tooltip: {
        trigger: 'item'
      },
      series: [{
        type: 'pie',
        radius: '65%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
    chartInstance.setOption(option);
  }).catch((e)=>{
    message.error("课程类型获取失败！" + e)
  })

};

// 获取统计数据
const fetchStats = async () => {
  try {
    const [usersRes, coursesRes, onlineRes] = await Promise.all([
      axios.get('/api/start/getUserCount'),
      axios.get('/api/start/getCourseCount'),
      axios.get('/api/start/count')
    ]);

    stats.value = {
      totalUsers: usersRes.data,
      totalCourses: coursesRes.data,
      onlineUsers: onlineRes.data
    };
    initChart();
  } catch (error) {
    message.error('数据加载失败');
  }
};

// 初始化
onMounted(() => {
  initChart();
  fetchStats();
  updateInterval = setInterval(fetchStats, 5000); // 5秒刷新
});

// 清理
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.dispose();
  clearInterval(updateInterval);
});

// 搜索处理
const handleSearch = (value) => {
  if (!value.trim()) {
    message.warning('请输入搜索关键词');
    return;
  }
  router.push({
    path: '/search',
    query: { q: value.trim() }
  });
};
</script>

<style lang="scss" scoped>
#home-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.video-container {
  position: relative;
  height: 60vh;

  .background-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%);
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 2rem 10%;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
}

.search-section {
  max-width: 800px;
  margin: -3rem auto 4rem;

  .animated-search {
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.02);
    }
  }
}

.section-title {
  font-size: 2.2rem;
  color: #1a3353;
  text-align: center;
  margin: 2rem 0;
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: #1890ff;
    margin: 1rem auto;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 3rem 0;

  .stat-card {
    border-radius: 12px;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    :deep(.ant-statistic-title) {
      font-size: 1.1rem;
      color: #666;
    }

    :deep(.ant-statistic-content) {
      font-size: 2.2rem;
    }
  }
}

.live-indicator {
  position: relative;
  padding-right: 24px;

  .live-dot {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: #ff4d4f;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255,77,79,0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255,77,79,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,77,79,0); }
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  .category-chart {
    width: 100vh;
    height: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.8rem;
  }
}
</style>
