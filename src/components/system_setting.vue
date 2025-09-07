<template>
  <div id="main_onlineEdu">
    <div class="menu">
      <a-menu
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        style="width: 256px"
        mode="inline"
        v-show="isLogin"
      >
        <a-sub-menu key="sub1">
          <template #icon><SettingOutlined /></template>
          <template #title>系统设置</template>
          <template v-for="item in menuItems" :key="item.key">
            <a-menu-item>
              <router-link :to="item.path">{{ item.label }}</router-link>
            </a-menu-item>
          </template>
        </a-sub-menu>
      </a-menu>
    </div>

    <div class="class_content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted, computed, nextTick } from 'vue';
import { SettingOutlined } from '@ant-design/icons-vue';
import router from '@/router';
import { message } from 'ant-design-vue';

export default defineComponent({
  components: {
    SettingOutlined,
  },
  setup() {
    const selectedKeys = ref([]);
    const openKeys = ref(['sub1']);
    const isLogin = ref(false);
    const isShow = ref(false);
    const isRoot = ref(false);

    // 动态生成菜单项
    const menuItems = computed(() => {
      const items = [];
      if (isRoot.value) {
        items.push(
          {
            key: '1',
            label: '账号设置',
            path: '/systemSetting/AcSetting',
          },
          {
            key: '2',
            label: '部门管理',
            path: '/systemSetting/DeSetting',
          }
        );
      }
      if (isShow.value) {
        items.push({
          key: '3',
          label: '班级配置',
          path: '/systemSetting/CSetting',
        });
      }
      return items;
    });

    // 检查登录状态和权限
    const checkLogin = () => {
      const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');
      isLogin.value = !!loginData.identifiers;
      isShow.value = ["Root", "Teacher"].includes(loginData.identifiers);
      isRoot.value = loginData.identifiers === "Root";
    };

    // 自动跳转到第一个可用菜单项
    const navigateToDefault = () => {
      if (menuItems.value.length > 0) {
        const defaultRoute = menuItems.value[0].path;
        if (router.currentRoute.value.path !== defaultRoute) {
          router.push(defaultRoute);
        }
        selectedKeys.value = [menuItems.value[0].key];
      } else {
        message.warning('您没有访问权限');
        router.push('/no-permission');
      }
    };

    // 初始化
    onMounted(async () => {
      checkLogin();
      await nextTick(); // 等待响应式数据更新
      navigateToDefault();
    });

    // 监听路由变化更新选中状态
    watch(
      () => router.currentRoute.value.path,
      (newPath) => {
        const activeItem = menuItems.value.find(item => item.path === newPath);
        if (activeItem) {
          selectedKeys.value = [activeItem.key];
        }
      }
    );

    // 监听权限变化重新导航
    watch([isRoot, isShow], () => {
      navigateToDefault();
    });

    return {
      selectedKeys,
      openKeys,
      isLogin,
      menuItems,
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

    .ant-menu {
      width: 100% !important;
    }
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
    width: calc(100% - 250px);
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow: auto;
    height: 100vh;
  }
}
</style>
