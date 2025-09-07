<template>
  <div class="answer-container">
    <!-- 背景装饰元素 -->
    <div class="decorative-bg">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 答题卡片 -->
    <a-card :bordered="false" class="question-card">
      <!-- 卡片标题 -->
      <template #title>
        <div class="card-title">
          <span class="title-icon">🎯</span>
          <h2>随机抽题</h2>
        </div>
        <p class="question-meta">
          <span class="tag">#{{ question.tag || '综合题' }}</span>
          <span class="difficulty">难度：{{ question.difficulty || '中等' }}</span>
        </p>
      </template>

      <!-- 问题内容 -->
      <div class="question-content">
        <div class="content-box">
          <p>{{ question.content }}</p>
        </div>
      </div>

      <!-- 答题区域 -->
      <a-form @finish="handleSubmit">
        <a-form-item>
          <a-textarea
            v-model:value="answer"
            :auto-size="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入你的解答..."
            class="answer-textarea"
            allow-clear
          />
        </a-form-item>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <a-button
            type="primary"
            html-type="submit"
            class="submit-btn"
            :loading="submitting"
            @click="handleSubmit"
          >
            <template #icon><send-outlined /></template>
            提交答案
          </a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { message } from 'ant-design-vue'

const route = useRoute()
const questionId = route.params.questionId
const question = ref({})
const answer = ref('')
const submitting = ref(false)

// 获取问题详情
onMounted(async () => {
  try {
    const response = await axios.get(`/api/questionsAi/${questionId}`)
    question.value = response.data
  } catch (error) {
    console.error('获取问题信息时出错:', error)
    message.error('获取问题信息失败')
  }
})

// 提交答案
const handleSubmit = async () => {
  if (!answer.value.trim()) {
    message.warning('请填写答案后再提交')
    return
  }

  submitting.value = true
  try {
    await axios.post(`/api/answersAi`, {
      questionId,
      content: answer.value
    })
    message.success('答案提交成功')
    setTimeout(() => window.close(), 1000)
  } catch (err) {
    console.error('提交答案时出错:', err)
    message.error('提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.answer-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  margin-top: 8vh;

  .decorative-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(91, 124, 255, 0.1);
      animation: float 6s infinite ease-in-out;

      &.circle-1 {
        width: 200px;
        height: 200px;
        top: -50px;
        left: -50px;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 300px;
        height: 300px;
        bottom: -100px;
        right: -100px;
        animation-delay: 2s;
      }

      &.circle-3 {
        width: 150px;
        height: 150px;
        top: 30%;
        right: -50px;
        animation-delay: 4s;
      }
    }
  }

  .question-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    width: 100%;

    :deep(.ant-card-head) {
      border-bottom: none;
      padding: 24px;

      .card-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .title-icon {
          font-size: 32px;
          animation: bounce 2s infinite;
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #2c3e50;
        }
      }

      .question-meta {
        margin-top: 8px;
        display: flex;
        gap: 12px;
        color: #666;

        .tag {
          background: #e8f0fe;
          padding: 4px 8px;
          border-radius: 4px;
          color: #5b7cff;
        }

        .difficulty {
          font-style: italic;
        }
      }
    }

    .question-content {
      margin: 24px 0;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;

      .content-box {
        padding: 16px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
    }

    .answer-textarea {
      font-size: 16px;
      line-height: 1.6;
      padding: 16px;
      border-radius: 8px;
      border: 2px solid #e0e3eb;
      transition: all 0.3s;

      &:focus,
      &:hover {
        border-color: #5b7cff;
        box-shadow: 0 2px 8px rgba(91, 124, 255, 0.15);
      }
    }

    .submit-section {
      margin-top: 2rem;
      text-align: right;

      .submit-btn {
        height: 48px;
        padding: 0 40px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
        background: linear-gradient(135deg, #5b7cff, #3b5bdb);
        border: none;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 8px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(91, 124, 255, 0.3);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
  .answer-container {
    padding: 1rem;

    .question-card {
      :deep(.ant-card-head) {
        padding: 16px;

        .card-title h2 {
          font-size: 1.2rem;
        }
      }

      .answer-textarea {
        font-size: 14px;
      }

      .submit-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
