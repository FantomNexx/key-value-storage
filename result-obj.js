//----------------------------------------------------------
//class that describes commonly used object to return values
//from async functions

var ResultObj = function(){
   
   this.RESULT_STATES = {
      UNDEFINED: '0',
      SUCCESS  : '1',
      ERROR    : '-1'
   };
   
   this.RESULT_STATES_STR = {};
   this.RESULT_STATES_STR[ this.RESULT_STATES.UNDEFINED ] = 'UNDEFINED';
   this.RESULT_STATES_STR[ this.RESULT_STATES.SUCCESS ] = 'SUCCESS';
   this.RESULT_STATES_STR[ this.RESULT_STATES.ERROR ] = 'ERROR';
   
   
   this.GetResultObj = function( error_msg, result_data ){
      
      var result_obj = {
         result_code    : undefined,
         result_code_str: undefined,
         error_msg      : '',
         result_data    : undefined
      };
      
      if( error_msg ){
         result_obj.result_code = this.RESULT_STATES.ERROR;
         result_obj.error_msg = error_msg;
         
      }else if( result_data ){
         result_obj.result_code = this.RESULT_STATES.SUCCESS;
         result_obj.result_data = result_data;
         
      }else{
         result_obj.result_code = this.RESULT_STATES.ERROR;
         result_obj.error_msg = "unknown error";
      }//else
      
      result_obj.result_code_str =
         this.RESULT_STATES_STR[ result_obj.result_code ];
      
      return result_obj;
   };
};//class ResultObj

//----------------------------------------------------------
//EXPORT
module.exports = ResultObj;