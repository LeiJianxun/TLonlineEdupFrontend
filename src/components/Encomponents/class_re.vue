<template>
  <div class="learning_re">
    <div class="header">
      <h1 class="title">本站热门课程</h1>
      <div class="update-time">
        <span class="update-icon">🕒</span>
        更新于：{{ formattedDate }}
      </div>
    </div>

    <div class="course-container">
      <div
        v-for="(course, index) in hotCourses"
        :key="course.course.id"
        class="course-card"
        :class="{ 'active': activeIndex === index }"
        @mouseenter="handleMouseOver(index)"
      >
        <div class="rank-badge">TOP{{ index + 1 }}</div>

        <div class="course-header">
          <div class="trending-icon">
            <fire-icon />
          </div>
          <div class="course-meta">
            <h3 class="course-title">{{ course.course.name }}</h3>
            <div class="stats">
              <span class="online-users">
                👥 {{ course.onlineCount }}人在线
              </span>
            </div>
          </div>
        </div>

        <div class="course-content">
          <p class="description">{{ truncatedDescription(course.course.b2) }}</p>
        </div>

        <button class="action-button">
          <span class="hover-text">立即学习</span>
          <span class="arrow">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const activeIndex = ref(0);
const hotCourses = ref([]);
const Now_date = new Date().toLocaleDateString();
const activeBox = ref('Top1');
const maxContentLength = 300;


// 日期格式化
let formattedDate = computed(() => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// 获取热门课程
const fetchHotCourses = async () => {
  try {
    formattedDate = computed(() => {
      return new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    });
    const response = await axios.get('/api/courses/hot-courses');
    hotCourses.value = response.data;
  } catch (error) {
    console.error('获取热门课程失败:', error);
  }
};

const handleMouseOver = (box) => {
  activeBox.value = box;
};

const truncatedDescription = (content) => {
  if (content === null || content === undefined || content === ''){
    return '暂无课程描述！'
  }else{
    if (content.length > maxContentLength) {
      return content.substring(0, maxContentLength) + "...";
    } else {
      return content;
    }
  }
};

onMounted(() => {
  fetchHotCourses();
  // 定时更新热门课程信息
  setInterval(fetchHotCourses, 5000); // 每 5 秒更新一次
});

</script>

<style lang="scss" scoped>
.learning_re {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1rem;

  .title {
    font-size: 2rem;
    color: #2c3e50;
    margin: 0;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .update-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
    font-size: 0.9rem;

    .update-icon {
      font-size: 1.2rem;
    }
  }
}

.course-container {
  //display: flex;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 0 1rem;
}

.course-card {
  position: relative;
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff6b6b, #ff9f43);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  }

  &.active {
    grid-column: span 2;
    .action-button {
      background: #4a90e2;
    }
  }
}

.rank-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #ff9f43;
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.course-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  .trending-icon {
    width: 40px;
    height: 40px;
    color: #ff6b6b;
  }

  .course-meta {
    flex: 1;

    .course-title {
      margin: 0;
      font-size: 1.3rem;
      color: #2c3e50;
      font-weight: 700;
    }

    .stats {
      margin-top: 0.5rem;
      font-size: 0.9rem;
      color: #6c757d;

      .online-users {
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }
    }
  }
}

.course-content {
  flex: 1;

  .description {
    color: #495057;
    line-height: 1.6;
    margin: 0;
    font-size: 0.95rem;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.action-button {
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .arrow {
    transform: translateX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    background: #4a90e2;

    .arrow {
      transform: translateX(5px);
    }
  }
}

@media (max-width: 768px) {
  .course-container {
    grid-template-columns: 1fr;
  }

  .course-card.active {
    grid-column: span 1;
  }
}
</style>
