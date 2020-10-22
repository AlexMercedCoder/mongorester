const { Schema, model } = require("mongoose");
const { Router } = require("express");

defaultConfig = {
  indexQuery: () => {
    return {};
  },
  middleware: [(req, res, next) => next()],
  config: { timestamps: true },
};

const rester = (name, schema, config = {}) => {
  const configs = {...defaultConfig, ...config}


  const {
    indexQuery,
    middleware,
    schemaConfig,
    index,
    show,
    destroy,
    update,
    create,
  } = configs;
  const Model = model(name, new Schema(schema, schemaConfig));
  const router = Router();

  router.use(...middleware);

  //INDEX
  router.get("/", async (req, res) => {
    if (index) {
      index(req, res, Model);
    } else {
      try {
        res.status(200).json(await Model.find(indexQuery(req, res)));
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  });

  //SHOW
  router.get("/:id", async (req, res) => {
    if (show) {
      show(req, res, Model);
    } else {
      try {
        res.status(200).json(await Model.findById(req.params.id));
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  });

  //CREATE
  router.post("/", async (req, res) => {
    if (create) {
      create(req, res, Model);
    } else {
      try {
        res.status(200).json(await Model.create(req.body));
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  });

  //PUT
  router.put("/:id", async (req, res) => {
    if (update) {
      update(req, res, Model);
    } else {
      try {
        res.status(200).json(
          await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
          })
        );
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  });

  //DELETE
  router.delete("/:id", async (req, res) => {
    if (destroy) {
      destroy(req, res, Model);
    } else {
      try {
        res.status(200).json(await Model.findByIdAndRemove(req.params.id));
      } catch (error) {
        res.status(400).json({ error });
      }
    }
  });

  return [Model, router];
};

module.exports = rester;
