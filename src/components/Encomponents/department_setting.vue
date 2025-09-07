<template>
  <div>
    <!-- 操作按钮区域 -->
    <div style="margin-bottom: 16px;">
      <a-button type="primary" @click="handleAddUser" style="margin-right: 10px;">
        新增部门
      </a-button>

      <!-- 编辑部门抽屉 -->
      <a-drawer
        v-model:visible="visible"
        class="custom-class"
        title="编辑"
        placement="right"
        @after-visible-change="afterVisibleChange"
      >
        <a-form :model="DrawerData" :wrapper-col="wrapperCol">
          <a-form-item label="部门名称" name="name">
            <a-input v-model:value="DrawerData.name"/>
          </a-form-item>
          <a-form-item name="dcode" label="部门代码">
            <a-input v-model:value="DrawerData.dcode" placeholder="请输入注册手机号" disabled/>
          </a-form-item>
          <a-form-item name="create_user" label="创建人">
            <a-input v-model:value="DrawerData.create_user" disabled/>
          </a-form-item>
          <a-form-item name="create_time" label="创建时间">
            <a-date-picker v-model:value="DrawerData.create_time" value-format="YYYY-MM-DD HH:mm:ss" disabled/>
          </a-form-item>
          <a-button type="primary" @click="submitEditUser">提交</a-button>
        </a-form>
      </a-drawer>

      <!-- 新增部门抽屉 -->
      <a-drawer
        v-model:visible="addVisible"
        class="custom-class"
        title="新增部门"
        placement="right"
        @close="resetDrawerData"
      @after-visible-change="afterVisibleChange"
      >
        <a-form-item label="添加类型">
          <a-select v-model:value="addtype" placeholder="请选择添加类型">
            <a-select-option value="isAddParent">主部门</a-select-option>
            <a-select-option value="isAddChildren" @click="loadParent">子部门</a-select-option>
          </a-select>
        </a-form-item>
        <div v-show="addtype === 'isAddParent' ">
          <a-form :model="DrawerData" :wrapper-col="wrapperCol" :rules="DrawerRules">
            <a-form-item label="部门名称" name="name">
              <a-input v-model:value="DrawerData.name" disabled/>
            </a-form-item>
            <a-form-item name="dcode" label="学校代码">
              <a-select
                v-model:value="DrawerData.dcode"
                show-search
                placeholder="输入学校名称或代码搜索"
                :filter-option="false"
                @search="handleSchoolSearch"
                :loading="searchLoading"
              >
                <a-select-option
                  v-for="school in schoolOptions"
                  :key="school.schoolCode"
                  :value="school.schoolCode"
                  @click="DrawerData.name=school.name"
                >
                  {{ school.name }} ({{ school.schoolCode }})
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-button type="primary" @click="newDepartment">提交</a-button>
          </a-form>
        </div>

        <div v-show="addtype === 'isAddChildren' ">
          <a-form :model="DrawerData" :wrapper-col="wrapperCol" >
            <a-form-item label="部门名称" name="name">
              <a-input v-model:value="DrawerData.name"/>
            </a-form-item>
            <a-form-item name="dcode" label="父级部门">
              <a-select v-model:value="DrawerData.parentId" placeholder="请选择父级部门">
                <a-select-option @click="setCode(department)" v-for="department in parentList" :value="department.id">{{department.name}}</a-select-option>
              </a-select>
            </a-form-item>
            <a-button type="primary" @click="newDepartment">提交</a-button>
          </a-form>
        </div>

      </a-drawer>

      <a-button type="default" @click="handleEditUser" v-show="selectedRowKeys.length === 1" style="margin-right: 10px;">
        编辑单条数据
      </a-button>
      <a-button danger @click="handleDeleteDepartment" v-show="selectedRowKeys.length === 1" style="margin-right: 10px;">
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
    const searchLoading = ref(false);
    const schoolOptions = ref([]);
    const selectedRowKeys = ref([]);  // 选中的行
    const parentList = ref([]);  // 选中的行
    const visible = ref(false); // 控制编辑用户抽屉显示
    const addVisible = ref(false); // 控制新增用户抽屉显示
    const addtype = ref(''); // 控制新增用户抽屉显示
    const wrapperCol = { span: 14 };
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: '10%',
      },
      {
        title: '部门名称',
        dataIndex: 'name',
        width: '20%',
      },
      {
        title: '部门代码',
        dataIndex: 'dcode',
      },
      {
        title: '创建人',
        dataIndex: 'create_user',
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        sorter: true,
      }
    ];


    const initialDrawerData = {
      name: '',
      dcode: '',
      parentId: '',
      create_user: '',
      create_time:'',
      update_user: 'HZKD2XbFe0',
      update_time: '2025-01-25T09:28:43.000+00:00'
    };

    const DrawerData = reactive({ ...initialDrawerData });

    const DrawerRules = {
      name: [{
        required: true,
        message: '请输入用户名！',
      }],
      dcode: [{
        required: true,
        message: '请输入手机号！'
      },],
    };

    const resetDrawerData = () => {
      Object.assign(DrawerData, initialDrawerData); // 重置表单数据
      addtype.value = ''; // 清空添加类型选择
    };

    // 学校搜索方法（带防抖）
    let searchTimer = null;
    const handleSchoolSearch = (value) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(async () => {
        if (value) {
          try {
            searchLoading.value = true;
            const response = await axios.get('/api/schools/search', {
              params: { keyword: value }
            });
            schoolOptions.value = response.data.content;
          } catch (error) {
            console.error('搜索失败:', error);
          } finally {
            searchLoading.value = false;
          }
        }
      }, 500);
    };

    const loadParent = async () =>{
      try {
        const response = await axios.get('/api/departments/addChildren');
        if (response.status === 200){
          parentList.value = response.data.content;
          console.log(parentList)
        }else {
          message.error("父级部门获取失败！")
        }
      }catch (err){
        console.log(err)
      }
    }

    const setCode = async (department) =>{
      try {
        const response = await axios.get(`/api/departments/searchCode?parentDCode=${department.dcode}`);

        if (response.status === 200){
          let newCode = response.data.content.length;
          newCode++;
          DrawerData.dcode = department.dcode + "_"  + newCode;
          const parentName = department.name + "-" + DrawerData.name;
          DrawerData.name = parentName;
        }
      }catch (err){
        console.log(err)
      }
    }

    const queryData = (params) => {
      return axios.get('/api/departments')
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

    const newDepartment = async () => {
      // 提交用户数据（你可以在此进行API请求）
      const response = await axios.post('/api/departments', DrawerData)
      if (response.status === 201){
        message.success("部门新增成功！");
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

    // 删除单个部门
    const handleDeleteDepartment = async () => {
      const selectedRow = dataSource.value.find(item => item.id === selectedRowKeys.value[0]);
      if (selectedRow) {
        Modal.confirm({
          title: '确认删除部门',
          content: '确定要删除该部门吗？',
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {  // 将原逻辑移动到确认回调中
            try {
              const response = await axios.delete(`/api/departments/${selectedRow.id}`, {
                headers: { 'Content-Type': 'application/json' }
              });
              if (response.status === 204) {
                message.success("删除部门成功！");
                selectedRowKeys.value = '';
                run();  // 调用刷新数据的方法
              } else {
                message.error("删除失败！");
              }
            } catch (error) {
              message.error("请求失败！");
              console.error(error);
            }
          }
        });
      }
    };

// 批量删除部门
    const handleDeleteSelected = async () => {
      if (selectedRowKeys.value.length !== 0) {
        Modal.confirm({
          title: '确认批量删除部门',
          content: `确定要删除选中的 ${selectedRowKeys.value.length} 个部门吗？`,
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {  // 将原逻辑移动到确认回调中
            let deleteData = Array.from(selectedRowKeys.value);
            try {
              const response = await axios.delete("/api/departments", {
                headers: { 'Content-Type': 'application/json' },
                data: deleteData
              });
              if (response.status === 204) {
                message.success("删除部门成功！");
                selectedRowKeys.value = '';
                run();  // 调用刷新数据的方法
              } else {
                message.error("删除失败！");
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
      const selectedRow = dataSource.value.find(item => item.id === selectedRowKeys.value[0]);
      try {
        const response = await axios.put(`/api/departments/${selectedRow.id}`, DrawerData, {
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
      handleDeleteDepartment,
      handleDeleteSelected,
      rowSelection,
      selectedRowKeys,
      visible,
      addVisible,
      initialDrawerData,
      DrawerData,
      wrapperCol,
      DrawerRules,
      newDepartment,
      submitEditUser,
      moment,
      addtype,
      parentList,
      loadParent,
      setCode,
      resetDrawerData,
      handleSchoolSearch,
      searchLoading,
      schoolOptions
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
