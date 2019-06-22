/**
 * @overview ccm component to edit answers for questions created with question_edit
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'answer_edit',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.7.1.js',

    config: {
      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.1.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      'comp_countdown': [ 'ccm.component', '../../components/countdown_timer/ccm.countdown_timer.js' ],

      "data": { "store": [ "ccm.store" ] },

      // predefined values
      "constants" : {
        "key_questions": "questions",   // key of store document containing question entries
        "qa_prefix": "q_",             // will be prepended to question-answer pair indices to create element ID's
        "truncate_length": 16           // number of characters to keep as ID for hashed answers
      },

      "html": {
        'main': {
          'inner': [
            // area for deadline timer
            { 'id': 'deadline', 'class': 'mb-3 row m-1', 'inner': [
              {
                'tag': 'label', 'class': 'input-group-prepend col-sm-0 p-1 mt-2 text-secondary',
                'inner': 'Remaining time', 'for': 'deadline-timer'
              },
              { 'id': 'deadline-timer', 'class': 'col-sm-0' }
            ] },
            // area for question and answer
            { 'id': 'content' },
            // area for save button
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

        // render question and answer text box
        'qa_entry': {
          'inner': [
            // question label and text
            {
              'class': 'input-group row m-1', 'inner': [
                {
                  'class': 'input-group-prepend col-sm-0 p-1', 'inner': [ {
                    'tag': 'label', 'class': 'text-secondary', 'for': 'q_%question_id%_question', 'inner': 'Question'
                  } ]
                },
                {
                  'class': 'col-sm-0', 'inner': [ {
                    'tag': 'input', 'type': 'text', 'readonly': true, 'class': 'form-control-plaintext p-1 text-info',
                    'id': 'q_%question_id%_question', 'value': '%question_text%'
                  } ]
                }
              ]
            },
            // answer label and text box
            {
              'class': 'input-group row mb-3 m-1', 'inner': [
                {
                  'class': 'input-group-prepend col-md-0', 'inner': [ {
                    'tag': 'label', 'class': 'p-2 input-group-text', 'for': 'q_%question_id%_answer', 'inner': 'Answer'
                  } ]
                },
                {
                  'class': 'col-lg-0', 'inner': [ {
                    'tag': 'textarea', 'class': 'form-control', 'aria-label': 'Answer', 'style': 'resize: both;',
                    'id': 'q_%question_id%_answer', 'inner': '%answer_text%'
                  } ]
                }
              ]
            }
          ],
        },  // end qa_entry

        // message to display when user is not logged in
        'login_message': { 'class': 'alert alert-info', 'role': 'alert', 'inner': 'Please login to continue!\n' }
      },

      'css': [ 'ccm.load',
        { url: '../../lib/css/bootstrap.min.css', type: 'css' },
        { url: '../../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
      ],

      'js': [
        'ccm.load', {
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
        const qaData = {};
        let deadline;

        // login
        let username;
        self.user && await self.user.login().then ( () => {
          username = self.user.data().user;
        } ).catch( ( exception ) => console.log( 'login: ' + exception.error ) );

        if ( !username ) {
          $.setContent( self.element, $.html( self.html.login_message ) );
          return;
        }

        // has logger instance? => log 'start' event
        self.logger && self.logger.log( 'start' );

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main, {
          // save ranking event handler
          'save-click': async ( event ) => {
            let payload = { key : username, answers: {} };

            Object.keys( qaData ).forEach( ( key ) => {
              const questionIdHtml = self.constants.qa_prefix + key;
              let aId = "textarea#" + questionIdHtml + "_answer";
              const ansText = contentElem.querySelector( aId ).value;
              const hashObj = CryptoJS.SHA256( ansText.trim() );
              const ansHash = hashObj.toString().substring( 0, self.constants.truncate_length );
              payload.answers[ key ] = { 'text': ansText, 'hash': ansHash }
            });

            await self.data.store.set( payload ).then( () => {
              const notificationSpan = self.element.querySelector( '#save-notification' );
              notificationSpan.innerText = 'Success';
              setTimeout( () => { notificationSpan.innerText = ''; }, 1000 );  // message disappear after 1 second
            } );
          }  // end event handler
        } ) );

        // get page fragments
        const contentElem = self.element.querySelector( '#content' );

        // load questions from store
        await self.data.store.get( self.constants.key_questions ).then(
            questions => {
              deadline = questions.answer_deadline;
              questions && questions.entries && Object.keys( questions.entries ).forEach( questionId => {
                qaData[ questionId ] = {};
                qaData[ questionId ][ 'question' ] = questions.entries[ questionId ];
              } );
            },
            reason => console.log( reason )             // read from data store failed
        ).catch( err => console.log( err.message ) );   // unhandled exception

        // load answers from store
        await self.data.store.get( username ).then(
            ud => {
              if ( !ud ) {
                // create new user data document if not exist
                ud = { "answers": {}, "ranking": {} }
              }

              ud.answers && Object.keys( ud.answers ).forEach( questionId => {
                // if no question on record for this answer, skip entry
                if ( !qaData[ questionId ] ) return;

                qaData[ questionId ][ 'answer' ] = ud.answers[ questionId ][ 'text' ];
              } );
            },
            reason => console.log( reason )             // read from data store failed
        ).catch( err => console.log( err.message ) );   // unhandled exception

        const dlCountdownElem = self.element.querySelector( '#deadline-timer' );
        await self.comp_countdown.start( {
          root: dlCountdownElem,
          'deadline': deadline,
          'onfinish': () => {
            const saveElem = self.element.querySelector( '#save' );
            saveElem.innerHTML = '';
          }
        } );

        renderQAPairs();

        function renderQAPairs() {
          Object.keys( qaData ).forEach( ( questionId ) => {
            const answerText = qaData[ questionId ].answer ? qaData[ questionId ].answer : '';
            const qaDiv = $.html( self.html.qa_entry, {
              'question_id': questionId, 'question_text': qaData[ questionId ].question, 'answer_text': answerText
            } );
            contentElem.appendChild( qaDiv );
          } );
        }  // end renderQAPairs()
      };  // end this.start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
