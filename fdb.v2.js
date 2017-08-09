//----------------------------------------------------------
//EXTERNALS
{
	var mongodb   = require( 'mongodb' );
	var log       = require( './log.js' );
	var IsEmpty   = require( './is-empty.js' );
	var ResultObj = require( './result-obj.js' );
}

//----------------------------------------------------------
//INITIALIZATIONS

//result obj is used to wrap a result of query requests
var result_obj = new ResultObj();

//constants
var LOG_TAG = '[fdb.js]:';


//----------------------------------------------------------
function FDB(){
	
	var db;
	
	//-------------------------------------------------------
	this.Init = function( db_connection_url ){
		
		mongodb.MongoClient.connect(
			db_connection_url, OnDBConnected );
	};//Init
	//-------------------------------------------------------
	function OnDBConnected( error, db_reference ){
		
		if( error ){
			log( LOG_TAG, 'DB connect failed.', error );
			return;
		}//if
		
		log( LOG_TAG, 'DB connect OK.' );
		
		//save db reference
		db = db_reference;
	}//OnDBConnected
	//-------------------------------------------------------
	this.Kill = function(){
		
		if( db === undefined ){
			return;
		}//if
		
		//close connection
		db.close();
	};//Kill
	//-------------------------------------------------------
	
	
	//-------------------------------------------------------
	/** @returns {boolean}*/
	function CollectionIsExist( collection_name, callback_on_result ){
		
		db.listCollections( { name : collection_name } )
			.next( function( error, collection_info ){
				
				var is_exist = false;
				
				if( collection_info ){
					is_exist = true;
				}//if
				
				var error  = undefined;
				var data   = { is_exist : is_exist };
				var result = result_obj.GetResultObj( error, data );
				
				callback_on_result( result );
			} );//next
	}//CollectionIsExist
	//-------------------------------------------------------
	
	
	//-------------------------------------------------------
	function Respond_WrongParameters( request_params ){
		
		var error = 'wrong parameters';
		var data  = undefined;
		
		request_params.response_data =
			result_obj.GetResultObj( error, data );
		request_params.callback_on_result( request_params );
	}//Respond_WrongParameters
	//-------------------------------------------------------
	
	
	//-------------------------------------------------------
	this.CollectionNamesGet = function( request_params ){
		
		var OnToArray = function( error, items ){
			
			var data = [];
			var collection_name;
			
			if( items.length === undefined ){
				collection_name = items.name;
				data.push( { name : collection_name } );
			}else{
				for( var idx in items ){
					collection_name = items[idx].name;
					data.push( { name : collection_name } );
				}//for
			}//if
			
			request_params.response_data =
				result_obj.GetResultObj( error, data );
			
			request_params.callback_on_result( request_params );
		};//OnToArray
		
		db.listCollections( {} ).toArray( OnToArray );
		
	};//CollectionNamesGet
	//-------------------------------------------------------
	this.CollectionCreate = function( request_params ){
		
		//request_params check
		if( request_params === undefined ||
			request_params.request_data.collection_name === undefined ||
			request_params.request_data.collection_index_field === undefined ||
			request_params.callback_on_result === undefined ){
			Respond_WrongParameters( request_params );
			return;
		}//if wrong parameters
		
		var OnCollectionIsExist = function( query_result ){
			
			if( query_result.result_data.is_exist ){
				var error = 'collection already exists';
				var data  = undefined;
				
				request_params.response_data =
					result_obj.GetResultObj( error, data );
				request_params.callback_on_result( request_params );
				return;
			}//if collection exist
			
			
			var collection = db.collection(
				request_params.request_data.collection_name );
			
			var OnCreateIndex = function( _error, index_name ){
				var error = _error;
				var data  = {};
				
				request_params.response_data =
					result_obj.GetResultObj( error, data );
				request_params.callback_on_result( request_params );
			};//OnCreateIndex
			
			var index_name   = request_params.request_data.collection_index_field;
			var index_option = {
				unique     : true,
				background : true,
				w          : 1
			};//index_option
			
			//create an index for the field index_name
			collection.createIndex(
				index_name, index_option, OnCreateIndex );
		};//OnCollectionIsExist
		
		CollectionIsExist(
			request_params.request_data.collection_name, OnCollectionIsExist );
	};//CollectionCreate
	//-------------------------------------------------------
	this.CollectionDataGet = function( request_params ){
		
		//params check
		if( request_params === undefined ||
			request_params.request_data.collection_name === undefined ||
			request_params.callback_on_result === undefined ){
			Respond_WrongParameters( request_params );
			return;
		}//if wrong parameters
		
		var collection_name   = request_params.request_data.collection_name;
		var collection_filter = request_params.request_data.collection_filter;
		
		var query;
		
		if( IsEmpty( collection_filter ) ){
			query = {};
		}else{
			
			
			var key   = Object.keys( collection_filter )[0];
			var value = collection_filter[key].toLowerCase();
			/*
			 
			 collection_filter[key] = {
			 $regex : "(" + value + ")+"
			 };
			 */
			
			/*
			$or:[
				{"field1":{"$in":["foo","bar"]}},
				{"field2":{"$in":["foo","bar"]}}
			]
			*/
			
			var s1 = { name : new RegExp( value, 'g' ) };
			var s2 = { user : new RegExp( value, 'g' ) };
			query  = {$or:[s1, s2]};
		}//else
		
		var collection = db.collection( collection_name );
		
		var OnResult = function( error, data ){
			request_params.response_data =
				result_obj.GetResultObj( error, data );
			request_params.callback_on_result( request_params );
		};//OnResult
		
		collection.find( query ).toArray( OnResult );
	};//CollectionDataGet
	//-------------------------------------------------------
	this.CollectionDrop = function( request_params ){
		
		//request_params check
		if( request_params === undefined ||
			request_params.request_data.collection_name === undefined ||
			request_params.callback_on_result === undefined ){
			Respond_WrongParameters( request_params );
			return;
		}//if wrong parameters
		
		var result = db.collection(
			request_params.request_data.collection_name ).drop();
		
		var error = undefined;
		var data  = result;
		
		request_params.response_data =
			result_obj.GetResultObj( error, data );
		request_params.callback_on_result( request_params );
	};//CollectionDrop
	//-------------------------------------------------------
	this.CollectionDropOne = function( request_params ){
		
		//request_params check
		if( request_params === undefined ||
			request_params.request_data.collection_name === undefined ||
			request_params.request_data.item_filter === undefined ||
			request_params.callback_on_result === undefined ){
			Respond_WrongParameters( request_params );
			return;
		}//if wrong parameters
		
		var collection = db.collection(
			request_params.request_data.collection_name );
		
		
		var OnDeleteOne = function( _error, data ){
			var error = GetError( _error );
			
			request_params.response_data =
				result_obj.GetResultObj( error, data );
			request_params.callback_on_result( request_params );
		};//OnDeleteOne
		
		var query = request_params.request_data.item_filter;
		
		collection.deleteOne( query, OnDeleteOne );
	};//CollectionDropOne
	//-------------------------------------------------------
	this.CollectionDataInsert = function( request_params ){
		
		//request_params check
		if( request_params === undefined ||
			request_params.request_data.collection_name === undefined ||
			request_params.request_data.data === undefined ||
			request_params.callback_on_result === undefined ){
			Respond_WrongParameters( request_params );
			return;
		}//if wrong parameters
		
		var collection = db.collection(
			request_params.request_data.collection_name );
		
		
		var OnInsertMany = function( _error, data ){
			var error = GetError( _error );
			
			request_params.response_data =
				result_obj.GetResultObj( error, data );
			request_params.callback_on_result( request_params );
		};//OnInsertMany
		
		var params_insert = { w : 1, ordered : false };
		
		collection.insertMany(
			request_params.request_data.data, params_insert, OnInsertMany );
	};//CollectionDataInsert
	//-------------------------------------------------------
	this.CollectionUpdateOne = function( request_params ){
		
		//request_params check
		if( request_params === undefined ||
			request_params.request_data.collection_name === undefined ||
			request_params.request_data.query === undefined ||
			request_params.request_data.values === undefined ||
			request_params.callback_on_result === undefined ){
			Respond_WrongParameters( request_params );
			return;
		}//if wrong parameters
		
		var collection = db.collection(
			request_params.request_data.collection_name );
		
		
		var OnDeleteOne = function( _error, data ){
			InsertOne();
		};//OnDeleteOne
		
		var OnInsertMany = function( _error, data ){
			var error = GetError( _error );
			
			request_params.response_data =
				result_obj.GetResultObj( error, data );
			request_params.callback_on_result( request_params );
		};//OnResult
		
		var InsertOne = function(){
			collection.insertOne( values, OnInsertMany );
		};//InsertOne
		
		var query  = request_params.request_data.query;
		var values = request_params.request_data.values;
		
		collection.deleteOne( query, OnDeleteOne );
	};//CollectionDataInsert
	//-------------------------------------------------------
}//FDB

//-------------------------------------------------------
/** @returns {string}*/
function GetError( _error ){
	if( _error !== null ){
		if( _error.errmsg !== undefined ){
			return _error.errmsg;
			
		}else if( _error.message !== null ){
			return _error.message;
		}//else if
	}//if
	return '';
}//GetError

module.exports = FDB;