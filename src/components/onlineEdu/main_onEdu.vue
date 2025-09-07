<template>
  <div id="main_onlineEdu">
    <div class="menu">
      <a-menu
        id="dddddd"
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        style="width: 256px"
        mode="inline"
        @click="handleClick"
      >
        <a-sub-menu key="sub1" @titleClick="titleClick">
          <template #title>课程列表</template>
          <a-menu-item-group key="g1" title="通识" v-if="OneCourses.length !== 0">
            <template v-for="course in OneCourses" :key="course.id">
              <a-menu-item @click="loadCourseContent(course.id)">{{ course.name }}</a-menu-item>
            </template>
          </a-menu-item-group>
          <a-menu-item-group key="g2" title="编程" v-if="TwoCourses.length !== 0">
            <template v-for="course in TwoCourses" :key="course.id">
              <a-menu-item @click="loadCourseContent(course.id)">{{ course.name }}</a-menu-item>
            </template>
          </a-menu-item-group>
          <a-menu-item-group key="g3" title="专业课" v-if="ThreeCourses.length !== 0">
            <template v-for="course in ThreeCourses" :key="course.id">
              <a-menu-item @click="loadCourseContent(course.id)">{{ course.name }}</a-menu-item>
            </template>
          </a-menu-item-group>
          <a-menu-item-group key="g4" title="其他" v-if="FourCourses.length !== 0">
            <template v-for="course in FourCourses" :key="course.id">
              <a-menu-item @click="loadCourseContent(course.id)">{{ course.name }}</a-menu-item>
            </template>
          </a-menu-item-group>
        </a-sub-menu>
      </a-menu>
    </div>

    <div class="class_content">
      <div class="class_menu">
        <a-button type="primary" @click="newClass" v-if="isDg">新增课程</a-button>
      </div>

      <div class="class_menu" v-if="isShow">
        <a-button type="primary" @click="" v-if="isDg">编辑课程</a-button>
        <a-button class="delete-btn" @click="deleteClass" v-if="isDg">删除课程</a-button>
        <a-button type="primary"  v-if="!isDg" @click="learning(selectedKeys)">开始学习</a-button>
        <a-button type="primary" v-if="isDg" @click="classBegin(selectedKeys)">开始上课</a-button>
      </div>
      <div class="class_main">
        <h1>{{ title }}</h1>
        <h3>{{ description }}</h3>
        <div v-html="content"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue';
