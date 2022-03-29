import express from "express";

const PORT = 3000;

const app = express();

const handleListening = () => {
    console.log(`서버가 잘 작동되고 있음`);
}

app.listen(PORT, handleListening);