const axios = require("axios");

axios
  .post("http://localhost:3000/api/webhook/123", {})
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
