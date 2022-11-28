const axios = require("axios");
const HttpError = require('../models/http-error');
// API is here in API_KEY variable but not shown due to privacy problems

const getCoordsforAddress = async (address) => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  const data = await response.data;
  if(!data || data.status==='ZERO_RESULTS')
  {
    const error = new HttpError('could not find location for the specified address.',422);
    throw error;
  }
  const coordinates = await data.results[0].geometry.location;
  return coordinates;
};

module.exports = getCoordsforAddress;
