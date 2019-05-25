var config = require('./config.js');

var process = require('process');
var path = require('path');
var express = require('express');
var app = express();
var fs = require('fs');
var url = require('url');
var nunjucks = require('nunjucks');

function getExternalFile(pathToFile) {
	return path.join(path.dirname(process.execPath), pathToFile);
}

app.get('/', function (req, res) {
	res.send('Hello World!');
});

var http = require('http');
var key = require('./keys/key.js');
var key2 = require('./keys/key2.js');

function xor(arr1, arr2) {
	var res = new Int32Array(arr1.length);
	for (var i = 0; i < arr1.length; i++) {
		res[i] = (arr1[i] ^ arr2[i]);
	}

	return res;
}


function bufferToString(arr){
	var str = "";
	for (i in arr){
		str+=String.fromCharCode(arr[i]);
	}
	return str;
}

nunjucks.configure('views', {
	autoescape: true,
	express: app
});

function decode(body, key) {
	if (body === undefined)
		return "";

	var buff = new Buffer.from(body.toString(), 'base64')
	//console.dir(buff);
	//console.dir(key);
	var r = xor(buff, key);

	return bufferToString(r);
}

function do_GET(options, callback) {
	var req_ = http.get(options, function(res_) {

		// Buffer the body entirely for processing as a whole.
		var bodyChunks = [];
		res_.on('data', function(chunk) {
			// You can process streamed parts here...
			bodyChunks.push(chunk);
		}).on('end', function() {
			var body = Buffer.concat(bodyChunks);

			callback(body, res_);
		})
	});

	req_.on('error', function(e) {
		console.log('ERROR: ' + e.message);
	});
}

app.get('/animes/:anime_id/video_online/:episode', function(req, res) {
	var anime_id = req.params.anime_id;
	var episode = req.params.episode;

	var videos_options = {
		host: config["HOST"],
		port: config["PORT"],
		path: '/api/' + anime_id + '/' + episode
	};

	var anime_options = {
		host: config["HOST"],
		port: config["PORT"],
		path: '/' + anime_id
	};

	function fallback() {
		res.render('video_template.html', {"anime_id": anime_id, "episode": episode, "anime_videos": {}, "anime_info": {}, "static": ""});
	}

	function not_found() {
		res.render('404.html');
	}

	do_GET(videos_options, function(anime_videos_body, anime_videos_res) {
		try {
			if (anime_videos_res.statusCode == 404)
				return not_found();

			var anime_videos = JSON.parse(decode(anime_videos_body, key2));
			for (kind of ["fandub", "raw", "subtitles"]) {
				for (var i = 0; i < anime_videos[kind].length; i++) {
					anime_videos[kind][i]["url"] = decode(anime_videos[kind][i].url, key);
					anime_videos[kind][i]["video_hosting"] = url.parse(anime_videos[kind][i].url).hostname;
				}
			}
			anime_videos["active_video"].url = decode(anime_videos["active_video"].url, key);
			do_GET(anime_options, function(anime_info_body, anime_info_res) {
				try {
					if (anime_info_res.statusCode == 404)
						return not_found();
					var anime_info = JSON.parse(decode(anime_info_body, key2));
					res.render('video_template.html', {"anime_id": anime_id, "episode": episode, "anime_videos": anime_videos, "anime_info": anime_info, "static": ""});
				} catch (err) {
					fallback();
					console.log(err);
				}
			});
		} catch (err) {
			fallback();
			console.log(err);
		}

	});
});

app.use(express.static(getExternalFile("public")))

app.listen(3000, "0.0.0.0", function () {
	console.log('Shikimori app listening on port 3000!');
	console.log('Serving files from ' + getExternalFile("public"));
});
