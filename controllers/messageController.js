const prisma = require("../lib/prisma");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const supabase = require("../config/supabaseClient");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit to 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only .png and .jpg allowed!"), false);
    }
  },
});

const validateMessage = [
  body("body")
    .trim()
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
    upload.single("imgMsg"),
    validateMessage,

    async (req, res) => {
      console.log(req.file);
      let urlData = null;
      if (req.file) {
        const file = req.file;
        const filePath = `chat_images/${Date.now()}-${file.originalname}`;

        const { data, error } = await supabase.storage
          .from("uploaded_files")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });
        if (error) {
          console.error("Supabase Upload Error:", error);
          throw error; // This will jump to your catch block
        }
        urlData = supabase.storage
          .from("uploaded_files")
          .getPublicUrl(data.path);
        if (error) throw error;
      }
      const { body } = matchedData(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const receiver = await prisma.user.findUnique({
          where: { username: req.params.username },
        });
        const newMessage = await prisma.message.create({
          data: {
            body: body,
            senderId: req.user.id,
            receiverId: Number(receiver.id),
            imageUrl: urlData.data.publicUrl,
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
