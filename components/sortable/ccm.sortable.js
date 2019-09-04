/**
 * @overview example ccm component that renders sortable list
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */
( function () {

  const component = {

    name: 'sortable',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      'components': {
        'katex': [ 'ccm.component', '../katex/ccm.katex.js' ]
      },

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'fontawesome': '../../lib/css/fontawesome-all.min.css',
        'katex': '../../lib/css/katex.min.css'
      },

      'js': {
        'sortable': '../../lib/js/Sortable.min.js',
        'jquery': '../../lib/js/jquery-3.3.1.slim.min.js',
        'katex': '../../lib/js/katex.min.js',
        'katex_auto_render': '../../lib/js/auto-render.min.js'
      },

      'data': { 'store': [ 'ccm.store' ] },

      'html': {
        'main': { 'inner': [ { 'id': 'items' } ] },

        'ul_elem': { 'class': 'list-group', 'id': '%id%' },

        'li_elem': { 'class': 'list-group-item ui-state-default', 'id': '%id%' }
      },

      'ranking': []
    },

    Instance: function () {

      let $;

      this.ready = async () => {
        // set shortcut to help functions
        $ = this.ccm.helper;

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );
      };

      this.start = async () => {
        const self = this;

        // has logger instance? => log 'start' event
        self.logger && self.logger.log( 'start', $.clone( dataset ) );

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main ) );

        // load bootstrap CSS
        self.ccm.load(
          { url: self.css.bootstrap, type: 'css' },
          { url: self.css.bootstrap, type: 'css', context: self }
        );

        // load Javascript modules
        await self.ccm.load(
          { url: self.js.sortable, type: 'js' },
          { url: self.js.jquery, type: 'js' }
        );

        // contain list items
        const itemsElem = self.element.querySelector( '#items' );

        // get dataset for rendering
        let dataset = await $.dataset( self.data );

        // render list items
        const ulElem = $.html( self.html.ul_elem, { 'id': dataset.id } );
        itemsElem.appendChild( ulElem );
        dataset.items && dataset.items.forEach( renderListItem );
        Sortable.create( ulElem, {
          onSort: function ( event ) {
            // remove entry from array at old index
            const draggedItem = self.ranking.splice( event.oldIndex, 1 )[ 0 ];
            // insert entry at new index
            self.ranking.splice( event.newIndex, 0, draggedItem );
          }
        } );

        function renderListItem( itemData ) {
          const liElem = $.html( self.html.li_elem, { 'id': itemData.id } );
          self.components.katex.start( {
            root: liElem, "css": self.css, "js": self.js, 'editable': false,
            data: { 'id': itemData.id, 'text': itemData.content }
          } );
          ulElem.appendChild( liElem );
          self.ranking.push( itemData.id );
        }
      };

      this.getRanking = () => { return this.ranking; }
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
