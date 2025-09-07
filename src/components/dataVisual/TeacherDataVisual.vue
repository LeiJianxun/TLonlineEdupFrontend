<template>
  <div class="dashboard teacher-dashboard">
    <!-- 顶部导航 -->
    <div class="dashboard-nav">
      <a-button
        v-for="tab in tabs"
        :key="tab.key"
        :type="activeTab === tab.key ? 'primary' : 'default'"
        @click="switchTab(tab.key)"
      >
        {{ tab.title }}
      </a-button>
    </div>

    <!-- 课程选择 -->
    <a-select
      v-if="activeTab === 'course'"
      v-model:value="selectedCourse"
      placeholder="选择授课课程"
      class="course-selector"
      @change="handleCourseChange"
    >
      <a-select-option
        v-for="course in teacherCourses"
        :key="course.id"
        :value="course.id"
      >
        {{ course.name }}
      </a-select-option>
    </a-select>

    <!-- 数据概览 -->
    <div class="overview-grid">
      <a-card title="学生统计" class="overview-card">
        <div class="student-chart" ref="studentChart"></div>
      </a-card>

      <a-card title="课程进度" class="overview-card">
        <a-progress
          type="circle"
          :percent="75"
          :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }"
        />
      </a-card>

      <a-card title="活跃度分析" class="overview-card">
        <div class="activity-chart" ref="activityChart"></div>
      </a-card>
    </div>

    <!-- 签到模块 -->
    <a-card v-if="activeTab === 'course'" title="课堂签到" class="attendance-card">
      <div class="attendance-container">
        <a-button
          type="primary"
          @click="startCheckIn"
          :disabled="isChecking"
        >
          {{ isChecking ? '进行中...' : '开始签到' }}
        </a-button>

        <div class="attendance-stats">
          <span>应到: {{ attendanceStats.total }}</span>
          <span>实到: {{ attendanceStats.present }}</span>
        </div>
      </div>
    </a-card>

    <!-- 随机提问 -->
    <a-card v-if="activeTab === 'course'" title="随机提问" class="question-card">
      <a-button type="primary" @click="askRandomQuestion">随机提问</a-button>
      <div v-if="randomStudent">
        <p>请 {{ randomStudent.userName }} 回答问题</p>
      </div>
    </a-card>

    <!-- 提问弹窗 -->
    <a-modal
      v-model:visible="showQuestionModal"
      :title="null"
      :footer="null"
      width="600px"
      :destroyOnClose="true"
      :keyboard="false"
      :maskClosable="false"
    >
      <div class="question-modal-container">
        <!-- 顶部标题栏 -->
        <div class="modal-header">
          <h3 class="modal-title">
            <span class="icon-wrapper"><rocket-outlined /></span>
            随机提问 - {{ randomStudent.userName }}
          </h3>
        </div>

        <!-- 内容区域 -->
        <div class="modal-body">
          <!-- 提问表单（初始状态） -->
          <a-form
            v-if="!isSubmitting"
            :model="questionForm"
            layout="vertical"
            class="question-form"
          >
            <a-form-item label="问题内容" required>
              <a-textarea
                v-model:value="questionForm.content"
                placeholder="请输入需要提问的问题内容"
                :rows="3"
                :auto-size="{ minRows: 3, maxRows: 5 }"
              />
            </a-form-item>
            <a-form-item label="答案关键词（可选）">
              <a-select
                v-model:value="questionForm.keywords"
                mode="tags"
                placeholder="输入关键词后回车"
                style="width: 100%"
              />
            </a-form-item>
          </a-form>

          <!-- 等待回答状态 -->
          <div v-else class="answer-status">
            <a-spin :spinning="noAnswer" size="large">
              <div class="status-content">
                <div v-if="noAnswer" class="waiting-response">
                  <div class="loading-animation">
                    <div class="dot-flashing"></div>
                  </div>
                  <h4>等待学生回答中...</h4>
                  <p>已向 {{ randomStudent.userName }} 发送提问请求</p>
                </div>

                <div v-if="isAnswer" class="answer-response">
                  <a-alert
                    type="success"
                    show-icon
                    :message="`${randomStudent.userName} 已回答`"
                  />
                  <div class="answer-content">
                    <h5>学生答案：</h5>
                    <div class="answer-text">{{ AnswerData.content }}</div>
                    <div class="answer-analysis">
                      <a-tooltip :title="AnswerData.emotionAnalysis">
                        <a-tag :color="getTagColor('emotionAnalysis')">
                          AI情感分析（仅供参考）
                          <!-- 这里可以截取部分内容显示，例如前50个字符 -->
                          {{ AnswerData.emotionAnalysis.length > 20? AnswerData.emotionAnalysis.slice(0, 20) + '...' : AnswerData.emotionAnalysis }}
                        </a-tag>
                      </a-tooltip>
                      <a-tag :color="getTagColor('score')">AI判分（仅供参考） {{ AnswerData.score }} 分</a-tag>
                      <a-tag v-for="(kw, index) in AnswerData.keywords" :key="index">
                        {{ kw }}
                      </a-tag>
                    </div>
                  </div>
                </div>
              </div>
            </a-spin>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="modal-footer">
          <template v-if="!isSubmitting">
            <a-button @click="handleQuestionCancel">取消提问</a-button>
            <a-button type="primary" @click="handleQuestionSubmit">发送提问</a-button>
          </template>

          <!-- 提交后状态 -->
          <template v-else>
            <!-- 等待回答状态 -->
            <a-button
              v-if="noAnswer"
              type="primary"
              :loading="true"
              class="loading-btn"
            >
              <template #indicator>
                <span class="dot-flashing"></span>
              </template>
              等待回答中...
            </a-button>

            <!-- 已回答状态 -->
            <div v-if="isAnswer" class="answered-actions">
