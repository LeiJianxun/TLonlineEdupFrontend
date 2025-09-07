<template>
  <div class="container">
    <!-- 班级选择区域 -->
    <a-card class="department-card" :bordered="false">
      <a-form-item label="选择班级" class="department-select">
        <a-select
          v-model:value="selectedDepartmentId"
          show-search
          placeholder="请输入子部门名称或代码搜索"
          :filter-option="false"
          :options="departmentOptions"
          :loading="searchLoading"
          @search="handleSearch"
          @change="handleDepartmentChange"
        >
          <template #option="{ name, dcode }">
            <span class="option-text">{{ name }}</span>
            <span class="option-code">{{ dcode }}</span>
          </template>
        </a-select>
      </a-form-item>
    </a-card>

    <div v-if="isSelect" class="content-wrapper">
      <!-- 功能切换区域 -->
      <a-card class="function-switch">
        <a-radio-group v-model:value="size" button-style="solid">
          <a-radio-button value="account" class="switch-btn">班级账号管理</a-radio-button>
          <a-radio-button value="course" class="switch-btn" @click="setCourse">班级课程配置</a-radio-button>
        </a-radio-group>
      </a-card>

      <!-- 账号管理内容 -->
      <div v-if="size === 'account'" class="account-management">
        <!-- 操作按钮组 -->
        <div class="action-buttons">
          <a-space :size="16">
            <a-button type="primary" @click="showAddModal">
              <template #icon><PlusOutlined /></template>
              新增账号
            </a-button>

            <a-upload
              name="file"
              accept=".csv"
              :showUploadList="false"
              :beforeUpload="beforeUpload"
            >
              <a-button type="primary">
                <template #icon><UploadOutlined /></template>
                批量导入
              </a-button>
            </a-upload>

            <a-button
              type="dashed"
              @click="showEditModal"
              :disabled="selectedRowKeys.length !== 1"
            >
              <template #icon><EditOutlined /></template>
              编辑数据
            </a-button>

            <a-button
              danger
              @click="handleDelete"
              :disabled="selectedRowKeys.length === 0"
            >
              <template #icon><DeleteOutlined /></template>
              {{ selectedRowKeys.length > 1 ? '批量删除' : '删除数据' }}
            </a-button>
          </a-space>
        </div>

        <!-- 数据表格 -->
        <a-card class="data-table">
          <a-table
            :columns="userColumns"
            :data-source="userList"
            :loading="tableLoading"
            row-key="id"
            :row-selection="rowSelection"
            bordered
            :pagination="{ pageSize: 8 }"
          >
            <template #bodyCell="{ column, record }">
              <!-- 各列显示模板 -->
            </template>
          </a-table>
        </a-card>
      </div>

      <!-- 课程配置内容 -->
      <div v-if="size === 'course'" class="course-management">
        <a-row :gutter="[16, 16]">
          <!-- 课程选择 -->
          <a-col :span="24">
            <a-card class="course-select-card">
              <a-form layout="inline">
                <a-form-item label="选择课程">
                  <a-select
                    v-model:value="courseId"
                    placeholder="请选择课程"
                    style="width: 240px"
                    :options="courseList.map(c => ({ value: c.id, label: c.name }))"
                  />
                </a-form-item>
              </a-form>
            </a-card>
          </a-col>

          <a-col :span="24">
            <a-card class="course-select-card">
              <a-form layout="inline">
                <a-form-item label="选择课程">
                  <a-select
                    v-model:value="courseId"
                    placeholder="请选择课程"
                    style="width: 240px"
                    :options="courseList.map(c => ({ value: c.id, label: c.name }))"
                  />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" @click="assignCourseToClass">分配课程到班级</a-button>
                </a-form-item>
              </a-form>
            </a-card>
          </a-col>

          <!-- 任务配置区域 -->
          <a-col :span="24">
            <a-card class="task-config">
              <a-form layout="vertical">
                <!-- 任务类型选择 -->
                <a-form-item label="任务类型">
                  <a-select
                    v-model:value="taskType"
                    placeholder="请选择任务类型"
                    style="width: 240px"
                  >
                    <a-select-option value="HOMEWORK">布置作业</a-select-option>
                    <a-select-option value="VIDEO">观看视频</a-select-option>
                    <a-select-option value="EXERCISE">在线练习</a-select-option>
                    <a-select-option value="OFFLINE">线下课程</a-select-option>
                  </a-select>
                </a-form-item>

                <!-- 动态表单区域 -->
                <div v-if="taskType" class="dynamic-form">
                  <!-- 作业任务表单 -->
                  <div v-if="taskType === 'HOMEWORK'">
                    <a-form-item label="作业标题">
                      <a-input v-model:value="taskForm.title" placeholder="请输入作业标题" />
                    </a-form-item>
                    <a-form-item label="作业要求">
                      <a-textarea v-model:value="taskForm.content" placeholder="请输入作业要求" :rows="4" />
                    </a-form-item>
                    <a-form-item label="截止时间">
                      <a-date-picker
                        v-model:value="taskForm.endTime"
                        show-time
                        placeholder="请选择截止时间"
                        style="width: 100%"
                      />
                    </a-form-item>
                    <a-form-item label="附件">
                      <a-upload
                        :action="`/api/tasks/15/attachments`"
                        :headers="{ Authorization: `Bearer ${token}` }"
                        @change="handleAttachmentUpload"
                        :showUploadList="{ remove: true }"
                      >
                        <a-button type="primary">
                          <upload-outlined /> 上传附件
                        </a-button>
                      </a-upload>
                    </a-form-item>
                  </div>

                  <!-- 视频任务表单 -->
                  <div v-if="taskType === 'VIDEO'">
                    <a-form-item label="视频链接">
                      <a-input v-model:value="taskForm.videoUrl" placeholder="请输入视频链接" />
                    </a-form-item>
                    <a-form-item label="观看时长（分钟）">
                      <a-input-number v-model:value="taskForm.duration" :min="1" />
                    </a-form-item>
                  </div>

                  <!-- 在线练习表单 -->
                  <div v-if="taskType === 'EXERCISE'">
                    <a-form-item label="练习标题">
                      <a-input v-model:value="taskForm.title" placeholder="请输入练习标题" />
                    </a-form-item>

                    <!-- 题目列表 -->
                    <div class="exercise-list">
                      <a-form-item label="截止时间">
                        <a-date-picker
                          v-model:value="taskForm.endTime"
                          show-time
                          placeholder="请选择截止时间"
                          style="width: 100%"
                        />
                      </a-form-item>
                      <div v-for="(exercise, index) in taskForm.exercises" :key="index" class="exercise-item">
                        <a-card class="exercise-card">
                          <a-space direction="vertical" style="width: 100%">
                            <!-- 题目类型选择 -->
                            <a-select
                              v-model:value="exercise.type"
                              placeholder="请选择题型"
                              style="width: 200px"
                              @change="handleExerciseTypeChange(index)"
                            >
                              <a-select-option value="SINGLE">单选题</a-select-option>
                              <a-select-option value="MULTIPLE">多选题</a-select-option>
                              <a-select-option value="SUBJECTIVE">主观题</a-select-option>
                            </a-select>

                            <!-- 题目题干 -->
                            <a-textarea
                              v-model:value="exercise.question"
                              placeholder="请输入题目内容"
                              :rows="2"
                            />

                            <!-- 选项（仅选择题显示） -->
                            <div v-if="['SINGLE','MULTIPLE'].includes(exercise.type)" class="options-section">
                              <div v-for="(option, oIndex) in exercise.options" :key="oIndex" class="option-item">
                                <a-input
                                  v-model:value="option.content"
                                  :placeholder="`选项 ${String.fromCharCode(65 + oIndex)}`"
                                  style="flex:1;margin-right:8px"
                                >
                                  <template #addonBefore>
                                    <a-checkbox
                                      v-model:checked="option.isCorrect"
                                      :disabled="exercise.type === 'SINGLE' && getSelectedCount(exercise) >= 1"
                                    />
                                  </template>
                                </a-input>
                                <a-button
                                  danger
                                  @click="removeOption(index, oIndex)"
                                  :disabled="exercise.options.length <= 2"
                                >
                                  <delete-outlined />
                                </a-button>
                              </div>
                              <a-button @click="addOption(index)" style="margin-top:8px">
                                <plus-outlined /> 添加选项
                              </a-button>
                            </div>

                            <!-- 答案解析 -->
                            <a-textarea
                              v-model:value="exercise.analysis"
                              placeholder="请输入答案解析（可选）"
                              :rows="2"
                            />

                            <!-- 题目操作 -->
                            <div class="exercise-actions">
                              <a-button
                                danger
                                @click="removeExercise(index)"
                                :disabled="taskForm.exercises.length === 1"
                              >
                                删除题目
                              </a-button>
                            </div>
                          </a-space>
                        </a-card>
                      </div>

                      <!-- 添加题目按钮 -->
                      <a-button
                        type="dashed"
                        block
                        @click="addExercise"
                        style="margin-top:16px"
                      >
                        <plus-outlined /> 添加题目
                      </a-button>
                    </div>
                  </div>

                  <!-- 线下课程表单 -->
                  <div v-if="taskType === 'OFFLINE'">
                    <a-form-item label="课程地点">
                      <a-input v-model:value="taskForm.location" placeholder="请输入课程地点" />
                    </a-form-item>
                    <a-form-item label="课程安排">
                      <a-select
                        v-model:value="value3"
                        :options="options"
                        mode="tags"
                        :size="size"
                        placeholder="请选择课程安排时间"
                        style="width: 100%"
                      ></a-select>
                    </a-form-item>
                  </div>
                </div>

                <!-- 发布按钮 -->
                <div class="publish-section">
                  <a-button
                    type="primary"
                    size="large"
                    @click="publishTask"
                    :disabled="!taskType"
                  >
                    发布任务
                  </a-button>
                </div>
              </a-form>
            </a-card>
          </a-col>

          <!-- 任务列表 -->
          <a-col :span="24">
            <a-card class="task-list">
              <a-table
                :data-source="courseTasks"
                :columns="taskColumns"
                :pagination="{ pageSize: 6 }"
              >
                <!-- 表格模板 -->
                <template #bodyCell="{ column, text }">
                  <template v-if="column.dataIndex === 'taskName'">{{ text }}</template>
                  <template v-else-if="column.dataIndex === 'taskType'">
                    <span>{{ text === 'EXERCISE' ? '在线练习' : text === 'VIDEO' ? '观看视频' : text === 'HOMEWORK' ? '附件作业' : text === 'OFFLINE' ? '线下课程' : '其他类型' }}</span>
                  </template>
                  <template v-else-if="column.dataIndex === 'endTime'">
                    <span>{{ moment(text).format('YYYY-MM-DD HH:mm:ss') }}</span>
                  </template>
                </template>

              </a-table>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>

    <!-- 模态对话框 -->
    <UserModal
      :visible="addVisible"
      title="新增用户"
      @ok="handleAddOk"
      @cancel="addVisible = false"
      :confirm-loading="addLoading"
    />

    <UserModal
      :visible="editVisible"
      title="编辑用户"
      @ok="handleEditOk"
      @cancel="editVisible = false"
      :confirm-loading="editLoading"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, reactive } from 'vue';
