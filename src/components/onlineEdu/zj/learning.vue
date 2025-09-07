<template>
  <div class="learning-container">
    <!-- 课程标题 -->
    <h2 v-if="course">{{ course.name }} - 学习任务</h2>

    <!-- 加载状态 -->
    <a-spin v-if="loading" size="large" tip="加载中..." />

    <!-- 错误提示 -->
    <a-alert
      v-else-if="error"
      message="加载失败"
      :description="error"
      type="error"
      show-icon
    />

    <!-- 任务列表 -->
    <div v-else>
      <a-empty v-if="tasks.length === 0" description="暂无学习任务" />

      <a-list item-layout="horizontal" :data-source="tasks">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta
              :description="formatTaskDescription(item)"
            >
              <template #title>
                <div class="task-title">
                  <span>{{ item.title }}</span>
                  <a-tag :color="getTaskTagColor(item.status)">
                    {{ formatTaskStatus(item.status) }}
                  </a-tag>
                </div>
              </template>

              <template #avatar>
                <div class="task-type-icon">
                  <component :is="getTaskIcon(item.type)" />
                </div>
              </template>
            </a-list-item-meta>

            <template #actions>
              <span>截止时间：{{ formatDate(item.endTime) }}</span>
              <a-progress
                :percent="item.progress"
                :status="item.progress === 100 ? 'success' : 'active'"
                style="width: 200px"
              />
              <a-button
                v-if="item.status === 'NOT_STARTED'"
                type="primary"
                @click="startTask(item)"
              >
                开始学习
              </a-button>
              <a-button
                v-else-if="item.status === 'IN_PROGRESS'"
                type="primary"
                @click="continueTask(item)"
              >
                继续学习
              </a-button>
              <div v-if="item.type === 'HOMEWORK' && item.attachments" class="attachments">
                <a-tooltip v-for="file in item.attachments" :key="file.id" :title="file.name">
                  <a-button type="link" @click="downloadFile(file.url)">
                    <file-text-outlined />
                    {{ file.name }} ({{ file.size }})
                  </a-button>
                </a-tooltip>
              </div>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import axios from 'axios';
import moment from 'moment';
import {
  BookOutlined,
  VideoCameraOutlined,
  ExperimentOutlined,
  ScheduleOutlined
} from '@ant-design/icons-vue';

const courseId = localStorage.getItem("learningKey");
const loading = ref(true);
const error = ref(null);
const course = ref(null);
const tasks = ref([]);

// 获取任务数据
const fetchData = async () => {
  try {
    // 获取课程信息
    const courseRes = await axios.get(`/api/courses/${courseId}`);
    course.value = courseRes.data;

    // 获取学生任务
    const userId = JSON.parse(localStorage.getItem('loginData')).id;
    const taskRes = await axios.get(`/api/student-tasks?courseId=${courseId}&studentId=${userId}`);
    tasks.value = taskRes.data;
  } catch (err) {
    error.value = err.response?.data?.message || '网络请求失败';
    message.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

// 任务类型图标
const getTaskIcon = (type) => {
  const icons = {
    HOMEWORK: BookOutlined,
    VIDEO: VideoCameraOutlined,
    EXERCISE: ExperimentOutlined,
    OFFLINE: ScheduleOutlined
  };
  return icons[type] || BookOutlined;
};

// 添加新的工具方法
const formatTaskDescription = (task) => {
  const descriptions = {
    HOMEWORK: `作业要求：${task.content}`,
    VIDEO: `视频时长：${task.duration}分钟`,
    EXERCISE: `题目数量：${task.questionCount}道`,
    OFFLINE: `上课地点：${task.classroom}，时间安排：${task.schedule?.join('、')}`
  };
  return descriptions[task.type] || task.content;
};

// 格式化日期
const formatDate = (dateString) => {
  return moment(dateString).format('YYYY-MM-DD HH:mm');
};

// 更新任务状态判断逻辑
const getTaskTagColor = (status) => {
  const colors = {
    NOT_STARTED: 'gray',
    IN_PROGRESS: 'orange',
    COMPLETED: 'green',
    OVERDUE: 'red'
  };
  return colors[status] || 'gray';
};

// 格式化任务状态
const formatTaskStatus = (status) => {
  const statusMap = {
    NOT_STARTED: '未开始',
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    OVERDUE: '已逾期'
  };
  return statusMap[status] || '未知状态';
};

// 开始任务
const startTask = async (task) => {
  // TODO: 实现开始任务逻辑
  try {
    const response = await axios.post(`/api/student-tasks/updateStatus/${task.id}`)
    if (response.status === 200){
      message.info(`开始任务：${task.title}`);
      fetchData()
    }else{
      message.error("处理失败")
    }

  }catch (err){
    message.error(err)
  }
};

// 继续任务
const continueTask = (task) => {
  // TODO: 根据任务类型跳转到对应页面
  switch(task.type) {
    case 'HOMEWORK':
      window.location.href = `/task/homework/${task.id}`;
      break;
    case 'VIDEO':
      window.location.href = `/task/video/${task.id}`;
      break;
    case 'EXERCISE':
      sessionStorage.setItem('currentTask', JSON.stringify(task));
      window.location.href = `/task/exercise/${task.CourseTaskId}`;
      break;
  }
};

// 添加附件下载方法
const downloadFile = (url) => {
  window.open(url, '_blank');
};

onMounted(() => {
  console.log(courseId)
  if (!courseId) {
    message.error('未选择学习课程');
    window.location.href = '/courses';
    return;
  }
  fetchData();
  // 用户进入课程页面，更新在线人数
  axios.post(`/api/courses/${courseId}/enter`);
});

onUnmounted(() => {
  // 用户离开课程页面，更新在线人数
  axios.post(`/api/courses/${courseId}/leave`);
});
</script>

<style lang="scss" scoped>
.learning-container {
  max-width: 1200px;
  margin: 20px auto;
  margin-top: 8vh;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: 100vh;

  h2 {
    margin-bottom: 24px;
    color: #1890ff;
  }

  .task-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .task-type-icon {
    font-size: 24px;
    color: #1890ff;
  }

  :deep(.ant-list-item) {
    padding: 16px;
    transition: all 0.3s;

    &:hover {
      background: #fafafa;
      transform: translateX(4px);
    }
  }
}
</style>
