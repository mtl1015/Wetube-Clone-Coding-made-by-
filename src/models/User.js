import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true}, //unique는 단 한개의 계정만을 만들고 싶을 때 쓴다.
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    name: {type: String, required: true},
    location: String,
});

userSchema.pre('save', async function() {
    console.log(this.password);
    this.password = await bcrypt.hash(this.password, 5) //여기서 this는 pasrsing하려는 password의 주체 User을 가리킨다.
    // 어떻게 가리키지?? userSchema를 바탕으로 하고 있자나!
    console.log(this.password);
})

const User = mongoose.model("User", userSchema);
export default User;