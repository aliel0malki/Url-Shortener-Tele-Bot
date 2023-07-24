import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Bot is running!");
});

app.listen(port, () => {
  console.log(`bot are listening on port ${port}`);
});
