<template>
  <header :class="{ scrolled: isScrolled }">
    <div id="content">
      <div id="h_left">
        <img src="../../assets/Thunder.svg" alt @click="logoReturn"/>
        Thunder Learning
      </div>
      <div id="h_right">
        <a-menu mode="horizontal" :selectedKeys="current">
          <a-menu-item key="index">
            <router-link to="/" @click="setCurrentKey('index')">首页</router-link>
          </a-menu-item>
          <a-menu-item key="onlineEdu">
            <router-link to="/OnlineEdu" @click="setCurrentKey('onlineEdu')">课程</router-link>
          </a-menu-item>
          <a-menu-item key="dataVisual" @click="setCurrentKey('dataVisual')">
            大屏
          </a-menu-item>
          <a-menu-item key="systemSetting">
            <router-link to="/systemSetting" v-show="isRoot" @click="setCurrentKey('systemSetting')">管理中心</router-link>
          </a-menu-item>
        </a-menu>
      </div>
      <div id="h_right2">
        <a-button type="text" style="color: #fff;" @click="LoginBut" v-show="isLogin">注册/登陆</a-button>
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent v-show="!isLogin">
            {{loginName}}
            <DownOutlined />
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <router-link to="/userCenter" @click="setCurrentKey('')">个人中心</router-link>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="LogoutBut">注销</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>
  </header>
</template>

<script>
import { defineComponent, ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';  // 引入 useRoute 来访问路由信息
import { DownOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import router from '@/router';

export default defineComponent({
  components: {
    DownOutlined,
  },
  setup() {
    let loginData = JSON.parse(localStorage.getItem("loginData"));
    let loginName = "";
    const current = ref(['index']);  // 默认选中 '首页'
    const route = useRoute();  // 获取当前路由信息
    const isLogin = ref(loginData === null);
    const isRoot = ref(false);

    if (loginData !== null){
      if (loginData.identifiers === "Root" || loginData.identifiers === "Teacher"){
        isRoot.value = true;
      }
      loginName = loginData.username;
    }

    // 使用 watch 监听路由变化，动态更新 current 值
    watch(
      () => route.path,  // 监听路由路径变化
      (newPath) => {
        if (newPath === '/OnlineEdu') {
          current.value = ['onlineEdu'];
        } else if (newPath === '/') {
          current.value = ['index'];
        } else if (newPath.includes("dataVisual")) {
          current.value = ['dataVisual'];
        }
        else {
          current.value = [];
        }
      },
      { immediate: true }  // 初次挂载时也要触发一次
    );

    const LoginBut = () => {
      router.push('/login');
      current.value = ['']
    };

    const LogoutBut = () => {
      console.log("logout")
      axios.post("/api/logout", {}).then((result)=>{
        if (result.status === 200){
          localStorage.clear();
          isLogin.value = true;
          current.value = ['index'];
          isRoot.value = false;
          window.location.reload()
        }
      })
    };

    const setCurrentKey = (key) => {
      current.value = [key];
      if (key === "dataVisual" && localStorage.getItem("loginData")){
        if (JSON.parse(localStorage.getItem("loginData")).identifiers === "Root"){
          router.push("/dataVisual/Root")
        }
        if (JSON.parse(localStorage.getItem("loginData")).identifiers === "Teacher"){
          router.push("/dataVisual/TeacherNoClass")
        }
        if (JSON.parse(localStorage.getItem("loginData")).identifiers === "Public"){
          router.push("/dataVisual/Public")
        }
      }
      if (key === "dataVisual" && !localStorage.getItem("loginData")){
        router.push("/dataVisual/Public")
      }

    };

    const isScrolled = ref(false);

    const handleScroll = () => {
      if(route.name === 'index' || route.name === 'login'){
        isScrolled.value = window.scrollY > 0;
      }else{
        isScrolled.value = true;
      }

    };

    onMounted(() => {
      handleScroll(); // 初始化状态
      window.addEventListener('scroll', handleScroll);
      setInterval(handleScroll, 1)
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      current,
      LoginBut,
      isLogin,
      isRoot,
      loginName,
      LogoutBut,
      setCurrentKey,
      isScrolled,
    };
  },
});
</script>

<style lang="scss" scoped>
header {
  width: 100%;
  height: 8vh;
  background: rgba(222, 233, 253, 0.34);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

#content {
  width: 85%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}

#h_left {
  margin-right: auto;
  font-size: 20px;
  font-weight: bold;
  color: black;
}

#h_right {
  width: auto;
}

#h_right2 {
  display: flex;
  align-items: center;
  color: #fff;
}

.ant-menu {
  border: 0;
  color: #fff;
}

.ant-menu-light {
  background: rgba(148, 145, 145, 0) !important;
  font-size: 1rem;
}

header.scrolled {
  background: white !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  #h_left {
    color: #2c3e50 !important;
  }

  .ant-menu-item a,
  .ant-dropdown-link,
  .ant-btn-text {
    color: #2c3e50 !important;
  }

  .ant-menu-light {
    color: #2c3e50 !important;
  }

  .anticon-down {
    color: #2c3e50 !important;
  }
}
</style>
