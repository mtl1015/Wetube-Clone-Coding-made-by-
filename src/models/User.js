import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, //unique는 단 한개의 계정만을 만들고 싶을 때 쓴다.
    avatarURL: String,
    socialOnly: { type: Boolean, default: false }, //user가 GitHub로 로그인했는지 아닌지 여부를 알기 위해서 이런 설정을 넣어주었다.
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false },//gitHub로 로그인하면 비밀번호가 없을테니깐 이걸 필수로 지정하면 안된다.
    name: { type: String, required: true },
    location: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
});

userSchema.pre('save', async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5)
    }
    //여기서 this는 pasrsing하려는 password의 주체 User을 가리킨다.
    // 어떻게 가리키지?? userSchema를 바탕으로 하고 있자나!
    //그런데, this.isModified("password")를 통해 this, 즉, user의 
    //password가 수정될때만 비밀버호 해쉬가 발생하게끔 만든다.
})

const User = mongoose.model("User", userSchema);
export default User;