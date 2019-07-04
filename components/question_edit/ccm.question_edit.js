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
            // HTML layout for a deadline date and time for answering questions
            {
              'id': 'answer-deadline', 'class': 'input-group mb-1',
              'inner': [
                {
                  'class': 'input-group-prepend',
                  'inner': '<span class="input-group-text pr-3">Answer Deadline</span>'
                },
                {
                  'tag': 'input', 'type': 'date', 'class': 'form-control col-2', 'name': 'ans_dl_date',
                  'id': 'ans-dl-date', 'onchange': '%ans-dl-change%'
                },
                {
                  'tag': 'input', 'type': 'time', 'class': 'form-control col-2', 'name': 'ans_dl_time',
                  'id': 'ans-dl-time', 'onchange': '%ans-dl-change%'
                }
              ]
            },

            // HTML layout for a deadline date and time for ranking answers
            {
              'id': 'ranking-deadline', 'class': 'input-group mb-4',
              'inner': [
                {
                  'class': 'input-group-prepend',
                  'inner': '<span class="input-group-text">Ranking Deadline</span>'
                },
                {
                  'tag': 'input', 'type': 'date', 'class': 'form-control col-2', 'name': 'rank_dl_date',
                  'id': 'rank-dl-date', 'onchange': '%rank-dl-change%'
                },
                {
                  'tag': 'input', 'type': 'time', 'class': 'form-control col-2', 'name': 'rank_dl_time',
                  'id': 'rank-dl-time', 'onchange': '%rank-dl-change%'
                },
                { 'id': 'invalid-date-notification' }
              ]
            },

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

            // HTML layout for a button to save question data, and a notification field for when saving finished
            {
              'id': 'save',
              'inner': [
                { 'id': 'save-button', 'tag': 'button', 'type': 'button', 'class': 'btn btn-info', 'inner': 'Save',
                  'onclick': '%save-click%' },
                { 'id': 'save-notification', 'class': 'd-inline-flex' }
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
              'tag': 'textarea', 'class': 'form-control col-8', 'aria-label': 'Question', 'style': 'overflow: auto;',
              'aria-describedby': 'q_%question_id%_label', 'id': 'q_%question_id%_text', 'onblur': '%blur%'
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

        // alert message
        'alert_message': { 'tag': 'span', 'class': 'alert alert-light text-%message-type%', 'inner': '%message-text%' },

        // message to display when user is not logged in
        'login_message': { 'class': 'alert alert-info', 'role': 'alert', 'inner': 'Please login to continue!\n' }

      },  // end html

      'css': [ 'ccm.load',
        { url: '../../lib/css/bootstrap.min.css', type: 'css'},
        { url: '../../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
      ],

      'js': [
        // crypto-js module for hashing question data
        'ccm.load', { url: "../../lib/js/crypto-js.min.js", type: 'js', context: 'head' }
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
        let ansDeadline;
        let rankDeadline;

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

          // handle adding new questions
          'add-question-click': async () => {
            const emptyQuestionId = getQuestionId( '' );

            if ( questionData[ emptyQuestionId ] ) return;

            questionData[ emptyQuestionId ] = '';
            renderQuestions();
          },

          // handle change of deadline for answering questions
          'ans-dl-change': async ( event ) => {
            // prevent unexpected form input events
            if ( event.srcElement.type !== 'date' && event.srcElement.type !== 'time' ) return;

            if ( !ansDeadline ) ansDeadline = {};
            ansDeadline[ event.srcElement.type ] = event.srcElement.value;
          },

          // handle change of deadline for answering questions
          'rank-dl-change': async ( event ) => {
            // prevent unexpected form input events
            if ( event.srcElement.type !== 'date' && event.srcElement.type !== 'time' ) return;

            if ( !rankDeadline ) rankDeadline = {};
            rankDeadline[ event.srcElement.type ] = event.srcElement.value;
          },

          // handle saving questions to data store
          'save-click': async () => {
            const ansDlObj = new Date( ansDeadline.date + ' ' + ansDeadline.time );
            const rankDlObj = new Date( rankDeadline.date + ' ' + rankDeadline.time );
            if ( rankDlObj < ansDlObj ) {
              // warn that stored date was invalid and change the ranking deadline to one day after the deadline
              // for answering questions
              const invalidDateElem = self.element.querySelector( '#invalid-date-notification' );
              setAlertWithTimeout( invalidDateElem, 'please choose ranking deadline after answer deadline',
                                   'warning', 2000 );
              return;
            }

            await self.data.store.set( {
              // new question data
              'key': self.constants.key_questions, 'entries': questionData,
              'answer_deadline': ansDeadline, 'ranking_deadline': rankDeadline
            } ) .then ( () => {       // successful update
                const notificationSpan = self.element.querySelector( '#save-notification' );
                setAlertWithTimeout( notificationSpan, 'Saved!', 'success' );
              },
              reason => {   // write failed
                console.log( reason );
              } ).catch( err => console.log( err.message ) );    // unhandled exception
            renderQuestions();
          },
        } ) );

        // load initial data from store
        await self.data.store.get( self.constants.key_questions ).then( qStoreData => {
            Object.assign( questionData, qStoreData && qStoreData.entries ? qStoreData.entries : {} );

            // set deadline date & time for answering questions
            if ( qStoreData && qStoreData.answer_deadline ) {
              ansDeadline = qStoreData.answer_deadline;
            } else {  // fill with current date & time
              ansDeadline = getNextDay( new Date() );
            }
            const ansDateInput = self.element.querySelector( '#ans-dl-date' );
            ansDateInput.setAttribute( 'value', ansDeadline.date );
            const ansTimeInput = self.element.querySelector( '#ans-dl-time' );
            ansTimeInput.setAttribute( 'value', ansDeadline.time );

            // set deadline for ranking answers
            if ( qStoreData && qStoreData.ranking_deadline ) {
              rankDeadline = qStoreData.ranking_deadline;
            } else {
              const ansDlObj = new Date( ansDeadline.date + ' ' + ansDeadline.time );
              rankDeadline = getNextDay( ansDlObj );
            }
            const rankDateInput = self.element.querySelector( '#rank-dl-date' );
            rankDateInput.setAttribute( 'value', rankDeadline.date );
            const rankTimeInput = self.element.querySelector( '#rank-dl-time' );
            rankTimeInput.setAttribute( 'value', rankDeadline.time );

            // render questions
            renderQuestions();
          },
          reason => {   // read questions failed
            console.log( reason );
          }
        ).catch( err => console.log( err ) );    // unhandled exception

        function renderQuestions() {
          const questionsElem = self.element.querySelector( '#questions' );
          questionsElem.innerHTML = '';
          Object.keys( questionData ).forEach( questionId => {
            const question = questionData[ questionId ];
            questionsElem.appendChild( renderQuestionDiv( questionId, question ? question : '' ) );
          } );
        }

        function renderQuestionDiv( questionId, questionText ) {
          // replace '%question_id%' with appropriate values, handle events
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
          // since CCM HTML helper has issue with backslash ('\'), set question text manually
          const qTextArea = questionDiv.querySelector( `#q_${ questionId }_text` );
          qTextArea.value = questionText;
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

        function getNextDay( date ) {
          // get the next day, at current time
          const nxtDayDate = date.getFullYear() + '-' + padNumber( date.getMonth() + 1, 2 )
                             + '-' + padNumber( date.getDate() + 1, 2 );
          const curTime = padNumber( date.getHours(), 2 ) + ':' + padNumber( date.getMinutes(), 2 );
          return { 'date': nxtDayDate, 'time': curTime };
        }

        // create question ID from text
        function getQuestionId( questionText ) {
          // use a truncated SHA-256 as new question ID
          const hashObj = CryptoJS.SHA256( questionText.trim() );
          return hashObj.toString().substring( 0, self.constants.truncate_length );
        }

        function setAlertWithTimeout( alertElem, message, type, timeout=1000 ) {
          $.setContent( alertElem, $.html( self.html.alert_message, {
            'message-text': message, 'message-type': type
          } ) );
          setTimeout( () => { alertElem.innerHTML = ''; }, timeout );
        }

        function padNumber( number, numDigits, prefix='0' ) {
          return String( number ).padStart( numDigits, prefix );
        }
      };
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
