const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');


const app = express();
app.set('port', process.env.PORT || 5000);

app.use(morgan('dev'));

app.get('/item/list', (req, res, next) => {
	var connection = mysql.createConnection({
		host    :'localhost',
		port : 3306,
		user : 'root',
		password : '',
		database:'cyberadam'
	});
	connection.connect(function(err) {
		if (err) {
			console.log('mysql connection error');
			console.log(err);
			throw err;
		}
	});
	
	const pageno = req.query.pageno;
	const count = req.query.count;

	var start = 0
	var size = 5
	if(pageno != undefined){
		start = (pageno - 1) * count
		size = parseInt(count)
	}
	
	console.log(start)
	console.log(count)
	
	var list;
	connection.query('SELECT * FROM goods order by itemid desc limit ?, ?', [start, size], function(err, results, fields) {
		if (err)
			throw err;
		console.log(results);
		list = results;

	});

	connection.query('SELECT count(*) cnt FROM goods', function(err, results, fields) {
		if (err)
			throw err;
		res.json({'count':results[0].cnt, 'list':list}); 

	});
	connection.end();
});

app.get('/item/date', (req, res, next) => {
	fs.readFile('./update.txt', function (err, data) { 
		res.json({'result':data.toString()}); 
	});
});


app.get('/item/detail', (req, res, next) => {
	var connection = mysql.createConnection({
		host    :'localhost',
		port : 3306,
		user : 'root',
		password : '',
		database:'cyberadam'
	});
	connection.connect(function(err) {
		if (err) {
			console.log('mysql connection error');
			console.log(err);
			throw err;
		}
	});
	const itemid = req.query.itemid;
	console.log(itemid)
	connection.query('SELECT * FROM item where itemid = ?', itemid, function(err, results, fields) {
		if (err)
			throw err;
		console.log(results);
		if(results.length == 0){
			res.json({'result':false}); 
		}else{
			res.json({'result':true, 'item':results[0]}); 
		}

	});
	connection.end();
});

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 


app.get('/item/date', (req, res, next) => {
	fs.readFile('./update.txt', function (err, data) { 
		res.rander({'result':data.toString()}); 
	});
});

app.post('/item/delete', (req, res, next) => {
	var connection = mysql.createConnection({
		host    :'localhost',
		port : 3306,
		user : 'root',
		password : '',
		database:'cyberadam'
	});
	connection.connect(function(err) {
		if (err) {
			console.log('mysql connection error');
			console.log(err);
			throw err;
		}
	});
	const itemid = req.body.itemid;
	console.log(itemid)
	connection.query('delete FROM goods where itemid = ?', itemid, function(err, results, fields) {
		if (err)
			throw err;
		console.log(results)
		if(results.affectedRows == 1){
			const writeStream = fs.createWriteStream('./update.txt');
			writeStream.write(Date.now().toString());
			writeStream.end();
			res.json({'result':true}); 
		}else{
			res.json({'result':false}); 
		}
	});
	connection.end();
});

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.get('/item/delete', (req, res, next) => {
	res.render('delete'); 
});


try {
	fs.readdirSync('img');
} catch (error) {
	console.error('img 폴더가 없어 img 폴더를 생성합니다.');
	fs.mkdirSync('img');
}

const upload = multer({
	storage: multer.diskStorage({
		destination(req, file, done) {
			done(null, 'img/');
		},
		filename(req, file, done) {
			const ext = path.extname(file.originalname);
			done(null, path.basename(file.originalname, ext) + Date.now() + ext);
		},
	}),
	limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/item/insert', upload.single('pictureurl'), (req, res, next) => {
	

	const itemname = req.body.itemname;
	const description = req.body.description;
	const price = req.body.price;
	var pictureurl;
	if(req.file){
		pictureurl = req.file.filename
	}else{
		pictureurl = "default.jpg";
	}	
	
	var connection = mysql.createConnection({
		host    :'localhost',
		port : 3306,
		user : 'root',
		password : '',
		database:'cyberadam'
	});
	connection.connect(function(err) {
		if (err) {
			console.log('mysql connection error');
			console.log(err);
			throw err;
		}
	});
	
	connection.query('select max(itemid) maxid from goods', function(err, results, fields) {
		if (err)
			throw err;
		var itemid;
		if(results.length > 0){
			itemid = results[0].maxid + 1
		}else{
			itemid = 1;
		}	
		
		var date = new Date()
		var year = date.getFullYear();
        var month = (1 + date.getMonth());
        month = month >= 10 ? month : '0' + month;
        var day = date.getDate();
        day = day >= 10 ? day : '0' + day;
        
        var hour = date.getHours();
        hour = hour >= 10 ? hour : '0' + hour;
        var minute = date.getMinutes();
        minute = minute >= 10 ? minute : '0' + minute;
        var second = date.getSeconds();
        second = second >= 10 ? second : '0' + second;
        
		connection.query('insert into goods(itemid, itemname, price, description, pictureurl, updatedate) values(?,?,?,?,?,?)', 
				[itemid, itemname, price, description, pictureurl,  year + '-' + month + '-' + day], function(err, results, fields) {
			if (err)
				throw err;
			console.log(results)
			if(results.affectedRows == 1){
				const writeStream = fs.createWriteStream('./update.txt');
				writeStream.write(year + '-' + month + '-' + day + " " + hour + ":" + minute + ":" + second);
				writeStream.end();

				res.json({'result':true}); 
			}else{
				res.json({'result':false}); 
			}
		});
	});
});

app.get('/item/insert', (req, res, next) => {
	res.render('insert'); 
});


//파일 다운로드
var util = require('util')
var mime = require('mime')

app.get('/img/:fileid', function(req, res){
		var fileId = req.params.fileid;
		var file = '/Users/mac/Documents/source/node/nodemysql/img' + '/' + fileId;
		console.log("file:" + file);
		mimetype = mime.lookup(fileId);
		console.log("file:" + mimetype);
		res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
		res.setHeader('Content-type', mimetype);
		var filestream = fs.createReadStream(file);
		filestream.pipe(res);
});



app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send(err.message)
});

app.listen(app.get('port'), () => {
	console.log(app.get('port'), '번 포트에서 대기 중');
});
