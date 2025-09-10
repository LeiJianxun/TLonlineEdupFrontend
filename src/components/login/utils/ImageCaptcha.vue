<template>
  <div class="captcha-container">
    <div class="captcha-input-group">
      <a-input
        v-model:value="captchaCode"
        placeholder="请输入验证码"
        class="captcha-input"
        :maxlength="4"
      />
      <div class="captcha-image" @click="refreshCaptcha">
        <img v-if="captchaImageUrl" :src="captchaImageUrl" alt="验证码" :key="captchaId" />
        <div v-else class="loading">验证码加载中...</div>
      </div>
    </div>
    <div class="captcha-refresh" @click="refreshCaptcha">
        <span>看不清？点击刷新</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineExpose } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';

const captchaCode = ref('');
const captchaId = ref('');
const captchaImageUrl = ref('');

//验证码获取
const refreshCaptcha = async () => {
    try {
        const timestamp = new Date().getTime();
        const response = await axios.get(`/api/captcha/generate?t=${timestamp}`, {
            responseType: 'blob'
        });

        //验证码Id
        captchaId.value = response.headers['captcha-id'];

        //图片Url
        const blob = new Blob([response.data], { type: 'image/png' });
        captchaImageUrl.value = URL.createObjectURL(blob);

        //刷新验证码时清除输入框中内容
        captchaCode.value = '';

    } catch(e) {
        message.error("验证码获取失败：" + e);
    }
}

//验证码、验证码id、刷新验证码方法传递
defineExpose({
    captchaCode,
    captchaId,
    refreshCaptcha
})

//组件挂载默认加载验证码
onMounted(()=>{
    refreshCaptcha();
})

</script>

<style scoped>
.captcha-container {
  width: 100%;
}

.captcha-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading {
  color: #999;
  font-size: 12px;
}

.captcha-refresh {
  margin-top: 5px;
  text-align: right;
}

.captcha-refresh span {
  color: #1890ff;
  cursor: pointer;
  font-size: 12px;
}

.captcha-refresh span:hover {
  text-decoration: underline;
}
</style>