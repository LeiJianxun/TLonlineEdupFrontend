<template>
	<div class="login_bg"></div>
	<!-- 添加监听子组件的事件 -->
	<MainLogin 
		v-if="is_login" 
		ref="mainLoginRef" 
		@toRegister="changeToRegister" 
		@toResetPassword="changeToResetPassword"
	/>
	<Register 
		v-if="is_re" 
		@backLogin="handleBackLogin" 
	/>
	<ResetPassword 
		v-if="is_reset" 
		@backLogin="handleBackLogin" 
	/>
</template>

<script setup>
import { ref } from "vue";
import MainLogin from "./utils/main_login.vue";
import Register from "./utils/register.vue";
import ResetPassword from "./utils/reset_password.vue";

// 登录和注册视图的显示状态
const is_login = ref(true);
const is_re = ref(false);
const is_reset = ref(false);

// 引用子组件实例
const mainLoginRef = ref(null);

// 切换到注册组件
const changeToRegister = () => {
	is_login.value = false;
	is_re.value = true;
};

const changeToResetPassword = () => {
	is_login.value = false;
	is_re.value = false;
	is_reset.value = true;
};

// 切换回登录组件
const changeToLogin = () => {
	is_login.value = true;
	is_re.value = false;
	// 手动触发登录组件的重新初始化（包括验证码组件）
	mainLoginRef.value?.initIdentify();
};

// 处理返回登录的逻辑
const handleBackLogin = () => {
	is_login.value = true;
	is_re.value = false;
	is_reset.value = false;
};
</script>

<style lang="scss" scoped>
.login_bg {
	width: 100vw;
	height: 100vh;
	background-image: url("https://campus.sf-express.com/upload/oss/static/web/login_bg.jpeg");
	position: relative;
	overflow-x: hidden;
	background-color: #0f30cb;
	background-position: 50% 50%;
	background-repeat: no-repeat;
	background-size: cover;
}

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
</style>
