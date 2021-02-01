const express = require('express');
//먼저 아래와 같이 mysql 모듈을 로딩
var mysql = require('mysql');
const router = express.Router();

//GET / 라우터
router.get('/', (req, res) => {
	//다음 로딩된 모듈로부터 Connection 객체를 생성
	//이 때 실제적인 Connection 연결은 이루어지지 않는다. 
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
	console.log(connection);
	res.render('index', {connection:connection});

	/*
    connection.query('CREATE TABLE family (id INT(3) AUTO_INCREMENT, name VARCHAR(20), PRIMARY KEY(id))engine=InnoDB DEFAULT CHARSET=utf8');

    connection.query('INSERT INTO family (name) VALUES (?)', "을지문덕");
    connection.query('INSERT INTO family (name) VALUES (?)', "강감찬");
    connection.query('INSERT INTO family (name) VALUES (?)', "윤관");
    connection.query('INSERT INTO family (name) VALUES (?)', "권율");
	 */

	connection.query('SELECT * FROM family', function(err, results, fields) {
		if (err)
			throw err;
		console.log(JSON.stringify(results));

		for(idx = 0; idx < results.length; idx++){
			console.log(results[idx].id);
		}

	});


	connection.end();
});

module.exports = router;
