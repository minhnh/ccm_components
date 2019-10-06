/**
 * @overview CCM component to rank student answers for a question
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de>
 * @copyright 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'answer_ranking',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      'data': { 'store': [ 'ccm.store' ] },

      'components': {
        'user': [ 'ccm.component', '../../lib/js/ccm/ccm.user-9.2.0.min.js' ],

        'sortable': [ 'ccm.component', '../sortable/ccm.sortable.js' ],

        'katex': [ 'ccm.component', '../katex/ccm.katex.js' ],

        'countdown': [ 'ccm.component', '../countdown_timer/ccm.countdown_timer.js' ]
      },

      "user_realm": "guest", "user": null,

      // predefined values
      'constants' : {
        'key_questions': 'questions',   // key of store document containing question entries
        'key_ans_prefix': 'answers_',   // question ID's will be appended to this to create the name of the document
                                        // containing the question's answers
        'num_answer': 5,                // number of answers to rank
      },

      'html': {
        'main': {
          'id': 'main',
          'inner': [
            { 'id': 'ranking-deadline' },
            { 'id': 'ranking' },
            {
              'id': 'submit', 'class': 'mt-3',
              'inner': [
                { 'id': 'save-button', 'tag': 'button', 'type': 'button', 'class': 'btn btn-info', 'inner': 'Save',
                  'onclick': '%save-click%' },
                { 'id': 'save-notification', 'tag': 'span', 'class': 'alert alert-dismissible  text-success' }
              ]
            }
          ]
        },  // end 'main'

        // HTML config for a question and answers
        'rank_entry': {
          'inner': [
            // question label and text
            {
              'class': 'input-group  m-1 mb-2 row', 'inner': [
                {
                  'class': 'input-group-prepend text-secondary pl-2 col mr-3 mt-2', 'tag': 'label',
                  'inner': 'Question %question_num%:', 'for': 'q_%question_id%'
                },
                { 'class': 'p-0 text-info col-11', 'id': 'q_%question_id%' }
              ]
            },
            // answers to be ranked
            { 'id': 'answers', 'class': 'mb-4 ml-2' }
          ]
        },  // end 'rank_entry'

        'deadline_timer': {
          'id': 'deadline', 'class': 'mb-2 row m-1', 'inner': [
            {
              'tag': 'label', 'class': 'input-group-prepend col-sm-0 p-1 mt-2 text-secondary',
              'inner': '%label%', 'for': 'deadline-timer'
            },
            { 'id': 'deadline-timer', 'class': 'col-sm-0' }
          ]
        },

        // message to display when user is not logged in
        'login_message': { 'class': 'alert alert-info', 'role': 'alert', 'inner': 'Please login to continue!\n' }
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
    },

    Instance: function () {

      let $;

      this.ready = async () => {
        // set shortcut to help functions
        $ = this.ccm.helper;
      };

      this.start = async () => {
        // get dataset for rendering
        const self = this;
        let qaData = {};
        let userData;
        const sortableObjects = {};

        // create a div element for rendering content and allow for CSS loading
        const mainDivElem = document.createElement( 'div' );
        $.setContent( self.element, mainDivElem );

        // load bootstrap CSS
        self.ccm.load(
          { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: self.element }
        );

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
        },
        reason => {  // login failed
          console.log( reason.message );
        } ).catch( exception => console.log( exception ) );

        if ( !username ) {
          $.setContent( mainDivElem, $.html( self.html.login_message ) );
          return;
        }

        // get question entries and deadlines
        const questionEntries = {};
        let selectedQuestionIds;
        let ansDeadline = null;
        let rankDeadline = null;
        await self.data.store.get( self.constants.key_questions ).then(
          questionStore => {
            if ( !questionStore ) return;
            if ( questionStore.answer_deadline ) ansDeadline = questionStore.answer_deadline;
            if ( questionStore.ranking_deadline ) rankDeadline = questionStore.ranking_deadline;
            if ( questionStore.entries ) Object.assign( questionEntries, questionStore.entries );
            selectedQuestionIds = questionStore.selected_ids ? questionStore.selected_ids : [];
          },
          reason => console.log( reason )               // read from question store failed
        ).catch( err => console.log( err ) );   // unhandled exception;

        // if ansDeadline is specified, wait until the deadline for answering questions is finished,
        // otherwise render content
        if ( ansDeadline ) {
          $.setContent( mainDivElem,  $.html( self.html.deadline_timer, {
            'label': 'Answer ranking available in:'
          } ) );
          const ansDlTimerElem = mainDivElem.querySelector( '#deadline-timer' );
          await self.components.countdown.start( {
            root: ansDlTimerElem, 'css': self.css, 'js': self.js, 'components': self.components,
            'deadline': ansDeadline, 'onfinish': () => renderContent()
          } );
        } else {
          renderContent();
        }

        ////////////////////
        // FUNCTIONS
        ////////////////////

        function renderContent() {
          // render main HTML structure
          $.setContent( mainDivElem, $.html( self.html.main, {
            // save ranking event handler
            'save-click': async ( event ) => {
              if ( !( 'ranking' in userData ) ) userData[ 'ranking' ] = {};
              for ( qId in sortableObjects ) {
                const rankings = sortableObjects[ qId ].getRanking();
                userData[ 'ranking' ][ qId ] = {};
                for ( rankNum in rankings ) {
                  userData[ 'ranking' ][ qId ][ rankings[ rankNum ] ] = rankNum;
                }
              }
              await self.data.store.set( userData ).then( () => {
                const notificationSpan = mainDivElem.querySelector( '#save-notification' );
                notificationSpan.innerText = 'Success';
                setTimeout( () => { notificationSpan.innerText = ''; }, 1000 );  // message disappear after 1 second
              } );
            }  // end event handler
          } ) );  // end $.setContent()

          // get page fragments
          const rankingDlElem = mainDivElem.querySelector( '#ranking-deadline' );
          const rankingElem = mainDivElem.querySelector( '#ranking' );

          // handle ranking deadline timer, remove save button on timer finish
          $.setContent( rankingDlElem,  $.html( self.html.deadline_timer, {
            'label': 'Remaining time:'
          } ) );
          const rankDlTimerElem = rankingDlElem.querySelector( '#deadline-timer' );
          self.components.countdown.start( {
            root: rankDlTimerElem, 'css': self.css, 'deadline': rankDeadline,
            'onfinish': () => {
              const saveElem = mainDivElem.querySelector( '#submit' );
              saveElem.innerHTML = '';
            }
          } );

          // load user data
          self.data.store.get( username ).then( ud => {
              userData = ud;
              if ( !userData ) userData = { key : username, answers: {}, ranking: {} };
              if ( !userData.ranking ) userData.ranking = {};
              if ( !userData.answers ) userData.answers = {};

              // load answers from store
              const entryDict = {};
              selectedQuestionIds.forEach( ( questionId, index ) => {
                // create placeholder document fragment to fill answer entries after async data queries complete
                const entryDiv = document.createElement( 'div' );
                entryDict[ questionId ] = entryDiv;
                rankingElem.appendChild( entryDiv );

                // setup entry for question
                qaData[ questionId ] = {};
                qaData[ questionId ][ 'question' ] = questionEntries[ questionId ];

                // get answers
                self.data.store.get( self.constants.key_ans_prefix + questionId )
                .then(
                  answers => {
                    answers = answers ? answers : { 'entries': {} };
                    qaData[ questionId ][ 'answers' ] = answers;
                    // sample answers
                    selectedAns = getAnswers( userData, questionId, answers[ 'entries' ] );
                    // render ranking entry
                    const rankEntryElem = renderAnswerRanking( index, questionId, qaData[ questionId ][ 'question' ],
                                                              selectedAns, answers[ 'entries' ] );
                    entryDict[ questionId ].appendChild( rankEntryElem );
                  },
                  reason => console.log( reason )                 // read from data store failed
                ).catch( err => console.log( err.message ) );   // unhandled exception
              } );
            },
            reason => console.log( reason )               // read from data store failed
          ).catch( err => console.log( err.message ) );   // unhandled exception

        }  // end renderContent()

        function getAnswers( userData, questionId, allAnswers ) {
          // collection of selected answers to return
          const selectedAnswers = {};

          // keep track of which indices already used
          const indicesAvailable = {};
          for ( index in [ ...Array( self.constants.num_answer ).keys() ] ) indicesAvailable[index] = true;

          // fill the user's ranked answers which are available in 'allAnswers'
          // this ensures updated answers to be resampled, and old ones to be discarded
          if ( userData[ 'ranking' ] && questionId in userData[ 'ranking' ] ) {
            for ( rankedAnsKey in userData[ 'ranking' ][ questionId ] ) {
              if ( !( rankedAnsKey in allAnswers ) ) continue;
              const rankIndex = userData[ 'ranking' ][ questionId ][ rankedAnsKey ];
              selectedAnswers[ rankedAnsKey ] = rankIndex;
              delete indicesAvailable[ rankIndex ];
            }
          }

          // sort answers by rank count
          const ansByRankCount = sortAnswersByRankCount( questionId, selectedAnswers, userData,
                                                         allAnswers, indicesAvailable );

          // Fill 'answers' randomly, starting from ones with the least number of ranking
          Object.keys( ansByRankCount ).sort().forEach( rankCount => {
            let ansCount = Object.keys( selectedAnswers ).length;

            // if there are enough entries in 'answers', stop the loop
            if ( ansCount === self.constants.num_answer ) return;

            // if there are not enough entries in 'answers' AND there are still answers with the current
            // number of ranking, randomly add more entries to 'answers'
            const answerKeys = ansByRankCount[ rankCount ];
            while ( ansCount < self.constants.num_answer && answerKeys.length > 0 ) {
              // sample random answer
              const randIndex = Math.floor( Math.random() * answerKeys.length );
              const selectedAnsKey = answerKeys.splice( randIndex, 1 )[ 0 ];

              // pop the first available rank index to store in 'answers'
              const rankIndex = Object.keys( indicesAvailable )[ 0 ];
              selectedAnswers[ selectedAnsKey ] = rankIndex;
              delete indicesAvailable[ rankIndex ]

              // update 'ansCount'
              ansCount = Object.keys( selectedAnswers ).length;
            }
          } );  // end sampling for answers

          return selectedAnswers;
        }  // end getAnswers()

        function sortAnswersByRankCount( questionId, selectedAnswers, userData, allAnswers, indicesAvailable ) {
          const ansByRankCount = {};
          for ( ansKey in allAnswers ) {
            // if there are enough entries in 'answers', stop the loop
            if ( Object.keys( selectedAnswers ).length === self.constants.num_answer ) break;

            // skip the user's own answers
            if ( questionId in userData[ 'answers' ] && ansKey === userData[ 'answers' ][ questionId ][ 'hash' ] )
              continue;

            // skip if answer is already considered
            if ( ansKey in selectedAnswers ) continue;

            // add to 'answers' if this answers is already ranked by the current user, unlikely to be here
            if ( username in allAnswers[ ansKey ][ 'ranked_by' ] && Object.keys( indicesAvailable ).length !==0 ) {
              // pop the first available rank index to store in 'answers'
              const rankIndex = Object.keys( indicesAvailable )[ 0 ];
              selectedAnswers[ ansKey ] = rankIndex;
              delete indicesAvailable[ rankIndex ]
              continue;
            }

            // else add to 'ansByRankCount'
            const rankCount = Object.keys( allAnswers[ ansKey ][ 'ranked_by' ] ).length;
            if ( rankCount in ansByRankCount ) {
              ansByRankCount[ rankCount ].push( ansKey );
            } else {
              ansByRankCount[ rankCount ] = [ ansKey ];
            }
            allAnswers[ ansKey ][ 'ranked_by' ][ username ] = true;
          }

          return ansByRankCount;

        }  // end sortAnswersByRankCount()

        function renderAnswerRanking( questionIndex, questionId, questionText, selectedAnswers, allAnswers ) {
          const qaRankingEntry = $.html( self.html.rank_entry, {
            'question_id': questionId, 'question_num': questionIndex + 1
          } );

          // start katex component to render equations in questions
          const questionTextArea = qaRankingEntry.querySelector( `#q_${ questionId }` );
          self.components.katex.start( {
            root: questionTextArea, "css": self.css, "js": self.js, 'editable': false,
            data: { 'id': questionId, 'text': questionText }
          } );

          // render the answer ranking area
          const answersDiv = qaRankingEntry.querySelector( '#answers' );
          const numAnswers = Object.keys( selectedAnswers ).length;
          if ( numAnswers < self.constants.num_answer ) {
            // render message about not enough answers for ranking
            answersDiv.className = 'p-3 mb-2 bg-light text-dark';
            answersDiv.innerText = 'can only find ' + numAnswers + ' answer(s) for this question, but we need '
                                   + self.constants.num_answer + ' to rank';
          } else {
            // render answers
            let answerEntries = [];
            for ( ansId in selectedAnswers ) {
              // this assume that selectedAnswers[ ansId ] are unique indices that represent the ranking of answers,
              // and qaData[ questionId ][ 'answers' ][ ansId ][ 'text' ] contains the answer text
              answerEntries[ selectedAnswers[ ansId ] ] = {
                'id': ansId,
                'content': allAnswers[ ansId ][ 'text' ]
              };
            }
            sortableObjects[ questionId ] = self.components.sortable.start( {
              root: answersDiv, 'css': self.css, 'js': self.js, 'components': self.components,
              data: { 'id': questionId + '_answers', 'items': answerEntries }
            } );
          }

          return qaRankingEntry;
        }  // end renderAnswerRanking()

      };  // end start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
