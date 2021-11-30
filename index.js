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

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// // link to redirect to
// "http://localhost:6868/caloriesBurned"

app.get("/getURLTing", (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    // clientId
    "443144746825-h4008kcfhk8appnb2oedd8s4b0upklba.apps.googleusercontent.com",
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

  console.log("url: ", url);
  console.log("req.url 1: ", req.url);
});

app.get("/caloriesBurned", async (req, res) => {
  console.log("req.url: ", req.url);
  const queryURL = new urlParse(req.url);
  console.log("queryURL: ", queryURL);
  const code = queryParse.parse(queryURL.query).code;

  const oauth2Client = new google.auth.OAuth2(
    // clientId
    "443144746825-h4008kcfhk8appnb2oedd8s4b0upklba.apps.googleusercontent.com",
    // client secret
    "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",
    "http://localhost:6868/caloriesBurned",
    // "https://google.com"
  );

  const tokens = await oauth2Client.getToken(code);

  try {
    const result = await axios({
      method: "POST",
      headers: {
        authorization: "Bearer " + tokens.tokens.access_token,
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
        startTimeMillis: 1637859610000,
        endTimeMillis: 1638176933227,
      },
    });

    res.send(result.data);
  } catch (error) {
    console.log("error: ", error);
  }
});

app.listen(port, () => console.log("GOOGLE FIT IS LISTENING ON PORT : ", port));
