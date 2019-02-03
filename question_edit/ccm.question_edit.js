/**
 * @overview example ccm component that add question entries to a database
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'question_edit',

    ccm: 'https://ccmjs.github.io/ccm/ccm.js',

    config: {
      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.3.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      'comp_input': [ 'ccm.component', 'https://ccmjs.github.io/akless-components/input/versions/ccm.input-1.0.0.js' ],

      "data": { "store": [ "ccm.store" ] },

      "html": {
        'main': [
          { 'id': 'questions' },
          { 'id': 'add_question' },
          { 'id': 'save' }
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
        // get dataset for rendering
        const self = this;
        this.data['user'] = !!this.user;
        const dataset = await $.dataset( this.data );

        // has logger instance? => log 'start' event
        this.logger && this.logger.log( 'start', $.clone( dataset ) );

        // render main HTML structure
        $.setContent( this.element, $.html( this.html.main ) );

        // get page fragments
        const questions_elem = this.element.querySelector( '#questions' );
        const add_question_elem = this.element.querySelector( '#add_question' );
        const save_elem = this.element.querySelector( '#save' );

        let lastQuestionNum = 0;
        let inputs = [];
        let initials = {};
        dataset["question_ids"].forEach((questionId) => {

          // keep track of the highest question number
          const question = dataset[questionId];
          const questionNumMatch = questionId.match(/q_(\d+)/);
          const questionNum = questionNumMatch ? parseInt(questionNumMatch[1]) : 0;
          if (questionNum > lastQuestionNum) {
            lastQuestionNum = questionNum;
          }

          // fill questions for the input component
          inputs.push({
            "label": "Question " + questionNum,
            "name": questionId,
            "input": "text"
          });

          initials[questionId] = question.text;

          //self.data.store.set({'key': 'task_1', 'q_2': { 'text': 'question 2', 'answers': [], 'user': 'mnguy12s' }})
        });

        await this.comp_input.start({
          root: questions_elem,
          "form": true,
          "button": true,
          "inputs": inputs,
          "initial": initials
        });

      };

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();