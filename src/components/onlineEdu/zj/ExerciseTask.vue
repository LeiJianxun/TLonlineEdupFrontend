<template>
  <div class="exercise-container">
    <a-spin v-if="loading" size="large" tip="加载题目中..." />
    <a-alert v-else-if="error" type="error" :message="error" show-icon />

    <div v-else>
      <a-page-header
        title="在线练习"
        :sub-title="`剩余时间：${countdown}`"
        @back="() => $router.go(-1)"
      >
        <template #extra>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            提交练习
          </a-button>
        </template>
      </a-page-header>

      <div class="exercise-content">
        <div v-for="(question, qIndex) in questions" :key="question.id" class="question-card">
          <a-card :title="`第${qIndex + 1}题（${questionTypeMap[question.type]}）`">
            <!-- 题目题干 -->
            <div class="question-stem" v-html="question.question"></div>

            <!-- 选择题选项 -->
            <div v-if="['SINGLE','MULTIPLE'].includes(question.type)" class="options-list">
              <template v-if="question.type === 'SINGLE'">
                <a-radio-group
                  v-model:value="answers[question.id].value"
                  class="radio-group"
                >
                  <div
                    v-for="(option, oIndex) in question.options"
                    :key="oIndex"
                    class="option-item"
                  >
                    <a-radio :value="option.id">
                      {{ String.fromCharCode(65 + oIndex) }}. {{ option.content }}
                    </a-radio>
                  </div>
                </a-radio-group>
              </template>

              <template v-else>
                <a-checkbox-group v-model:value="answers[question.id].value">
                  <div
                    v-for="(option, oIndex) in question.options"
                    :key="oIndex"
                    class="option-item"
                  >
                    <a-checkbox :value="option.id">
                      {{ String.fromCharCode(65 + oIndex) }}. {{ option.content }}
                    </a-checkbox>
                  </div>
                </a-checkbox-group>
              </template>
            </div>

            <!-- 主观题答案框 -->
            <a-textarea
              v-else
              v-model:value="answers[question.id].value"
              placeholder="请输入您的答案"
              :rows="4"
            />

            <!-- 答案解析（仅预览模式显示） -->
            <a-collapse v-if="showAnalysis" class="analysis-section">
              <a-collapse-panel key="1" header="答案解析">
                <div v-html="question.analysis || '暂无解析'"></div>
              </a-collapse-panel>
            </a-collapse>
          </a-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import axios from 'axios';
import moment from 'moment';

const route = useRoute();
const taskId = route.params.taskId;
const loading = ref(true);
const error = ref(null);
const questions = ref([]);
const answers = ref({});
const submitting = ref(false);
const endTime = ref(null);
const showAnalysis = ref(false);
const currentTime = ref(moment()); // 当前时间

// 题目类型映射
const questionTypeMap = {
  SINGLE: '单选题',
  MULTIPLE: '多选题',
  SUBJECTIVE: '主观题'
};

// 获取题目数据
const fetchQuestions = async () => {
  try {
    const res = await axios.get(`/api/tasks/${taskId}/questions`);
    questions.value = res.data;

    // 初始化答案结构
    questions.value.forEach(q => {
      answers.value[q.id] = {
        type: q.type,
        value: q.type === 'MULTIPLE' ? [] : null // SINGLE和SUBJECTIVE都用null初始化
      };
    });

    const taskJson = sessionStorage.getItem('currentTask');
    if (taskJson) {
      const task = JSON.parse(taskJson);
      // 获取任务截止时间
      endTime.value = moment(task.endTime);
    }

  } catch (err) {
    error.value = err.response?.data?.message || '加载失败';
  } finally {
    loading.value = false;
  }
};

// 倒计时计算
const countdown = computed(() => {
  if (!endTime.value) return '--:--:--';
  const now = currentTime.value;
  const duration = moment.duration(endTime.value.diff(now));

  return duration.asSeconds() > 0
    ? `${Math.floor(duration.asHours())}小时 ${duration.minutes()}分 ${duration.seconds()}秒`
    : '已截止';
});

// 定时器更新当前时间
let timer;
onMounted(() => {
  fetchQuestions();
  timer = setInterval(() => {
    currentTime.value = moment();
  }, 1000); // 每秒更新一次当前时间
});

onUnmounted(() => {
  clearInterval(timer); // 组件卸载时清除定时器
});

// 提交处理
const handleSubmit = async () => {
  try {
    submitting.value = true;

    // 构建提交数据
    const submission = {
      answers: Object.entries(answers.value).map(([questionId, answer]) => ({
        questionId,
        type: answer.type,
        value: answer.value
      }))
    };

    const taskJson = sessionStorage.getItem('currentTask');

    if (taskJson) {
      const task = JSON.parse(taskJson);
      await axios.post(`/api/student-tasks/tasks/${task.id}/submit`, submission);
      message.success('提交成功');
      showAnalysis.value = true;
      // 更新任务状态
      await axios.post(`/api/student-tasks/complete/${task.id}`);
      // route.push('/Learning');
    }

  } catch (err) {
    message.error('提交失败：' + (err.response?.data?.message || '网络错误'));
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.exercise-container {
  max-width: 1200px;
  margin: 20px auto;
  margin-top: 8vh;
  padding: 20px;
}
.radio-group {
  width: 100%;
}
.option-item {
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.question-card {
  margin: 16px 0;
}

.question-stem {
  font-size: 16px;
  margin-bottom: 24px;
  white-space: pre-wrap;
}

.options-list {
  margin: 12px 0;
}

.option-item {
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.option-item:hover {
  background: #f5f5f5;
}

.analysis-section {
  margin-top: 24px;
}
</style>
