/**
 * @overview example ccm component that renders sortable list
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */
( function () {

  const component = {

    name: 'sortable',

    ccm: 'https://ccmjs.github.io/ccm/ccm.js',

    config: {
      'css': [
        'ccm.load',
        { url: '../lib/css/bootstrap.min.css', type: 'css' },
        { url: '../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
      ],

      'js': [ 'ccm.load',
        { url: '../lib/js/Sortable.min.js', type: 'js' },
        { url: '../lib/js/jquery-3.3.1.slim.min.js', type: 'js', context: 'head' }
      ],

      'data': { 'store': [ 'ccm.store' ] },

      'html': {
        'main': [
          { 'id': 'items' }
        ]
      },

      'ranking': []
    },

    Instance: function () {

      let $;
      let dataset;

      this.ready = async () => {
        // set shortcut to help functions
        $ = this.ccm.helper;

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );
      };

      this.start = async () => {
        // has logger instance? => log 'start' event
        this.logger && this.logger.log( 'start', $.clone( dataset ) );

        // render main HTML structure
        $.setContent( this.element, $.html( this.html.main ) );

        // contain list items
        const items_elem = this.element.querySelector( '#items' );

        // get dataset for rendering
        const self = this; dataset = await $.dataset( this.data );

        // render list items
        const ul_elem = document.createElement( 'ul' );
        ul_elem.classList.add( 'list-group' );
        ul_elem.id = dataset.id;
        items_elem.appendChild( ul_elem );
        dataset.items && dataset.items.forEach( renderListItem );
        Sortable.create( ul_elem, {
          onSort: function ( event ) {
            // remove entry from array at old index
            const draggedItem = self.ranking.splice( event.oldIndex, 1 )[ 0 ];
            // insert entry at new index
            self.ranking.splice( event.newIndex, 0, draggedItem );
          }
        } );

        function renderListItem( item_data ) {
          const li_elem = document.createElement( 'li' );
          li_elem.innerHTML = item_data.content;
          li_elem.id = item_data.id;
          li_elem.classList.add( 'list-group-item','ui-state-default' );
          ul_elem.appendChild( li_elem );
          self.ranking.push( li_elem.id );
        }
      };

      this.getRanking = () => { return this.ranking; }
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
