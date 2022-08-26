//api는 백엔드가 템플릿을 렌더링하지 않을때, 백엔드랑 프론트엔드가 통신하는 방법
//pug를 통해 백엔드랑 프론트엔드가 통신하는 방법은, 이제 별로 안쓴다고 한다.
import express from "express";
import { registerView } from "../controllers/videoController.js";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);

export default apiRouter;
