/**
 * @overview example ccm component that add question entries to a database
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'question_edit',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.7.1.js',

    config: {
      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.1.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      "data": { "store": [ "ccm.store" ] },

      // predefined strings
      "constants" : {
        "key_questions": "questions",   // key of store document containing question entries
        "truncate_length": 16           // number of characters to keep as ID for hashed questions
      },

      "html": {
        'main': {
          'id': 'main',
          'inner': [
            // HTML area where questions will be rendered
            { 'id': 'questions' },

            // HTML layout for a button to add new questions
            {
              'id': 'add_question',
              'inner': {
                'tag': 'button', 'type': 'button', 'class': 'btn btn-link', 'inner': 'Add New Question',
                'onclick': '%add-question-click%'
              }
            },

            // HTML layout for a button to add new questions, and a notification when saving finished
            {
              'id': 'save',
              'inner': [
                { 'id': 'save-button', 'tag': 'button', 'type': 'button', 'class': 'btn btn-info', 'inner': 'Save',
                  'onclick': '%save-click%' },
                { 'id': 'save-notification', 'tag': 'span', 'class': 'alert alert-dismissible' }
              ]
            }
          ]
        },

        // HTML layout for each question entry
        'question_entry': {
          'class': 'input-group mb-3',
          'inner': [
            { // question label
              'class': 'input-group-prepend',
              'inner': {
                'tag': 'span', 'class': 'input-group-text', 'inner': 'Question', 'id': 'q_%question_id%_label'
              }
            },
            // question input
            {
              'tag': 'input', 'class': 'form-control', 'type': 'text', 'aria-label': 'Question',
              'aria-describedby': 'q_%question_id%_label', 'name': 'q_%question_id%', 'value': '%question_text%',
              'onblur': '%blur%'
            },
            // button to remove question
            {
              'class': 'input-group-append',
              'inner': {
                'tag': 'button', 'class': 'btn btn-link', 'type': 'button', 'inner': 'Remove',
                'id': 'q_%question_id%_rm_btn', 'onclick': '%click%'
              }
            }
          ]
        },  // end question_entry
      },  // end html

      'css': [ 'ccm.load',
        { url: '../../lib/css/bootstrap.min.css', type: 'css'},
        { url: '../../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
      ],

      'js': [
        'ccm.load', {
          // crypto-js module for hashing question data
          url: "../../lib/js/crypto-js.min.js", type: 'js', context: 'head'
        }
      ]
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
        let questionData = {};

        // login
        let username;
        self.user && await self.user.login().then ( () => {
          username = self.user.data().user;
        } ).catch( ( exception ) => console.log( 'login: ' + exception.error ) );

        if ( !username ) {
          self.element.innerHTML = '<div class="alert alert-info" role="alert">\n' +
              '  Please login to continue!\n' +
              '</div>';
          return;
        }

        // has logger instance? => log 'start' event
        self.logger && self.logger.log( 'start' );

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main, {

          // handle adding new questions
          'add-question-click': async () => {
            const emptyQuestionId = getQuestionId( '' );

            if ( questionData[ emptyQuestionId ] ) return;

            questionData[ emptyQuestionId ] = '';
            renderQuestions();
          },

          // handle saving questions to data store
          'save-click': async () => {
            await self.data.store.set( { key: self.constants.key_questions, 'entries': questionData } )
              .then ( () => {       // successful update
                const notificationSpan = self.element.querySelector( '#save-notification' );
                notificationSpan.innerHTML = 'Success';
                setTimeout( () => { notificationSpan.innerHTML = ''; }, 1000 );
              },
              reason => {   // write failed
                console.log( reason );
              } ).catch( err => console.log( err.message ) );    // unhandled exception
            renderQuestions();
          },
        } ) );

        // load initial data from store
        await self.data.store.get( self.constants.key_questions ).then(
            questions => {
              Object.assign( questionData, questions && questions.entries ? questions.entries : {} );
            },
            reason => {   // read questions failed
              console.log( reason );
            } ).catch( err => console.log( err.message ) );    // unhandled exception

        // render questions
        renderQuestions();

        function renderQuestions() {
          const questionsElem = self.element.querySelector( '#questions' );
          questionsElem.innerHTML = '';
          Object.keys( questionData ).forEach( questionId => {
            const question = questionData[ questionId ];
            questionsElem.appendChild( renderQuestionDiv( questionId, question ? question : '' ) );
          } );
        }

        function renderQuestionDiv( questionId, questionText ) {
          // replace '%question_id%' and '%question_text%' with appropriate values, handle events
          const questionDiv = $.html( self.html.question_entry, {
            'question_id': questionId, 'question_text': questionText,
            // write text content to dataset when question field is unfocused
            'blur': ( event ) => {
              const inputElem = event.srcElement;
              questionData[ questionId ] = inputElem ? inputElem.value : '';
              reindexQuestions();
            },
            // handle removing a question
            'click': async () => {
              delete questionData[ questionId ];
              renderQuestions();
            }
          } );
          return questionDiv;
        }  // end renderQuestionDiv()

        // ensure the question ids are correct
        function reindexQuestions() {
          Object.keys( questionData ).forEach( key => {
            // calculate new question ID
            const questionId = getQuestionId( questionData[ key ] );

            // return if key matches calculated id
            if ( questionId === key ) return;

            questionData[ questionId ] = questionData[ key ];
            delete questionData[ key ];
          } );
        }

        // create question ID from text
        function getQuestionId( questionText ) {
          // use a truncated SHA-256 as new question ID
          const hashObj = CryptoJS.SHA256( questionText.trim() );
          return hashObj.toString().substring( 0, self.constants.truncate_length );
        }
      };
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
