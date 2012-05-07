var moment   = require( 'moment' );
var markdown = require( 'markdown' ).markdown;

module.exports = function ( app ){
  app.helpers({

    selected : function ( target, current ){
      return target === current ? 'selected' : '';
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
    messages : require( 'express-messages' )
  });
};
