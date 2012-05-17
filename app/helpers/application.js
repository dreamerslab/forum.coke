String.prototype.bytes = function (){
  var arr = this.match( /[^\x00-\xff]/ig );
  return arr === null ? this.length : this.length + arr.length;
};

var moment = require( 'moment' );
var marked = require( 'marked' );

module.exports = function ( app ){
  app.helpers({

    ago : function ( date ){
      return moment( date ).fromNow();
    },

    date : function ( date, format ){
      return moment( date ).format( format || 'MMM Do YYYY, h:m:s' );
    },

    exists : function ( obj ){
      return obj === undefined ? '' : obj;
    },

    no_record : function ( length, label ){
      return length == 0 ? label : '';
    },

    each : function ( arr, limit, callback ){
      var i = 0;
      var j = arr.length > limit ? limit : arr.length;

      if( !callback ) return;

      for( ; i < j; i++ ){
        callback( arr[ i ]);
      }
    },

    info : function ( info ){
      return info ?
        '<li class="article-nav-item"><span class="info">' + info + '</span></li>' : '';
    },

    more : function ( length, limit, link ){
      return length > limit ? link : '';
    },

    pager : function ( from, count, limit ){
      from = parseInt( from, 10 );

      var total = Math.ceil( count / limit );
      var pages = total > 5 ? 6 : total + 1;

      var out = {
        total        : total,
        pre          : '',
        next         : '',
        first        : '',
        last         : '',
        start        : 1,
        end          : pages,
        page         : from / limit + 1,
        start_spacer : '',
        end_spacer   : '',
        pre_from     : from - limit,
        next_from    : from + limit,
        each_from    : 0,
        end_from     : ( total - 1 ) * limit
      };

      if( from == 0 )             out.pre          = 'active';
      if( from >= count - limit ) out.next         = 'hidden';
      if( out.page <= 3 )         out.first        = 'hidden';
      if( out.page <= 4 )         out.start_spacer = 'hidden';

      if( out.page > 3 ){
        out.start     = out.page - 2;
        out.end       = out.page + 3;
        out.each_from += from - limit * 2;
      }

      if(( out.page + 3 ) >= total ){
        out.end        = total + 1;
        out.last       = 'hidden';
        out.end_spacer = 'hidden';
      }

      if( total <= 6 ){
        out.last       = 'hidden';
        out.end_spacer = 'hidden';
      }

      return out;
    },

    selected : function ( target, current, label ){
      return target === current ? label : '';
    },

    sub_nav : function ( data, title, nav ){
      var selected = data.sub_nav_selected;
      var keyword  = data.tag_name || data.keywords;
      var new_btn  = data.sess_user ?
        '<li id="new-post"><a class="btn btn-primary" href="/topics/new">New Post</a></li>' : '';

      if(( selected === 'tag' ) || ( selected === 'keyword' )){
        return title( keyword, selected );
      }

      nav( new_btn );
    },

    show_title : function ( keyword, label ){
      return '<h2 id="page-title">Search %s</h2>'.
        replace( /%s/, label + ' "' + keyword + '"' );
    },

    show_err : function ( type ){
       return this.get_error()[ type ] ?
        '<label class="error">' + this.get_error()[ type ] + '</label>' :
        '';
    },

    truncate : function ( str, length ){
      var _length = length === undefined ? 20 : length;

      var tmp = str.length > _length ?
        str.substr( 0, _length ) + '...' :
        str;

      return ( tmp.bytes() - 3 ) > _length ?
        tmp.substr( 0, _length / ( tmp.bytes() / _length )) + '...' :
        tmp;
    },

    val : function ( obj, prop ){
      return obj === undefined ? '' : obj[ prop ];
    },

    markdown : marked
  });

  app.dynamicHelpers({
    get_error : function ( req, res ){
      return function (){
        return req.form ?
          req.form.getErrors() :
          {};
      }
    },

    success : function ( req, res ){
      return function (){
        var _info = req.flash();
        var info  = _info ? _info[ 'flash-info' ] : [];
        return info ?
          info[ 0 ] :
          undefined;
      }
    },

    messages : require( 'express-messages' )
  });
};