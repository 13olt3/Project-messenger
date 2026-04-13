const { Router } = require("express");
const userController = require("../controllers/userController");

const userRouter = Router();

userRouter.post("/", userController.createUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/allusers", userController.getUsers);

userRouter.post("/upload", userController.uploadPic);

userRouter.get("/:username", userController.getUser); // view profile

module.exports = userRouter;
