import express from "express";
import { join, login} from "../controllers/userController.js";
import {  search, home} from "../controllers/videoController.js";

const globalRouter = express.Router();

globalRouter.get("/", home);
globalRouter.get("/search", search);
globalRouter.get("/join", join);
globalRouter.get("/login", login);
export default globalRouter;