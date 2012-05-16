( function ( $ ){
  $( function (){
    $( 'pre' ).addClass( 'prettyprint' );

    var $a = $( 'a, button, input[type="submit"], input[type="reset"]' );

    $a.click( function (){
      this.blur();
    }).
    mousedown( function (){
      this.blur();
    });

    if( /msie/i.test( navigator.userAgent ) && !/opera/i.test( navigator.userAgent )){
      $a.focus( function (){
        this.blur();
      });
    }
  });
})( jQuery );