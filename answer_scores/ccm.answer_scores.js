/**
 * @overview ccm component for getting answer rankings and calculating their combined scores
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'answer_scores',

    ccm: 'https://ccmjs.github.io/ccm/ccm.js',

    config: {
      'data': { 'store': [ 'ccm.store' ] },

      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.1.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      // predefined values
      'constants' : {
        'key_questions': 'questions',   // key of store document containing question entries
        'key_ans_prefix': 'answers_',   // question ID's will be appended to this to create the name of the document
                                        // containing the question's answers
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
                "class": "col-6 p-2 list-group-item",
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
                "class": "col-6 p-2",
                "inner": [ {
                  "id": "answer-panel",
                  "class": "tab-content"
                } ]
              } ]
            }  // end content-row
          ]  // end main.inner
        },  // end main

        // HTML configs of a table which displays answer and scores
        'answer_table': {
          'class': 'table table-hover',
          'tag': 'table',
          'inner': [
            // table header
            {
              'class': 'answer-table-head',
              'tag': 'thead',
              'inner': [ {
                'tag': 'tr',
                'inner': [
                  // 4 columns
                  { 'tag': 'th', 'class': 'col-1', 'inner': '#' },
                  { 'tag': 'th', 'class': 'col-7', 'inner': 'Answer' },
                  { 'tag': 'th', 'class': 'col-1', 'inner': 'Score' },
                  { 'tag': 'th', 'class': 'col-1', 'inner': '# rankings' },
                ]
              } ]
            },
            // table body
            {
              'class': 'answer-table-body',
              'tag': 'tbody'
            },
          ]
        },  // end answer_table

        // HTML configs of a row containing answer info
        'answer_row': {
          'tag': 'tr',
          'inner': [
            { 'tag': 'th', 'class': 'answer-row-index' },
            { 'tag': 'td', 'class': 'answer-row-text' },
            { 'tag': 'td', 'class': 'answer-row-score' },
            { 'tag': 'td', 'class': 'answer-row-num-ranking' },
          ]
        }  // end answer_row
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
      };  // end ready

      this.start = async () => {
        // get dataset for rendering
        const self = this;

        const isQuestionSelected = {};

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main ) );
        // get page fragments
        const contentRowDiv = self.element.querySelector( '#content-row' );
        const questionTabsDiv = contentRowDiv.querySelector( '#question-tabs' );
        const answerPanelDiv = contentRowDiv.querySelector( '#answer-panel' );

        // login
        self.user && await self.user.login().then ( () => {
          const username = self.user.data().user;

          // load questions and answers from store
          self.data.store.get( self.constants.key_questions ).then(
            questions => {
              // show first tab as active
              questions && questions.entries && Object.keys( questions.entries ).forEach( ( questionId, index ) => {
                self.data.store.get( self.constants.key_ans_prefix + questionId ).then( answers => {
                  if ( !answers || !answers.entries ) {
                    return;
                  }

                  const isActive = ( index === 0 ) ? true : false;
                  isQuestionSelected[ questionId ] = isActive;
                  renderQA( questionId, questions.entries[ questionId ], answers.entries, isActive );
                },
                reason => console.log( 'get answers rejected: ' + reason )
                ).catch( err => console.log( 'get answers failed: ' + err ) );
              } );
            },
            reason => console.log( 'get questions rejected: ' + reason )
          ).catch( err => console.log( 'get questions failed: ' + err.error ) );
        },
        reason => {
          console.log( 'login rejected: ' + reason );
        } ).catch( ( exception ) => console.log( 'login failed: ' + exception.error ) );

        function renderQA( questionId, questionText, answers, isActive ) {
          questionTabsDiv.appendChild( getQuestionTab( questionId, questionText, isActive ) );
          answerPanelDiv.appendChild( getAnswerPanel( questionId, answers, isActive ) );
        }  // end renderQA()

        function getQuestionTab( questionId, questionText, isActive ) {
          const questionTab = document.createElement( 'a' );
          questionTab.id = getQuestionTabId( questionId );
          setQuestionTabActive( questionTab, isActive );
          setAttributes( questionTab, {
            'data-toggle': "list",
            'href': '#' + getAnswerPanelId( questionId ),
            'role': 'tab',
            'aria-controls': getAnswerPanelId( questionId )
          } );
          questionTab.innerHTML = questionText;
          questionTab.addEventListener( 'click', ( event ) => {
            event.preventDefault();

            // skip event if tab already selected
            if ( isQuestionSelected[ questionId ] ) return;

            // set clicked question tab to active and show corresponding answer panel, update 'isQuestionSelected'
            setQuestionTabActive( event.srcElement, true );
            isQuestionSelected[ questionId ] = true;
            const ansPanel = answerPanelDiv.querySelector( '#' + getAnswerPanelId( questionId ) )
            setAnsPanelActive( ansPanel, true );

            // set other question tabs to inactive and hide their answer panels
            for ( checkQuestionId in isQuestionSelected ) {
              // skip current question
              if ( checkQuestionId === questionId ) continue;

              // skip if the checked question is not currently selected
              if ( !isQuestionSelected[ checkQuestionId ] ) continue;

              // update previously active tab and answer panel
              const checkQTab = questionTabsDiv.querySelector( '#' + getQuestionTabId( checkQuestionId ) );
              setQuestionTabActive( checkQTab, false );
              const checkAnsPanel = answerPanelDiv.querySelector( '#' + getAnswerPanelId( checkQuestionId ) );
              setAnsPanelActive( checkAnsPanel, false );
              isQuestionSelected[ checkQuestionId ] = false;
            }
          } );
          return questionTab;
        }  // end getQuestionTab()

        function getAnswerPanel( questionId, answers, isActive ) {
          // create answer panel
          const ansPanelDiv = document.createElement( 'div' );
          ansPanelDiv.id = getAnswerPanelId( questionId );
          setAnsPanelActive( ansPanelDiv, isActive );
          setAttributes( ansPanelDiv, {
            'role': 'tabpanel',
            'aria-labelledby': getQuestionTabId( questionId )
          } );

          // create and fill answer table
          const ansTable = $.html( self.html.answer_table );
          ansPanelDiv.appendChild( ansTable );
          const ansTableBody = ansTable.querySelector( '.answer-table-body' );

          // organize answer scores, fill table rows by descending scores
          const ansScores = organizeAnswerScores( answers );
          let ansIndex = 1;
          Object.keys( ansScores.ansByScore ).sort( ( a, b ) => b - a ).forEach( score => {
            ansScores.ansByScore[ score ].forEach( ansInfo => {
              const ansRow = $.html( self.html.answer_row );
              fillAnswerTableRow( ansRow, ansIndex, ansInfo.text, score, ansInfo.numRankings );
              ansTableBody.appendChild( ansRow );
              ansIndex += 1;
            } );
          } );

          ansScores.unranked.forEach( ansText => {
            const ansRow = $.html( self.html.answer_row );
            fillAnswerTableRow( ansRow, ansIndex, ansText, 'unranked', 0 );
            ansTableBody.appendChild( ansRow );
            ansIndex += 1;
          } );
          return ansPanelDiv;
        }  // getAnswerPanel()

        function fillAnswerTableRow( answerRowElem, ansIndex, ansText, score, numRankings ) {
          const ansIndexCell = answerRowElem.querySelector( 'th.answer-row-index' );
          const ansTextCell = answerRowElem.querySelector( 'td.answer-row-text' );
          const ansScoreCell = answerRowElem.querySelector( 'td.answer-row-score' );
          const ansNumRankingCell = answerRowElem.querySelector( 'td.answer-row-num-ranking' );

          ansIndexCell.innerHTML = ansIndex;
          ansTextCell.innerHTML = ansText;
          ansScoreCell.innerHTML = score;
          ansNumRankingCell.innerHTML = numRankings;
        }

        function organizeAnswerScores( answers ) {
          // sort answers by their score
          const answerScores = { 'unranked': [], 'ansByScore': {} }
          for ( ansId in answers ) {
            // seperate the unranked answer
            const numRankings = Object.keys( answers[ ansId ].ranked_by ).length;
            if ( numRankings === 0 ) {
              answerScores.unranked.push( answers[ ansId ].text );
              continue;
            }

            // calculate score: average of all (1 - normalizedRanking)
            let ansScore = 0;
            Object.values( answers[ ansId ].ranked_by ).forEach( normalizedRank => {
              ansScore += 1 - normalizedRank;
            } );
            ansScore /= numRankings;
            ansScore = ansScore.toFixed( 4 );

            // add answer info to 'answersByRankings'
            const ansInfo = { 'text': answers[ ansId ].text, 'numRankings': numRankings };
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

        function setAttributes( element, attribtues ) {
            for ( var key in attribtues ) {
                element.setAttribute(key, attribtues[key]);
            }
        }  // end setAttributes()

      };  // end start

    }  // end Instance
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();