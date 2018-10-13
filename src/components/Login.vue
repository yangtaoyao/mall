<template>
<el-row class="login-wrapper">
    <el-col :span="6" :offset="9">
        <h3 class="welcome">欢迎登录</h3>
        <el-form class="app-form" ref="form" label-position="top" :model="form" :rules="rules">
            <el-form-item label="请输入用户名" prop="username">
                <el-input v-model="form.username" placeholder="用户名"></el-input>
            </el-form-item>

            <el-form-item label="请输入密码" prop="password">
                <el-input v-model="form.password" placeholder="密码" @keyup.enter.native="doLogin"></el-input>
            </el-form-item>
            <el-form-item>
            <el-checkbox v-model="checkbox">
                下次自动登录
            </el-checkbox>
            <el-button class='fr' style="display:inline">
              注册
            </el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="width: 100%" @click.stop="doLogin">登 录</el-button>
            </el-form-item>
        </el-form>
    </el-col>
</el-row>
</template>

<script>
import { mapActions } from "vuex"
import { doLogin } from "api"

export default {
  name: "app-login",
  data() {
    return {
      form: {
        username: "",
        password: ""
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名.", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码.", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ]
      }
    }
  },
  methods: {
    ...mapActions(["createLoginInfo"]),
    async doLogin() {
      if (this.form.username == "" || this.form.password == "") {
        return this.$message.warning("请正确填写用户名和密码！")
      }
      try {
        const response = await doLogin({
          username: this.form.username,
          password: this.form.password
        })
        console.log(response.data)
        if (response.data.err == 1) {
          this.createLoginInfo({
            id: response.data.info.id,
            name: response.data.info.name,
            roles: response.data.info.roles || []
          })
          this.$router.push({ path: "/" })
        } else {
          this.$message.error(response.data.message)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style>
/* .login-wrapper {
} */
.login-wrapper .welcome {
  text-align: center;
  padding: 40px 0 30px;
  font-size: 30px;
  line-height: 40px;
}

.login-wrapper .app-form {
  padding: 10px 20px 0;
  background-color: #fff;
  border: 1px solid #d8dee2;
  border-radius: 5px;
  box-shadow: 3px 5px 5px #c8c4c4;
}
</style>