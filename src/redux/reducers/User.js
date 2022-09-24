import { USER_STATE_CHANGE } from "../constants";
import { USER_POSTS_STATE_CHANGE } from "../constants";
import { USER_CHATLIST_STATE_CHANGE } from "../constants";
import { USER_MESSAGES_STATE_CHANGE } from "../constants";
import { USER_CONNECTED_STATE_CHANGE } from "../constants";
import { USER_CONNECTING_STATE_CHANGE } from "../constants";
import { USER_CONNECTING_REQUESTS_STATE_CHANGE } from "../constants";
import { USER_NOTIFICATIONS_STATE_CHANGE } from "../constants";
import { CLEAR_DATA } from "../constants";



const initialState = {
    currentUser: null,
    posts: [],
    connecting: [],
    connected: [],
    connectingRequests: [],
    chatList: [],
    messages: [],
    notifications: [],

};

export const User = (state = initialState, action) => {
    switch (action.type) {
        case USER_STATE_CHANGE:
            return {
                ...state,
                currentUser: action.currentUser,
            };
        case USER_POSTS_STATE_CHANGE:
            return {
                ...state,
                posts: action.posts,
            };
        case USER_CHATLIST_STATE_CHANGE:
            return {
                ...state,
                chatList: [...state.chatList, action.chatList],
            };
        case USER_MESSAGES_STATE_CHANGE:
            return {
                ...state,
                messages: [...state.messages, ...action.messages],
            };
        case USER_CONNECTED_STATE_CHANGE:
            return {
                ...state,
                connected:  action.connected,
            };
        case USER_CONNECTING_STATE_CHANGE:
            return {
                ...state,
                connecting: action.connecting,
            };
        case USER_CONNECTING_REQUESTS_STATE_CHANGE:
            return {
                ...state,
                connectingRequests: action.connectingRequests,
            };
        case USER_NOTIFICATIONS_STATE_CHANGE:
            return {
                ...state,
                notifications: [...state.notifications, action.notifications],
            };
        case CLEAR_DATA:
            return initialState;
        default:
            return state;
    }
}