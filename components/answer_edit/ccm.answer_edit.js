/**
 * @overview ccm component to edit answers for questions created with question_edit
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'answer_edit',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      'components': {
        'user': [ 'ccm.component', '../../lib/js/ccm/ccm.user-9.2.0.min.js' ],

        'katex': [ 'ccm.component', '../katex/ccm.katex.js' ],

        'countdown': [ 'ccm.component', '../countdown_timer/ccm.countdown_timer.js' ]
      },

      "user_realm": "guest", "user": null,

      "data": { "store": [ "ccm.store" ] },

      // predefined values
      "constants" : {
        "key_questions": "questions",   // key of store document containing question entries
        "qa_prefix": "q_",              // will be prepended to question-answer pair indices to create element ID's
        "truncate_length": 16           // number of characters to keep as ID for hashed answers
      },

      "html": {
        'main': {
          'inner': [
            // area for deadline timer
            {
              'id': 'deadline', 'class': 'mb-3 row m-1', 'inner': [
                {
                  'tag': 'label', 'class': 'input-group-prepend col-sm-0 p-1 mt-2 text-secondary',
                  'inner': 'Remaining time', 'for': 'deadline-timer'
                },
                { 'id': 'deadline-timer', 'class': 'col-sm-0' }
              ]
            },
            // area for question and answer
            { 'id': 'content' },
            // area for save button
            {
              'id': 'save',
              'inner': [
                { 'id': 'save-button', 'tag': 'button', 'type': 'button', 'class': 'btn btn-info', 'inner': 'Save',
                  'onclick': '%save-click%' },
                { 'id': 'save-notification', 'tag': 'span', 'class': 'alert alert-dismissible text-success' }
              ]
            }
          ]
        },

        // render question and answer text box
        'qa_entry': {
          'inner': [
            // question label and text
            {
              'class': 'input-group m-1 row', 'inner': [
                {
                  'class': 'input-group-prepend text-secondary p-1 col-0 mr-3', 'tag': 'label', 'inner': 'Question',
                  'for': 'q_%question_id%_question'
                },
                { 'class': 'p-1 text-info col-11', 'id': 'q_%question_id%_question' }
              ]
            },
            // answer label and text box
            {
              'class': 'input-group m-1 mb-3 row', 'inner': [
                {
                  'class': 'input-group-prepend input-group-text col-0 mr-3', 'tag': 'label',
                  'for': 'q_%question_id%_answer', 'inner': 'Answer'
                },
                { 'class': 'p-0 col-11', 'id': 'q_%question_id%_answer' }
              ]
            }
          ],
        },  // end qa_entry

        // message to display when user is not logged in
        'login_message': { 'class': 'alert alert-info', 'role': 'alert', 'inner': 'Please login to continue!\n' },

        // error message
        'error_message': { 'class': 'alert alert-danger', 'role': 'alert', 'inner': '%message%\n' }
      },

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'fontawesome': '../../lib/css/fontawesome-all.min.css',
        'katex': '../../lib/css/katex.min.css'
      },

      'js': {
        "crypto": "../../lib/js/crypto-js.min.js",
        'katex': '../../lib/js/katex.min.js',
        'katex_auto_render': '../../lib/js/auto-render.min.js'
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

        // create a div element for rendering content and allow for CSS loading
        const mainDivElem = document.createElement( 'div' );
        $.setContent( self.element, mainDivElem );

        // load bootstrap CSS
        self.ccm.load(
          { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: self.element }
        );

        // load Crypto-JS module
        await self.ccm.load( { url: self.js.crypto, type: 'js' } );

        // login
        self.user = await self.components.user.start( {
          "css": [ "ccm.load",
            { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: 'head' },
            { url: self.css.fontawesome, type: 'css' }, { url: self.css.fontawesome, type: 'css', context: 'head' }
          ],
          "title": "Guest Mode: please enter any username", "realm": self.user_realm
        } );

        const qaData = {};
        await self.user.login()
        .then ( () => {
          const username = self.user.data().user;

          // load questions and user data from store
          Promise.all( [
            self.data.store.get( self.constants.key_questions ),
            self.data.store.get( username )
          ] )
          .then( ( [ questionData, userData ] ) => {
            if ( !questionData ) questionData = {};
            const deadline = questionData.answer_deadline;
            // use selected questions if defined, otherwise use all questions
            let questionIds;
            questionIds = questionData.selected_ids ? questionData.selected_ids : [];
            questionIds.forEach( qId => {
              qaData[ qId ] = {};
              qaData[ qId ][ 'question' ] = questionData.entries[ qId ];
            } );

            // create new user data document if not exist
            if ( !userData ) userData = { "answers": {}, "ranking": {} };
            userData.answers && Object.keys( userData.answers ).forEach( questionId => {
              // if no question on record for this answer, skip entry
              if ( !( questionId in qaData ) ) return;

              qaData[ questionId ][ 'answer' ] = userData.answers[ questionId ][ 'text' ];
            } );

            renderContent( mainDivElem, qaData, username );
            renderDeadlineTimer( mainDivElem, deadline );
            renderQAPairs( mainDivElem, qaData, deadline );

          } )
          .catch( exception => {
            console.log( exception );
            $.setContent( mainDivElem, $.html( self.html.error_message,
                                               { 'message': 'Failed to read/write data store.' } ) );
          } );
        } )
        .catch( exception => {
          console.log( exception );
          $.setContent( mainDivElem, $.html( self.html.login_message ) );
        } );

        function renderContent( rootElem, qaData, username ) {
          // render main HTML structure
          $.setContent( rootElem, $.html( self.html.main, {
            // save ranking event handler
            'save-click': async ( event ) => {
              let payload = { key : username, answers: {}, ranking: {} };

              Object.keys( qaData ).forEach( qId => {
                const ansText = qaData[ qId ][ 'answer' ];
                const hashObj = CryptoJS.SHA256( ansText.trim() );
                const ansHash = hashObj.toString().substring( 0, self.constants.truncate_length );
                payload.answers[ qId ] = { 'text': ansText, 'hash': ansHash }
              });

              await self.data.store.set( payload ).then( () => {
                const notificationSpan = rootElem.querySelector( '#save-notification' );
                notificationSpan.innerText = 'Success';
                setTimeout( () => { notificationSpan.innerText = ''; }, 1000 );  // message disappear after 1 second
              } );
            }  // end event handler
          } ) );
        }

        function renderDeadlineTimer( rootElem, deadline ) {
          const dlCountdownElem = rootElem.querySelector( '#deadline-timer' );
          self.components.countdown.start( {
            root: dlCountdownElem, 'deadline': deadline, 'css': self.css,
            'onfinish': () => {
              const saveElem = mainDivElem.querySelector( '#save' );
              saveElem.innerHTML = '';
            }
          } );
        }  // end renderDeadlineTimer

        function renderQAPairs( rootElem, qaData, deadline ) {
          const contentElem = rootElem.querySelector( '#content' );
          let allowEdit = true;
          if ( deadline ) {
            const dlObj = new Date( deadline.date + ' ' + deadline.time );
            if ( dlObj - new Date() < 0 ) allowEdit = false;
          }

          Object.keys( qaData ).forEach( ( questionId ) => {
            const answerText = qaData[ questionId ].answer ? qaData[ questionId ].answer : '';
            const questionText = qaData[ questionId ].question ? qaData[ questionId ].question : '';

            const qaDiv = $.html( self.html.qa_entry, { 'question_id': questionId } );

            // create non-editable katex instance for question
            const questionTextArea = qaDiv.querySelector( `#q_${ questionId }_question` );
            self.components.katex.start( {
              root: questionTextArea, "css": self.css, "js": self.js, 'editable': false,
              data: { 'id': questionId, 'text': questionText }
            } );

            // to avoid issue with backlashes, set textarea values for question and answers manually:
            const answerTextArea = qaDiv.querySelector( `#q_${ questionId }_answer` );
            self.components.katex.start( {
              root: answerTextArea, "css": self.css, "js": self.js, 'editable': allowEdit,
              data: { 'id': questionId, 'text': answerText },
              onchange: ( newAnsText ) => {
                qaData[ questionId ][ 'answer' ] = newAnsText;
              }
            } );

            contentElem.appendChild( qaDiv );
          } );
        }  // end renderQAPairs()
      };  // end this.start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
