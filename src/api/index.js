import axios from 'axios'
import qs from 'qs'
import common from 'assets/js/common'
import store from 'store'
import { Message } from 'element-ui'

console.info(common.env)

const instance = axios.create({
    baseURL: common.serverUrl,
    timeout: 4000,
    withCredentials: true, // 跨域请求时是否需要使用凭证
    paramsSerializer: params => {
        // 序列化 GET 请求参数 -> a: [1, 2] => a=1&a=2
        return qs.stringify(params, { arrayFormat: 'repeat' })
    },
    transformRequest: [data => {
        // 在向服务器发送前修改请求数据，只适用于 POST
        return qs.stringify(data, { arrayFormat: 'repeat' })
    }],
    headers: {
        post: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
})

// http 请求拦截器
instance.interceptors.request.use(config => {
    store.dispatch('setBtnLoading', !0)
    return config
}, error => {
    store.dispatch('setBtnLoading', !1)
    Message.error('数据加载超时！')
    return Promise.reject(error)
})

// http 响应拦截器
instance.interceptors.response.use(response => {
    store.dispatch('setBtnLoading', !1)
    return response
}, error => {
    store.dispatch('setBtnLoading', !1)
    Message.error('数据加载失败！')
    return Promise.reject(error)
})

/**
 * 向后台请求数据的 API 接口
 */

// 登录接口
export const doLogin = params => instance.post('/login/do', params)

// 退出登录接口
export const doLogout = () => instance.get('/login/out')

// 获取应用导航接口
export const getNavList = () => instance.get('/menu/getlist')

// 获取角色列表 for select
export const getSelectRoles = () => instance.get('/roles/select')

// 用户管理 搜索 + 分页 接口
export const getUserList = params => instance.get('/user/getlist', {params})

// 新增用户
export const saveUserInfo = params => instance.post('/user/save', params)

// 修改用户
export const updateUserInfo = params => instance.post('/user/update', params)

// 获取用户信息
export const getUserItem = params => instance.get('/user/getone', {params})

// 删除用户记录
export const deleteUserItem = params => instance.get('/user/delete', {params})

// 修改用户密码
export const resetUserPass = params => instance.post('/user/resetpwd', params)

// 获取角色列表 - for 角色管理
export const getRolesList = () => instance.get('/roles/getlist')

// 新增角色
export const saveRoleInfo = params => instance.get('/roles/save', {params})

// 获取角色信息
export const getRoleItem = params => instance.get('/roles/getone', {params})

// 更新角色信息
export const updateRoleInfo = params => instance.get('/roles/update', {params})

// 直接修改角色排序
export const updateRoleSort = params => instance.get('/roles/sort', {params})

// 删除角色记录
export const deleteRoleItem = params => instance.get('/roles/delete', {params})

// 获取菜单列表
export const getMenuList = () => instance.get('/menu/getall')

// 直接修改菜单排序
export const updateMenuSort = params => instance.get('/menu/sort', {params})

// 获取菜单列表 - for select
export const getSelectMenus = () => instance.get('/menu/select')

// 新增菜单
export const saveMenuInfo = params => instance.post('/menu/save', params)

// 获取单个菜单信息
export const getMenuItem = params => instance.get('/menu/getone', {params})

// 更新菜单信息
export const updateMenuInfo = params => instance.post('/menu/update', params)

// 删除菜单
export const deleteMenuItem = params => instance.get('/menu/delete', {params})

// 获取角色的权限列表
export const getRolePermissionList = params => instance.get('/permission/get', {params})

// 设置角色权限
export const setRolePermission = params => instance.get('/permission/save', {params})

// 获取分类树
export const getClassifyTree = () => instance.get('/classify/getlist')

// 直接修改分类排序
export const updateClassifySort = params => instance.get('/classify/sort', {params})

// 获取分类列表 - for select
export const getSelectClassify = () => instance.get('/classify/select')

// 新增分类信息
export const saveClassifyInfo = params => instance.post('/classify/save', params)

// 获取分类信息
export const getClassifyItem = params => instance.get('/classify/getone', {params})

// 更新分类信息
export const updateClassifyInfo = params => instance.post('/classify/update', params)

// 删除分类记录
export const deleteClassifyItem = params => instance.get('classify/delete', {params})

// 获取文章列表 搜索 + 分页
export const getArticleList = params => instance.get('/article/getlist', {params})

// 新增文章
export const saveArticleInfo = params => instance.post('/article/save', params)

// 获取文章信息记录
export const getArticleItem = params => instance.get('/article/getone', {params})

// 更新文章信息
export const updateArticleInfo = params => instance.post('/article/update', params)

// 删除文章记录
export const deleteArticleItem = params => instance.get('/article/delete', {params})

// 获取网站配置信息
export const getSiteInfo = () => instance.get('/site/getone')

// 保存网站配置信息
export const saveSiteInfo = params => instance.post('/site/save', params)
// 39












