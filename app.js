// Retrieve
var fs = require("fs");
var http = require("http");
var walletRPC = require("bitcoin-core");

const walletSIGT = new walletRPC({
  host: "localhost",
  port: 33334,
  username: "",
  password: ""
});

http.createServer(function(request, response) {  
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write(fs.readFileSync("./index.html"));

	walletSIGT.getBalance(function(err, balance){
		if (err) return console.log(err);
		console.log(balance);
	});

	response.end();
}).listen(8080);
