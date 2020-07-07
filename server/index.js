require("dotenv").config();
const express = require("express");
const cors = require("cors");
const monk = require("monk");

const app = express();

const db = monk(process.env.API_URL);
db.then(() => {
  console.log("server connected");
});

const mews = db.get("mews");

app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
  res.json({ message: "Hwllo world" });
});

function isValidMew(mew) {
  return (
    mew.name &&
    mew.name.toString().trim() !== "" &&
    mew.content &&
    mew.content.toString().trim() !== ""
  );
}

app.post("/mews", (req, res) => {
  if (isValidMew(req.body)) {
    const mew = {
      name: req.body.name.toString(),
      content: req.body.content.toString(),
      created: new Date(),
    };
    mews
      .insert(mew)
      .then((createdMew) => {
        res.json(createdMew);
      })
      .catch((err) => {
        res.json(err);
      });
  } else {
    res.status(422);
    res.json({ message: "Hey! Name and content are required" });
  }
});

app.get("/mews", (req, res) => {
  mews.find().then((mews) => {
    res.json(mews);
  });
});

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
