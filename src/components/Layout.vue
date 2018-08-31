<template>
<el-container>
    <app-header></app-header>
    <router-view></router-view>
    <app-footer></app-footer>
</el-container>
</template> 


<script>
import { mapGetters } from "vuex"
import { getUrlHash } from "assets/js/util"
import { doLogin } from "api"

import AppHeader from "components/Header.vue"
import AppNaver from "./Naver.vue"
export default {
  name: "app-layout",
  data() {
    return {}
  },
  components: {
    AppHeader,
    AppNaver
  }
}
</script>

<style>
</style>

