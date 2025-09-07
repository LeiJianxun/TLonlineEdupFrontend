<template>
  <div class="search-results-container">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="container">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="输入课程关键词"
          enter-button="重新搜索"
          size="large"
          @search="handleSearch"
          class="search-box"
        />
        <div class="search-meta">
          <span v-if="!loading">
            找到 {{ total }} 个与 "{{ searchKeyword }}" 相关的结果
          </span>
          <a-skeleton-input v-else active :size="15" />
        </div>
      </div>
    </div>

    <!-- 搜索结果列表 -->
    <div class="container">
      <a-spin :spinning="loading">
        <div v-if="results.length > 0" class="results-grid">
          <a-row :gutter="[24, 24]">
            <a-col
              v-for="course in results"
              :key="course.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <a-card hoverable class="course-card">
                <template #cover>
                  <img
                    :src="course.cover || '/default-course.jpg'"
                    alt="课程封面"
                    class="course-cover"
                  />
                </template>
                <a-card-meta :title="course.name">
                  <template #description>
                    <div class="course-info">
                      <div class="description">
                        {{ course.b2 && course.b2.length > 0 ? (course.b2.length > 30 ? course.b2.slice(0, 30) + '...' : course.b2) : '暂无课程描述'}}
                      </div>
                      <div class="meta">
                        <a-tag :color="getCategoryColor(course.category)">
                          {{ formatCategory(course.category) }}
                        </a-tag>
                        <span class="duration">
                          <clock-circle-outlined />
                          {{ course.ks }}课时
                        </span>
                      </div>
                    </div>
                  </template>
                </a-card-meta>
              </a-card>
            </a-col>
          </a-row>
        </div>

        <a-empty v-else description="暂无搜索结果" class="empty-container">
          <template #image>
            <img src="/empty-search.png" class="empty-image" />
          </template>
        </a-empty>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { ClockCircleOutlined } from '@ant-design/icons-vue';
import axios from 'axios';

const router = useRouter();
const searchKeyword = ref(router.currentRoute.value.query.q || '');
const results = ref([]);
const loading = ref(false);
const total = ref(0);

const formatCategory = (category) => {
  const map = {
    GeneralKnowledge: '通识课',
    Programming: '编程课',
    SpecializedCourses: '专业课'
  };
  return map[category] || '其他课程';
};

const getCategoryColor = (category) => {
  const colors = {
    GeneralKnowledge: '#1890ff',
    Programming: '#52c41a',
    SpecializedCourses: '#f5222d'
  };
  return colors[category] || '#666';
};

const fetchResults = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/api/courses/searchCourse/${encodeURIComponent(searchKeyword.value)}`);
    console.log(response)
    results.value = response.data;
    total.value = response.data.length;
  } catch (error) {
    message.error('搜索失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  router.push({
    path: '/search',
    query: { q: searchKeyword.value }
  });
};

watchEffect(() => {
  if (searchKeyword.value) {
    fetchResults();
  }
});
</script>

<style lang="scss" scoped>
.search-results-container {
  min-height: 100vh;
  background: #f8f9fa;
  margin-top: 10vh;
  margin-bottom: 2vh;
}

.search-header {
  background: #fff;
  padding: 2rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2rem;

  .search-box {
    //max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .search-meta {
    text-align: center;
    margin-top: 1rem;
    color: #666;
    font-size: 0.9rem;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.course-card {
  height: 100%;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }

  :deep(.ant-card-cover) {
    height: 200px;
    overflow: hidden;
  }

  .course-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover .course-cover {
    transform: scale(1.05);
  }

  .course-info {
    .description {
      height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      color: #666;
      font-size: 0.9rem;
    }

    .meta {
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .duration {
        font-size: 0.8rem;
        color: #999;
      }
    }
  }
}

.empty-container {
  margin: 4rem 0;
  text-align: center;

  .empty-image {
    width: 200px;
    height: auto;
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .course-card {
    :deep(.ant-card-cover) {
      height: 150px;
    }
  }
}
</style>
