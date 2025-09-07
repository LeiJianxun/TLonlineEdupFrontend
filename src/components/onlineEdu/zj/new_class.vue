<template>
  <div id="create-course">
    <a-form :model="form" @submit.prevent="submitCourse">
      <!-- 课程标题 -->
      <a-form-item name="className" label="课程标题" :labelCol="{ span: 4 }" :wrapperCol="{ span: 14 }">
        <a-input v-model:value="form.name" placeholder="请输入课程标题" />
      </a-form-item>

      <!-- 课程描述 -->
      <a-form-item name="classD" label="课程描述" :labelCol="{ span: 4 }" :wrapperCol="{ span: 14 }">
        <a-input v-model:value="form.b2" placeholder="请输入课程描述" />
      </a-form-item>

      <!-- 课时 -->
      <a-form-item name="ks" label="课时" :labelCol="{ span: 4 }" :wrapperCol="{ span: 14 }">
        <a-select v-model:value="form.ks" placeholder="请选择课时" :options="areas"/>
      </a-form-item>

      <!-- 课程类型 -->
      <a-form-item name="cType" label="课程类型" :labelCol="{ span: 4 }" :wrapperCol="{ span: 14 }">
        <a-select v-model:value="form.course_type" placeholder="请选择课程类型" :options="cType"/>
      </a-form-item>

      <!-- 富文本编辑器 -->
      <a-form-item name="cContent" label="课程内容" :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }">
        <div style="border: 1px solid #ccc">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            :mode="mode"
          />
          <Editor
            style="height: 300px; overflow-y: hidden;"
            v-model="valueHtml"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
          />
        </div>
      </a-form-item>

      <!-- 提交按钮 -->
      <a-form-item :wrapperCol="{ span: 14, offset: 4 }">
        <a-button type="primary" html-type="submit">提交课程</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount, shallowRef  } from 'vue';
import axios from 'axios';
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import router from '@/router';



export default defineComponent({
  components: {
    Editor,
    Toolbar
  },
  setup() {
    // 课程表单数据
    const form = reactive({
      name: '',
      b2: '',
      ks: '',
      course_type: ''
    });

    const editorRef = shallowRef()
    const valueHtml = ref('')
    // 模拟 ajax 异步获取内容
    // onMounted(() => {
    //   setTimeout(() => {
    //     valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'
    //   }, 1500)
    // })
    const toolbarConfig = {}
    const editorConfig = { placeholder: '请输入内容...' }
    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })
    const handleCreated = (editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }


    const areas = [
      { label: '12', value: '12' },
      { label: '24', value: '24' },
      { label: '36', value: '36' },
      { label: '48', value: '48' },
      { label: '60', value: '60' },
      { label: '72', value: '72' },
      { label: '86', value: '86' },
      { label: '98', value: '98' },
      { label: '不限', value: '999' }
    ];

    const cType = [
      { label: '通识', value: 'GeneralKnowledge' },
      { label: '编程', value: 'Programming' },
      { label: '专业课程', value: 'SpecializedCourses' },
      { label: '其他', value: 'Other' }
    ];

    // 提交表单
    const submitCourse = async () => {
      try {
        form.b1 = valueHtml;
        const response = await axios.post('/api/courses', form);
        if (response.status === 201){
          alert("课程添加成功！")
          router.push("/OnlineEdu");
        }
      } catch (error) {
        console.error('创建课程失败', error);
      }
    };

    return {
      form,
      areas,
      cType,
      submitCourse,
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated,
    };
  }
});
</script>

<style scoped>
#create-course {
  width: 80%;
  margin: 0 auto;
  height: 80vh;
  margin-top: 10vh;
}
</style>
