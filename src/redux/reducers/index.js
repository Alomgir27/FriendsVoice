import { combineReducers } from "redux";
import { UI } from "./UI";
import { User } from "./User";
import { Users } from "./Users";

const rootReducer = combineReducers({
    UI: UI,
    User: User,
    Users: Users,
});

export default rootReducer;