
import * as types from './mutations_types'

export default {
  [types.GET_BUTTON](state, button) {
    state.button = button;
  },
};
