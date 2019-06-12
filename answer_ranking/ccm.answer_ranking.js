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

      'comp_sortable': [ 'ccm.component', '../sortable/ccm.sortable.js' ],

      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.1.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      // predefined values
      'constants' : {
        'key_questions': 'questions',   // key of store document containing question entries
        'key_ans_prefix': 'answers_',   // question ID's will be appended to this to create the name of the document
                                        // containing the question's answers
        'num_answer': 5,                // number of answers to rank'question_html':
        'question_html':                // default HTML for each question text element
`
<div class="input-group row m-1 pt-4">
  <div class="input-group-prepend col-sm-0 p-1">
    <label for="q_$q_id$" class="text-secondary">Question</label>
  </div>
  <div class="col-sm-0">
    <input type="text" readonly class="form-control-plaintext p-1 text-info" id="q_$q_id$" value="">
  </div>
</div>
`,
      },

      'html': {
        "main": {
          "id": "main",
          "inner": [
            { "id": "ranking" },
            { "id": "submit" }
          ]
        },
        "rank_entry": {
          "class": "rank_entry",
          "inner": [
            { "id": "question" },
            { "id": "answers" }
          ]
        }
      },

      'css': [ 'ccm.load',
        { url: '../lib/css/bootstrap.min.css', type: 'css' },
        { url: '../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
      ],
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
        let qaData = {};
        let userData;
        const sortableObjects = {};

        // login
        let username;
        self.user && await self.user.login().then ( () => {
          username = self.user.data().user;
        },
        reason => {  // login failed
          console.log( 'login rejected: ' + reason );
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
        $.setContent( this.element, $.html( this.html.main ) );

        // get page fragments
        const rankingElem = this.element.querySelector( '#ranking' );
        const submitElem = this.element.querySelector( '#submit' );

        // load user data
        self.data.store.get( username ).then( async ud => {
            userData = ud;

            // load questions and answers from store
            self.data.store.get( self.constants.key_questions ).then(
              questions => {
                questions && questions.entries && Object.keys( questions.entries ).forEach( async questionId => {
                  qaData[ questionId ] = {};
                  qaData[ questionId ][ 'question' ] = questions.entries[ questionId ];
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

          },
          reason => console.log( reason )               // read from data store failed
        ).catch( err => console.log( err.message ) );   // unhandled exception

        // render save button and notification span
        const saveButton = document.createElement( 'button' );
        const notificationSpan = document.createElement( 'span' );
        saveButton.innerHTML = 'Save';
        saveButton.className = 'btn btn-info m-3 p-2';
        notificationSpan.className = "alert alert-dismissible";
        submitElem.appendChild( saveButton );
        submitElem.appendChild( notificationSpan );

        saveButton.addEventListener( 'click', async () => {
          if ( !( 'ranking' in userData ) ) userData[ 'ranking' ] = {};
          for ( qId in sortableObjects ) {
            const rankings = sortableObjects[ qId ].getRanking();
            userData[ 'ranking' ][ qId ] = {};
            for ( rankNum in rankings ) {
              userData[ 'ranking' ][ qId ][ rankings[ rankNum ] ] = rankNum;
            }
          }
          await self.data.store.set( userData ).then( () => {
            notificationSpan.innerText = 'Success';
            setTimeout( function () {
              notificationSpan.innerText = '';
            }, 1000 );  // message disappear after 1 second
          } );
        } );  // end saveButton.addEventListener()

        function getAnswers( userData, questionId, allAnswers ) {
          // collection of selected answers to return
          const answers = {};

          // keep track of which indices already used
          const indiceAvailable = {};
          for ( indice in [ ...Array( self.constants.num_answer ).keys() ] ) indiceAvailable[indice] = true;

          // fill the user's ranked answers which are available in 'allAnswers'
          // this ensures updated answers to be resampled, and old ones to be discarded
          if ( userData[ 'ranking' ] && userData[ 'ranking' ][ questionId ] ) {
            for ( rankedAnsKey in userData[ 'ranking' ][ questionId ] ) {
              if ( !( rankedAnsKey in allAnswers ) ) continue;
              const rankIndex = userData[ 'ranking' ][ questionId ][ rankedAnsKey ];
              answers[ rankedAnsKey ] = rankIndex;
              delete indiceAvailable[ rankIndex ];
            }
          }

          // sort answers by rank count
          const ansByRankCount = {};
          for ( ansKey in allAnswers ) {
            // if there are enough entries in 'answers', stop the loop
            if ( Object.keys( answers ).length === self.constants.num_answer ) break;

            // skip the user's own answers
            if ( userData[ 'answers' ][ questionId ] && ansKey === userData[ 'answers' ][ questionId ][ 'hash' ] )
              continue;

            // skip if answer is already considered
            if ( ansKey in answers ) continue;

            // add to 'answers' if this answers is already ranked by the current user, unlikely to be here
            if ( username in allAnswers[ ansKey ][ 'ranked_by' ] && Object.keys( indiceAvailable ).length !==0 ) {
              // pop the first available rank index to store in 'answers'
              const rankIndex = Object.keys( indiceAvailable )[ 0 ];
              answers[ ansKey ] = rankIndex;
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
          }  // end sorting answers by rank count

          // Fill 'answers' randomly, starting from ones with the least number of ranking
          for ( rankCount in Object.keys( ansByRankCount ).sort() ) {
            let ansCount = Object.keys( answers ).length;

            // if there are enough entries in 'answers', stop the loop
            if ( ansCount === self.constants.num_answer ) break;

            // if there are not enough entries in 'answers' AND there are still answers with the current
            // number of ranking, randomly add more entries to 'answers'
            const answerKeys = ansByRankCount[ rankCount ];
            while ( ansCount < self.constants.num_answer && answerKeys.length > 0 ) {
              // sample random answer
              const randIndex = Math.floor( Math.random() * answerKeys.length );
              const selectedAnsKey = answerKeys.splice( randIndex, 1 )[ 0 ];

              // pop the first available rank index to store in 'answers'
              const rankIndex = Object.keys( indiceAvailable )[ 0 ];
              answers[ selectedAnsKey ] = rankIndex;
              delete indiceAvailable[ rankIndex ]

              // update 'ansCount'
              ansCount = Object.keys( answers ).length;
            }
          }  // end sampling for answers

          return answers;
        }  // end getAnswers()

        async function renderAnswerRanking( questionId, questionText, selectedAnswers, allAnswers ) {
          const qaRankingFragment = document.createDocumentFragment();
          $.setContent( qaRankingFragment, $.html( self.html.rank_entry ) );

          // render the question area
          const questionDiv = qaRankingFragment.querySelector( '#question' );
          questionDiv.innerHTML = self.constants.question_html;
          questionDiv.innerHTML = questionDiv.innerHTML.replace( /\$q_id\$/g, questionId );
          const questionTextElem = questionDiv.querySelector( "#q_" + questionId );
          questionTextElem.setAttribute( 'value', questionText );

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

      };  // end start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
