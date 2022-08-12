import "dotenv/config";
import "./db.js";
import "./models/Video.js";
import app from "./server.js";

const PORT = 3000;

const handleListening = () => {
  console.log(`서버 ${PORT}이 잘 작동되고 있음`);
};

app.listen(PORT, handleListening);
