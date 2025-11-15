import express from "express";
import {
    createBar,
    updateBar,
    getBar,
    deleteBar,
} from "../controllers/bar_controller";

const barRouter = express.Router();

barRouter.post("/create", createBar);
barRouter.put("/update", updateBar);
barRouter.get("/get", getBar);
barRouter.delete("/delete", deleteBar);

export default barRouter;