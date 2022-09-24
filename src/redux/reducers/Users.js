import { USERS_STATE_CHANGE } from "../constants";
import { USERS_POSTS_STATE_CHANGE } from "../constants";
import { CLEAR_DATA } from "../constants";


const initialState = {
    users: [],
    posts: [],
};

export const Users = (state = initialState, action) => {
    switch (action.type) {
        case USERS_STATE_CHANGE:
            return {
                ...state,
                users: [...state.users, action.users],
            };
        case USERS_POSTS_STATE_CHANGE:
            return {
                ...state,
                posts: [...state.posts, ...action.posts],
            };
        case CLEAR_DATA:
            return initialState;
        default:
            return state;
    }
}