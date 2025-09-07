import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import index from "../views/index.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    component: index,
  },
  {
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/login/login.vue'),
  },
  {
    path: '/userCenter',
    name: 'userCenter',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/userCenter/main_center.vue'),
    meta: { isAuth: true },
    beforeEnter: (to, from, next) => {
      if (to.meta.isAuth) { //判断是否需要授权
        if (localStorage.getItem('loginData') !== null) {
          next()  //放行
        } else {
          alert('抱歉，您无权限查看！')
          next('/')
        }
      } else {
        next()  //放行
      }
    }
  },
  {
    path: '/OnlineEdu',
    name: 'OnlineEdu',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/onlineEdu/main_onEdu.vue'),
  },
  {
    path: '/AddClass',
    name: 'AddClass',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/onlineEdu/zj/new_class.vue'),
    meta: { isAuth: true },
    beforeEnter: (to, from, next) => {
      if (to.meta.isAuth) { //判断是否需要授权
        if (localStorage.getItem('loginData') !== null) {
          next()  //放行
        } else {
          alert('抱歉，您无权限查看！')
          next('/')
        }
      } else {
        next()  //放行
      }
    }
  },
  {
    path: '/Learning',
    name: 'Learning',
    component: () => import(/* webpackChunkName: "about" */ '../components/onlineEdu/zj/learning.vue'),
    meta: { isAuth: true },
    beforeEnter: (to, from, next) => {
      if (to.meta.isAuth) { //判断是否需要授权
        if (localStorage.getItem('loginData') !== null) {
          next()  //放行
        } else {
          alert('抱歉，您无权限查看！')
          next('/')
        }
      } else {
        next()  //放行
      }
    }
  },
  {
    path: '/task/exercise/:taskId',
    name: 'ExerciseTask',
    component: () => import('../components/onlineEdu/zj/ExerciseTask.vue'),
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      if (to.meta.isAuth) { //判断是否需要授权
        if (localStorage.getItem('loginData') !== null) {
          next()  //放行
        } else {
          alert('抱歉，您无权限查看！')
          next('/')
        }
      } else {
        next()  //放行
      }
    }
  },
  {
    path: '/systemSetting',
    name: 'systemSetting',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/system_setting.vue'),
    meta: { isAuth: true },
    beforeEnter: (to, from, next) => {
      if (to.meta.isAuth) { //判断是否需要授权
        // @ts-ignore
        if (localStorage.getItem('loginData') !== null) {
          next()  //放行
        } else {
          alert('抱歉，您无权限查看！')
          next('/')
        }
      } else {
        next()  //放行
      }
    },
    children:[
      {
        path: 'AcSetting',
        name: 'AcSetting',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/Encomponents/account_setting.vue'),
      },{
        path: 'DeSetting',
        name: 'DeSetting',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/Encomponents/department_setting.vue'),
      },{
        path: 'CSetting',
        name: 'CSetting',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/Encomponents/class_setting.vue'),
      }
    ]
  },
  {
    path: '/dataVisual',
    name: 'dataVisual',
    children:[
      {
        path: 'Public',
        name: 'Public',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/dataVisual/PublicDataVisual.vue'),
      },{
        path: 'Teacher/:courseId/:courseGs', // 定义 courseId 参数
        name: 'Teacher',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/dataVisual/TeacherDataVisual.vue'),
        meta: { isAuth: true },
        beforeEnter: (to, from, next) => {
          if (to.meta.isAuth) { //判断是否需要授权
            // @ts-ignore
            if (localStorage.getItem('loginData') !== null) {
              // @ts-ignore
              if (JSON.parse(localStorage.getItem('loginData')).identifiers === 'Teacher'){
                next()  //放行
              }else {
                alert('抱歉，您无权限查看！')
                // @ts-ignore
                next('/dataVisual/' + JSON.parse(localStorage.getItem('loginData')).identifiers)
              }
            } else {
              alert('抱歉，您无权限查看！')
              next('/dataVisual/Public')
            }
          } else {
            next()  //放行
          }
        },
      },{
        path: 'TeacherNoClass', // 定义 courseId 参数
        name: 'TeacherNoClass',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/dataVisual/TeacherDataVisual.vue'),
        meta: { isAuth: true },
        beforeEnter: (to, from, next) => {
          if (to.meta.isAuth) { //判断是否需要授权
            // @ts-ignore
            if (localStorage.getItem('loginData') !== null) {
              // @ts-ignore
              if (JSON.parse(localStorage.getItem('loginData')).identifiers === 'Teacher'){
                next()  //放行
              }else {
                alert('抱歉，您无权限查看！')
                // @ts-ignore
                next('/dataVisual/' + JSON.parse(localStorage.getItem('loginData')).identifiers)
              }
            } else {
              alert('抱歉，您无权限查看！')
              next('/dataVisual/Public')
            }
          } else {
            next()  //放行
          }
        },
      },
      {
        path: 'Root',
        name: 'Root',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/dataVisual/RootDataVisual.vue'),
        meta: { isAuth: true },
        beforeEnter: (to, from, next) => {
          if (to.meta.isAuth) { //判断是否需要授权
            // @ts-ignore
            if (localStorage.getItem('loginData') !== null) {
              // @ts-ignore
              if (JSON.parse(localStorage.getItem('loginData')).identifiers === 'Root'){
                next()  //放行
              }else {
                alert('抱歉，您无权限查看！')
                // @ts-ignore
                next('/dataVisual/' + JSON.parse(localStorage.getItem('loginData')).identifiers)
              }
            } else {
              alert('抱歉，您无权限查看！')
              next('/dataVisual/Public')
            }
          } else {
            next()  //放行
          }
        },
      },
      {
        path: 'StudentAnswer',
        name: 'StudentAnswer',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../components/dataVisual/StudentAnswer.vue'),
      }
    ]
  },
  {
    path: '/RandomQuestion/:questionId',
    name: 'RandomQuestion',
    component: () => import('../components/dataVisual/StudentAnswer.vue'),
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      if (to.meta.isAuth) { //判断是否需要授权
        if (localStorage.getItem('loginData') !== null) {
          next()  //放行
        } else {
          alert('抱歉，您无权限查看！')
          next('/')
        }
      } else {
        next()  //放行
      }
    }
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('../views/SearchResults.vue'),
    props: (route) => ({ keyword: route.query.q })
  },
  {
    path: '/test',
    name: 'test',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../test.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
