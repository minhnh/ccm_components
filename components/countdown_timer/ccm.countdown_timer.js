/**
 * @overview example ccm component that renders a countdown timer given a deadline
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */
( function () {

  const component = {

    name: 'countdown_timer',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      'html': {
        'main': { 'id': 'main' },
        'timer': {
          'class': 'd-inline-flex p-2 m-1 bg-light text-info',
          'inner': '%days% d %hours%h %minutes%m %seconds%s'
        },
        'expired': { 'class': 'd-inline-flex p-2 m-1 bg-light text-info', 'inner': 'expired at %time_string%' }
      },

      // example deadline: { 'date': '2019-06-20', 'time': '20:00' }
      'deadline': null,

      // event to be called with 'self.element' when the timer expires
      'onfinish': function( srcElement ) { console.log( srcElement.innerHTML ) },

      // start blinking if the time offset is less than this amount (ms), default to 1 minute
      'warn_time': 60000,

      'css': { 'bootstrap': '../../lib/css/bootstrap.min.css' },
    },

    Instance: function () {

      let $;

      this.ready = async () => {
        // set shortcut to help functions
        $ = this.ccm.helper;
      };

      this.start = async () => {
        const self = this;

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main ) );

        // load bootstrap CSS
        self.ccm.load(
          { url: self.css.bootstrap, type: 'css' },
          { url: self.css.bootstrap, type: 'css', context: self.element }
        );

        const mainElem = self.element.querySelector( '#main' );

        let deadline;
        if ( self.deadline ) {
          deadline = new Date( self.deadline.date + ' ' + self.deadline.time );
        } else {
          // default to 1 minute in the future
          deadline = new Date();
          deadline.setMinutes( deadline.getMinutes() + 1 );
        }

        let blink = false;
        let interval = setInterval( () => {
          const offset = deadline - new Date();
          if ( offset < 0 ) {
            // clear interval, set counter expired and return
            clearInterval( interval );
            $.setContent( mainElem, $.html( self.html.expired, {
              'time_string': deadline.toDateString() + ' ' + deadline.toTimeString().substring(0, 15) } ) );
            self.onfinish && self.onfinish( self.element );
            return;
          }

          // update view with countdown
          const days    = Math.floor(   offset / ( 1000 * 60 * 60 * 24 ) );
          const hours   = Math.floor( ( offset % ( 1000 * 60 * 60 * 24 ) ) / ( 1000 * 60 * 60 ));
          const minutes = Math.floor( ( offset % ( 1000 * 60 * 60 )      ) / ( 1000 * 60 ));
          const seconds = Math.floor( ( offset % ( 1000 * 60 )           ) / 1000);

          const timerElem = $.html( self.html.timer, {
            'days': days, 'hours': hours, 'minutes': minutes, 'seconds': seconds
          } );

          // if warning is specified, blink in the last minute
          if ( self.warn_time && offset < self.warn_time ) {
            if ( blink ) {
              timerElem.classList.remove( 'bg-light', 'text-info' );
              timerElem.classList.add( 'bg-warning', 'text-light' );
            }
            blink = !blink;
          }

          $.setContent( mainElem, timerElem );
        }, 1000 );
      };  // end start()
    }  // end Instance()
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
