import express from "express";
import cors from "cors";
import joi from "joi";

const app = express();

app.use(cors());
app.use(express.json());

let avatar;
let arrayUser = [];
let arrayTweets = [];

const signUpSchema = joi.object({
  username: joi.string().required(),
  avatar: joi.string().required(),
});

const tweetSchema = joi.object({
  tweet: joi.string().required(),
});

const validateSchemaMiddleware = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  next();
};

app.post("/sign-up", validateSchemaMiddleware(signUpSchema), (req, res) => {
  avatar = req.body.avatar;
  arrayUser.push(req.body);

  return res.status(201).send({ message: `Ok` });
});

app.get("/tweets/:USERNAME", (req, res) => {
  let user = req.params.USERNAME;

  const filterTweets = arrayTweets.filter((i) => i.username === user);
  return res.send(filterTweets);
});

app.get("/tweets", (req, res) => {
  let page = req.query.page ?? 1;
  let init = Number(page) * 10 - 10;
  let end = Number(page) * 10;

  if (page < 1) {
    return res.status(400).json({ message: `Informe uma página válida!` });
  }

  return res.send(arrayTweets.slice(init, end));
});

app.post("/tweets", validateSchemaMiddleware(tweetSchema), (req, res) => {
  let username = req.headers.user;
  let tweet = req.body.tweet;

  const obj = {
    username,
    tweet,
    avatar,
  };

  if (!arrayUser.find((u) => u.username === username)) {
    return res.status(400).send("unauthorized");
  }

  if (tweet !== "") {
    arrayTweets.push(obj);
    return res.status(201).send(obj);
  }

  return res.status(400).json({ message: `Informe tweet válido!` });
});

app.get("*", (req, res) => {
  return res.status(404).json({
    message: `Não existe rota para a requisicao solicitada ${req.url},verifique`,
  });
});

app.listen(5000, () => {
  console.log("Running on PORT 5000");
});
