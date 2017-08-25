import * as types from './mutations_types'

export default {
    [types.SET_MENU](state, menus) {
        state.menus = menus;
    },
};