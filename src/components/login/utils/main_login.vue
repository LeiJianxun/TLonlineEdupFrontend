<template>
  <div class="main_login">
    <div class="welcome_content">欢迎登录TL在线教育平台</div>
    <a-form :model="formState" name="normal_login" class="login-form" @finish="onFinish"
            @finishFailed="onFinishFailed" style="margin-top: 15%;">
      <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
        <a-input v-model:value="formState.username" style="height: 6vh; width: 18vw;" placeholder="用户名">
        </a-input>
      </a-form-item>

      <a-form-item name="password" :rules="[{ required: true, message: '请输入密码!' }]">
        <a-input-password v-model:value="formState.password" style="height: 6vh; width: 18vw;" placeholder="密码">
        </a-input-password>
      </a-form-item>

      <a-form-item name="code">
        <div class="IdCode">
          <a-input v-model:value="sidentifyMode" placeholder="验证码" class="IdInput"/>

          <div class="code" @click="refreshCode">
            <Identify :identifyCode="identifyCode"></Identify>
          </div>
        </div>

      </a-form-item>

      <a-form-item style="text-align: center">
        <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button" @click="login">
          登录
        </a-button>
        或
        <a @click="changeToRegister">注册</a>
        <br>
        <a @click="changeToResetPassword">忘记密码</a>了？
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import {
  reactive,
  computed,

} from 'vue';
import Identify from "./Identify.vue"
import {
  ElMessage
} from 'element-plus'
import {
  ref,
  onMounted
} from 'vue'
import axios from 'axios';
import router from '@/router';

const emit = defineEmits(["toRegister"]);

let sidentifyMode = ref('') //输入框验证码
let identifyCode = ref('') //图形验证码
let identifyCodes = ref('1234567890abcdefjhijklinopqrsduvwxyz') //验证码出现的数字和字母

//组件挂载
onMounted(() => {
  identifyCode.value = ''
  makeCode(identifyCodes.value, 4)
})

// 生成随机数
const randomNum = (min, max) => {
  max = max + 1
  return Math.floor(Math.random() * (max - min) + min)
}
// 随机生成验证码字符串
const makeCode = (o, l) => {
  for (let i = 0; i < l; i++) {
    identifyCode.value += o[randomNum(0, o.length)]
  }
}
// 更新验证码
const refreshCode = () => {
  identifyCode.value = ''
  makeCode(identifyCodes.value, 4)
}

const formState = reactive({
  username: '',
  password: '',
  remember: true,
});
const onFinish = values => {
  console.log('Success:', values);
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
  return !(formState.username && formState.password);
});

axios.defaults.withCredentials = true;
const login = async ()=>{
  try {
    if (sidentifyMode.value === identifyCode.value){
      const params = new URLSearchParams(); // 构建 URL 参数
      params.append('phone', formState.username)
      params.append('password', formState.password)

      const result = await axios.post('/api/login', params.toString());

      if (result.status === 200){
        localStorage.setItem("loginData", JSON.stringify(result.data));
        router.push({ path: "/", }).then(() => {
          window.location.reload()
        });
      }
    }else {
      alert("验证码有误！")
    }

  }catch (e){
    if (e.code === "ERR_BAD_REQUEST") {
      alert("系统安全升级，请先重置密码")
    } else {
      alert("用户名或密码错误！")
    }
  }
}

// 跳转到注册页面
const changeToRegister = () => {
  emit("toRegister");
};
// 跳转到重置密码页面
const changeToResetPassword = () => {
  emit("toResetPassword");
};
</script>


<style scoped>
#components-form-demo-normal-login .login-form {
  max-width: 300px;
}

#components-form-demo-normal-login .login-form-forgot {
  float: right;
}

#components-form-demo-normal-login .login-form-button {
  width: 100%;
}
</style>

<style lang="scss" scoped>
.main_login {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border-radius: 12px;
  padding: 68px 64px 32px;
  box-sizing: border-box;
}

.welcome_content {
  font-family: PingFangSC-Semibold;
  font-size: 32px;
  color: #1d1d26;
  font-weight: 600;
}

.login_bt {
  width: 18vw;
  height: 6vh;
  margin-top: 20%;
}

.IdCode {
  display: flex;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
  .IdInput {
    width: 40%;
    margin-right: 10%;
  }
}

.identify {
  display: flex;
  align-items: center;

  a-input {
    flex: 0 0 48%;
    margin-right: 4%;
  }

  Identify {
    flex: 0 0 48%;
  }
}
</style>
