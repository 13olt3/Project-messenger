const prisma = require("../lib/prisma");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const validateMessage = [
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Message must have a body.")
    .isLength({ max: 500 })
    .withMessage("Message is too long (max 500 chars)"),
];

const messageController = {
  getMessages: [
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const allMessages = await prisma.message.findMany({
          where: { senderId: req.user.id },
        });
        res.status(201).json(allMessages);
      } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
  ],

  sendMessage: [
    passport.authenticate("jwt", { session: false }),
    validateMessage,
    async (req, res) => {
      const { body } = matchedData(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const receiverId = req.params.id;
        const newMessage = await prisma.message.create({
          data: {
            body: body,
            senderId: req.user.id,
            receiverId: Number(receiverId),
          },
        });
        res.status(201).json(newMessage);
      } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
  ],
};

//passport.authenticate('jwt', { session: false }),

module.exports = messageController;
