require("dotenv").config();
const express = require("express");
const cors = require("cors");
const monk = require("monk");
const Filter = require("bad-words");
const rateLimit = require("express-rate-limit");

const app = express();

const db = monk(process.env.MONGODB_URI || `localhost/meower`);
db.then(() => {
  console.log("server connected");
});

const mews = db.get("mews");
const filter = new Filter();

app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
  res.json({ message: "Hwllo world" });
});
app.get("/mews", (req, res) => {
  mews.find().then((mews) => {
    res.json(mews);
  });
});

function isValidMew(mew) {
  return (
    mew.name &&
    mew.name.toString().trim() !== "" &&
    mew.content &&
    mew.content.toString().trim() !== ""
  );
}

const limiter = rateLimit({
  windowMs: 20 * 1000, // 30 seconds
  max: 1, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

app.post("/mews", (req, res) => {
  if (isValidMew(req.body)) {
    const mew = {
      name: filter.clean(req.body.name.toString()),
      content: filter.clean(req.body.content.toString()),
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

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
