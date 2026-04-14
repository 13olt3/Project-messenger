const { Router } = require("express");
const messageController = require("../controllers/messageController");

const messageRouter = Router();

messageRouter.get("/", messageController.getContacts);

messageRouter.get("/:username", messageController.getMessages);

messageRouter.post("/:username", messageController.sendMessage);

module.exports = messageRouter;
