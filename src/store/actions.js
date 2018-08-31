/**
 * @Author: jzy
 * @Date: 2017/9/19
 * @Last Modified by: jzy
 * @Last Modified time: 2017/9/19
 */
import * as types from './types'
import { setToken } from 'assets/js/auth'

const actions = {
    createLoginInfo ({commit}, params){
        // setToken(params.id)
        commit({
            type: types.LOGININFO,
            info: params
        })
    },
    createNavList ({commit}, params){
        commit({
            type: types.NAVLIST,
            info: params
        })
    },
    setBtnLoading ({commit}, params){
        commit({
            type: types.BUTTON_LOADING,
            info: params
        })
    },
    setLeaveRemind ({commit}, params){
        commit({
            type: types.LEAVE_REMIND,
            info: params
        })
    }
}

export default actions