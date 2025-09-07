<template>
  <div id="userC">
    <h1>用户中心</h1>
    <div class="main_userC">
      <div class="headshot">
        <div id="left" style="float: left">
          <a-avatar shape="square" :size="80">
            <template #icon><UserOutlined /></template>
          </a-avatar>
        </div>
        <div id="left2" style="float: left; margin-left: 2vh">
          <a-upload
            v-model:file-list="fileList"
            name="avatar"
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="imageUrl" :src="imageUrl" alt="avatar" />
            <div v-else>
              <loading-outlined v-if="loading"></loading-outlined>
              <plus-outlined v-else></plus-outlined>
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
        </div>
      </div>

      <div class="userContent">
        <a-form :model="formState" :wrapper-col="wrapperCol" :rules="rules">
          <a-form-item label="用户名">
            <a-input v-model:value="formState.name" />
          </a-form-item>
          <a-form-item label="性别">
            <a-radio-group v-model:value="formState.sex">
              <a-radio value="1">男</a-radio>
              <a-radio value="2">女</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item name="date-picker" label="出生日期">
            <a-date-picker v-model:value="formState.birthday" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item label="手机号/登录账号" name="phone">
            <a-input v-model:value="formState.phone" />
          </a-form-item>
          <a-form-item label="归属">
            <a-input v-model:value="formState.ascription" disabled />
          </a-form-item>
        </a-form>
      </div>

      <div class="submitBut">
        <a-button
          type="primary"
          @click="onSubmit"
          :disabled="!isModified"
        >
          修改
        </a-button>
        <a-button
          type="default"
          style="margin-left: 1vh"
          @click="showDrawer"
        >
          修改密码
        </a-button>
      </div>

      <a-drawer
        v-model:visible="visible"
        class="custom-class"
        title="修改密码"
        placement="right"
        @after-visible-change="afterVisibleChange"
      >
        <a-form :model="DrawerData" :wrapper-col="wrapperCol" :rules="DrawerRules">
          <a-form-item label="原密码" name="yPassword">
            <a-input-password v-model:value="DrawerData.yPassword" />
          </a-form-item>
          <a-form-item label="新密码" name="newPassword">
            <a-input-password v-model:value="DrawerData.newPassword" />
          </a-form-item>
          <a-form-item label="确认密码" name="cfnPassword">
            <a-input-password v-model:value="DrawerData.cfnPassword" />
          </a-form-item>
          <a-button type="primary" @click="changePassword">提交</a-button>
        </a-form>
      </a-drawer>
    </div>
  </div>
</template>

