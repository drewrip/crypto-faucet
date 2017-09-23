// Retrieve
var fs = require("fs");
var http = require("http");
var coind = require("node-coind");

var client = new coind.Client({
	host: "localhost",
	port: ,
	user: "",
	pass: ""
});

function newDeposit(fromAddr, amt){
	db.addresses.insert({from: fromAddr, amount: amt})
}
http.createServer(function(request, response) {  
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write(fs.readFileSync("./index.html"));
	$ = cheerio.load(html);
	client.cmd('getbalance', '*', 6, function(err, balance){
		if (err) return console.log(err);
		console.log(balance);
	});
	client.cmd("getaddress", function(err, serverAddr){
		if (err) return console.log(err);
			console.log(serverAddr);
	});

	response.end();
}).listen(8080);