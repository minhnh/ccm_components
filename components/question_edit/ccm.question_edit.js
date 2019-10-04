/**
 * @overview example ccm component that add question entries to a database
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'question_edit',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      'components': {
        'user': [ 'ccm.component', '../../lib/js/ccm/ccm.user-9.2.0.min.js' ],

        'katex': [ 'ccm.component', '../katex/ccm.katex.js' ]
      },

      "user_realm": "guest", "user": null,

      "data": { "store": [ "ccm.store" ] },

      "initial_questions": [ "ccm.store" ],

      "max_question_num": 15,           // max number of questions to be selected for students to answer

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
                  'class': 'input-group-prepend pl-1',
                  'inner': [ { "tag": "span", "class": "input-group-text", "inner": "Answer Deadline" } ]
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
                  'inner': [ { "tag": "span", "class": "input-group-text", "inner": "Ranking Deadline" } ]
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

            // HTML area where selected questions will be rendered
            { 'class': 'row text-info ml-1', 'inner': '<h4>Selected Questions</h4>' }, { 'tag': 'hr' },

            { 'id': 'selected-questions', "class": "mb-3" },

            // HTML area where questions will be rendered
            { 'class': 'row text-info ml-1', 'inner': '<h4>All Questions</h4>' }, { 'tag': 'hr' },

            // Counter for number of questions
            {
              "class": "text-info mb-3", "inner": 'Number of questions: <span id="question-num"></span>'
            },

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
              'class': 'col-8', 'aria-label': 'Question', 'style': 'overflow: auto;',
              'aria-describedby': 'q_%question_id%_label', 'id': 'q_%question_id%_text'
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

        'selected_question_entry': {
          'class': 'input-group text-secondary', 'id': 'q_selected_%question_id%', 'inner': [
            { // question label
              'tag': 'span', 'class': 'input-group-prepend col-1',
              'id': 'q_selected_%question_id%_label', 'inner': 'Question %question-num%:',
            },
            // question input
            {
              'class': 'col-8', 'aria-label': 'Question', 'style': 'overflow: auto;',
              'aria-describedby': 'q_selected_%question_id%_label', 'id': 'q_selected_%question_id%_text'
            }
          ] },

        // alert message
        'alert_message': { 'tag': 'span', 'class': 'alert alert-light text-%message-type%', 'inner': '%message-text%' },

        // message to display when user is not logged in
        'login_message': { 'class': 'alert alert-info', 'role': 'alert', 'inner': 'Please login to continue!\n' },

        // error message
        'error_message': { 'class': 'alert alert-danger', 'role': 'alert', 'inner': '%message%\n' }

      },  // end html

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'fontawesome': '../../lib/css/fontawesome-all.min.css',
        'katex': '../../lib/css/katex.min.css'
      },

      'js': {
        "crypto": "../../lib/js/crypto-js.min.js",  // crypto-js module for hashing question data
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

        // has logger instance? => log 'start' event
        self.logger && self.logger.log( 'start' );

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
        let username;
        self.user = await self.components.user.start( {
          "css": [ "ccm.load",
            { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: 'head' },
            { url: self.css.fontawesome, type: 'css' }, { url: self.css.fontawesome, type: 'css', context: 'head' }
          ],
          "title": "Guest Mode: please enter any username", "realm": self.user_realm
        } );
        await self.user.login().then ( () => {
          username = self.user.data().user;
        } ).catch( ( exception ) => console.log( 'login: ' + exception.error ) );

        if ( !username ) {
          $.setContent( mainDivElem, $.html( self.html.login_message ) );
          return;
        }

        // render main HTML structure
        const emptyQuestionId = getQuestionId( '' );
        let questionData = {};
        let selectedIds;
        let questionElements = {};
        let ansDeadline;
        let rankDeadline;
        $.setContent( mainDivElem, $.html( self.html.main, {

          // handle adding new questions
          'add-question-click': async () => {

            if ( emptyQuestionId in questionData ) return;

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
              const invalidDateElem = mainDivElem.querySelector( '#invalid-date-notification' );
              setAlertWithTimeout( invalidDateElem, 'please choose ranking deadline after answer deadline',
                                   'warning', 2000 );
              return;
            }

            await self.data.store.set( {
              // new question data
              'key': self.constants.key_questions, 'entries': questionData, 'selected_ids': selectedIds,
              'answer_deadline': ansDeadline, 'ranking_deadline': rankDeadline
            } ) .then ( () => {       // successful update
                const notificationSpan = mainDivElem.querySelector( '#save-notification' );
                setAlertWithTimeout( notificationSpan, 'Saved!', 'success' );
              },
              reason => {   // write failed
                console.log( reason );
              } ).catch( err => console.log( err.message ) );    // unhandled exception
            renderQuestions();
          },
        } ) );

        // load initial data from store
        await self.data.store.get( self.constants.key_questions )
        .then(
          qStoreData => {
            Object.assign( questionData, qStoreData && qStoreData.entries ? qStoreData.entries : {} );
            selectedIds = qStoreData.selected_ids ? qStoreData.selected_ids : [];

            // set deadline date & time for answering questions
            if ( qStoreData && qStoreData.answer_deadline ) {
              ansDeadline = qStoreData.answer_deadline;
            } else {  // fill with current date & time
              ansDeadline = getNextDay( new Date() );
            }
            const ansDateInput = mainDivElem.querySelector( '#ans-dl-date' );
            ansDateInput.setAttribute( 'value', ansDeadline.date );
            const ansTimeInput = mainDivElem.querySelector( '#ans-dl-time' );
            ansTimeInput.setAttribute( 'value', ansDeadline.time );

            // set deadline for ranking answers
            if ( qStoreData && qStoreData.ranking_deadline ) {
              rankDeadline = qStoreData.ranking_deadline;
            } else {
              const ansDlObj = new Date( ansDeadline.date + ' ' + ansDeadline.time );
              rankDeadline = getNextDay( ansDlObj );
            }
            const rankDateInput = mainDivElem.querySelector( '#rank-dl-date' );
            rankDateInput.setAttribute( 'value', rankDeadline.date );
            const rankTimeInput = mainDivElem.querySelector( '#rank-dl-time' );
            rankTimeInput.setAttribute( 'value', rankDeadline.time );

            // if initial questions are specified, fill questionData
            self.initial_questions.get( 'questions' ).then(
              initQuestions => {
                initQuestions && initQuestions.forEach( qText => {
                  questionData[ getQuestionId( qText ) ] = qText;
                } );
              }
            ).then( () => renderQuestions() );
          },
          reason => {   // read questions failed
            console.log( reason.error );
            $.setContent( mainDivElem,
                          $.html( self.html.error_message, { 'message': 'Reading questions from server failed' } ) );
          }
        ).catch( err => console.log( err ) );    // unhandled exception

        function renderQuestions() {
          const questionsElem = mainDivElem.querySelector( '#questions' );
          const questionNumElem = mainDivElem.querySelector( "#question-num" );
          const selectedQuestionsElem = mainDivElem.querySelector( '#selected-questions' );
          let numQuestions = 0;
          const answerCounts = {};

          questionsElem.innerHTML = '';
          Object.keys( questionData ).forEach( questionId => {
            numQuestions++;
            if ( !( questionId in questionElements ) ) {
              const questionTxt = questionData[ questionId ];
              questionElements[ questionId ] = renderQuestionDiv( questionId, questionTxt );
            }
            questionsElem.appendChild( questionElements[ questionId ] );
            // TODO: get 'ans_count' from database
            answerCounts[ questionId ] = 0;
          } );
          questionNumElem.innerHTML = numQuestions;

          // select a subset of questions for students
          sampleQuestionSubset( answerCounts );
          selectedQuestionsElem.innerHTML = '';
          selectedIds.forEach( ( selId, index ) => {
            const selQElem = $.html( self.html.selected_question_entry, {
              'question_id': selId, 'question-num': index + 1
            } );
            const selQTextElem = selQElem.querySelector( '#q_selected_' + selId + '_text' )
            self.components.katex.start( {
              root: selQTextElem, "css": self.css, "js": self.js, 'editable': false,
              data: { 'id': selId, 'text': questionData[ selId ] }
            } );
            selectedQuestionsElem.appendChild( selQElem );
          } );
        }

        function renderQuestionDiv( questionId, questionText ) {
          // replace '%question_id%' with appropriate values, handle events
          const questionDiv = $.html( self.html.question_entry, {
            'question_id': questionId,

            // handle removing a question
            'click': async () => {
              delete questionData[ questionId ];
              delete questionElements[ questionId ];
              renderQuestions();
            }
          } );

          // since CCM HTML helper has issue with backslash ('\'), set question text manually
          const qTextArea = questionDiv.querySelector( `#q_${ questionId }_text` );
          self.components.katex.start( {
            root: qTextArea, "css": self.css, "js": self.js,
            data: { 'id': questionId, 'text': questionText },
            onchange: ( newQuestion ) => {
              const questionIdClone = $.clone( questionId );
              const newQuestionId = getQuestionId( newQuestion );
              // make no changes if the question value has not changed
              if ( newQuestionId == questionIdClone ) return;

              // else update 'questionElements' and 'questionData'
              questionData[ newQuestionId ] = newQuestion;
              questionElements[ newQuestionId ] = questionDiv;
              delete questionData[ questionIdClone ];
              delete questionElements[ questionIdClone ];
            }
          } );

          // qTextArea.value = questionText;
          return questionDiv;
        }  // end renderQuestionDiv()

        function sampleQuestionSubset( answerCounts ) {
          let allQIds = Object.keys( answerCounts );

          // ensure all selected keys exist
          selectedIds.forEach( selId => {
            if ( selId in answerCounts ) {
              // remove entry from possible questions to be sampled and selected
              const qIndex = allQIds.indexOf( selId );
              if ( qIndex > -1 ) allQIds.splice( qIndex, 1 );
              return;
            }
            // remove key if not exist in 'questionData', check if 'indexOf' returns -1 when 'selId' is not found
            var index = selectedIds.indexOf( selId );
            if ( index > -1 ) selectedIds.splice( index, 1 );
          } );

          // randomly select questions from the remaining ID's
          while ( selectedIds.length < self.max_question_num ) {
            // if no more questions to sample
            if ( allQIds.length == 0 ) break;
            // sample a random question
            // TODO: need to take into account the number of answers for each question
            const randIndex = Math.floor( Math.random() * allQIds.length );
            // add to 'selectedIds' & remove from 'allQIds'
            selectedIds.push( allQIds[ randIndex ] );
            allQIds.splice( randIndex, 1 );
          }
        }  // end selectQuestions()

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
