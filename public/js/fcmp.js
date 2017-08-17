var FCmp = {};

//--------------------------------------------------------
/**
 * @param callback_created
 * @param tag
 */
FCmp.InitComponent = function( callback_created, tag ){
	var proto = Object.create( HTMLElement.prototype );
	
	proto.createdCallback = callback_created;
	document.registerElement( tag, { prototype : proto } );
};//InitComponent

//------------------------------------------------------
/**
 * @param parent
 * @param template
 * @param tag
 * @returns {*}
 */
FCmp.ElementMakeRoot = function( parent, template, tag ){
	
	var root = parent.createShadowRoot();
	
	var content = document.importNode( template.content, true );
	
	if( window.ShadowDOMPolyfill ){
		WebComponents.ShadowCSS.shimStyling( content, tag );
	}//if
	
	root.appendChild( content );
	
	return root;
};//MakeRootEl

//--------------------------------------------------------
/**
 * @param element
 */
FCmp.ElementMakeEmpty = function( element ){
	while( element.hasChildNodes() ){
		element.removeChild( element.lastChild );
	}//while
};//InitComponent


//----------------------------------------------------------
/**
 * @param tag
 * @param data_item
 * @returns {*}
 */
FCmp.ElementCreate = function( tag, data_item ){
	
	var element = document.createElement( tag );
	
	if( element === null ){
		return null;
	}//if
	
	if( element._cmp === undefined ){
		return null;
	}//if
	
	element._cmp.SetData( data_item );
	element._cmp.Render();
	
	return element;
};//ElementCreate

//----------------------------------------------------------
/**
 * @param tag
 * @returns {*}
 */
FCmp.ElementCreateOnly = function( tag ){
	
	var element = document.createElement( tag );
	
	if( element === null ){
		return null;
	}//if
	
	return element;
};//ElementCreate

//----------------------------------------------------------
/**
 * @param container
 * @param element_params
 * @returns {*}
 */
FCmp.ElementAdd = function( container, element_params ){
	var element;
	
	if( element_params['tag'] === undefined ){
		return;
	}//if
	
	element = FCmp.ElementCreateOnly( element_params['tag'] );
	
	if( element_params['text'] !== undefined ){
		element.innerText = element_params['text'];
	}//if
	
	if( element_params['class_name'] !== undefined ){
		element.className = element_params['class_name'];
	}//if
	
	if( element_params['_data'] !== undefined ){
		element._cmp.SetData( element_params['_data'] );
	}//if
   
   if( element_params[ 'element_data' ] !== undefined ){
      element.element_data = element_params[ 'element_data' ];
   }//if
	
	if( element_params['_render'] !== undefined ){
		element._cmp.Render();
	}//if
	
	container.appendChild( element );
	
	return element;
};//ElementAdd

//----------------------------------------------------------
/**
 * @param object
 * @returns {boolean}
 */
FCmp.IsEmptyObject = function( object ){
   try{
      if( object.length === 0 ){
         return true;
      }//if no data
   }catch( exception ){
      return true;
   }//try
   return false;
};
//----------------------------------------------------------
/**
 * @param node
 * @returns {object}
 */
FCmp.GetElementData = function( node ){
   try{
      if( node.element_data === undefined ){
         return null;
      }//if no data
   }catch( exception ){
      return null;
   }//try
   return node.element_data;
};
//----------------------------------------------------------
/**
 * @param data, id
 * @returns {object}
 */
FCmp.GetDataItemById = function( data, id ){
   
   if( data === null ){
      return null;
   }//if
   if( data.length === 0 ){
      return null;
   }//if
   
   for( var i = 0; i < data.length; i++ ){
      if(data[i].id === id){
         return data[i]
      }//if
   }//for
   
   return null;
};//GetDataItemById
//----------------------------------------------------------
FCmp.tags = {};
FCmp.tags.DIV = 'div';