import axios from 'axios';
import { message, Modal } from 'ant-design-vue';
import moment from 'moment';
import Papa from 'papaparse';
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    PlusOutlined,
    UploadOutlined,
    EditOutlined,
    DeleteOutlined
  },
  setup() {
    // 状态管理
    const size = ref('account');
    const selectedDepartmentId = ref(null);
    const departmentOptions = ref([]);
    const searchLoading = ref(false);
    const userList = ref([]);
    const courseTasks = ref([]);
    const isSelect = ref(false);
    const allDepartments = ref([]);
    const addVisible = ref(false);
    const editVisible = ref(false);
    const addLoading = ref(false);
    const editLoading = ref(false);
    const addForm = ref({});
    const editForm = ref({});
    const selectedRowKeys = ref([]);
    const tableLoading = ref(false);
    const p_id = ref('')
    const taskType = ref(undefined)
    const courseId = ref(undefined);
    const courseList = ref([])
    const fileList = ref([]);
    const setClass = ref(undefined)
    const value3 = ref([]);
    const options = [
      {
        label: '每周一',
        value: 1
      },
      {
        label: '每周二',
        value: 2
      },
      {
        label: '每周三',
        value: 3
      },
      {
        label: '每周四',
        value: 4
      },
      {
        label: '每周五',
        value: 5
      },
      {
        label: '每周六',
        value: 6
      },
      {
        label: '每周日',
        value: 7
      }
    ];

    const handleChange = info => {
      let resFileList = [...info.fileList];

      resFileList = resFileList.slice(-2);

      resFileList = resFileList.map(file => {
        if (file.response) {
          file.url = file.response.url;
        }
        return file;
      });
      fileList.value = resFileList;
    };

    // 表格列配置
    const userColumns = [
      { title: '用户名', dataIndex: 'userName', width: '20%' },
      { title: '手机号', dataIndex: 'phone', width: '20%' },
      { title: '性别', dataIndex: 'sex', width: '15%' },
      { title: '所属部门', dataIndex: 'ascription', width: '25%' },
      { title: '创建时间', dataIndex: 'create_time', width: '20%' }
    ];

    // 表格列配置
    const taskColumns = [
      { title: '任务名称', dataIndex: 'taskName' },
      { title: '类型', dataIndex: 'taskType' },
      { title: '截止时间', dataIndex: 'endTime' },
      { title: '未开始人数', dataIndex: 'notStartedCount' },
      { title: '学习中人数', dataIndex: 'inProgressCount' },
      { title: '已完成人数', dataIndex: 'completedCount' },
    ];

    const taskForm = reactive({
      title: '', // 作业/练习标题
      content: '', // 作业要求
      endTime: null, // 作业截止时间
      videoUrl: '', // 视频链接
      duration: 0, // 视频时长
      description: '', // 练习描述
      location: '', // 线下课程地点
      classTime: null, // 线下课程时间
      attachments: [], // 附件列表
      exercises: [{
        type: 'SINGLE',
        question: '',
        options: [
          { content: '', isCorrect: false },
          { content: '', isCorrect: false }
        ],
        analysis: ''
      }]
    });

    // 添加题目方法
    const addExercise = () => {
      taskForm.exercises.push({
        type: 'SINGLE',
        question: '',
        options: [
          { content: '', isCorrect: false },
          { content: '', isCorrect: false }
        ],
        analysis: ''
      });
    };

// 删除题目
    const removeExercise = (index) => {
      taskForm.exercises.splice(index, 1);
    };

// 添加选项
    const addOption = (exerciseIndex) => {
      taskForm.exercises[exerciseIndex].options.push({
        content: '',
        isCorrect: false
      });
    };

// 删除选项
    const removeOption = (exerciseIndex, optionIndex) => {
      taskForm.exercises[exerciseIndex].options.splice(optionIndex, 1);
    };

// 处理题型变化
    const handleExerciseTypeChange = (index) => {
      const exercise = taskForm.exercises[index];
      if (exercise.type === 'SUBJECTIVE') {
        exercise.options = [];
      } else {
        if (exercise.options.length < 2) {
          exercise.options = [
            { content: '', isCorrect: false },
            { content: '', isCorrect: false }
          ];
        }
      }
    };

// 获取选中数量（用于单选校验）
    const getSelectedCount = (exercise) => {
      return exercise.options.filter(opt => opt.isCorrect).length;
    };

    const validateExercises = () => {
      for (const [index, exercise] of taskForm.exercises.entries()) {
        if (!exercise.question.trim()) {
          message.error(`第${index + 1}题题干不能为空`);
          return false;
        }

        if (['SINGLE','MULTIPLE'].includes(exercise.type)) {
          const validOptions = exercise.options.filter(opt => opt.content.trim());
          if (validOptions.length < 2) {
            message.error(`第${index + 1}题至少需要2个有效选项`);
            return false;
          }

          const correctCount = exercise.options.filter(opt => opt.isCorrect).length;
          if (correctCount < 1) {
            message.error(`第${index + 1}题需要至少一个正确答案`);
            return false;
          }

          if (exercise.type === 'SINGLE' && correctCount > 1) {
            message.error(`第${index + 1}题单选题只能有一个正确答案`);
            return false;
          }
        }
      }
      return true;
    };

    // 获取用户列表
    const fetchUsers = async (value) => {
      try {
        isSelect.value = true;
        const response = await axios.get(`/api/classUser/${value}`);

        if (response.data.userInfo !== null) {
          userList.value = response.data.userInfo;
          p_id.value = value;
          setClass.value = value;
        }
      } catch (error) {
        message.error('数据加载失败');
        console.error(error);
      }
    };

    //获取登录用户所属列表
    const setCourse = async ()=>{
      try {
        const response = await axios.get('/api/courses/getByAscription')
        courseList.value = response.data;
      }catch (e) {
        message.error(e);
      }
    }

    // 部门搜索
    const handleSearch = async (value) => {
      try {
        searchLoading.value = true;
        const res = await axios.get('/api/classUser', { params: { keyword: value } });
        departmentOptions.value = res.data.subDepartments.map(dept => ({
          value: dept.id,
          label: dept.name,
          name: dept.name,
          dcode: dept.dcode
        }));
        allDepartments.value = [res.data.department, ...res.data.subDepartments];
      } catch (error) {
        message.error('搜索失败');
      } finally {
        searchLoading.value = false;
      }
    };

    // 部门切换处理
    const handleDepartmentChange = async (value) => {
      isSelect.value = true;
      selectedDepartmentId.value = value;
      await loadClassTask(value)
      await fetchUsers(value);
    };

    const loadClassTask = async (value)=>{
      try {
        const response = await axios.get(`/api/tasks/getClassTask/${value}`);
        courseTasks.value = response.data.courseTasks;
      }catch (e){
        message.error("获取班级任务列表失败！" + e)
      }
    }

    // 新增用户
    const handleAddOk = async () => {
      try {
        addLoading.value = true;
        await axios.post('/api/usersManage', addForm.value, {
          params: { departmentId: selectedDepartmentId.value }
        });
        message.success('新增成功');
        addVisible.value = false;
        await fetchUsers(p_id.value);
      } catch (error) {
        message.error('新增失败');
      } finally {
        addLoading.value = false;
      }
    };

    // 编辑用户
    const handleEditOk = async () => {
      try {
        editLoading.value = true;
        await axios.put(`/api/usersManage/${editForm.value.id}`, editForm.value);
        message.success('更新成功');
        editVisible.value = false;
        await fetchUsers(p_id.value);
      } catch (error) {
        message.error('更新失败');
      } finally {
        editLoading.value = false;
      }
    };

    // 删除处理
    const handleDelete = () => {
      Modal.confirm({
        title: '确认删除',
        content: `确定删除选中的${selectedRowKeys.value.length}条记录吗？`,
        onOk: async () => {
          try {
            if (selectedRowKeys.value.length === 1) {
              await axios.delete(`/api/usersManage/${selectedRowKeys.value[0]}`);
            } else {
              await axios.delete('/api/usersManage/batch', {
                data: selectedRowKeys.value
              });
            }
            message.success('删除成功');
            await fetchUsers(p_id.value);
          } catch (error) {
            message.error('删除失败');
          }
        }
      });
    };

    // CSV导入处理
    const beforeUpload = file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('departmentId', selectedDepartmentId.value);

      Papa.parse(file, {
        complete: async (results) => {
          try {
            const users = results.data.slice(1).map(row => ({
              userName: row[0],
              phone: row[1],
              sex: row[2]
            }));

            await axios.post('/api/usersManage/batch', users, {
              params: { departmentId: selectedDepartmentId.value }
            });
            message.success(`成功导入${users.length}条数据`);
            await fetchUsers(p_id.value);
          } catch (error) {
            message.error('导入失败');
          }
        },
        error: () => message.error('文件解析失败')
      });
      return false;
    };

    // 工具方法
    const getDepartmentName = (departmentId) => {
      const dept = allDepartments.value.find(d => d.id === departmentId);
      return dept ? `${dept.name} (${dept.dcode})` : '未知部门';
    };

    const formatDate = (dateString) => {
      return moment(dateString).format('YYYY-MM-DD HH:mm');
    };

    const handleAttachmentUpload = (file) => {
      taskForm.attachments.push(file);
      return false; // 阻止自动上传
    };

    const handleRemoveAttachment = async (file) => {
      try {
        await axios.delete(`/api/attachments/${file.uid}`);
        message.success('附件删除成功');
        taskForm.attachments = taskForm.attachments.filter(f => f.uid !== file.uid);
      } catch (error) {
        message.error('附件删除失败');
      }
    };

    const publishTask = async () => {
      try {
        const formData = new FormData();

        // 公共必填参数
        formData.append('title', taskForm.title);
        formData.append('content', taskForm.content);
        formData.append('did', selectedDepartmentId.value); // 部门ID
        formData.append('taskType', taskType.value);
        formData.append('course', courseId.value); // 会被后端转换器转为 Course 对象
        formData.append('department', selectedDepartmentId.value); // 会被后端转换器转为 Department 对象
        formData.append('endTime', taskForm.endTime.format('YYYY-MM-DD HH:mm:ss'));

        // 文件处理（必须传递至少一个文件）
        if (taskType.value === 'HOMEWORK' && taskForm.attachments.length > 0) {
          taskForm.attachments.forEach(file => {
            formData.append('file', file); // 作业任务上传真实文件
          });
        } else {
          // 其他任务类型传递空文件占位符
          const emptyFile = new File([''], 'placeholder.txt', { type: 'text/plain' });
          formData.append('file', emptyFile); // 注意这里改为 'file'
        }

        if (taskType.value === 'OFFLINE') {
          formData.append('endTime', '1999-01-01 00:00:00');
          formData.append("apTime", value3.value)
          formData.append("classRoom", taskForm.location)
        }

        // 添加练习数据
        if (taskType.value === 'EXERCISE') {
          formData.append('exercises', JSON.stringify(taskForm.exercises));
        }

        // 发送请求
        await axios.post('/api/tasks/pushTasks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        message.success('任务发布成功，页面在1秒后刷新！');
        setTimeout(()=>{
          resetTaskForm();
        },1000)
      } catch (error) {
        message.error('任务发布失败');
        console.error('Error:', error.response?.data || error.message);
      }
    };

    const resetTaskForm = () => {
      window.location.reload();
      taskForm.title = '';
      taskForm.content = '';
      taskForm.endTime = null;
      taskForm.videoUrl = '';
      taskForm.duration = 0;
      taskForm.description = '';
      taskForm.location = '';
      taskForm.classTime = null;
      taskForm.attachments = [];
    };

    const assignCourseToClass = async () => {
      if (!courseId.value || !selectedDepartmentId.value) {
        message.error('请选择课程和班级');
        return;
      }

      try {
        await axios.post(`/api/courses/${courseId.value}/assign`, null, {
          params: { departmentId: selectedDepartmentId.value }
        });
        message.success('课程分配成功');
      } catch (error) {
        message.error('课程分配失败');
        console.error('Error:', error.response?.data || error.message);
      }
    };

    return {
      size,
      selectedDepartmentId,
      departmentOptions,
      searchLoading,
      userColumns,
      userList,
      isSelect,
      addVisible,
      editVisible,
      addForm,
      editForm,
      selectedRowKeys,
      rowSelection: computed(() => ({
        selectedRowKeys: selectedRowKeys.value,
        onChange: keys => (selectedRowKeys.value = keys),
        preserveSelectedRowKeys: true
      })),
      showAddModal: () => {
        addForm.value = { sex: '1' };
        addVisible.value = true;
      },
      showEditModal: () => {
        const user = userList.value.find(u => u.id === selectedRowKeys.value[0]);
        editForm.value = { ...user };
        editVisible.value = true;
      },
      handleSearch,
      handleDepartmentChange,
      handleAddOk,
      handleEditOk,
      handleDelete,
      beforeUpload,
      getDepartmentName,
      formatDate,
      taskType,
      taskForm,
      taskColumns,
      courseId,
      courseList,
      setCourse,
      fileList,
      handleChange,
      handleAttachmentUpload,
      handleRemoveAttachment,
      publishTask,
      setClass,
      assignCourseToClass,
      value3,
      options,
      addExercise,
      removeExercise,
      addOption,
      removeOption,
      handleExerciseTypeChange,
      getSelectedCount,
      validateExercises,
      courseTasks,
      moment
    };
  },
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.department-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: $shadow-base;

  :deep(.ant-card-body) {
    padding: 20px 24px;
  }
}

