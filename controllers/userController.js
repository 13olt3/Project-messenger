const prisma = require("../lib/prisma");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

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
};

module.exports = userController;
