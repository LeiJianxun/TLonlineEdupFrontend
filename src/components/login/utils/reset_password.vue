<template>
	<div class="main_login">
		<!-- 返回登录按钮 -->
		<a-button type="link" @click="backLogin" class="back_login_button">返回登录</a-button>

		<!-- 重置密码界面 -->
		<div class="welcome_content">重置密码</div>
		<div id="main_form">
			<a-form ref="formRef" :model="formState" :rules="rules">
				<a-form-item ref="phone" name="phone">
					<a-input v-model:value="formState.phone" placeholder="请输入修改密码账户手机号" />
				</a-form-item>
				<a-form-item ref="oldPassword" name="oldPassword">
					<a-input-password v-model:value="formState.oldPassword" placeholder="请输入旧密码" />
				</a-form-item>
				<a-form-item ref="newPassword" name="newPassword">
					<a-input-password v-model:value="formState.newPassword" placeholder="请输入新密码" />
				</a-form-item>
                <a-form-item ref="newPassword2" name="newPassword2">
					<a-input-password v-model:value="formState.newPassword2" placeholder="请二次确认新密码" />
				</a-form-item>
				<a-form-item name="code" :rules="[{ required: true, message: '请输入验证码!' }]">
					<div class="IdCode">
						<a-input v-model:value="formState.code" placeholder="验证码" class="IdInput" />
						<div class="code" @click="refreshCode">
							<Identify :identifyCode="identifyCode"></Identify>
						</div>
					</div>
				</a-form-item>
				<a-form-item>
					<a-button type="primary" @click="onSubmit">确认</a-button>
					<a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
				</a-form-item>
			</a-form>
		</div>
	</div>
</template>

<script setup>
import {
  reactive,
  computed,
  ref,
  onMounted,
  toRaw,
} from 'vue';
import { message } from 'ant-design-vue';
import Identify from './Identify.vue';
import axios from 'axios';
import router from '@/router';

const formRef = ref();
const ascription = ref([]);
const labelCol = {
  span: 5,
};
const wrapperCol = {
  span: 13,
};
const formState = reactive({
  ascription: undefined,
  delivery: false,
  type: [],
  resource: '',
  desc: '',
  code: '',
  phone: '',
  oldPassword: '',
  newPassword: '',
  newPassword2: '',
});
const rules = {
  phone: [{
    required: true,
    message: '请输入手机号！',
    trigger: 'change',
  },
  {
    min: 11,
    max: 11,
    message: '请输入正确手机号！',
    trigger: 'blur',
  },
  ],
};
const onSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      if (formState.newPassword === formState.newPassword2){
        axios.post("/api/auth/reset-password", {
          phone:formState.phone,
          oldPassword:formState.oldPassword,
          newPassword:formState.newPassword,
        }).then((result)=>{
          if (result.data === "密码重置成功"){
            message.success("密码重置成功！请重新登录~")
            backLogin();
          }
        }).catch((error)=>{
            message.error(error.response?.data || '密码重置失败!');
        })
      }else{
        message.warning("请检查两次输入密码是否一致！")
      }

    })
    .catch((error) => {
      console.log('error', error);
    });
};

const resetForm = () => {
  formRef.value.resetFields();
};

// 定义可发射的事件
const emit = defineEmits(['backLogin']);

const sidentifyMode = ref(''); // 输入框验证码
const identifyCode = ref(''); // 图形验证码
const identifyCodes = ref('1234567890abcdefjhijklinopqrsduvwxyz'); // 验证码出现的数字和字母

// 组件挂载
onMounted(() => {
  identifyCode.value = '';
  makeCode(identifyCodes.value, 4);
});

// 生成随机数
const randomNum = (min, max) => {
  max += 1;
  return Math.floor(Math.random() * (max - min) + min);
};
// 随机生成验证码字符串
const makeCode = (o, l) => {
  for (let i = 0; i < l; i++) {
    identifyCode.value += o[randomNum(0, o.length)];
  }
};
// 更新验证码
const refreshCode = () => {
  identifyCode.value = '';
  makeCode(identifyCodes.value, 4);
};

const onFinish = (values) => {
  console.log('Success:', values);
};
const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const backLogin = () => {
  emit('backLogin');
};
</script>

<style lang="scss" scoped>
.main_login {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: #fff;
	border-radius: 12px;
	padding: 40px 32px;
	width: 50vw;
	max-width: 600px;
	box-sizing: border-box;
}

.welcome_content {
	font-family: PingFangSC-Semibold;
	font-size: 32px;
	color: #1d1d26;
	font-weight: 600;
	text-align: center;
	margin-bottom: 20px;
}

#main_form {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;

	a-form-item {
		width: 80%; /* 设置表单控件的统一宽度 */
		margin-bottom: 20px;

		input, select, .ant-input-password, .ant-picker {
			width: 100%;
		}
	}
}

.IdCode {
	display: flex;
	align-items: center;

	.IdInput {
		width: 60%;
		margin-right: 10px;
	}

	.code {
		cursor: pointer;
	}
}

.back_login_button {
	position: absolute;
	top: 10px;
	left: 10px;
	font-size: 14px;
	color: #1890ff;
	cursor: pointer;
}
</style>