.content-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: $shadow-base;
  padding: 24px;
}

.function-switch {
  margin-bottom: 24px;

  .switch-btn {
    padding: 0 32px;
    height: 40px;
    font-size: 16px;
  }
}

.dynamic-form {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;

  .ant-form-item {
    margin-bottom: 16px;
  }
}

.publish-section {
  margin-top: 32px;
  text-align: right;
}

.account-management {
  .action-buttons {
    margin-bottom: 24px;

    button {
      height: 40px;
      padding: 0 20px;
    }
  }

  .data-table {
    border-radius: 8px;
    overflow: hidden;

    :deep(.ant-table) {
      border-radius: 8px;
    }
  }
}

.exercise-card {
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;

  .option-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .ant-input-group-addon {
      background: transparent;
      border: none;
    }
  }

  .exercise-actions {
    margin-top: 12px;
    text-align: right;
  }
}

.options-section {
  border-left: 3px solid #1890ff;
  padding-left: 12px;
  margin: 12px 0;
}

.course-management {
  .course-select-card {
    margin-bottom: 24px;
  }

  .task-config {
    margin-bottom: 24px;

    .dynamic-form {
      margin-top: 24px;
      padding: 16px;
      background: #fafafa;
      border-radius: 6px;
    }

    .publish-section {
      margin-top: 32px;
      text-align: right;
    }
  }

  .task-list {
    :deep(.ant-progress) {
      min-width: 160px;
    }
  }
}

// 响应式处理
@media (max-width: 768px) {
  .container {
    padding: 12px;
  }

  .function-switch .switch-btn {
    width: 100%;
    margin-bottom: 8px;
  }

  .action-buttons {
    flex-direction: column;

    button {
      width: 100%;
      margin-bottom: 8px;
    }
  }
}
</style>
