import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import morgan from "morgan";
import flash from "express-flash";
import { localsMiddleware } from "./middlewares.js";
import rootRouter from "./routers/rootRouter.js";
import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";
import apiRouter from "./routers/apiRouter.js";

const logger = morgan("dev");

const app = express(); //application 생성

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false, //세션을 수정할때만 세션을 DB에 저장하고 쿠키를 넘겨주는 기능을 한다. 즉, backend로 표현하면, 서버는 로그인을 시도하는 유저에 대해서만 쿠키를 준다는 것. 안그러면 운영하기에 너무 비대한 서버가 만들어진다. 매번 세션을 주기 때문에...
    //그러니깐, 이렇게 하면, 웹사이트에 방문하는 익명의 유저들에게는 쿠키를 줄 필요가 없다는 것!
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

//app.use((req, res, next) => {
//  res.locals.siteName ="Wetube";
//  req.sessionStore.all((error, sessions) => {
//    console.log(sessions);
//    next();
//  });
// });

app.get("/add-one", (req, res, next) => {
  req.session.potato += 1;
  return res.send(`${req.session.id} ${req.session.potato}`);
});

app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); // "/uploads"에 들어갈때 uploads 폴더를 노출시킨다.
//static은 내가 노출시키고 싶은 폴더의 이름을 써서, 그 폴더를 브라우저에게 노출시키는 것이다.
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);
export default app;
