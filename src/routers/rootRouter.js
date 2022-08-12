import express from "express";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController.js";
import { search, home } from "../controllers/videoController.js";
import { publicOnlyMiddleware } from "../middlewares.js";

const rootRouter = express.Router();
//바꾼 이유: "/"는 root를 의미하기 때문이다.
rootRouter.get("/", home);
rootRouter.get("/search", search);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
export default rootRouter;
