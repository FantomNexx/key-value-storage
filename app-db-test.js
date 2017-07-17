//----------------------------------------------------------
//ENTRY
{
   OnAppStarted();
   
   process.title = 'T:APP-DB-TEST';
   process.name = 'N:APP-DB-TEST';
   process.on( 'exit', OnAppEnded );


   //-------------------------------------------------------
   function OnAppStarted(){
      //clear screen
      process.stdout.write( '\u001b[2J\u001b[0;0H' );
      console.log( '[app-db-test] OnAppStarted()' );
   }//OnAppStarted
   //-------------------------------------------------------
   function OnAppEnded(){
      console.log( '\n' );
      console.log( '[app-db-test] OnAppEnded()' );
      console.log( '\n' );
      
      fdb.Kill();
   }//OnAppEnded
   //-------------------------------------------------------
   
}//ENTRY


//----------------------------------------------------------
//EXTERNALS
{
   var http = require( 'http' );
   var path = require( 'path' );
   var fs = require( 'fs' );
   
   //log with a timestamp
   var log = require( './log.js' );
   
   //mongo db wrapper
   var FDB = require( './fdb.v2.js' );
}//EXTERNALS


//----------------------------------------------------------
//INITIALIZATIONS

//----------------------------------------------------------
//constants
//----------------------------------------------------------
{
   var LOG_TAG = '[app-db-test.js]:';
   
   var STATUS_CODE = {
      OK       : 200,
      NOT_FOUND: 404
   };//STATUS_CODE
   
   var REQUEST_METHOD = {
      POST: 'POST',
      GET : 'GET'
   };//REQUEST_METHOD
   
   var CONTENT_TYPES = {
      HTML      : { 'Content-Type': 'text/html' },
      CSS       : { 'Content-Type': 'text/css' },
      JAVASCRIPT: { 'Content-Type': 'application/javascript' },
      TEXT      : { 'Content-Type': 'text/plain' },
      JSON      : { 'Content-Type': 'application/json' }
   };//CONTENT_TYPES
}
//----------------------------------------------------------


//----------------------------------------------------------
//connect to mongo database
//----------------------------------------------------------
var db_connection_url = 'mongodb://localhost:27017/kv_db';
var fdb = new FDB();
fdb.Init( db_connection_url );
//----------------------------------------------------------


//----------------------------------------------------------
//init request handlers
//----------------------------------------------------------
function GetRequestHandlers(){
   var request_handlers = {};
   
   request_handlers[ '/collection-create' ] = CollectionCreate;
   request_handlers[ '/collection-names-get' ] = CollectionNamesGet;
   request_handlers[ '/collection-data-get' ] = CollectionDataGet;
   request_handlers[ '/collection-data-insert' ] = CollectionDataInsert;
   request_handlers[ '/collection-data-find' ] = CollectionDataFind;
   request_handlers[ '/collection-drop' ] = CollectionDrop;
   request_handlers[ '/receive-request' ] = ReceiveRequest;
   
   return request_handlers;
}//GetRequestHandlers
//----------------------------------------------------------
var request_handlers = GetRequestHandlers();
//----------------------------------------------------------


//----------------------------------------------------------
//start web server
http.createServer( OnRequest ).listen( 3000 );
//----------------------------------------------------------
function OnRequest( request, response ){
   //if( request.method === REQUEST_METHOD.GET ){}
   log( LOG_TAG, request.url );
   
   var request_params = {
      request_obj       : request,
      response_obj      : response,
      callback_on_result: Respond_Result
   };//params
   
   if( request_handlers[ request.url ] === undefined ){
      //if the request has no handler
      Respond_WrongRequest( response );
      return;
   }//if
   
   var RequestHandler = request_handlers[ request.url ];
   Request_GetData( request_params, RequestHandler );
}//OnRequest
//----------------------------------------------------------


//----------------------------------------------------------
function Respond_WrongRequest( response ){
   var status_code = STATUS_CODE.NOT_FOUND;
   var content_type = CONTENT_TYPES.TEXT;
   var response_msg = '404 Wrong request';
   
   response.writeHead( status_code, content_type );
   response.end( response_msg );
}//Respond_WrongRequest
//----------------------------------------------------------
function Respond_Result( request_params ){
   var status_code = STATUS_CODE.OK;
   var content_type = CONTENT_TYPES.JSON;
   var response_msg = JSON.stringify( request_params.response_data );
   
   request_params.response_obj.writeHead( status_code, content_type );
   request_params.response_obj.end( response_msg );
}//Respond_Result
//----------------------------------------------------------

//----------------------------------------------------------
function Request_GetData( request_params, callback ){
   
   var request_data_json = '';
   
   var OnDataGoing = function( data_chunk ){
      request_data_json += data_chunk;
   };//OnDataGoing
   
   var OnDataReceived = function(){
      
      try{
         request_params.request_data = JSON.parse( request_data_json );
      }catch( exception ){
         request_params.request_data = {};
      }//try
      
      callback( request_params );
   };//OnDataGoing
   
   request_params.request_obj.on( 'data', OnDataGoing );
   request_params.request_obj.on( 'end', OnDataReceived );
}//ReceiveRequest
//----------------------------------------------------------


//----------------------------------------------------------
function CollectionCreate( request_params ){
   
   request_params.collection_name = 'fantom_keys';
   request_params.collection_index_field = 'title';
   
   fdb.CollectionCreate( request_params );
}//CollectionCreate
//----------------------------------------------------------
function CollectionDataGet( request_params ){
   
   request_params.collection_name = 'fantom_keys';
   
   fdb.CollectionDataGet( request_params );
}//CollectionDataGet
//----------------------------------------------------------
function CollectionDataInsert( request_params ){
   
   var data = [
      { title: 'man', description: 1 },
      { title: 'people', description: 2 }
   ];//collection_data
   
   request_params.collection_name = 'fantom_keys';
   request_params.data = data;
   
   fdb.CollectionDataInsert( request_params );
}//CollectionDataInsert
//----------------------------------------------------------
function CollectionDataFind( request_params ){
   
   request_params.collection_name = 'fantom_keys';
   request_params.collection_filter = { 'title': 'mn' };
   
   fdb.CollectionDataGet( request_params );
}//CollectionDataFind
//----------------------------------------------------------
function CollectionDrop( request_params ){
   
   request_params.collection_name = 'fantom_keys';
   
   fdb.CollectionDrop( request_params );
}//CollectionCreate
//----------------------------------------------------------
function CollectionNamesGet( request_params ){
   
   fdb.CollectionNamesGet( request_params );
}//CollectionNamesGet
//----------------------------------------------------------
function ReceiveRequest( request_params ){
   
   request_params.response_data = request_params.request_data;
   
   Respond_Result( request_params );
}//ReceiveRequest