<!--              <a-tooltip title="保存当前问答记录">-->
<!--                <a-button type="dashed" @click="handleSaveRecord">-->
<!--                  <template #icon><save-outlined /></template>-->
<!--                </a-button>-->
<!--              </a-tooltip>-->
              <a-button type="primary" @click="handleCloseModal">
                关闭提问
              </a-button>
            </div>
          </template>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 静态数据
const activeTab = ref('overview')
const tabs = [
  { key: 'overview', title: '教学概览' },
  { key: 'course', title: '课程管理' }
]
const teacherCourses = ref([
  { id: 1, name: 'Java编程入门' },
  { id: 2, name: 'Python数据分析' },
  // 更多数据...
])

const selectedCourse = ref(null)
const isChecking = ref(false)
const attendanceStats = ref({ total: 45, present: 0 })
const courseStudents = ref([])
const randomStudent = ref(null)
const showQuestionModal = ref(false)
const isSubmitting = ref(false)
const noAnswer = ref(true)
const isAnswer = ref(false)
const AnswerData = ref()
const pollingIntervalId = ref(null); //轮询数据

// 提问表单
const questionForm = ref({
  content: '',
  keywords: []
})

// 初始化图表
const initCharts = () => {
  const studentChart = echarts.init(document.querySelector('.student-chart'))
  studentChart.setOption({
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    yAxis: { type: 'value' },
    series: [{ data: [120, 200, 150, 80, 70], type: 'bar' }]
  })

  const activityChart = echarts.init(document.querySelector('.activity-chart'))
  activityChart.setOption({
    xAxis: { type: 'category', data: ['Week1', 'Week2', 'Week3', 'Week4'] },
    yAxis: { type: 'value' },
    series: [{ data: [820, 932, 901, 934], type: 'line' }]
  })
}

const switchTab = (key) =>{
  console.log(key)
}

// 开始签到
const startCheckIn = async () => {
  isChecking.value = true
  try {
    const response = await axios.post('/api/attendance/start', {
      courseId: selectedCourse.value
    })
    if (response.status === 200) {
      message.success('签到已开始')
      // 模拟实时更新签到人数
      setInterval(async () => {
        const statsResponse = await axios.get(
          `/api/attendance/stats/${selectedCourse.value}`
        )
        attendanceStats.value.present = statsResponse.data.present
      }, 5000)
    }
  } catch (err) {
    message.error('签到开始失败')
    console.error(err)
  } finally {
    isChecking.value = false
  }
}

// 获取课程学生列表
const fetchCourseStudents = async (courseId, courseGs) => {
  try {
    const response = await axios.get(`/api/classUser/${17}`);
    courseStudents.value = response.data.userInfo
  } catch (err) {
    console.error('获取学生列表失败', err)
  }
}

// 随机提问
const askRandomQuestion = () => {
  if (courseStudents.value.length === 0) {
    message.warning('没有学生可以提问')
    return
  }
  const randomIndex = Math.floor(Math.random() * courseStudents.value.length)
  randomStudent.value = courseStudents.value[randomIndex]
  showQuestionModal.value = true
}

// 处理问题提交
const handleQuestionSubmit = async () => {
  if (!questionForm.value.content) {
    message.error('请填写问题内容')
    return
  }

  isSubmitting.value = true
  try {
    const res = await axios.post('/api/questionsAi', {
      ...questionForm.value,
      courseId: selectedCourse.value,
      studentId: randomStudent.value.id
    })
    message.success('问题已发送')
    startAnswerPolling(res.data.id) // 启动轮询
  } catch (err) {
    message.error('发送失败')
    isSubmitting.value = false
  }
}

// 重置表单
const resetQuestionForm = () => {
  questionForm.value = {
    content: '',
    keywords: []
  }
}

// 取消提问
const handleQuestionCancel = () => {
  resetQuestionForm()
  showQuestionModal.value = false
}

