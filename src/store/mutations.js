/**
 * @Author: jzy
 * @Date: 2017/9/19
 * @Last Modified by: jzy
 * @Last Modified time: 2017/9/19
 */
import * as types from './types'

const mutations = {
    [types.LOGININFO](state, payload){
        state.loginInfo = payload.info
    },
    [types.NAVLIST](state, payload){
        state.navList = payload.info
    },
    [types.BUTTON_LOADING](state, payload){
        state.btnLoading = payload.info
    },
    [types.LEAVE_REMIND](state, payload){
        state.isLeaveRemind = payload.info
    }
}

export default mutations