<script>
import { UserOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { defineComponent, ref, reactive, toRaw, watch } from 'vue';
import axios from 'axios';
import router from '@/router';

export default defineComponent({
  components: {
    LoadingOutlined,
    PlusOutlined,
    UserOutlined
  },
  setup() {
    const visible = ref(false);
    const fileList = ref([]);
    const loading = ref(false);
    const imageUrl = ref('');
    const loginData = JSON.parse(localStorage.getItem("loginData"));

    // 初始数据
    const initialDrawerData = {
      yPassword: '',
      newPassword: '',
      cfnPassword: ''
    };

    const DrawerData = reactive({ ...initialDrawerData });

    const initialFormState = {
      name: loginData.username,
      sex: loginData.sex || '',
      birthday: loginData.birthday,
      phone: loginData.phone,
      ascription: loginData.ascription,
    };

    const formState = reactive({ ...initialFormState });
    const isModified = ref(false);

    // Watch for formState changes
    watch(formState, (newVal) => {
      isModified.value = JSON.stringify(newVal) !== JSON.stringify(initialFormState);
    });

    // 重置抽屉数据
    watch(visible, (newVal) => {
      if (!newVal) {
        Object.assign(DrawerData, { ...initialDrawerData });
      }
    });

    const wrapperCol = { span: 14 };

    const rules = {
      phone: [
        {
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

    const DrawerRules = {
      yPassword: [{
        required: true,
        message: '请输入原密码！',
      }],
      newPassword: [{
        required: true,
        message: '请输入修改后密码！',
      }],
      cfnPassword: [{
        required: true,
        message: '请输入确认修改后密码！',
      }],
    };

    /**
     * 用户信息修改
     * @returns {Promise<void>}
     */
    const onSubmit = async () => {
      try {
        const response = await axios.post('/api/changeUser', formState);
        if (response.status === 200) {
          alert("修改成功！")
          localStorage.setItem('loginData', JSON.stringify(response.data));
          window.location.reload()
        } else {
          alert("修改失败！")
        }
      } catch (error) {
        console.log(error)
      }
    };

    /**
     * 用户密码修改
     * @returns {Promise<void>}
     */
    const changePassword = async () => {
      try {
        if (DrawerData.cfnPassword === DrawerData.newPassword){
          const cdData = {
            SourcePassword: DrawerData.yPassword,
            newPassword: DrawerData.newPassword
          }
          const response = await axios.post('/api/changeUser', cdData, {
            headers: { 'Content-Type': 'application/json' }
          });
          if (response.status === 200) {
            alert("修改成功！请重新登录~");
            localStorage.clear();
            window.location.reload();
            router.push('/login')
          } else {
            alert("修改失败！");
            window.location.reload();
          }
        }else {
          alert("两次密码输入不同，请核对密码！")
        }
      } catch (error) {
        console.log(error)
      }
    };

    const handleChange = (info) => {
      if (info.file.status === 'uploading') {
        loading.value = true;
        return;
      }
      if (info.file.status === 'done') {
        getBase64(info.file.originFileObj, (base64Url) => {
          imageUrl.value = base64Url;
          loading.value = false;
        });
      }
      if (info.file.status === 'error') {
        loading.value = false;
        message.error('上传失败');
      }
    };

    const beforeUpload = (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 文件！');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('文件大小不能超过 2MB');
      }
      return isJpgOrPng && isLt2M;
    };

    function getBase64(img, callback) {
      const reader = new FileReader();
      reader.addEventListener('load', () => callback(reader.result));
      reader.readAsDataURL(img);
    }

    const showDrawer = () => {
      visible.value = true;
    };

    const afterVisibleChange = (bool) => {
      console.log('Drawer visible:', bool);
    };

    return {
      wrapperCol,
      formState,
      DrawerData,
      visible,
      isModified,
      rules,
      DrawerRules,
      onSubmit,
      changePassword,
      handleChange,
      beforeUpload,
      showDrawer,
      afterVisibleChange
    };
  },
});
</script>

<style lang="scss" scoped>
#userC {
  background: #f7f7f7;
  padding-top: 5vh;
  width: 100%;
  height: 100vh;

  h1 {
    width: 60%;
    text-align: left;
    margin: 0 auto;
    margin-top: 5vh;
    margin-bottom: 5vh;
    font-size: 24px;
    color: #333;
  }

  .main_userC {
    margin: 0 auto;
    width: 60%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    background-color: #fff;
    padding: 2vh;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }

  .headshot {
    flex: 0 0 30%;
    display: flex;
    justify-content: center;
    align-items: center;

    .avatar-uploader > .ant-upload {
      width: 128px;
      height: 128px;
      border-radius: 8px;
    }
    .ant-upload-select-picture-card i {
      font-size: 32px;
      color: #999;
    }
    .ant-upload-select-picture-card .ant-upload-text {
      margin-top: 8px;
      color: #666;
    }
  }

  .userContent {
    flex: 0 0 65%;
    margin-top: 1vh;
  }

  .submitBut {
    display: flex;
    justify-content: flex-start;
    margin-top: 2vh;
  }

  .ant-btn {
    font-size: 16px;
    padding: 0 15px;
    height: 40px;
  }
}

.ant-drawer {
  width: 400px;
  .ant-drawer-body {
    padding: 2vh;
  }
  .ant-btn {
    width: 100%;
    margin-top: 2vh;
  }
}
</style>
