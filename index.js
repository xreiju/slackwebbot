/*
Copyright 2017 Reiju

Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to the following 
conditions:

The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR 
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var RtmClient = require("@slack/client").RtmClient;
var WebClient = require("@slack/client").WebClient;
var RTM_EVENTS = require("@slack/client").RTM_EVENTS;
var webshot = require("webshot");
var fs = require("fs");
var Entities = require("html-entities").AllHtmlEntities;

var token = process.env.SLACK_API_TOKEN || "";
var rtm = new RtmClient(token, {logLevel: "normal"});
var web = new WebClient(token);
rtm.start();

entities = new Entities();

var prefix="reiju:"
var regex = /.*?\<(.+?)[|\>].*/

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
	//var message = {text: "reiju: <https://google.com>"};
	console.log(message.text);
	if(!message.text) return;
	try {
		url = message.text.match(regex);
	} catch(e) {
		//web.chat.postMessage(message.channel, "Error: 文字列関係がア！", {as_user: true}, function(err, res) {
			console.log(e);
		//});
	}
	if (url) {
		//console.log(url[0].indexOf("reiju:"));
		if(url[0].indexOf("reiju:") != -1) {
			//console.log("match! ", url[1]);
			var filePath = __dirname+"/img/"+Date.now()+".png";
			var urlstr = entities.decode(url[1]);
			
			const promise = new Promise((resolve, reject) => {
				webshot(urlstr, filePath, {
					shotSize: {width: "all", height: "all"}, renderDelay: 3*1000,
					userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
					defaultWhiteBackground: true, quality: 100, timeout: 15*1000
				}, function(err) {
					if(err) {
						web.chat.postMessage(message.channel, "PhantomJSが限界になった(error)", {as_user: true}, function(err, res) {
							if(err) console.log(err);
						});
						console.log(err);
						reject();
					}
					resolve();
				});
			});
			promise.then(() => web.files.upload("phantom: "+urlstr, {file: fs.createReadStream(filePath), channels: message.channel, 
title: "PhantomJS: "+urlstr}, function handleStreamFileUpload(err, res) {
				if(err) console.log(err);
			}));
		}
	}
});
