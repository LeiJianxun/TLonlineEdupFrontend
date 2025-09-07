<template>
  <header-nav />

  <!-- 悬浮按钮 -->
  <div class="float-button-container" v-show="isShow">
    <a-float-button-group shape="circle" :style="{ right: '94px' }">
      <a-float-button @click="toggleChat">
        <template #icon>
          <MessageOutlined :style="{ color: chatVisible ? '#1890ff' : '#000' }" />
        </template>
      </a-float-button>
      <a-back-top />
    </a-float-button-group>
  </div>

  <!-- AI聊天对话框 -->
  <a-modal
    v-model:visible="chatVisible"
    title="AI助手"
    :footer="null"
    :width="600"
    :maskClosable="false"
    class="ai-chat-modal"
  >
    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.isUser ? 'user' : 'ai']"
        >
          <div class="message-content">
            <template v-if="msg.isUser">{{ msg.content }}</template>
            <template v-else>
              <div v-if="msg.status === 'loading'" class="thinking-animation">
                <div class="dot-flashing"></div>
              </div>
              <div v-else class="ai-response-content" v-html="formatResponse(msg.content)"></div>
            </template>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <a-input
          v-model:value="inputMessage"
          placeholder="请输入您的问题..."
          @pressEnter="handleSend"
          :disabled="isLoading"
        >
          <template #suffix>
            <a-button
              :type="isLoading ? 'danger' : 'primary'"
              @click="isLoading ? abortRequest() : handleSend()"
            >
              {{ isLoading ? '停止生成' : '发送' }}
            </a-button>
          </template>
        </a-input>
      </div>
    </div>
  </a-modal>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <router-view />
  </main>

  <!-- 页脚 -->
  <FooterMenu />
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { MessageOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';

// ...其他导入保持不变...

export default defineComponent({
  // ...组件配置保持不变...

  setup() {
    // ...其他代码保持不变...

    const messagesContainer = ref(null);
    const cancelTokenSource = ref(null);

    // 格式化响应内容
    const formatResponse = (content) => {
      // 转换换行符
      let formatted = content.replace(/\n/g, '<br>');
      // 高亮代码块
      formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
        const highlighted = Prism.highlight(
          code.replace(/^(\w+)\n/, ''),
          Prism.languages.python,
          'python'
        );
        return `<pre class="code-block"><code>${highlighted}</code></pre>`;
      });
      // 处理<think>标签
      formatted = formatted.replace(/<think>([\s\S]*?)<\/think>/g, '<div class="thinking-note">$1</div>');
      return formatted;
    };

    // 中止请求
    const abortRequest = () => {
      if (cancelTokenSource.value) {
        cancelTokenSource.value.cancel('用户中止请求');
        isLoading.value = false;
      }
    };

    // AI处理逻辑
    const processAICommand = async (message) => {
      try {
        cancelTokenSource.value = axios.CancelToken.source();

        const response = await axios.post('/api/deepSeek', null, {
          params: { someParam: message },
          cancelToken: cancelTokenSource.value.token
        });

        // 更新最后一条消息状态
        const lastMsgIndex = messages.value.length - 1;
        messages.value[lastMsgIndex] = {
          content: response.data,
          isUser: false,
          status: 'complete'
        };
      } catch (error) {
        if (!axios.isCancel(error)) {
          messages.value.push({
            content: '请求被中断或发生错误',
            isUser: false,
            status: 'error'
          });
        }
      } finally {
        isLoading.value = false;
        cancelTokenSource.value = null;
        scrollToBottom();
      }
    };

    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    // 发送消息处理
    const handleSend = async () => {
      if (!inputMessage.value.trim() || isLoading.value) return;

      const message = inputMessage.value.trim();
      messages.value.push({
        content: message,
        isUser: true
      });

      // 添加加载中的AI消息
      messages.value.push({
        content: '',
        isUser: false,
        status: 'loading'
      });

      isLoading.value = true;
      inputMessage.value = '';
      scrollToBottom();

      await processAICommand(message);
    };

    // ...其他方法保持不变...

    return {
      // ...其他返回值...
      messagesContainer,
      formatResponse,
      abortRequest
    };
  },
});
</script>

<style lang="scss" scoped>
.ai-chat-modal {
  :deep(.ant-modal-body) {
    padding: 0;
  }
}

.chat-container {
  height: 70vh;
  display: flex;
  flex-direction: column;

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #f8f8f8;

    .message {
      margin: 12px 0;
      max-width: 85%;
      transition: opacity 0.3s;

      &.user {
        margin-left: auto;
        .message-content {
          background: #1890ff;
          color: white;
          border-radius: 12px 12px 0 12px;
        }
      }

      &.ai {
        margin-right: auto;
        .message-content {
          background: white;
          color: #333;
          border-radius: 12px 12px 12px 0;
        }
      }

      .message-content {
        padding: 12px 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        line-height: 1.6;
      }
    }
  }

  .thinking-animation {
    padding: 12px 16px;
    .dot-flashing {
      position: relative;
      width: 10px;
      height: 10px;
      border-radius: 5px;
      background-color: #1890ff;
      animation: dotFlashing 1s infinite linear;

      &::before,
      &::after {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 5px;
        background-color: #1890ff;
        animation: dotFlashing 1s infinite linear;
      }

      &::before {
        left: -15px;
        animation-delay: 0s;
      }

      &::after {
        left: 15px;
        animation-delay: 0.2s;
      }
    }
  }

  .chat-input {
    padding: 16px;
    border-top: 1px solid #eee;
    background: white;

    :deep(.ant-input) {
      padding-right: 100px;
      border-radius: 20px;
    }

    button {
      right: 24px;
      border-radius: 18px;
    }
  }
}

@keyframes dotFlashing {
  0% { opacity: 0.2; transform: translateY(0); }
  20% { opacity: 1; transform: translateY(-3px); }
  100% { opacity: 0.2; transform: translateY(0); }
}

.code-block {
  background: #2d2d2d;
  color: #ccc;
  padding: 12px;
  border-radius: 6px;
  font-family: Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.9em;
  overflow-x: auto;
  margin: 8px 0;
}

.thinking-note {
  color: #666;
  border-left: 3px solid #1890ff;
  padding-left: 12px;
  margin: 8px 0;
  font-style: italic;
}
</style>
