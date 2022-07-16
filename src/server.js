import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";

const PORT = 3000;
const logger = morgan("dev");

const app = express();//application 생성


app.use("/",globalRouter);
app.use("/users",userRouter);
app.use("/videos",videoRouter);

 


const handleListening = () => {
    console.log(`서버 ${PORT}이 잘 작동되고 있음`);
}

app.listen(PORT, handleListening);