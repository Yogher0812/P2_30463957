var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log['asdasd']
  res.render('index', {
     title: 'Informacion Personal',
     FirstName : 'Yogher Jose',
     LastName : 'Corrales Dominguez',
     Id : '30463957',
     Section : '4'
     });
});

module.exports = router;
