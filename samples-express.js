
var express = require( 'express' );

//----------------------------------------------------------

var app = express();

app.get( '/', function( req, res ){
  res.send( 'Hello World and Debug' );
} );

app.get( '/tpu', function( req, res ){
  res.send( 'This is a TPU!' );
} );


var server = app.listen( 3000, function(){
  var host = server.address().address;
  var port = server.address().port;
  
  console.log("address "+ server.address());
  console.log("host "+ host);
  console.log("port "+ port);
  
  console.log(
    "Example app listening at http://%s:%s", host, port )
} );