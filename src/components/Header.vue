<template>
    <el-header class='header'>
        <el-container class='nav-global'>
          <h1 class='logo-container'>
              <a class='logo' href='/home' title='斧子科技官网'></a>
          </h1>
          <ul class='nav-list'>
              <li><a>文本1</a></li>
              <li><a>文本2</a></li>
              <li><a>文本3</a></li>
              <li><a>文本4</a></li>
              <li><a>文本5</a></li>
          </ul>
          <ul class='nav-side'>
              <li class='user'><a href='/personalcenter' title='个人中心'></a></li>
              <li class='cart'><app-dropdown-menu></app-dropdown-menu></li>
          </ul>
        </el-container>
    </el-header>
</template>

<script>
import Cooikes from "js-cookie"
import AppDropdownMenu from "./DropdownMenu.vue"
import { doLogout } from "api"

export default {
  name: "app-header",
  date() {},
  components: {
    AppDropdownMenu
  }
}
</script>
<style>
.header {
  width: 100%;
  height: 100px !important;
  background-color: #2dc3e8;
  border-bottom: 1px solid #ededed;
}
.nav-global {
  width: 1220px;
  margin: 0 auto;
}
.logo-container {
  height: 48px;
  width: 48px;
  float: left;
  margin-left: -5px;
  padding: 25px 0 0;
}
.logo {
  display: block;
  height: 48px;
  width: 48px;
  background: url("../assets/img/斧子.png") no-repeat;
}
.nav-list {
  display: block;
  float: right;
  line-height: 100px;
}
.nav-list li {
  float: left;
  display: inline;
  margin-left: 130px;
}
.nav-side {
  box-sizing: border-box;
  position: absolute;
  top: 20px;
  right: 200px;
}
.nav-side .user {
  display: inline-block;
}
.nav-side .user a {
  display: block;
  height: 48px;
  width: 48px;
  background: url("../assets/img/头像.png") no-repeat;
}
.nav-side .cart {
  float: right;
  margin-left: 50px;
}
.nav-side .cart a {
  display: block;
  height: 48px;
  width: 48px;
  background: url("../assets/img/购物车.png") no-repeat;
}
</style>

 