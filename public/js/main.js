//----------------------------------------------------------
var transport = new Transport();
//----------------------------------------------------------

var APP_DATA = {
   collection_name: 'fantom_notes'
};

var REQUEST_URLS = {
   NotesCreate   : '/notes-create',
   NotesDrop     : '/notes-drop',
   NotesDropOne  : '/notes-drop-one',
   NotesAddMany  : '/notes-add-many',
   NotesGetAll   : '/notes-get-all',
   NotesFind     : '/notes-find',
   NotesUpdateOne: '/notes-update-one'
};//REQUEST_URLS


var SEARCH_TYPES = {
   UNDEF  : -1,
   BY_NAME: 1,
   BY_TEXT: 2
};//SEARCH_TYPES
var search_type = SEARCH_TYPES.BY_NAME;


//remember the last query
var last_searched_text = '';
var edit_item = undefined;

//----------------------------------------------------------
function NotesCreate(){
   
   var OnResult = function( response_data ){
      console.log( response_data );
   };//OnResult
   
   var request_data = {
      collection_name       : APP_DATA.collection_name,
      collection_index_field: 'name'
   };//request_data
   
   transport.PostData(
      REQUEST_URLS.NotesCreate, request_data, OnResult );
}//NotesCreate
//----------------------------------------------------------
function NotesDrop(){
   
   var OnResult = function( response_data ){
      console.log( response_data );
   };//OnResult
   
   var request_data = {
      collection_name: APP_DATA.collection_name
   };//request_data
   
   transport.PostData(
      REQUEST_URLS.NotesDrop, request_data, OnResult );
}//NotesDrop
//----------------------------------------------------------
function NotesDropOne( item_data ){
   
   var OnResult = function( response_data ){
      NotesUpdate();
   };//OnResult
   
   var request_data = {
      collection_name: APP_DATA.collection_name,
      item_filter    : { name: item_data.name }
   };//request_data
   
   transport.PostData(
      REQUEST_URLS.NotesDropOne, request_data, OnResult );
}//NotesDrop
//----------------------------------------------------------
function NotesAddMany( items_data ){
   
   var OnResult = function( response_data ){
      NotesUpdate();
   };//OnResult
   
   var request_data = {
      collection_name: APP_DATA.collection_name,
      data           : items_data
   };//request_data
   
   transport.PostData(
      REQUEST_URLS.NotesAddMany, request_data, OnResult );
}//NotesAddMany
//----------------------------------------------------------
function NotesFind( searched_text, callback_result ){
   NotesFindAdvanced(
      searched_text, SEARCH_TYPES.UNDEF, callback_result );
}//NotesFind
//----------------------------------------------------------
function NotesFindAdvanced( searched_text, search_type, callback_result ){
   
   last_searched_text = searched_text;
   
   var OnResult = function( response_data ){
      console.log( response_data );
      callback_result( response_data.result_data );
   };//OnResult
   
   //search note by its name
   var collection_filter = {};
   
   if( searched_text === '' || searched_text === '' ){
   }else{
      collection_filter = { 'name': searched_text };
   }//else
   
   var request_data = {
      collection_name  : APP_DATA.collection_name,
      collection_filter: collection_filter,
      search_type      : search_type
   };//request_data
   
   transport.PostData(
      REQUEST_URLS.NotesFind, request_data, OnResult );
}//NotesFindAdvanced
//----------------------------------------------------------
function NotesUpdate(){
   
   var OnNotesUpdate = function( notes ){
      if( el_fgrid === undefined ){
         return;
      }//if
      el_fgrid._cmp.SetData( notes );
      el_fgrid._cmp.Render();
   };//OnNotesFound
   
   NotesFind( last_searched_text, OnNotesUpdate );
}//NotesUpdate
//----------------------------------------------------------
function NotesUpdateOne( item_data ){
   
   var OnResult = function( response_data ){
      console.log( response_data );
      NotesUpdate();
   };//OnResult
   
   delete item_data._id;
   
   var request_data = {
      collection_name: APP_DATA.collection_name,
      query          : { 'name': edit_item.name },
      values         : item_data
   };//request_data
   
   transport.PostData(
      REQUEST_URLS.NotesUpdateOne, request_data, OnResult );
}//NotesUpdateOne
//----------------------------------------------------------

//NotesDrop();
//NotesCreate();
//NotesAddMany();
//NotesGetAll();

//----------------------------------------------------------
var el_fgrid = undefined;
function InitGrid(){
   
   el_fgrid = document.querySelector( '#id-fgrid' );
   
   var OnFGridItemDClick = function( event ){
      
      if( el_fpopup === undefined ){
         return;
      }//if
      
      edit_item = event.fdata;
      
      el_fpopup._cmp.SetRowsData( edit_item );
      el_fpopup._cmp.SetStateEdit();
      el_fpopup._cmp.Show();
   };//OnFGridItemDClick
   
   el_fgrid.addEventListener(
      FGrid.EVENT_ITEM_DCLICK, OnFGridItemDClick );
   
   
   var OnResult = function( response_data ){
      console.log( response_data );
      
      el_fgrid._cmp.SetData( response_data.result_data );
      el_fgrid._cmp.Render();
   };//OnResult
   
   var request_data = {
      collection_name: APP_DATA.collection_name
   };//request_data
   
   transport.PostData(
      REQUEST_URLS.NotesGetAll, request_data, OnResult );
}//InitGrid
InitGrid();

