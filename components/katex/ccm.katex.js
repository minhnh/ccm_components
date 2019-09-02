/**
 * @overview example ccm component that renders math fields
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */
( function () {

  const component = {

    name: 'katex',

    ccm: '../../lib/js/ccm/ccm-22.4.0.min.js',

    config: {
      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'katex': '../../lib/css/katex.min.css'
      },

      'js': {
        'jquery': '../../lib/js/jquery-3.3.1.slim.min.js',
        'katex': '../../lib/js/katex.min.js',
        'katex_auto_render': '../../lib/js/auto-render.min.js'
      },

      'data': { 'store': [ 'ccm.store' ] },

      'html': {
        'main': [
          { 'id': 'math-edit', 'inner': '%math-edit-text%' },
          { 'id': 'math-render', 'inner': '' }
        ]
      }
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

        // load bootstrap CSS
        self.ccm.load(
          { url: self.css.katex, type: 'css' },
          { url: self.css.katex, type: 'css', context: self }
        );

        // load Javascript modules
        await self.ccm.load( [
          { url: self.js.katex, type: 'js' },
          { url: self.js.katex_auto_render, type: 'js' },
        ] );

        // get dataset for rendering
        let dataset = await $.dataset( self.data );

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main, { 'math-edit-text': dataset.content.text } ) );

        // contain list items
        const mathElem = self.element.querySelector( '#math-render' );
        const mathEditElem = self.element.querySelector( '#math-edit' );

        renderMathInElement(mathEditElem, { "delimiters": [
          {left: "$$", right: "$$", display: false},
          {left: "\\(", right: "\\)", display: false},
          {left: "\\[", right: "\\]", display: false}
        ] });

        katex.render("c = \\pm\\sqrt{a^2 + b^2}", mathElem, {
          throwOnError: false, displayMode: false
        });
      };  // end start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
