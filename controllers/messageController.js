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
  getContacts: [
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const contacts = await prisma.user.findMany({
          where: {
            OR: [
              {
                receivedMessages: {
                  some: { senderId: Number(req.user.id) },
                },
              },
              {
                sentMessages: {
                  some: { receiverId: Number(req.user.id) },
                },
              },
            ],
          },
          select: {
            id: true,
            username: true,
            profile: {
              select: { profilePic: true },
            },
          },
        });
        // this prisma query finds all the users that this user has either sent to or received a message from
        // console.log(contacts);
        res.status(201).json(contacts);
      } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
  ],
  getMessages: [
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const receiverUsername = req.params.username;
        const messageData = await prisma.message.findMany({
          where: {
            OR: [
              {
                sender: { username: req.user.username },
                receiver: { username: receiverUsername },
              },
              {
                sender: { username: receiverUsername },
                receiver: { username: req.user.username },
              },
            ],
          },
          orderBy: {
            time: "asc",
          },
          include: {
            sender: {
              select: { username: true },
            },
          },
        });
        console.log(messageData);
        res.status(201).json(messageData);
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
