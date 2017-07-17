//----------------------------------------------------------
//ENTRY
{
   OnAppStarted();
   
   process.title = 'T:K-V-STORAGE';
   process.name = 'N:K-V-STORAGE';
   process.on( 'exit', OnAppEnded );
   
   //-------------------------------------------------------
   function OnAppStarted(){
      process.stdout.write( '\u001b[2J\u001b[0;0H' );
      console.log( '[app.js] OnAppStarted()' );
   }//OnAppStarted
   //-------------------------------------------------------
   function OnAppEnded(){
      console.log( '\n' );
      console.log( '[app.js] OnAppEnded()' );
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
{
   var LOG_TAG = '[app.js]:';
   
   var FILE_TYPE_REGEXP = {
      CSS       : /.css$/,
      JAVASCRIPT: /.js$/,
      HTML      : /.html$/
   };//FILE_TYPE_REGEXP
   
   
   var STATUS_CODE = {
      OK         : 200,
      BAD_REQUEST: 400,
      NOT_FOUND  : 404
   };//STATUS_CODE
   
   var CONTENT_TYPES = {
      HTML      : { 'Content-Type': 'text/html' },
      CSS       : { 'Content-Type': 'text/css' },
      JAVASCRIPT: { 'Content-Type': 'application/javascript' },
      TEXT      : { 'Content-Type': 'text/plain' },
      JSON      : { 'Content-Type': 'application/json' }
   };//CONTENT_TYPES
}//constants
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
   
   request_handlers[ '/notes-create' ] = NotesCreate;
   request_handlers[ '/notes-drop' ] = NotesDrop;
   request_handlers[ '/notes-drop-one' ] = NotesDropOne;
   request_handlers[ '/notes-add-many' ] = NotesAddMany;
   request_handlers[ '/notes-get-all' ] = NotesGetAll;
   request_handlers[ '/notes-find' ] = NotesFind;
   request_handlers[ '/notes-update-one' ] = NotesUpdateOne;
	
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
   
   log( LOG_TAG, request.url );
   
   var request_params = {
      request_obj       : request,
      response_obj      : response,
      callback_on_result: Respond_Result
   };//params
   
   if( request_handlers[ request.url ] === undefined ){
      //if the request has no handler
      ProcessWebpageFiles( request, response );
      return;
   }//if
   
   var RequestHandler = request_handlers[ request.url ];
   Request_GetData( request_params, RequestHandler );
}//WebServer
//----------------------------------------------------------
function ProcessWebpageFiles( request, response ){
   
   var file_path = '';
   var file_encoding = 'UTF-8';
   
   if( request.url === '/' ){
      file_path = './public/demo.html';
      fs.readFile( file_path, file_encoding, function( error, data ){
         OnFileRead( error, data, CONTENT_TYPES.HTML, response );
      } );
      return;
   }//if root
   
   file_path = path.join( './public', request.url );
   
   for( var ftype in FILE_TYPE_REGEXP ){
      if( !FILE_TYPE_REGEXP.hasOwnProperty( ftype ) ){
         continue;
      }//if
      
      if( request.url.match( FILE_TYPE_REGEXP[ ftype ] ) ){
         fs.readFile( file_path, file_encoding, function( error, data ){
            OnFileRead( error, data, CONTENT_TYPES[ ftype ], response );
         } );
         return;
      }//if match
   }//for
   
   Respond_WrongRequest( request, response );
}//ProcessWebpageFiles
//----------------------------------------------------------
function OnFileRead( error, data, type, response ){
   
   if( error !== null ){
      response.writeHead(
         STATUS_CODE.BAD_REQUEST, CONTENT_TYPES.TEXT );
      response.end( data );
      return;
   }//if
   
   response.writeHead( STATUS_CODE.OK, type );
   response.end( data );
}//OnFileRead
//----------------------------------------------------------


//----------------------------------------------------------
function Respond_WrongRequest( request, response ){
	
   var status_code = STATUS_CODE.NOT_FOUND;
   var content_type = CONTENT_TYPES.TEXT;
   var response_msg = '404 Wrong request';
   
   response.writeHead( status_code, content_type );
   response.end( response_msg );
}//Respond_WrongRequest
//----------------------------------------------------------
function Respond_Result( request_params ){
	
	request_params.response_data.request_url =
		request_params.request_obj.url;
	
   var status_code = STATUS_CODE.OK;
   var content_type = CONTENT_TYPES.JSON;
   var response_msg = JSON.stringify( request_params.response_data );
   
   request_params.response_obj.writeHead( status_code, content_type );
   request_params.response_obj.end( response_msg );
}//Respond_Result
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
function NotesCreate( request_params ){
   fdb.CollectionCreate( request_params );
}//NotesCreate
//----------------------------------------------------------|
function NotesDrop( request_params ){
   fdb.CollectionDrop( request_params );
}//NotesDrop
//----------------------------------------------------------|
function NotesDropOne( request_params ){
   fdb.CollectionDropOne( request_params );
}//NotesDropOne
//----------------------------------------------------------
function NotesAddMany( request_params ){
   fdb.CollectionDataInsert( request_params );
}//NotesAddMany
//----------------------------------------------------------
function NotesGetAll( request_params ){
   fdb.CollectionDataGet( request_params );
}//NotesGetAll
//----------------------------------------------------------
function NotesFind( request_params ){
   fdb.CollectionDataGet( request_params );
}//NotesGetAll
//----------------------------------------------------------
function NotesUpdateOne( request_params ){
   fdb.CollectionUpdateOne( request_params );
}//NotesGetAll
//----------------------------------------------------------







