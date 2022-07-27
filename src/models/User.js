import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true}, //unique는 단 한개의 계정만을 만들고 싶을 때 쓴다.
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    name: {type: String, required: true},
    location: String,
});

const User = mongoose.model("User", userSchema);
export default User;