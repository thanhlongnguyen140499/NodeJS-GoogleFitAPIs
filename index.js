const express = require("express");
const app = express();
const port = 6868;
const { google } = require("googleapis");
const request = require("request");
const cors = require("cors");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const axios = require("axios");
const get = require("lodash/get");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// // link to redirect to
// "http://localhost:6868/caloriesBurned"

app.get("/getURLTing", (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    // clientId
    "726635518103-c1mn3auqoahbskvqn8imfl4d77jo68ff.apps.googleusercontent.com",
    // client secret
    "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",
    "http://localhost:6868/caloriesBurned"
    // "https://google.com"
  );
  const scopes = [
    "https://www.googleapis.com/auth/fitness.activity.read profile email openid",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state: JSON.stringify({
      //   callbackUrl: req.body.callbackUrl,
      //   userID: req.body.userid,
    }),
  });

  request(url, (err, resp, body) => {
    console.log("error: ", err);
    console.log("statusCode: ", resp && resp.statusCode);
    res.send({ url });
  });

  //   console.log("url: ", url);
  //   console.log("req.url 1: ", req.url);
});

app.get("/caloriesBurned", async (req, res) => {
//   const queryURL = new urlParse(req.url);
//   const code = queryParse.parse(queryURL.query).code;

//   const oauth2Client = new google.auth.OAuth2(
//     // clientId
//     "726635518103-c1mn3auqoahbskvqn8imfl4d77jo68ff.apps.googleusercontent.com",
//     // client secret
//     "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",
//     "http://localhost:6868/caloriesBurned"
//     // "https://google.com"
//   );

//   const tokens = await oauth2Client.getToken(code);
//   console.log("result: ", tokens.tokens.access_token);

    const token = get(req, "body", "");
    console.log("accessToken: ", token.access_token);

  try {
    const result = await axios({
      method: "POST",
      headers: {
        // authorization: "Bearer " + tokens.tokens.access_token,
        // authorization: "Bearer " + "ya29.a0ARrdaM8yEog1X6iRTk2cqoJoImUNidyBN4OSrXrRWNEfbLEzmbA8a6HUpHmH2adKdd_bmztAnPFaivpotQPghcmmLGrzKn7gjEHDXsJQ-DwPJKya0QyJkG3Z2gAuOl_loGA21uT8FMK8BO2gnZH56hHwqorp",
        authorization: "Bearer " + token.access_token,
      },
      "Content-Type": "application/json",
      url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      data: {
        aggregateBy: [
          {
            dataTypeName: "com.google.calories.expended",
            dataSourceId:
              "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended",
          },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: 1636477210000,
        endTimeMillis: 1638239326798,
      },
    });

    // console.log("result: ", result);
    // res.send(result.data);
    res.send(result.data);
  } catch (error) {
    console.log("error: ", error);
  }
});

app.listen(port, () => console.log("GOOGLE FIT IS LISTENING ON PORT : ", port));
