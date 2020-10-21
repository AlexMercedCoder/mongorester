const { Schema, model } = require("mongoose");
const { Router } = require("express");

const rester = (name, schema) => {
  const Model = model(name, new Schema(schema));

  const router = Router();

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

  return [Model, router];
};

module.exports = rester;
