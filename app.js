var express = require('express');
var path = require('path');
var routes = require('./routes');


var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'user',
  password : 'user',
  database : 'nodeDB'
});


var app = express();

//set up handlebars view engine
var handlebars = require('express3-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');



app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded());

app.set('port', process.env.PORT || 3000);

app.get('/', function(req,res){
	res.render('index' );
});

app.get('/GetBook', function(req,res){
	res.render('GetBook' );
});


app.get('/data', function(req, res){
	db.query("SELECT * FROM books", function(err, rows){
		if (err) console.log(err);
		
		res.send(rows);
	});
});


app.post('/data', function(req, res){
	var data = req.body;
	var mode = data["!nativeeditor_status"];
	var sid = data.gr_id;
	var tid = sid;

	var sales  = data.sales;
	var author = data.author;
	var title  = data.title;
	var price  = data.price;

	function update_response(err, result){
		if (err){
			console.log(err);
			mode = "error";
		}

		else if (mode == "inserted")
			tid = result.insertId;

		res.setHeader("Content-Type","text/xml");
		res.send("<data><action type='"+mode+"' sid='"+sid+"' tid='"+tid+"'/></data>");
	}

	if (mode == "updated")
		db.query("UPDATE books SET sales = ?, author = ?, title = ?, price = ? WHERE id = ?",
			[sales, author, title, price, sid],
			update_response);
	else if (mode == "inserted")
		db.query("INSERT INTO books(sales, author, title, price) VALUES (?,?,?,?)",
			[sales, author, title, price],
			update_response);
	else if (mode == "deleted")
		db.query("DELETE FROM books WHERE id = ?", [sid], update_response);
	else
		res.send("Not supported operation");
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.' );
});
