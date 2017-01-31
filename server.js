var express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    expressValidator = require('express-validator');

/*Set EJS template Engine*/
app.set('views','./views');
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());

/*MySql connection*/
var connection  = require('express-myconnection'),
    mysql = require('mysql');

app.use(

    connection(mysql,{
        host     : 'localhost',
        user     : 'root',
        password : '183888',
        database : 'company_db',
        debug    : false
    },'request')

);

app.get('/',function(req,res){
    res.send('Welcome');
});


//RESTful route
var router = express.Router();

router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

var dep = router.route('/departments');

//show the interface | GET
dep.get(function(req,res,next){
    req.getConnection(function(err,conn){
        if (err) return next("Cannot Connect");
        var query = conn.query('SELECT * FROM departments',function(err,rows){
            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }
            res.render('departments',{title:"Company App",data:rows});
         });
    });
});

//post data to DB | POST
dep.post(function(req,res,next){

    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('description','Description is required').notEmpty();

    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name:req.body.name,
        description:req.body.description
     };

    //inserting into mysql
    req.getConnection(function (err, conn){
        if (err) return next("Cannot Connect");
        var query = conn.query("INSERT INTO departments set ? ",data, function(err, rows){
           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }
          res.sendStatus(200);
        });
     });
});

//now for Single route (GET,DELETE,PUT)
var dep2 = router.route('/departments/:id');

dep2.all(function(req,res,next){
    console.log("You need to smth about dep2 Route ? Do it here");
    console.log(req.params);
    next();
});

//get data to update
dep2.get(function(req,res,next){
    var id = req.params.id;
    req.getConnection(function(err,conn){
        if (err) return next("Cannot Connect");
        var query = conn.query("SELECT * FROM departments WHERE id = ? ",[id],function(err,rows){
            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }

            //if departments not found
            if(rows.length < 1)
                return res.send("departments Not found");
            res.render('edit',{title:"Edit departments",data:rows});
        });
    });
});

//update data
dep2.put(function(req,res,next){
    var id = req.params.id;
    //validation
    req.assert('name','Name is required').notEmpty();
    req.assert('description','Description is required').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        res.status(422).json(errors);
        return;
    }

    //get data
    var data = {
        name:req.body.name,
        description:req.body.description
     };

    //inserting into mysql
    req.getConnection(function (err, conn){
        if (err) return next("Cannot Connect");
        var query = conn.query("UPDATE departments set ? WHERE id = ? ",[data,id], function(err, rows){
           if(err){
                console.log(err);
                return next("Mysql error, check your query");
           }
          res.sendStatus(200);
        });
     });
});

//delete data
dep2.delete(function(req,res,next){
    var id = req.params.id;
     req.getConnection(function (err, conn) {
        if (err) return next("Cannot Connect");
        var query = conn.query("DELETE FROM departments  WHERE id = ? ",[id], function(err, rows){
             if(err){
                console.log(err);
                return next("Mysql error, check your query");
             }
             res.sendStatus(200);
        });
        //console.log(query.sql);
     });
});

//apply router
app.use('/', router);

//start Server
var server = app.listen(3000,function(){
   console.log("Listening to port %s",server.address().port);
});
