/**
 * @overview ccm component for getting answer rankings and calculating their combined scores
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'answer_scores',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      'data': { 'store': [ 'ccm.store' ] },

      'components': {
        'user': [ 'ccm.component', '../../lib/js/ccm/ccm.user-9.2.0.min.js' ],

        'katex': [ 'ccm.component', '../katex/ccm.katex.js' ],

        'countdown': [ 'ccm.component', '../countdown_timer/ccm.countdown_timer.js' ]
      },

      "user_realm": "guest", "user": null,

      // predefined values
      'constants' : {
        'key_questions': 'questions',   // key of store document containing question entries
        'key_ans_prefix': 'answers_',   // question ID's will be appended to this to create the name of the document
                                        // containing the question's answers
        'score_decimal_points': 3
      },

      'html': {
        "main": {
          "id": "main",
          "inner": [
            {
              // table headers
              "id": "title-row",
              "class": "row text-info",
              "inner": [ {
                "id": "question-title-col",
                "class": "col-4 ml-3 mr-1 list-group-item",
                "inner": "<h5>Questions</h5>"
              }, {
                "id": "answer-title-col",
                "class": "col-7 p-2 pl-3 list-group-item",
                "inner": "<h5>Answers</h5>"
              } ]
            },  // end title-row

            {
              // table content, containing question tabs and a panel for answers
              "id": "content-row",
              "class": "row",
              "inner": [ {
                // question column containing control tabs
                "id": "question-col",
                "class": "col-4 ml-3 p-2",
                "inner": [ {
                  "id": "question-tabs",
                  "class": "list-group",
                  "role": "tablist"
                } ]
              }, {
                // answer column containing answers and their scores
                "id": "answer-col",
                "class": "col-7 p-3 pr-5 ml-3",
                "inner": [ {
                  "id": "answer-panel",
                  "class": "tab-content"
                } ]
              } ]
            }  // end content-row
          ]  // end main.inner
        },  // end main

        // HTML configs for the control element which display a question
        'question_tab': {
          'id': 'q_%question_id%', 'data-toggle': "list", 'role': 'tab',
          'href': '#a_%question_id%', 'aria-controls': 'a_%question_id%', 'onclick': '%click%',
          'inner': [
            { 'tag': 'span', 'class': "badge badge-light col", 'inner': 'Question %question_num%' },
            { 'tag': 'span', 'class': 'col', 'id': 'questionTabContent' }
          ]
        },  // end question_tab

        // HTML configs for the answer panel to display when a question tab is clicked
        'answer_panel': {
          'id': 'a_%question_id%', 'role': 'tabpanel', 'aria-labelledby': 'q_%question_id%',
          'inner': [ {
            // HTML configs of a table which displays answer and their combined ranking scores
            'class': 'table table-hover',
            'tag': 'table',
            'inner': [
              // table header
              {
                'class': 'answer-table-head',
                'tag': 'thead',
                'inner': [ {
                  'tag': 'tr', 'class': 'row',
                  'inner': [
                    // 4 columns
                    { 'tag': 'th', 'class': 'col-1 text-center', 'inner': '#' },
                    { 'tag': 'th', 'class': 'col', 'inner': 'Answer' },
                    { 'tag': 'th', 'class': 'col-1 d-none', 'inner': 'Username', 'id': 'answer-head-username' },
                    { 'tag': 'th', 'class': 'col-1 text-center', 'inner': 'Score' },
                    { 'tag': 'th', 'class': 'col-2 text-center', 'inner': '# rankings' },
                  ]
                } ]
              },
              // table body
              {
                'class': 'answer-table-body',
                'tag': 'tbody'
              },
            ]
          } ]
        },  // answer_panel

        // HTML configs of a row containing answer info
        'answer_row': {
          'tag': 'tr', 'class': 'row',
          'inner': [
            { 'tag': 'td', 'class': 'col-1 text-center font-weight-bold answer-row-index' },
            { 'tag': 'td', 'class': 'col answer-row-text' },
            { 'tag': 'td', 'class': 'col-1 d-none answer-row-username' },
            { 'tag': 'td', 'class': 'col-1 text-center answer-row-score' },
            { 'tag': 'td', 'class': 'col-2 text-center answer-row-num-ranking' },
          ]
        },  // end answer_row

        'deadline_timer': {
          'id': 'deadline', 'class': 'mb-2 row m-1', 'inner': [
            {
              'tag': 'label', 'class': 'input-group-prepend col-sm-0 p-1 mt-2 text-secondary',
              'inner': '%label%', 'for': 'deadline-timer'
            },
            { 'id': 'deadline-timer', 'class': 'col-sm-0' }
          ]
        },  // end 'deadline_timer'

        // message to display when user is not logged in
        'login_message': { 'class': 'alert alert-info', 'role': 'alert', 'inner': 'Please login to continue!\n' }
      },

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'fontawesome': '../../lib/css/fontawesome-all.min.css',
        'katex': '../../lib/css/katex.min.css'
      },

      'js': {
        'katex': '../../lib/js/katex.min.js',
        'katex_auto_render': '../../lib/js/auto-render.min.js'
      }
    },

    Instance: function () {

      let $;

      this.ready = async () => {
        // set shortcut to help functions
        $ = this.ccm.helper;
      };  // end ready

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
        } ).catch( ( exception ) => console.log( exception ) );

        if ( !username ) {
          $.setContent( mainDivElem, $.html( self.html.login_message ) );
          return;
        }

        // keep track of which question is currently selected
        const isQuestionSelected = {};

        // get question entries and deadlines
        const questionEntries = {};
        let selectedQuestionIds;
        let rankDeadline = null;
        await self.data.store.get( self.constants.key_questions ).then(
          questionStore => {
            if ( !questionStore ) return;
            if ( questionStore.ranking_deadline ) rankDeadline = questionStore.ranking_deadline;
            if ( questionStore.entries ) Object.assign( questionEntries, questionStore.entries );
            selectedQuestionIds = questionStore.selected_ids ? questionStore.selected_ids : [];
          },
          reason => console.log( reason )               // read from question store failed
        ).catch( err => console.log( err ) );   // unhandled exception;

        // if rankDeadline is specified, wait until the deadline for ranking answers is finished,
        // otherwise render content
        if ( rankDeadline ) {
          $.setContent( mainDivElem,  $.html( self.html.deadline_timer, {
            'label': 'Answer scores available in:'
          } ) );
          const rankDlTimerElem = mainDivElem.querySelector( '#deadline-timer' );
          await self.components.countdown.start( {
            root: rankDlTimerElem, 'css': self.css, 'deadline': rankDeadline,
            'onfinish': async () => { await renderContent(); }
          } );
        } else {
          await renderContent();
        }

        ////////////////////
        // FUNCTIONS
        ////////////////////

        async function renderContent() {
          // render main HTML structure
          $.setContent( mainDivElem, $.html( self.html.main ) );

          // get page fragments
          const contentRowDiv = mainDivElem.querySelector( '#content-row' );
          const questionTabsDiv = contentRowDiv.querySelector( '#question-tabs' );
          const answerPanelDiv = contentRowDiv.querySelector( '#answer-panel' );

          // get user role for rendering content accordingly
          let showUsername = false;
          await self.data.store.get( 'role' ).then( roleInfo => {
            if ( roleInfo.name === 'admin' || roleInfo.name === 'grader' ) showUsername = true;
          } );

          // render questions and their answers, set first question tab and answer panel as active
          selectedQuestionIds.forEach( ( questionId, index ) => {
            const isActive = ( index === 0 ) ? true : false;
            isQuestionSelected[ questionId ] = isActive;
            // add question tab and answer panel
            questionTabsDiv.appendChild(
              getQuestionTab( questionTabsDiv, answerPanelDiv, index, questionId,
                              questionEntries[ questionId ], isActive )
            );

            self.data.store.get( self.constants.key_ans_prefix + questionId )
            .then(
              answers => {
                if ( !answers || !answers.entries ) {
                  answers = { 'entries': {} }
                }
                answerPanelDiv.appendChild( getAnswerPanel( questionId, answers.entries, isActive, showUsername ) );
              },
              reason => console.log( 'get answers rejected: ' + reason )
            ).catch( err => console.log( 'get answers failed: ' + err ) );
          } );
        }  // end renderContent()

        function getQuestionTab( questionTabsElem, ansPanelsElem, questionIndex, questionId, questionText, isActive ) {
          const questionTab = $.html( self.html.question_tab, {
            'question_id': questionId,

            'question_num': questionIndex + 1,

            // handler for when a question menu is clicked
            'click': event => {
              event.preventDefault();

              // skip event if tab already selected
              if ( isQuestionSelected[ questionId ] ) return;

              // set clicked question tab to active and show corresponding answer panel, update 'isQuestionSelected'
              const currentQTab = questionTabsElem.querySelector( '#' + getQuestionTabId( questionId ) );
              setQuestionTabActive( currentQTab, true );
              isQuestionSelected[ questionId ] = true;
              const ansPanel = ansPanelsElem.querySelector( '#' + getAnswerPanelId( questionId ) )
              setAnsPanelActive( ansPanel, true );

              // set other question tabs to inactive and hide their answer panels
              for ( checkQuestionId in isQuestionSelected ) {
                // skip current question
                if ( checkQuestionId === questionId ) continue;

                // skip if the checked question is not currently selected
                if ( !isQuestionSelected[ checkQuestionId ] ) continue;

                // update previously active tab and answer panel
                const checkQTab = questionTabsElem.querySelector( '#' + getQuestionTabId( checkQuestionId ) );
                setQuestionTabActive( checkQTab, false );
                const checkAnsPanel = ansPanelsElem.querySelector( '#' + getAnswerPanelId( checkQuestionId ) );
                setAnsPanelActive( checkAnsPanel, false );
                isQuestionSelected[ checkQuestionId ] = false;
              }
            }
          } );  // end $.html()

          // start a katex instance to render equations in the question
          const qContent = questionTab.querySelector( '#questionTabContent' );
          self.components.katex.start( {
            root: qContent, "css": self.css, "js": self.js, 'editable': false,
            data: { 'id': 'content_' + questionId, 'text': `${ questionText }` }
          } );

          setQuestionTabActive( questionTab, isActive );
          return questionTab;
        }  // end getQuestionTab()

        function getAnswerPanel( questionId, answers, isActive, showUsername ) {
          // create answer panel
          const ansPanelDiv = $.html( self.html.answer_panel, { 'question_id': questionId } );
          setAnsPanelActive( ansPanelDiv, isActive );
          const ansTableBody = ansPanelDiv.querySelector( '.answer-table-body' );

          // show username table header if user is grader or admin
          if ( showUsername ) {
            const usernameThElem = ansPanelDiv.querySelector( 'th#answer-head-username' );
            usernameThElem.classList.remove( 'd-none' );
          }

          // organize answer scores, fill table rows by descending scores
          const ansScores = organizeAnswerScores( answers );
          let ansIndex = 1;
          Object.keys( ansScores.ansByScore ).sort( ( a, b ) => b - a ).forEach( score => {
            ansScores.ansByScore[ score ].forEach( ansInfo => {
              const ansRow = $.html( self.html.answer_row );
              fillAnswerTableRow( ansRow, ansIndex, ansInfo.text, score, ansInfo.numRankings,
                                  ansInfo.authors, showUsername );
              ansTableBody.appendChild( ansRow );
              ansIndex += 1;
            } );
          } );

          ansScores.unranked.forEach( ansInfo => {
            const ansRow = $.html( self.html.answer_row );
            fillAnswerTableRow( ansRow, ansIndex, ansInfo.text, 'unranked', 0, ansInfo.authors, showUsername );
            ansTableBody.appendChild( ansRow );
            ansIndex += 1;
          } );
          return ansPanelDiv;
        }  // getAnswerPanel()

        function fillAnswerTableRow( answerRowElem, ansIndex, ansText, score, numRankings, authors, showUsername ) {
          const ansIndexCell = answerRowElem.querySelector( 'td.answer-row-index' );
          const ansTextCell = answerRowElem.querySelector( 'td.answer-row-text' );
          const ansUsernameCell = answerRowElem.querySelector( 'td.answer-row-username' );
          const ansScoreCell = answerRowElem.querySelector( 'td.answer-row-score' );
          const ansNumRankingCell = answerRowElem.querySelector( 'td.answer-row-num-ranking' );

          // show usernames for answer if allowed
          if ( showUsername ) {
            ansUsernameCell.classList.remove( 'd-none' );
            ansUsernameCell.innerText = authors.join( ', ' );
          }

          ansIndexCell.innerHTML = ansIndex;
          ansScoreCell.innerHTML = score;
          ansNumRankingCell.innerHTML = numRankings;

          // start a katex instance to render equations in the answer
          self.components.katex.start( {
            root: ansTextCell, "css": self.css, "js": self.js, 'editable': false,
            data: { 'id': 'ans_content', 'text': ansText }
          } );
        }

        function organizeAnswerScores( answers ) {
          // sort answers by their score
          const answerScores = { 'unranked': [], 'ansByScore': {} }
          for ( ansId in answers ) {
            const authorList = answers[ ansId ].authors ? Object.keys( answers[ ansId ].authors ) : [];

            // separate the unranked answer
            const numRankings = Object.keys( answers[ ansId ].ranked_by ).length;
            if ( numRankings === 0 ) {
              answerScores.unranked.push( { 'text': answers[ ansId ].text, 'authors': authorList } );
              continue;
            }

            // calculate score: average of all (1 - normalizedRanking)
            let ansScore = 0;
            Object.values( answers[ ansId ].ranked_by ).forEach( normalizedRank => {
              ansScore += 1 - normalizedRank;
            } );
            ansScore /= numRankings;
            ansScore = ansScore.toFixed( self.constants.score_decimal_points );

            // add answer info to 'answersByRankings'
            const ansInfo = { 'text': answers[ ansId ].text, 'numRankings': numRankings, 'authors': authorList };
            if ( ansScore in answerScores.ansByScore ) {
              answerScores.ansByScore[ ansScore ].push( ansInfo );
            } else {
              answerScores.ansByScore[ ansScore ] = [ ansInfo ];
            }
          }
          return answerScores;
        }  // end getAnswerScores()

        function getQuestionTabId( questionId ) { return 'q_' + questionId }

        function getAnswerPanelId( questionId ) { return 'a_' + questionId }

        function setQuestionTabActive( qTabElem, isActive ) {
          const questionTabClasses = 'list-group-item list-group-item-action flex-column align-items-start';
          qTabElem.className = isActive ? questionTabClasses + ' active'
                                        : questionTabClasses;
        }  // end setQuestionTabActive()

        function setAnsPanelActive( ansPanelElem, isActive ) {
          ansPanelElem.className = isActive ? 'tab-pane fade show active' : 'tab-pane fade';
        }  // end setAnsPanelActive()

      };  // end start

    }  // end Instance
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();