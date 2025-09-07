<template>
  <div>
    <!-- 操作按钮区域 -->
    <div style="margin-bottom: 16px;">
      <a-button type="primary" @click="handleAddUser" style="margin-right: 10px;">
        新增用户
      </a-button>

      <!-- 编辑用户抽屉 -->
      <a-drawer
        v-model:visible="visible"
        class="custom-class"
        title="编辑用户"
        placement="right"
        @after-visible-change="afterVisibleChange"
      >
        <a-form :model="DrawerData" :wrapper-col="wrapperCol" :rules="DrawerRules">
          <a-form-item label="用户名" name="userName">
            <a-input v-model:value="DrawerData.userName"/>
          </a-form-item>
          <a-form-item ref="phone" name="phone" label="手机号/登录账号">
            <a-input v-model:value="DrawerData.phone" placeholder="请输入注册手机号" />
          </a-form-item>
          <a-form-item label="性别" name="sex">
            <a-radio-group v-model:value="DrawerData.sex">
              <a-radio value="1">男</a-radio>
              <a-radio value="2">女</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item name="birthday" label="出生日期">
            <a-date-picker v-model:value="DrawerData.birthday" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item name="identifiers" label="身份">
            <a-select v-model:value="DrawerData.identifiers" placeholder="请选择注册身份">
              <a-select-option value="Puser">学生/普通用户</a-select-option>
              <a-select-option value="Teacher">教师</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="密码" name="password">
            <a-input-password v-model:value="DrawerData.password" />
          </a-form-item>
          <a-button type="primary" @click="submitEditUser">提交</a-button>
        </a-form>
      </a-drawer>

      <!-- 新增用户抽屉 -->
      <a-drawer
        v-model:visible="addVisible"
        class="custom-class"
        title="新增用户"
        placement="right"
        @after-visible-change="afterVisibleChange"
      >
        <a-form :model="DrawerData" :wrapper-col="wrapperCol" :rules="DrawerRules">
          <a-form-item label="用户名" name="userName">
            <a-input v-model:value="DrawerData.userName" />
          </a-form-item>
          <a-form-item ref="phone" name="phone" label="手机号/登录账号">
            <a-input v-model:value="DrawerData.phone" placeholder="请输入注册手机号" />
          </a-form-item>
          <a-form-item label="性别" name="sex">
            <a-radio-group v-model:value="DrawerData.sex">
              <a-radio value="1">男</a-radio>
              <a-radio value="2">女</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item name="birthday" label="出生日期">
            <a-date-picker v-model:value="DrawerData.birthday" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item name="identifiers" label="身份">
            <a-select v-model:value="DrawerData.identifiers" placeholder="请选择注册身份">
              <a-select-option value="Puser">学生/普通用户</a-select-option>
              <a-select-option value="Teacher">教师</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="密码" name="password">
            <a-input-password v-model:value="DrawerData.password" />
          </a-form-item>
          <a-form-item label="确认密码" name="cfnPassword">
            <a-input-password v-model:value="DrawerData.cfnPassword" />
          </a-form-item>
          <a-button type="primary" @click="submitUser">提交</a-button>
        </a-form>
      </a-drawer>

      <a-button type="default" @click="handleEditUser" v-show="selectedRowKeys.length === 1" style="margin-right: 10px;">
        编辑单条数据
      </a-button>
      <a-button danger @click="handleDeleteUser" v-show="selectedRowKeys.length === 1" style="margin-right: 10px;">
        删除数据
      </a-button>
      <a-button danger @click="handleDeleteSelected" v-show="selectedRowKeys.length > 1">
        批量删除
      </a-button>
    </div>

    <!-- 数据表格 -->
    <a-table
      style="height: 80vh"
      :columns="columns"
      :row-key="record => record.id"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
      :rowSelection="rowSelection"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'user_name'">{{ text }}</template>
        <template v-else-if="column.dataIndex === 'sex'">
          <span>{{ text === '1' ? '男' : text === '2' ? '女' : '未设置' }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'birthday'">
          <span>{{ moment(text).format('YYYY-MM-DD') }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'create_time'">
          <span>{{ moment(text).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import { defineComponent, computed, ref, reactive } from 'vue';
import { usePagination } from 'vue-request';
import axios from 'axios';
import { SettingOutlined } from '@ant-design/icons-vue';
import { Modal, message, Button } from 'ant-design-vue';
import moment from 'moment';

export default defineComponent({
  components: {
    SettingOutlined,
  },
  setup() {
    const selectedRowKeys = ref([]);  // 选中的行
    const visible = ref(false); // 控制编辑用户抽屉显示
    const addVisible = ref(false); // 控制新增用户抽屉显示
    const wrapperCol = { span: 14 };
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: '10%',
      },
      {
        title: '用户名',
        dataIndex: 'userName',
        width: '20%',
      },
      {
        title: '性别',
        dataIndex: 'sex',
        filters: [
          { text: '男', value: '1' },
          { text: '女', value: '2' },
        ],
      },
      {
        title: '出生日期',
        dataIndex: 'birthday',
      },
      {
        title: '年龄',
        dataIndex: 'age',
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        sorter: true,
      },
      {
        title: '身份标识',
        dataIndex: 'identifiers',
      },
      {
        title: '所属部门',
        dataIndex: 'ascription',
      },
    ];

    const initialDrawerData = {
      userName: '',
      phone: '',
      sex: '',
      birthday:'',
      identifiers: '',
      password: '',
      cfnPassword: ''
    };

    const DrawerData = reactive({ ...initialDrawerData });

    const DrawerRules = {
      userName: [{
        required: true,
        message: '请输入用户名！',
      }],
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
      sex: [{
        required: true,
        message: '请选择性别！',
      }],
      birthday: [{
        required: true,
        message: '请选择出生日期！',
      }],
      identifiers: [{
        required: true,
        message: '请选择注册身份！',
      }],
      password: [{
        required: true,
        message: '请输入密码！',
      }],
      cfnPassword: [{
        required: true,
        message: '请输入确认密码！',
      }],
    };

    const queryData = (params) => {
      return axios.get('/api/users')
        .then(response => {
          if (response.data && Array.isArray(response.data.content)) {
            return response.data.content;
          } else {
            console.error('Expected content to be an array, but got:', response.data);
            return [];
          }
        });
    };

    const {
      data: dataSource,
      run,
      loading,
      current,
      pageSize,
    } = usePagination(queryData, {
      formatResult: res => {
        if (Array.isArray(res.content)) {
          return res.content;
        }
        return [];
      },
      pagination: {
        currentKey: 'page',
        pageSizeKey: 'results',
      },
    });

    const pagination = computed(() => ({
      total: 200,
      current: current.value,
      pageSize: pageSize.value,
    }));

    const handleTableChange = (pag, filters, sorter) => {
      console.log(pag, filters, sorter);
    };

    const submitUser = async () => {
      if (DrawerData.password !== DrawerData.cfnPassword) {
        message.error('密码不匹配！');
        return;
      }
      // 提交用户数据（你可以在此进行API请求）
      DrawerData.name = DrawerData.userName
      const response = await axios.post('/api/register', DrawerData)
      if (response.data === "注册成功"){
        message.success("用户新增成功！");
        visible.value = false;
        addVisible.value = false;
        run();
      }else{
        message.error("新增失败！")
      }

    };

    const handleAddUser = () => {
      // 清空表单数据，准备新增
      Object.assign(DrawerData, initialDrawerData);
      addVisible.value = true;
    };

    const handleEditUser = () => {
      const selectedRow = dataSource.value.find(item => item.id === selectedRowKeys.value[0]);
      if (selectedRow) {
        // 将选中的行数据传递给抽屉
        Object.assign(DrawerData, selectedRow);
        visible.value = true;
      }
    };

    // 删除单个用户
    const handleDeleteUser = async () => {
      const selectedRow = dataSource.value.find(item => item.id === selectedRowKeys.value[0]);
      if (selectedRow) {
        Modal.confirm({
          title: '确认删除',
          content: '确定要删除该用户吗？',
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {  // 将原逻辑移动到确认回调中
            let deleteData = [selectedRow.id];
            try {
              const response = await axios.delete("/api/users", {
                headers: { 'Content-Type': 'application/json' },
                data: deleteData
              });
              if (response.status === 204) {
                message.success("删除用户成功！");
                selectedRowKeys.value = ''
                run();
              }
            } catch (error) {
              message.error("请求失败！");
              console.error(error);
            }
          }
        });
      }
    };

// 批量删除用户
    const handleDeleteSelected = async () => {
      if (selectedRowKeys.value.length !== 0) {
        Modal.confirm({
          title: '确认批量删除',
          content: `确定要删除选中的 ${selectedRowKeys.value.length} 个用户吗？`,
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {  // 将原逻辑移动到确认回调中
            let deleteData = Array.from(selectedRowKeys.value);
            try {
              const response = await axios.delete("/api/users", {
                headers: { 'Content-Type': 'application/json' },
                data: deleteData
              });
              if (response.status === 204) {
                message.success("删除用户成功！");
                selectedRowKeys.value = ''
                run();
              }
            } catch (error) {
              message.error("请求失败！");
              console.error(error);
            }
          }
        });
      }
    };

    const rowSelection = computed(() => ({
      selectedRowKeys: selectedRowKeys.value,
      onChange: (keys) => {
        selectedRowKeys.value = keys;
      },
    }));

    const submitEditUser = async () =>{
      try {
        const response = await axios.post('/api/EditUser', DrawerData, {
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.status === 200){
          message.success("用户信息更新成功！");
          // 关闭抽屉
          visible.value = false;
          addVisible.value = false;
          // 刷新数据表格
          run();
        }
      }catch (err) {
        message.error(err)
      }
    }

    return {
      columns,
      dataSource,
      loading,
      pagination,
      handleTableChange,
      handleAddUser,
      handleEditUser,
      handleDeleteUser,
      handleDeleteSelected,
      rowSelection,
      selectedRowKeys,
      visible,
      addVisible,
      initialDrawerData,
      DrawerData,
      wrapperCol,
      DrawerRules,
      submitUser,
      submitEditUser,
      moment
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

  .class_content {
    width: calc(100% - 250px);
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: auto;
    height: 100vh;
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