//实时获取学生答题内容
const startAnswerPolling = (questionId) => {
  pollingIntervalId.value = setInterval(async () => {
    try {
      const response = await axios.get(`/api/questionsAi/getAnswer/${questionId}`);
      if (response.data !== ''){
        noAnswer.value = false;
        isAnswer.value = true;
        AnswerData.value = response.data;
        setTimeout(()=>{
          localStorage.removeItem("currentQuestion")
        },5000)
      }else {
        noAnswer.value = true;
        isAnswer.value = false;
      }
    } catch (err) {
      console.error('轮询检查失败', err)
      clearInterval(pollingIntervalId.value)
    }
  }, 2000) // 每2秒检查一次
}

const getTagColor = computed(()=>{
  return (type) =>{
    if (type === 'emotionAnalysis' && AnswerData.value){
      return AnswerData.value.emotionAnalysisColor;
    }
    if (type === 'score' && AnswerData.value && AnswerData.value.score < 60){
      return 'red'
    }else if (type === 'score' && AnswerData.value && AnswerData.value.score >= 60 && AnswerData.value.score <= 80){
      return 'orange'
    }else {
      return 'green'
    }
  }
})
const handleCloseModal = () => {
  if (pollingIntervalId.value) {
    clearInterval(pollingIntervalId.value); // 清除轮询
    pollingIntervalId.value = null;
  }
  resetQuestionForm()
  showQuestionModal.value = false
  isSubmitting.value = false
  noAnswer.value = true
  isAnswer.value = false
  AnswerData.value = null
}

onMounted(() => {
  initCharts()
  const courseId = router.currentRoute.value.params.courseId;
  const courseGs = router.currentRoute.value.params.courseGs;
  if (courseId) {
    activeTab.value = 'course'
    selectedCourse.value = courseId
    fetchCourseStudents(courseId,courseGs)
  }
})

onBeforeUnmount(() =>{
  clearInterval(pollingIntervalId.value);
})
</script>

<style lang="scss">
.teacher-dashboard {
  padding: 24px;
  background: #f5f7fa;
  margin-top: 8vh;

  .dashboard-nav {
    margin-bottom: 24px;

    .ant-btn {
      margin-right: 12px;
    }
  }

  .course-selector {
    width: 300px;
    margin-bottom: 24px;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 24px;

    .overview-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .student-chart,
      .activity-chart {
        height: 200px;
      }
    }
  }

  .attendance-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    .attendance-container {
      display: flex;
      align-items: center;
      gap: 24px;

      .attendance-stats {
        display: flex;
        gap: 16px;
        font-size: 16px;

        span {
          padding: 8px 16px;
          background: #f8f9fa;
          border-radius: 4px;
        }
      }
    }
  }

  .question-card {
    margin-top: 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
.question-modal-container {
  padding: 16px;

  .modal-header {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
    margin-bottom: 20px;

    .modal-title {
      margin: 0;
      display: flex;
      align-items: center;
      font-size: 18px;
      color: #2c3e50;

      .icon-wrapper {
        background: #1890ff;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        :deep(svg) {
          color: white;
          font-size: 16px;
        }
      }
    }
  }

  .modal-body {
    min-height: 200px;
    padding: 8px 0;

    .question-form {
      :deep(.ant-form-item-label) {
        font-weight: 500;
      }
    }

    .answer-status {
      padding: 20px 0;

      .waiting-response {
        text-align: center;
        padding: 24px;

        h4 {
          margin: 16px 0 8px;
          color: #666;
        }

        p {
          color: #999;
          margin: 0;
        }

        .loading-animation {
          position: relative;
          height: 40px;
          margin-bottom: 16px;

          .dot-flashing {
            position: relative;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 10px;
            border-radius: 5px;
            background-color: #1890ff;
            animation: dotFlashing 1s infinite linear;

            &::before, &::after {
              content: '';
              position: absolute;
              top: 0;
              width: 10px;
              height: 10px;
              border-radius: 5px;
              background-color: #1890ff;
            }

            &::before {
              left: -15px;
              animation: dotFlashing 1s infinite linear;
              animation-delay: 0s;
            }

            &::after {
              left: 15px;
              animation: dotFlashing 1s infinite linear;
              animation-delay: 0.2s;
            }
          }
        }
      }

      .answer-response {
        .answer-content {
          margin-top: 16px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 4px;

          h5 {
            margin: 0 0 12px;
            color: #444;
          }

          .answer-text {
            line-height: 1.6;
            color: #666;
            margin-bottom: 16px;
          }

          .answer-analysis {
            border-top: 1px dashed #eee;
            padding-top: 12px;
          }
        }
      }
    }
  }

  .modal-footer {
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
    margin-top: 20px;
    text-align: right;

    .ant-btn {
      margin-left: 8px;
    }
  }
}

@keyframes dotFlashing {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}
</style>
