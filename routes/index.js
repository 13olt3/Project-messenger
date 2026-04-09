const { Router } = require("express");
const userRouter = require("./userRoutes");
const messageRouter = require("./messageRoutes");

const indexRouter = Router({ mergeParams: true });

indexRouter.use("/api/users", userRouter);
indexRouter.use("/api/messages", messageRouter);

module.exports = indexRouter;
