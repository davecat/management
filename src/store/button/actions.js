import * as types from './mutations_types';

export default {
  get_button: ({commit}, button) => {
    commit(types.GET_BUTTON, button);
  },
};
