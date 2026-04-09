const { Router } = require("express");
const messageController = require("../controllers/messageController");

const messageRouter = Router();

messageRouter.post("/:id", messageController.sendMessage);
messageRouter.get("/", messageController.getMessages);

module.exports = messageRouter;
