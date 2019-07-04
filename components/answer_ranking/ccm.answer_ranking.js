/**
 * @overview CCM component to rank student answers for a question
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de>
 * @copyright 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'answer_ranking',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.7.1.js',

    config: {
      'data': { 'store': [ 'ccm.store' ] },

      'comp_sortable': [ 'ccm.component', '../../components/sortable/ccm.sortable.js' ],

      'comp_countdown': [ 'ccm.component', '../../components/countdown_timer/ccm.countdown_timer.js' ],

      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.1.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

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
            {
              'id': 'question', 'class': 'input-group row m-1 pt-4',
              'inner': [
                {
                  'class': 'input-group-prepend col-sm-0 p-1',
                  'inner': [ {
                    'tag': 'label', 'class': 'text-secondary', 'for': 'q_%question_id%', 'inner': 'Question'
                  } ]
                },
                {
                  'class': 'col-sm-0',
                  'inner': [ {
                    'tag': 'input', 'class': 'form-control-plaintext p-1 text-info', 'type': 'text', 'readonly': true,
                    'id': 'q_%question_id%', 'value': '%question_text%'
                  } ]
                }
              ]
            },
            { 'id': 'answers' }
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

      'css': [ 'ccm.load',
        { url: '../../lib/css/bootstrap.min.css', type: 'css' },
        { url: '../../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
      ],
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

        // login
        let username;
        self.user && await self.user.login().then ( () => {
          username = self.user.data().user;
        },
        reason => {  // login failed
          console.log( reason );
        } ).catch( ( exception ) => console.log( exception ) );

        if ( !username ) {
          $.setContent( self.element, $.html( self.html.login_message ) );
          return;
        }

        // get question entries and deadlines
        const questionEntries = {};
        let ansDeadline = null;
        let rankDeadline = null;
        await self.data.store.get( self.constants.key_questions ).then(
          questionStore => {
            if ( !questionStore ) return;
            if ( questionStore.answer_deadline ) ansDeadline = questionStore.answer_deadline;
            if ( questionStore.ranking_deadline ) rankDeadline = questionStore.ranking_deadline;
            if ( questionStore.entries ) Object.assign( questionEntries, questionStore.entries );
          },
          reason => console.log( reason )               // read from question store failed
        ).catch( err => console.log( err ) );   // unhandled exception;

        // if ansDeadline is specified, wait until the deadline for answering questions is finished,
        // otherwise render content
        if ( ansDeadline ) {
          $.setContent( self.element,  $.html( self.html.deadline_timer, {
            'label': 'Answer ranking available in:'
          } ) );
          const ansDlTimerElem = self.element.querySelector( '#deadline-timer' );
          await self.comp_countdown.start( {
            root: ansDlTimerElem,
            'deadline': ansDeadline,
            'onfinish': () => renderContent()
          } );
        } else {
          renderContent();
        }

        ////////////////////
        // FUNCTIONS
        ////////////////////

        function renderContent() {
          // render main HTML structure
          $.setContent( self.element, $.html( self.html.main, {
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
                const notificationSpan = self.element.querySelector( '#save-notification' );
                notificationSpan.innerText = 'Success';
                setTimeout( () => { notificationSpan.innerText = ''; }, 1000 );  // message disappear after 1 second
              } );
            }  // end event handler
          } ) );  // end $.setContent()

          // get page fragments
          const rankingDlElem = self.element.querySelector( '#ranking-deadline' );
          const rankingElem = self.element.querySelector( '#ranking' );

          // handle ranking deadline timer, remove save button on timer finish
          $.setContent( rankingDlElem,  $.html( self.html.deadline_timer, {
            'label': 'Remaining time:'
          } ) );
          const rankDlTimerElem = rankingDlElem.querySelector( '#deadline-timer' );
          self.comp_countdown.start( {
            root: rankDlTimerElem,
            'deadline': rankDeadline,
            'onfinish': () => {
              const saveElem = self.element.querySelector( '#submit' );
              saveElem.innerHTML = '';
            }
          } );

          // load user data
          self.data.store.get( username ).then( async ud => {
              userData = ud;
              if ( !userData ) userData = { key : username, answers: {}, ranking: {} };
              if ( !userData.ranking ) userData.ranking = {};
              if ( !userData.answers ) userData.answers = {};

              // load answers from store
              Object.keys( questionEntries ).forEach( async questionId => {
                qaData[ questionId ] = {};
                qaData[ questionId ][ 'question' ] = questionEntries[ questionId ];
                self.data.store.get( self.constants.key_ans_prefix + questionId ).then( async answers => {
                  if ( !answers ) {
                    qaData[ questionId ][ 'answers' ] = {};
                    return;
                  }
                  qaData[ questionId ][ 'answers' ] = answers;
                  // sample answers
                  selectedAns = getAnswers( userData, questionId, answers[ 'entries' ] );
                  // render ranking entry
                  const docFrag = await renderAnswerRanking( questionId, qaData[ questionId ][ 'question' ],
                                                      selectedAns, answers[ 'entries' ] );
                  rankingElem.appendChild( docFrag );
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
          if ( userData[ 'ranking' ] && userData[ 'ranking' ][ questionId ] ) {
            for ( rankedAnsKey in userData[ 'ranking' ][ questionId ] ) {
              if ( !( rankedAnsKey in allAnswers ) ) continue;
              const rankIndex = userData[ 'ranking' ][ questionId ][ rankedAnsKey ];
              selectedAnswers[ rankedAnsKey ] = rankIndex;
              delete indicesAvailable[ rankIndex ];
            }
          }

          // sort answers by rank count
          const ansByRankCount = sortAnswersByRankCount( questionId, selectedAnswers, userData, allAnswers );

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

        function sortAnswersByRankCount( questionId, selectedAnswers, userData, allAnswers ) {
          const ansByRankCount = {};
          for ( ansKey in allAnswers ) {
            // if there are enough entries in 'answers', stop the loop
            if ( Object.keys( selectedAnswers ).length === self.constants.num_answer ) break;

            // skip the user's own answers
            if ( userData[ 'answers' ][ questionId ] && ansKey === userData[ 'answers' ][ questionId ][ 'hash' ] )
              continue;

            // skip if answer is already considered
            if ( ansKey in selectedAnswers ) continue;

            // add to 'answers' if this answers is already ranked by the current user, unlikely to be here
            if ( username in allAnswers[ ansKey ][ 'ranked_by' ] && Object.keys( indiceAvailable ).length !==0 ) {
              // pop the first available rank index to store in 'answers'
              const rankIndex = Object.keys( indiceAvailable )[ 0 ];
              selectedAnswers[ ansKey ] = rankIndex;
              delete indiceAvailable[ rankIndex ]
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

        async function renderAnswerRanking( questionId, questionText, selectedAnswers, allAnswers ) {
          const qaRankingFragment = document.createDocumentFragment();
          $.setContent( qaRankingFragment, $.html( self.html.rank_entry, {
            'question_id': questionId, 'question_text': questionText
          } ) );

          // render the answer ranking area
          const answersDiv = qaRankingFragment.querySelector( '#answers' );
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
            sortableObjects[ questionId ] = await self.comp_sortable.start( {
              root: answersDiv,
              data: { 'id': questionId + '_answers', 'items': answerEntries }
            } );
          }

          return qaRankingFragment;
        }  // end renderAnswerRanking()

        function getDateObj( dateDict ) { return new Date( dateDict.date + ' ' + dateDict.time ) };

      };  // end start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
