# Mongo Rester

### by Alex Merced

Spin up a Full Crud Mongo Express API with one function

## How it works

Install it...

`npm install mongorester`

require it...

```js
const rester = require("mongorester");
```

Pass the rester function a model name string and schema definition object. The function will return an array with the model and the router with 5 pre-made routes.

```js
//Generate Model and Router
const [Note, noteRouter] = rester("Note", { title: String, content: String });

//add extra routes if you want
noteRouter.get("/user/:username", async (req, res) => {
  res.json(await Note.find({ username: req.params.username }));
});

//Use the Router
app.use("/note/", noteRouter);
```

## The Pre-Made Routes

Here is the Routes that get created when using the rester function

```js
//INDEX
router.get("/", async (req, res) => {
  try {
    res.status(200).json(await Model.find({}));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//SHOW
router.get("/:id", async (req, res) => {
  try {
    res.status(200).json(await Model.findById(req.params.id));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//CREATE
router.post("/", async (req, res) => {
  try {
    res.status(200).json(await Model.create(req.body));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//PUT
router.put("/:id", async (req, res) => {
  try {
    res
      .status(200)
      .json(await Model.findByIdAndUpdate(req.params.id, req.body));
  } catch (error) {
    res.status(400).json({ error });
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    res.status(200).json(await Model.findByIdAndRemove(req.params.id));
  } catch (error) {
    res.status(400).json({ error });
  }
});
```

## The Config Object

Can pass a third config object argument that'll help add middleware and configure your schema.

```js
//config object
const config = {
  middleware: [auth], //array of middleware function, must be an array
  config: { timestamps: false }, //second argument of Schema, default timestamps true
  indexQuery: (req, res) => {
    username: req.query.username;
  },
  //Function that takes req/res and returns object to query for index route
};

//Generate Model and Router
const [Note, noteRouter] = rester(
  "Note",
  { title: String, content: String },
  config
);
```

## Overriding Default Routes

You can pass an alternate route handler into the config object under the following keys:

- index
- show
- update
- create
- destroy

with the following function signature

```(req, res, model) => {}```