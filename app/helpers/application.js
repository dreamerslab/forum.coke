String.prototype.bytes = function(){
  var arr = this.match( /[^\x00-\xff]/ig );
  return arr === null ? this.length : this.length + arr.length;
};

var moment   = require( 'moment' );
var markdown = require( 'markdown' ).markdown;

module.exports = function ( app ){
  app.helpers({

    selected : function ( target, current, label ){
      return target === current ? label : '';
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

    show_title : function ( keyword, current, label ){
      var tmp = '<h2 id="page-title">Posts About %s</h2>';

      var title_obj = {
        tag : function ( keyword ){
          return 'tag "' + keyword + '"';

          // return '<h2 id="page-title">Posts About tag "' + keyword + '"</h2>';
        },

        search : function ( keyword ){
          return 'keywords "' + keyword + '"';
          // return '<h2 id="page-title">Posts About keywords "' + keyword + '"</h2>';
        }
      };

      var title = title_obj[ current ] && title_obj[ current ]( keyword );

      return tmp.replace( /%s/, title );

      // return title_obj[ current ] && title_obj[ current ]( keyword );;
    },

    show_err : function ( err ){
      return err ?
        '<label class="error">' + err + '</label>' : '';
    },

    show_info : function ( info ){
      return info ?
        '<li class="article-nav-item"><span class="info">' + info + '</span></li>' : '';
    },

    val : function ( obj, prop ){
      return obj === undefined ? '' : obj[ prop ];
    },

    exists : function ( obj ){
      return obj === undefined ? '' : obj;
    },

    date : function ( date, format ){
      return moment( date ).format( format || 'MMM Do YYYY, h:m:s' );
    },

    from_now : function ( date ){
      return moment( date ).fromNow();
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

    markdown : markdown.toHTML
  });

  app.dynamicHelpers({
    error : function ( req, res ){
      return function (){
        return req.form ?
          req.form.getErrors() :
          {};
      }
    },

    success_info : function ( req, res ){
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
