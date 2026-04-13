const { Router } = require("express");
const messageController = require("../controllers/messageController");

const messageRouter = Router();

messageRouter.get("/", messageController.getContacts);

messageRouter.get("/:username", messageController.getMessages);

messageRouter.post("/:id", messageController.sendMessage);

module.exports = messageRouter;
