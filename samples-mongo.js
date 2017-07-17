
//----------------------------------------------------------

var mongodb = require( 'mongodb' );
var db      = undefined;//stores db ref. after connection

//We need to work with "MongoClient" interface in order
// to connect to a mongodb server
var mongo_client = mongodb.MongoClient;

// Connection URL.
// This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/kv_db';


// Use connect method to connect to the Server
mongo_client.connect( url, function( err, _db ){
  
  if( err ){
    console.log( 'Unable to connect to server.', err );
  }//if
  
  //HURRAY!! We are connected. :)
  console.log( 'Connection established to', url );
  
  
  //save db reference
  db = _db;
  
  //AddUsers();
  //UpdateUsers();
  //QueryUsers();
  //Cursor();
  //Delete( "58de48823ae5f22a410cb2fc" );
  Cursor();
  
  //close connection
  db.close();
} );



//add-------------------------------------------------------
function AddUsers(){
  
  var user1 = {
    name  : 'modulus admin',
    age   : 42,
    roles : ['admin', 'moderator', 'user']
  };
  var user2 = {
    name  : 'modulus user',
    age   : 22,
    roles : ['user']
  };
  var user3 = {
    name  : 'modulus super admin',
    age   : 92,
    roles : ['super-admin', 'admin', 'moderator', 'user']
  };
  
  var data = [user1, user2, user3];
  
  var collection = db.collection( 'users' );
  
  // Insert some users
  collection.insertMany( data, OnInserted );
}//AddUsers

function OnInserted( error, result ){
  
  if( error ){
    console.log( error );
  }//if
  
  console.log( 'Inserted %d documents into ' +
    'the "users" collection. The documents ' +
    'inserted with "_id" are:', result.length, result );
}//OnInserted


//update----------------------------------------------------
function UpdateUsers(){
  var collection = db.collection( 'users' );
  var selector   = { name : 'modulus user' };
  var actions    = { $set : { enabled : false } };
  
  collection.updateMany( selector, actions, OnUpdate );
}//UpdateUsers

function OnUpdate( error, upt_result ){
  if( error ){
    console.log( error );
  }else if( upt_result ){
    console.log(
      'Updated Successfully %d document(s).',
      upt_result.matchedCount );
  }else{
    console.log(
      'No document found with defined "find" criteria!' );
  }
}//OnUpdate


//query-----------------------------------------------------
function QueryUsers(){
  
  var collection = db.collection( 'users' );
  var selector   = { name : 'modulus user' };
  
  collection.find( selector ).toArray( OnQuery );
}//UpdateUsers

function OnQuery( error, result ){
  if( error ){
    console.log( error );
  }else if( result.length ){
    console.log( 'Found:', result );
  }else{
    console.log( 'No document(s) found with defined ' +
      '"find" criteria!' );
  }//else
}//OnQuery

//cursor----------------------------------------------------
function Cursor(){
  
  var collection = db.collection( 'users' );
  
  //var selector = { name : 'modulus user' };
  //var selector = { roles : { $in : ['admin'] } };
  var selector = {};
  
  //We have a cursor now with our find criteria
  var cursor = collection.find( selector );
  
  //We need to sort by age descending
  cursor.sort( { age : -1 } );
  
  //Limit to max 10 records
  cursor.limit( 10 );
  
  //Skip specified records. 0 for skipping 0 records.
  cursor.skip( 0 );
  
  //Lets iterate on the result
  cursor.forEach( function( err, doc ){
    
    console.log( '\n' );
    
    if( err ){
      console.log( err );
    }else{
      console.log( '--||--' );
      //console.log( 'Fetched:', doc );
      //console.log( '--||--' );
    }//if
  } );//foreach
  
  
}//Cursor

//delete----------------------------------------------------
function Delete( id ){
  
  console.log( '\n[Delete]:\n' );
  
  
  var collection = db.collection( 'users' );
  
  var item = { _id : new mongodb.ObjectID( id ) };
  
  collection.deleteOne( item, OnDelete );
}//Delete

function OnDelete( error, results ){
  if( error ){
    console.log( "failed" );
    throw error;
  }
  console.log( "OnDelete: success" );
}