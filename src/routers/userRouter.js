import express from "express";
import {
  getEdit,
  postEdit,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassowrd,
} from "../controllers/userController.js";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middlewares.js";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
//1. all은 어떤 http method를 사용해도, 이 function을 사용하겠다는 것을 의미한다.
//2. Multer는 file를 uploads폴더 안에 저장하게끔 하고, 그 파일들을 avatar라는 이름으로 postEdit Controller에 넘겨준다.
//   왜냐하면 Middleware는 파일을 왼쪽에서 오른쪽으로 저장하기 때문이다.
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassowrd);
//http get request를 보내면 getChangePassword함수를 발동하고,
//http post request를 보내면 postChangePassword함수를 발동하게 된다.

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
//이렇게 중간에 pubblicMiddleware나 protcetorMiddleware를 집어넣어줘서
//router들을 더 견고하게, 어떤 조건의 user가 이용할 수 있는지를 알려 준다.
userRouter.get("/:id", see);

export default userRouter;
