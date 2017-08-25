import * as types from './mutations_types';

export default {
    set_menu: ({commit}, menus) => {
        commit(types.SET_MENU, menus);
    },
};