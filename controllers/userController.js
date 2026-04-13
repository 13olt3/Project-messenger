const prisma = require("../lib/prisma");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const supabase = require("../config/supabaseClient");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const validateUser = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage(`Email is not a valid email input, try again.`),
  body("password").isLength({ min: 1 }),
  body("confirmPw")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];
const validateLogin = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").isLength({ min: 1 }),
];

const userController = {
  createUser: [
    validateUser,
    async (req, res) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      try {
        const { username, email, password } = matchedData(req);
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
          data: {
            username: username,
            password: hashedPassword,
            email: email,
            profile: {
              create: {
                bio: "Hello, new user here!",
                profilePic: "default",
              },
            },
          },
        });
        return res.status(201).json({ message: "User created!" });
      } catch (err) {
        console.error(err);
      }

      return res.status(500).json({ message: "Internal Server Error" });
      //Use this (error500) if you don't know what caused the error.
    },
  ],

  loginUser: [
    validateLogin,
    async (req, res) => {
      const data = matchedData(req);
      const userMatch = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (!userMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const pwMatch = await bcrypt.compare(data.password, userMatch.password);
      if (!pwMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ id: userMatch.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ message: "successful", token: token });
    },
  ],

  getUser: [
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      const username = req.params.username;
      const data = await prisma.user.findUnique({
        where: { username: username },
        include: { profile: true },
      });
      // console.log(data);
      res.json(data);
    },
  ],

  getUsers: [
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      try {
        const data = await prisma.user.findMany();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
  ],

  uploadPic: [
    passport.authenticate("jwt", { session: false }),
    upload.single("profilePic"),
    async (req, res) => {
      console.log(req.body);
      console.log(req.file);
      try {
        if (!req.file) return res.status(400).send("No file uploaded.");
        const file = req.file;
        const filePath = `profile_pics/${Date.now()}-${file.originalname}`;

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
        const downloadUrl = supabase.storage
          .from("uploaded_files")
          .getPublicUrl(data.path);
        if (error) throw error;

        console.log(downloadUrl);
        res.status(200).json("upload successful");
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
  ],
};
//passport.authenticate('jwt', { session: false }),
module.exports = userController;