import { MailOutlined, QqOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue';
import router from '@/router';
import axios from 'axios';
import { message, Modal } from 'ant-design-vue';

export default defineComponent({
  components: {
    MailOutlined,
    QqOutlined,
    AppstoreOutlined,
    SettingOutlined,
  },
  setup() {
    const selectedKeys = ref(null);
    const openKeys = ref(['sub1']);
    const title = ref('');
    const description = ref('');
    const content = ref('');
    const courses = ref([]);
    const OneCourses = ref([]);
    const TwoCourses = ref([]);
    const ThreeCourses = ref([]);
    const FourCourses = ref([]);
    const isDg = ref(false);
    const isShow = ref(false);
    const courseGs = ref('')

    const handleClick = e => {
      console.log('click', e);
    };

    const titleClick = e => {
      console.log('titleClick', e);
    };

    watch(openKeys, val => {
      console.log('openKeys', val);
    });

    const newClass = () => {
      router.push("/AddClass");
    };

    const loadCourseContent = async (id) => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        title.value = response.data.name;
        description.value = response.data.b2;
        content.value = response.data.b1;
        courseGs.value = response.data.ascription;
        // selectedKeys.value = id;
        isShow.value = true;
      } catch (err) {
        console.log("课程读取失败" + err);
      }
    };

    // 获取当前学生所属部门的课程
    const loadCourses = async () => {
      const loginData = localStorage.getItem("loginData");
      if (loginData !== null){
        try {
          // 获取当前学生的部门ID（假设从用户信息中获取）
          const userResponse = JSON.parse(localStorage.getItem("loginData"));
          const departmentId = userResponse.ascription;

          // 根据部门ID获取课程
          const response = await axios.get('/api/courses/byDepartment', {
            params: { departmentId }
          });

          if (response.status === 200) {
            let oneData = [];
            let towData = [];
            let threeData = [];
            let fourData = [];
            for (let i = 0; i < response.data.length; i++) {
              if (response.data[i].course_type === "GeneralKnowledge") {
                oneData.push(response.data[i]);
              }

              if (response.data[i].course_type === "Programming") {
                towData.push(response.data[i]);
              }

              if (response.data[i].course_type === "SpecializedCourses") {
                threeData.push(response.data[i]);
              }

              if (response.data[i].course_type === "Other") {
                fourData.push(response.data[i]);
              }
            }
            OneCourses.value = oneData;
            TwoCourses.value = towData;
            ThreeCourses.value = threeData;
            FourCourses.value = fourData;
          }
        } catch (error) {
          console.error("获取课程列表失败", error);
        }
      }else {
        message.error("用户未登录！")
      }
    };

    // 删除课程
    const deleteClass = async () => {
      Modal.confirm({
        title: '确认删除课程',
        content: '确定要删除该课程吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {  // 将原逻辑移动到确认回调中
          try {
            const response = await axios.delete(`/api/courses/${selectedKeys.value}`);
            if (response.status === 204){
              message.success("课程删除成功！");
              loadCourses();
              title.value = '';
              description.value = '';
              content.value = '';
              // selectedKeys.value = id;
              isShow.value = false;
            }
            // 补充数据刷新等后续操作
          } catch (err) {
            message.error("课程删除失败！");
            console.log(err);
          }
        }
      });
    };

    onMounted(() => {
      const loginData = localStorage.getItem("loginData");
      if (loginData !== null){
        const new_loginData = JSON.parse(loginData);
        if (new_loginData.identifiers !== "Public"){
          isDg.value = true;
        }
      }
      loadCourses(); // 页面加载时获取课程列表
    });

    const learning = (selectedKeys) =>{
      const key = selectedKeys[0];
      localStorage.setItem("learningKey", key)
      router.push({
        name: 'Learning',
        params: {
          param: key
        }
      });
    }

    const classBegin = (selectedKeys) => {
      const key = selectedKeys[0];
      console.log(selectedKeys)
      localStorage.setItem("teachingKey", key);
      router.push({
        name: 'Teacher',
        params: {
          courseId: key,
          courseGs: courseGs.value
        }
      });
    }

    return {
      selectedKeys,
      openKeys,
      handleClick,
      titleClick,
      newClass,
      courses,
      OneCourses,
      TwoCourses,
      ThreeCourses,
      FourCourses,
      loadCourses,
      loadCourseContent,
      title,
      description,
      content,
      isDg,
      deleteClass,
      isShow,
      learning,
      classBegin,
      courseGs
    };
  },
});
</script>

<style lang="scss" scoped>
#main_onlineEdu {
  width: 100%;
  height: auto;
  padding-top: 8vh;
  display: flex;
  font-family: Arial, sans-serif;

  /* 菜单样式 */
  .menu {
    width: 250px;
    height: 100%;
    background-color: #f4f4f4;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .ant-menu-item, .ant-menu-submenu-title {
    font-size: 16px;
    font-weight: 600;
  }

  .ant-menu-submenu-arrow {
    color: #1890ff;
  }

  /* 主内容区域 */
  .class_content {
    width: calc(100% - 250px); /* 调整为剩余宽度 */
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: auto;
    height: 100vh;
  }

  .class_menu {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-start;
    gap: 15px; /* 增加按钮间隔 */
  }

  /* 按钮样式 */
  .class_menu .ant-btn-primary {
    font-size: 16px;
    font-weight: 600;
  }

  .class_menu .ant-btn-primary:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }

  .class_menu .delete-btn {
    background-color: #e74848;
    border-color: #e74848;
    color: white;
  }

  .class_menu .delete-btn:hover {
    background-color: darkred;
    border-color: darkred;
  }

  .class_main {
    margin-top: 20px;
    padding: 20px;
    background-color: #fafafa;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  /* 标题样式 */
  .class_main h1 {
    font-size: 28px;
    color: #333;
    margin-bottom: 15px;
  }

  .class_main h3 {
    font-size: 20px;
    color: #555;
    margin-bottom: 20px;
  }

  /* 富文本内容的样式 */
  .class_main div {
    font-size: 16px;
    line-height: 1.8;
    color: #333;
    word-wrap: break-word;
    padding: 20px;
    background-color: white;
    border-radius: 5px;
  }

  /* 为富文本内容添加一些格式化 */
  .class_main div h1, .class_main div h2, .class_main div h3 {
    color: #1890ff;
  }

  .class_main div p {
    margin-bottom: 20px;
  }

  .class_main div ul {
    padding-left: 20px;
    margin-bottom: 20px;
  }

  .class_main div ul li {
    margin-bottom: 10px;
  }
}
</style>
