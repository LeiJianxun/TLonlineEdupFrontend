<template>
	<div class="main_login">
		<!-- 返回登录按钮 -->
		<a-button type="link" @click="backLogin" class="back_login_button">返回登录</a-button>

		<!-- 注册主界面 -->
		<div class="welcome_content">注册账号</div>
		<div id="main_form">
			<a-form ref="formRef" :model="formState" :rules="rules">
				<a-form-item ref="name" name="name">
					<a-input v-model:value="formState.name" placeholder="请输入用户名" />
				</a-form-item>
				<a-form-item ref="phone" name="phone">
					<a-input v-model:value="formState.phone" placeholder="请输入注册手机号" />
				</a-form-item>
				<a-form-item ref="password" name="password">
					<a-input-password v-model:value="formState.password" placeholder="请输入密码" @input="passwordCheck"/>
          <div v-if="formState.password" class="password-strength-container">
            <a-progress 
              :percent="passwordStrength.percent"
              :status="passwordStrength.status"
              :stroke-color="passwordStrength.color"
              size="small"
              :show-info="false"
            />
            <div class="strength-text">
              <span v-if="passwordStrength.message" class="strength-message">{{ passwordStrength.message }}</span>
            </div>
          </div>
				</a-form-item>
				<a-form-item ref="password2" name="password2">
					<a-input-password v-model:value="formState.password2" :disabled="password2Visible" placeholder="请二次确认密码" />
				</a-form-item>
				<a-form-item name="region">
					<a-select v-model:value="formState.region" placeholder="请选择注册身份">
						<a-select-option value="Puser">学生/普通用户</a-select-option>
						<a-select-option value="Teacher">教师</a-select-option>
					</a-select>
				</a-form-item>
        <a-form-item name="region1" v-show=" formState.region=== 'Teacher' ">
          <a-select v-model:value="formState.ascription" placeholder="请选择所属部门">
            <a-select-option v-for="dp in ascription" :value="dp.d_code">{{dp.name}}</a-select-option>
          </a-select>
        </a-form-item>
				<a-form-item required name="date1">
					<a-date-picker v-model:value="formState.date1" type="date" placeholder="出生年月" style="float: left;"/>
				</a-form-item>
				<a-form-item name="code">
					<ServerCaptcha ref="captchaRef" />
				</a-form-item>
				<a-form-item>
					<a-button type="primary" @click="onSubmit">创建</a-button>
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
import axios from 'axios';
import router from '@/router';
import ServerCaptcha from "./ImageCaptcha.vue";
import { message } from 'ant-design-vue';

const captchaRef = ref();
const formRef = ref();
const ascription = ref([]);
const visible = ref(false);
const password2Visible = ref(true)
const passwordVaildInfo = ref("")
const passwordStrength = ref({
  percent: 0,
  status: 'exception',
  color: '#ff4d4f',
  text: '非常弱',
  message: '',
  valid: false
})
const labelCol = {
  span: 5,
};
const wrapperCol = {
  span: 13,
};
const formState = reactive({
  name: '',
  region: undefined,
  ascription: undefined,
  date1: undefined,
  delivery: false,
  type: [],
  resource: '',
  desc: '',
  code: '',
  phone: '',
  password: '',
  password2: '',
});
const rules = {
  name: [{
    required: true,
    message: '请输入用户名！',
    trigger: 'change',
  },
  ],
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
  region: [{
    required: true,
    message: '请选择注册身份！',
    trigger: 'change',
  }],
  date1: [{
    required: true,
    message: '请选择出生年月！',
    trigger: 'change',
    type: 'object',
  }],
};
const onSubmit = () => {
  // 首先检查密码强度
  if (!passwordStrength.value.valid) {
    message.error('密码强度不符合要求，请修改后再提交！')
    return
  }
  
  formRef.value
    .validate()
    .then(() => {
      if (formState.password === formState.password2){
        axios.post("/api/register", {
          name:formState.name,
          phone:formState.phone,
          password:formState.password,
          identifiers:formState.region,
          birthday: formState.date1,
          captchaId: captchaRef.value.captchaId,
          captchaCode: captchaRef.value.captchaCode
        }).then((result)=>{
          if (result.data === "注册成功"){
            message.success("注册成功！")
            backLogin();
          }
        })
      }else{
        message.warning("请检查两次输入密码是否一致！")
      }
    })
    .catch((error) => {
      message.error('注册失败：', error);
    });
};

const passwordVaild = (psw) => {
  if (!psw) {
    return {
      valid: false,
      percent: 0,
      status: 'exception',
      color: '#ff4d4f',
      text: '非常弱',
      message: '请输入密码'
    }
  }

  let score = 0
  let messages = []

  // 长度检查
  if (psw.length >= 8) {
    score += 20
  } else {
    messages.push('至少8位字符')
  }

  // 小写字母
  if (/[a-z]/.test(psw)) {
    score += 20
  } else {
    messages.push('包含小写字母')
  }

  // 大写字母
  if (/[A-Z]/.test(psw)) {
    score += 20
  } else {
    messages.push('包含大写字母')
  }

  // 数字
  if (/\d/.test(psw)) {
    score += 20
  } else {
    messages.push('包含数字')
  }

  // 特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(psw)) {
    score += 20
  } else {
    messages.push('包含特殊字符')
  }

  // 常见弱密码检查
  const weakPasswords = ['123456', 'password', 'qwerty', '111111', 'abc123']
  if (weakPasswords.some(weak => psw.toLowerCase().includes(weak))) {
    score = Math.min(score, 20)
    messages.unshift('避免常见弱密码')
  }

  // 根据分数确定强度
  let result = {
    valid: score >= 60, // 至少需要60分才算合格
    percent: score,
    message: messages.length > 0 ? `缺少：${messages.join('、')}` : '密码强度良好'
  }

  if (score >= 80) {
    result.status = 'success'
    result.color = '#52c41a'
    result.text = '强'
  } else if (score >= 60) {
    result.status = 'active'
    result.color = '#1890ff'
    result.text = '中等'
  } else if (score >= 40) {
    result.status = 'normal'
    result.color = '#faad14'
    result.text = '弱'
  } else {
    result.status = 'exception'
    result.color = '#ff4d4f'
    result.text = '非常弱'
  }

  return result
}

const passwordCheck = () => {
  const strength = passwordVaild(formState.password)
  passwordStrength.value = strength
  
  // 只有密码强度合格才启用确认密码输入框
  password2Visible.value = !strength.valid
  
  // 更新验证信息
  passwordVaildInfo.value = strength.message
}

const loadAscription = async () =>{
  try {
    const response = await axios.get("/api/departments")
    if (response.status === 200){
      ascription.value = response.data.content;
    }
  }catch (err){
    message.error("部门信息获取失败：",err)
  }

}

const resetForm = () => {
  password2Visible.value = true
  passwordVaildInfo.value = ""
  formRef.value.resetFields();
};

// 定义可发射的事件
const emit = defineEmits(['backLogin']);

// 组件挂载
onMounted(() => {
  loadAscription();
});

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

  .password-strength-container {
  margin-top: 8px;
  
  .strength-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
    font-size: 12px;
    
    .strength-message {
      color: #666;
      font-size: 11px;
    }
  }
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
