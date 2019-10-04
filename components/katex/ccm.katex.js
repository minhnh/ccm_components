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
      'editable': true,

      'onchange': null,

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'katex': '../../lib/css/katex.min.css'
      },

      'js': {
        'katex': '../../lib/js/katex.min.js',
        'katex_auto_render': '../../lib/js/auto-render.min.js'
      },

      'data': { 'store': [ 'ccm.store' ] },

      'html': {
        'main': {
          'class': 'row p-0',
          'inner': [
            { 'id': 'math-edit' },
            { 'id': 'math-render', 'class': 'pl-4 pt-2 col' }
          ]
        },

        'math_textarea': {
          'id': 'text-edit-input', 'tag': 'textarea', "class": "form-control p-1 pl-4", "onchange": "%change%",
          'style': 'resize: vertical; overflow: auto;',
          'placeholder': "Enclose LaTex equations with '$' to render."
        }
      }
    },

    Instance: function () {

      let $;
      let textData;

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
          { url: self.css.bootstrap, type: 'css' },
          { url: self.css.bootstrap, type: 'css', context: self },
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
        textData = dataset && dataset.text ? dataset.text : "";

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main ) );

        // render math equations, set inner text values directly to avoid special character issues with CCM placeholders
        const mathRenderElem = self.element.querySelector( '#math-render' );
        mathRenderElem.innerText = textData;
        renderMathInElement( mathRenderElem, { "delimiters": [ { left: "$", right: "$", display: false } ] } );

        // render textarea field if editing is allowed
        if ( self.editable ) {
          const mathEditElem = self.element.querySelector( '#math-edit' );
          mathEditElem.className = 'p-0 col-6'
          $.setContent( mathEditElem, $.html( self.html.math_textarea, {
            'change': event => {
              textData = event.srcElement.value;
              mathRenderElem.innerText = textData;
              renderMathInElement( mathRenderElem, { "delimiters": [ { left: "$", right: "$", display: false } ] } );
              // pass 'textData' to component's event handler
              self.onchange && self.onchange( textData );
            }
          } ) );
          const textAreaElem = mathEditElem.querySelector( '#text-edit-input' );
          textAreaElem.value = textData;
        }
      };  // end start()

      this.getTextData = () => textData;

    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
