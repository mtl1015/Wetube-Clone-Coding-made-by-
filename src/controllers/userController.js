import User from "../models/User.js";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { response } from "express";


export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    const { name, username, email, password, password2, location } = req.body;
    const pageTitle = "Join";
    if (password !== password2) {
        return res.render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        });
    }
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists) {
        return res.render("join", {
            pageTitle,
            errorMessage: "This username/email is already taken.",
        });
    }
    try {
        await User.create({
            name,
            username,
            email,
            password,
            location,
        });
        return res.redirect("/");
    }
    catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }


};
export const getEdit = (req, res) => {
    return res.render("edit-profile", { pageTitle: "Edit Profile" });
}
export const postEdit = async (req, res) => {
    const { session: { user: { _id } }, body: { email, username, name, location }, } = req;
    const updatedUser = await User.findByIdAndUpdate(_id, {
        name, email, location, username,
    }, { new: true });
    req.session.user = updatedUser;
    return res.rednder("edit-profile");
}
export const getLogin = (req, res) =>
    res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, socialOnly: false });
    const pageTitle = "Login";
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong Password.",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect("/");
};

export const startGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })).json();
    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiURL = "https://api.github.com";
        const userData = await (
            await fetch(`${apiURL}/user`,
                {
                    headers: {
                        Authorization: `token ${access_token}`,//json에는 token이 있음을 잊지말자.
                    }
                })).json();
        console.log(userData);
        const emailData = await (
            await fetch(`${apiURL}/user/emails`,
                {
                    headers: {
                        Authorization: `token ${access_token}`,//json에는 token이 있음을 잊지말자.
                    }
                })).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            //set notification
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
            user = await User.create({
                name: userData.name,
                avatarURL: userData.avata_url,
                username: userData.twitter_username,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    }
    else {
        return res.redirect("/login");
    }
};
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};
export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        return res.redirect("/")
        //social, 그니깐 Github로 로그인 했다면, 비밀번호 창을 열지 못하게 만드는 것!
    }
    return res.render("users/change-password", { pageTitle: "Change Password" });
}
export const postChangePassowrd = async (req, res) => {
    const { session: { user: { _id, password } }, body: { oldPassword, newPassword, newPasswordConfirmation } } = req;
    const ok = await bcrypt.compare(oldPassword, password)
    if (!ok) {
        return res.status(400).render("users/change-password", { pagedTitle: "Change Password", errorMessage: "The password does not match the confirmation" })
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", { pagedTitle: "Change Password", errorMessage: "The password does not match the confirmation" })
        //브라우저는 늘 status 코드를 주시하고 있다는 것을 기억해야 한다.
    }
    const user = await User.findById(_id);
    user.password = newPassword;
    await user.save();
    req.session.user.password = user.password;
    //우리는 db와 session 2개의 저장소를 쓰고 있다. 그렇기 때문에 session에서 정보를 받으면 업데이트도 해주어야 한다. 
    return res.redirect("/users/logout");
}

export const see = (req, res) => res.send("See User");