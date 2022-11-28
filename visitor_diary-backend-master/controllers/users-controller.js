const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    throw next(new HttpError("could not fetch users", 500));
  }
  res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};
const signup = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("please enter valid details", 422));
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Signinig up failed ,please try again", 500));
  }
  if (existingUser) {
    return next(new HttpError("User exist already,please login", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("could not create user,please try again.", 500);
    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Signing up failed ,please try again", 500));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "secret_string",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Signing up failed ,please try again", 500));
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Logging up failed ,please try again", 500));
  }
  if (!existingUser) {
    return next(new HttpError("invalid credential could not log you in"), 403);
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in,please checck ypur credential",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    return next(new HttpError("invalid credential could not log you in"), 403);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "secret_string",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Login in failed ,please try again", 500));
  }

  res.json({
    userId:existingUser.id,
    email:existingUser.email,
    token:token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
