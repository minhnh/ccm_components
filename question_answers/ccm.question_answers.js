/**
 * @overview example ccm component that just renders "Hello, World!"
 * @author André Kless <andre.kless@web.de> 2017-2018
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'question_answers',

    ccm: 'https://ccmjs.github.io/ccm/ccm.js',

    config: {
      'data': { 'store': [ 'ccm.store' ] },

      'comp_sortable': [ 'ccm.component', '../sortable/ccm.sortable.js' ],

      'html': {
        "main": {
          "id": "main",
          "inner": [
            { "id": "question" },
            { "id": "answers" },
            { "id": "submit" }
          ]
        }
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
        // get dataset for rendering
        const dataset = await $.dataset( this.data );

        // has logger instance? => log 'start' event
        this.logger && this.logger.log( 'start', $.clone( dataset ) );

        // render main HTML structure
        $.setContent( this.element, $.html( this.html.main ) );

        // contain list items
        const question_elem = this.element.querySelector( '#question' );
        const answers_elem = this.element.querySelector( '#answers' );
        const submit_elem = this.element.querySelector( '#submit' );

        // render question
        question_elem.innerHTML = dataset.question;

        // render answers
        const answer_comp = await this.comp_sortable.start({
          root: answers_elem,
          data: dataset.answers
        });

        // render submit button
        const button = document.createElement( 'button' );
        button.innerHTML = 'Submit';
        button.addEventListener('click', () => {
          console.log(answer_comp.getRanking());
        });
        submit_elem.appendChild(button);
      };

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();