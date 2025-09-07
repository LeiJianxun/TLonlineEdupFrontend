<template>
  <header-nav />

  <!-- 悬浮按钮 -->
  <div class="float-button-container" v-show="isShow">
    <a-float-button-group shape="circle" :style="{ right: '94px' }">
      <a-float-button @click="toggleChat">
        <template #icon>
          <MessageOutlined :style="{ color: chatVisible? '#1890ff' : '#000' }" />
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
    :width="800"
    :maskClosable="false"
  >
    <div class="chat-container">
      <div class="chat-messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.isUser? 'user' : 'ai']"
        >
          <div class="message-content">
            <template v-if="msg.isLoading">
              <div class="thinking-animation">
                <span>思</span><span>考</span><span>中</span><span>.</span><span>.</span><span>.</span>
              </div>
            </template>
            <template v-else>
              <div v-html="formatToMarkdown(msg.content)"></div>
            </template>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <a-input
          v-model:value="inputMessage"
          placeholder="请输入您的问题..."
          @pressEnter="handleSend"
          :loading="isLoading"
        >
          <template #suffix>
            <a-button type="primary" @click="handleSend" :loading="isLoading">
              {{ isLoading? '停止思考' : '发送' }}
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
import { defineComponent, ref, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import { MessageOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import header from "./components/Encomponents/H_menu.vue";
import footerMenu from "./components/Encomponents/footer_com.vue";
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

// 路由白名单（安全限制）
const ALLOWED_ROUTES = [
  '/home',
  '/settings',
  '/profile',
  '/dashboard'
  // 添加更多允许跳转的路由
];

// 新增本地存储键名常量
const STORAGE_KEYS = {
  LOGIN_DATA: "loginData",
  ACTIVE_QUESTION: "activeQuestion" // 新增：记录当前活跃题目
};

export default defineComponent({
  components: {
    MessageOutlined,
    headerNav: header,
    FooterMenu: footerMenu,
  },
  setup() {
    const router = useRouter();
    const isShow = ref(true);
    let heartbeatInterval = null;
    let heartbeatIntervalRandom = null;
    const chatVisible = ref(false);
    const messages = ref([]);
    const inputMessage = ref('');
    const isLoading = ref(false);

    // 高亮代码
    const highlightCode = (content) => {
      const regex = /```([a-z]+)\n([\s\S]*?)```/g;
      return content.replace(regex, (match, lang, code) => {
        const highlighted = Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup, lang);
        return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
      });
    };

    // 格式化为Markdown
    const formatToMarkdown = (text) => {
      if (text.includes("代码") || text.includes("Python") || text.includes("Java") || text.includes("JavaScript") || text.includes("js")){
        return highlightCode(text)
      }else {
        // 处理标题
        text = text.replace(/###\s(.*)/g, '<h3>$1</h3>');
        text = text.replace(/##\s(.*)/g, '<h2>$1</h2>');
        text = text.replace(/#\s(.*)/g, '<h1>$1</h1>');

        // 处理无序列表
        text = text.replace(/\n- /g, '<li>');
        text = text.replace(/<li>$/g, '</li>');
        text = text.replace(/<li>/g, '<li>');
        // 处理有序列表
        text = text.replace(/\n(\d+)\. /g, '<li>');
        text = text.replace(/<li>$/g, '</li>');
        text = text.replace(/<li>/g, '<li>');

        // 处理加粗
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 处理斜体
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

        return text;
      }
    };

    // AI处理逻辑
    const processAICommand = async (message) => {
      try {
        // 添加思考中的消息
        const thinkingIndex = messages.value.length;
        messages.value.push({
          content: '',
          isUser: false,
          isLoading: true
        });

        // 调用AI接口
        const response = await axios.post('/api/deepSeek', null, {
          params: {
            someParam: message
          }
        });

        // 解析AI响应
        const aiResponse = response.data.split("</think>")[1];

        // 更新思考中的消息为实际响应
        messages.value[thinkingIndex] = {
          content: aiResponse,
          isUser: false,
          isLoading: false
        };

        console.log(messages.value);

        // 处理导航指令
        if (aiResponse.action === 'navigate' && aiResponse.path) {
          if (ALLOWED_ROUTES.includes(aiResponse.path)) {
            router.push(aiResponse.path);
          } else {
            messages.value.push({
              content: '抱歉，我没有权限导航到该页面',
              isUser: false
            });
          }
        }
      } catch (error) {
        console.error('AI处理错误:', error);
        messages.value.push({
          content: '处理请求时出现问题，请稍后再试',
          isUser: false
        });
      } finally {
        isLoading.value = false;
      }
    };

    // 发送消息处理
    const handleSend = () => {
      if (!inputMessage.value.trim() || isLoading.value) return;

      const message = inputMessage.value.trim();
      messages.value.push({
        content: message,
        isUser: true
      });

      isLoading.value = true;
      inputMessage.value = '';

      processAICommand(message);
    };

    // 切换聊天窗口
    const toggleChat = () => {
      chatVisible.value =!chatVisible.value;
      if (chatVisible.value) {
        // 打开时滚动到底部
        setTimeout(() => {
          const container = document.querySelector('.chat-messages');
          if (container) container.scrollTop = container.scrollHeight;
        }, 100);
      }
    };

    // 检查登录状态
    const checkLogin = async () => {
      try {
        const response = await axios.get('/api/start/getLoginData');
        if (response.status === 200) {
          localStorage.setItem(STORAGE_KEYS.LOGIN_DATA, JSON.stringify(response.data));

          // 启动轮询时检查现有题目状态
          const existingQuestion = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUESTION);
          if (!existingQuestion) {
            heartbeatIntervalRandom = setInterval(() =>
                loadStudentQuestion(response.data.id),
              5000 // 改为5秒轮询一次以减轻压力
            );
          }
        }
      } catch (e) {
        console.error("登录检查失败:", e);
        localStorage.clear();
      }
    };

    // 实时获取需要回答的问题
    const loadStudentQuestion = async (userID) => {
      try {
        const loginData = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGIN_DATA));
        if (!loginData || loginData.identifiers!== "Public") {
          clearInterval(heartbeatIntervalRandom);
          return;
        }

        // 检查本地是否存在未完成题目
        const activeQuestion = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUESTION);
        if (activeQuestion) {
          console.log('已有未完成题目:', activeQuestion);
          return;
        }

        const response = await axios.get(`/api/questionsAi/getStudent/${userID}`);
        if (response.data?.id) {
          // 记录当前题目到本地存储
          localStorage.setItem(
            STORAGE_KEYS.ACTIVE_QUESTION,
            JSON.stringify({
              id: response.data.id,
              timestamp: new Date().getTime()
            })
          );

          // 使用同域窗口管理
          const questionWindow = window.open(
            `/RandomQuestion/${response.data.id}`,
            'questionWindow', // 指定窗口名称
            'width=800,height=600'
          );

          // 监听窗口关闭
          const checkWindowClosed = setInterval(() => {
            if (questionWindow.closed) {
              clearInterval(checkWindowClosed);
              localStorage.removeItem(STORAGE_KEYS.ACTIVE_QUESTION);
            }
          }, 1000);
        }
      } catch (e) {
        console.error("加载随机学生问题出错:", e);
      }
    };

    // 启动心跳
    const startHeartbeat = () => {
      if (localStorage.getItem("loginData")) {
        const userData = JSON.parse(localStorage.getItem("loginData"));
        axios.post('/api/start/heartbeatUser', {}, {
          headers: {
            Authorization: `${userData.id}` // 携带登录id
          }
        }).catch(error => console.error('心跳失败:', error));
      } else {
        axios.post('/api/start/heartbeat')
          .catch(error => console.error('心跳失败:', error));
      }
    };

    // 停止心跳
    const stopHeartbeat = () => {
      axios.post('/api/start/leave')
        .catch(error => console.error('离开失败:', error));
    };

    // 处理页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
    };

    // 生命周期钩子
    onBeforeMount(() => {
      checkLogin();
    });

    onMounted(() => {
      startHeartbeat();
      heartbeatInterval = setInterval(startHeartbeat, 32000); // 每32秒发送一次心跳
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', stopHeartbeat);
    });

    onBeforeUnmount(() => {
      clearInterval(heartbeatInterval);
      clearInterval(heartbeatIntervalRandom); // 清理随机问题定时器
      stopHeartbeat();
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_QUESTION);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', stopHeartbeat);
    });

    // 路由守卫
    router.beforeEach((to, from, next) => {
      if (to.path === '/login') {
        isShow.value = false;
      } else {
        isShow.value = true;
      }
      next();
    });

    return {
      isShow,
      chatVisible,
      messages,
      inputMessage,
      isLoading,
      handleSend,
      toggleChat,
      formatToMarkdown,
      highlightCode
    };
  },
  methods: {
    handleClick() {
      // 悬浮按钮点击事件
    },
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
.chat-container {
  height: 60vh;
  display: flex;
  flex-direction: column;

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 16px;

    .message {
      margin: 8px 0;
      max-width: 80%;

      &.user {
        margin-left: auto;
        text-align: right;
        .message-content {
          background: #1890ff;
          color: white;
        }
      }

      &.ai {
        margin-right: auto;
        .message-content {
          background: #f0f0f0;
          color: #333;
        }
      }

      .message-content {
        display: inline-block;
        padding: 8px 12px;
        border-radius: 12px;
        word-break: break-word;
      }

      .thinking-animation {
        display: inline-block;
        font-size: 20px;
        animation: dots 1.5s infinite;
        letter-spacing: 3px;
      }
    }
  }

  .chat-input {
    :deep(.ant-input) {
      padding-right: 80px;
    }

    button {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
    }
  }
}

@keyframes dots {
  0%, 20% {
    opacity: 0;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-3px);
  }
  100% {
    opacity: 0;
    transform: translateY(0);
  }
}
</style>
