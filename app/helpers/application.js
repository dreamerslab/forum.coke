String.prototype.bytes = function (){
  var arr = this.match( /[^\x00-\xff]/ig );
  return arr === null ? this.length : this.length + arr.length;
};

var moment = require( 'moment' );
var marked = require( 'marked' );

module.exports = function ( app ){
  app.helpers({

    each : function ( arr, limit, callback ){
      var i = 0;
      var j = arr.length > limit ? limit : arr.length;

      if( !callback ) return;

      for( ; i < j; i++ ){
        callback( arr[ i ]);
      }
    },

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

    show_more : function ( length, limit, link ){
      return length > limit ? link : '';
    },

    show_sub_nav : function ( _it ){
      var keyword = _it.tag_name || _it.keywords;
      var new_btn = _it.sess_user ? '<li id="new-post"><a class="btn btn-primary" href="/topics/new">New Post</a></li>' : '';

      if(( _it.sub_nav_selected === 'tag' ) || ( _it.sub_nav_selected === 'keywords' )){
        return _it.show_title( keyword, _it.sub_nav_selected );
      }else{
        return '<ul class="article-sub-nav-list">' +
          '<li class="article-sub-nav-item"><a id="' + _it.selected( 'latest', _it.sub_nav_selected, 'article-sub-nav-selected' ) + '" class="article-sub-nav-link " href="/topics/latest">Latest</a></li>' +
          '<li class="article-sub-nav-item"><a id="' + _it.selected( 'trending', _it.sub_nav_selected, 'article-sub-nav-selected' ) + '" class="article-sub-nav-link" href="/topics/trending">Hot</a></li>' +
          '<li class="article-sub-nav-item"><a id="' + _it.selected( 'unsolved', _it.sub_nav_selected, 'article-sub-nav-selected' ) + '" class="article-sub-nav-link" href="/topics/unsolved">Unsolved</a></li>' +
          new_btn +
        '</ul>';
      }
    },

    show_title : function ( keyword, label ){
      return '<h2 id="page-title">Posts About %s</h2>'.replace( /%s/, label + ' "' + keyword + '"' );
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

    markdown : marked
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


