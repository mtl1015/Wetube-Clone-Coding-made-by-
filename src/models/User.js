import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, //unique는 단 한개의 계정만을 만들고 싶을 때 쓴다.
    avatar_url: String,
    socialOnly: { type: Boolean, default: false }, //user가 GitHub로 로그인했는지 아닌지 여부를 알기 위해서 이런 설정을 넣어주었다.
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false },//gitHub로 로그인하면 비밀번호가 없을테니깐 이걸 필수로 지정하면 안된다.
    name: { type: String, required: true },
    location: String,
});

userSchema.pre('save', async function () {
    console.log(this.password);
    this.password = await bcrypt.hash(this.password, 5) //여기서 this는 pasrsing하려는 password의 주체 User을 가리킨다.
    // 어떻게 가리키지?? userSchema를 바탕으로 하고 있자나!
    console.log(this.password);
})

const User = mongoose.model("User", userSchema);
export default User;