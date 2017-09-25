// Retrieve
var fs = require("fs");
var http = require("http");
var walletRPC = require("bitcoin-core");
var express = require("express");
var bodyParser = require('body-parser');
var path = require("path")
var rateLimit = require('express-rate-limit');
var request = require('request');

var app = express();
var config = require("./config.json");

var sent = "none";
var message = "";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var limiter = new rateLimit({
  windowMs: 60*60*1000, // 1 hour 
  max: 1,
  onLimitReached: function(req, res, options){
    sent = "timeout";
    message = "Come back in 1 hour to claim again!";
    res.redirect("/");
  }
});

const walletSIGT = new walletRPC({
  host: config.rpcHost,
  port: config.rpcPort,
  username: config.rpcUsername,
  password: config.rpcPassword
});

app.use("/sendAddress", limiter);
app.set('views', './views');
app.set('view engine', 'ejs');

app.get("/", function(req, res){
  walletSIGT.getBalance(function(err, bal){
    walletSIGT.getAccountAddress(config.walletAccount, function(err, addr){
      res.render('index', {apiKey: config.googleCaptchaApiKey, faucetBalance: bal, faucetAddress: addr, sentStatus: sent, statusMessage: message});
      sent = "none";
      message = "";
    });
  });
});

app.post("/sendAddress", function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  console.log("Sending SIGT to address " + req.body.userAddress);
   if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
  }
  // Put your secret key here.
  var secretKey = config.googleCaptchaApiSecret;

  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(error,response,body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
    }
  });
  walletSIGT.sendToAddress(req.body.userAddress, config.faucetRate);
  if(req.rateLimit.statusCode != 429){
    sent = "sent";
    message = "SIGT has been sent!";
  }
  res.redirect("/");
});

app.listen(8080);