//----------------------------------------------------------
function InitSearch(){
   
   var el_search = document.querySelector( '#id-search-field' );
   
   if( el_search.length === 0 ){
      return;
   }//if
   
   var OnNotesFound = function( notes ){
      var el_fgrid = document.querySelector( '#id-fgrid' );
      el_fgrid._cmp.SetData( notes );
      el_fgrid._cmp.Render();
   };//OnNotesFound
   
   el_search.onkeyup = function( event ){
      
      if( event.keyCode !== 13 ){
         return;
      }//if Enter was not pressed - exit
      
      var searched_text = el_search.value;
      searched_text = searched_text.toLowerCase();
      //NotesFind( searched_text, OnNotesFound );
      NotesFindAdvanced( searched_text, search_type, OnNotesFound );
      
      /*
       var text = event.type +
       ' keyCode=' + event.keyCode +
       ' which=' + event.which +
       ' charCode=' + event.charCode +
       ' char=' + String.fromCharCode( event.keyCode || event.charCode ) +
       (event.shiftKey ? ' +shift' : '') +
       (event.ctrlKey ? ' +ctrl' : '') +
       (event.altKey ? ' +alt' : '') +
       (event.metaKey ? ' +meta' : '') + "\n";
       
       console.log( text );
       */
   };//OnKeyUp
   
}//InitSearch
InitSearch();

//----------------------------------------------------------
var el_id_drop_down_list = '#id-drop-down-list';
function InitDropDownList(){
   
   var el = document.querySelector( el_id_drop_down_list );
   
   if( el.length === 0 ){
      return;
   }//if
   
   //-------------------------------------------------------
   var GetDataDummy = function(){
      
      var item_search_by_name = {
         txt: 'Search in names',
         id : SEARCH_TYPES.BY_NAME
      };
      
      var item_search_by_text = {
         txt: 'Search everywhere',
         id : SEARCH_TYPES.BY_TEXT
      };
      
      var data_dummy = [];
      data_dummy.push( item_search_by_name );
      data_dummy.push( item_search_by_text );
      
      return data_dummy;
   };//GetDataDummy
   //-------------------------------------------------------
   
   var data_drop_down_list = GetDataDummy();
   var handler_on_selection_changed = function(){
      search_type = el._cmp.GetIdSelected();
   };//handler_on_selection_changed
   
   el._cmp.SetHandler_OnSelectionChanged(
      handler_on_selection_changed );
   el._cmp.SetData( data_drop_down_list );
   el._cmp.Render();
   el._cmp.SetSelectedById( SEARCH_TYPES.BY_NAME );
}//InitDropDownList
InitDropDownList();

//----------------------------------------------------------
var el_fpopup = undefined;
function InitPopup(){
   
   var OnBtnSaveClick = function( item_data ){
      if( el_fpopup === undefined ){
         return;
      }//if
      
      var popup_state = el_fpopup._cmp.GetState();
      switch( popup_state ){
         
         case 'NEW':
            console.log( 'new', item_data );
            NotesAddMany( [ item_data ] );
            break;
         
         case 'EDIT':
            console.log( 'edit', item_data );
            NotesUpdateOne( item_data );
            break;
      }//switch
   };//OnBtnSaveClick
   
   var OnBtnDeleteClick = function( item_data ){
      if( el_fpopup === undefined ){
         return;
      }//if
      
      NotesDropOne( item_data );
   };//OnBtnDeleteClick
   
   el_fpopup = document.querySelector( '#id-fpopup' );
   el_fpopup._cmp.SetOnBtnSaveClick( OnBtnSaveClick );
   el_fpopup._cmp.SetOnBtnDeleteClick( OnBtnDeleteClick );
}//InitPopupAndBtnAddNew
InitPopup();

//----------------------------------------------------------
var el_fbutton_addnew = undefined;
function InitBtnAddNew(){
   
   var ShowPopupAddNewItem = function(){
      if( el_fpopup === undefined ){
         return;
      }//if
      el_fpopup._cmp.SetStateNew();
      el_fpopup._cmp.Show();
   };//ShowPopupAddNewItem
   
   el_fbutton_addnew =
      document.querySelector( '#id-fbutton-action' );
   
   el_fbutton_addnew.addEventListener(
      'click', ShowPopupAddNewItem );
}//InitPopupAndBtnAddNew
InitBtnAddNew();
//----------------------------------------------------------

