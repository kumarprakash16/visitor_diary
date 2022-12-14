const HttpError = require("../models/http-error");
const fs = require("fs");
const { validationResult } = require("express-validator");
const getCoordsforAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Could not find a place with given id", 404));
  }

  if (!place) {
    return next(new HttpError("Could not find a place with given id", 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("could not able to fetch by user id", 500));
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places with given user  id", 404)
    );
  }
  res.json({ places: places.map((p) => p.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed please check your data", 422)
    );
  }
  const { title, description, address} = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsforAddress(address);
  } catch (error) {
    return next(error);
  }
  // console.log(coordinates);

  const createdPlace = new Place({
    title,
    description,
    address,
    loaction: coordinates,
    image: req.file.path,
    creator:req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    throw next(new HttpError("creating place failed try again", 500));
  }
  if (!user) {
    throw next(new HttpError("could not find user for provided id", 404));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("creating place failed try again", 500));
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed please check your data", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("something went wrong could not update", 500));
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to update this place",
      401
    );
    return next(error);
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("something went wrong2,could not update"), 500);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Something went wrong ,could not delete place", 500)
    );
  }
  if (!place) {
    return next(new HttpError("could not place for this id", 404));
  }
  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place",
      401
    );
    return next(error);
  }
  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Something went wrong ,could not delete place", 500)
    );
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ message: "Deleted ." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
