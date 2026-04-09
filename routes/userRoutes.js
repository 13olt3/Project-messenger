const { Router } = require("express");
const userController = require("../controllers/userController");

const userRouter = Router();

userRouter.post("/", userController.createUser);
userRouter.post("/login", userController.loginUser);

module.exports = userRouter;
