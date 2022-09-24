
import { TOGGLE_THEME } from '../constants';
import { INITIATE_THEME } from '../constants';
import { RELOAD_DATA_STATE_CHANGE } from '../constants';
import { colors } from '../constants';

const initialState = {
    colors: colors,
    textColor: colors.dark,
    backgroundColor: colors.light,
    theme: 'light',
    loading: true,
    reload: false,

};

export const  UI = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_THEME:
            return {
                ...state,
                theme: state.theme === 'light' ? 'dark' : 'light',
                textColor: state.textColor === colors.dark ? colors.light : colors.dark,
                backgroundColor: state.backgroundColor === colors.light ? colors.dark : colors.light,
            };
        case INITIATE_THEME:
            return {
                ...state,
                theme: action.payload,
                textColor: action.payload === 'light' ? colors.dark : colors.light,
                backgroundColor: action.payload === 'light' ? colors.light : colors.dark,
                loading: false,
            };
        case RELOAD_DATA_STATE_CHANGE:
            return {
                ...state,
                reload: !state.reload,
            };
        default:
            return state;
        }
 }