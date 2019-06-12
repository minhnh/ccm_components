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
              "id": "title-row",
              "class": "row",
              "inner": [
                {
                  "id": "question-title-col",
                  "class": "col-4 p-2 ml-3 table-primary",
                  "inner": "<h4>Questions</h4>"
                },
                {
                  "id": "answer-title-col",
                  "class": "col-6 p-2 table-primary",
                  "inner": "<h4>Answers</h4>"
                }
              ]
            },
            {
              "id": "content-row",
              "class": "row",
              "inner": [
                {
                  "id": "question-col",
                  "class": "col-4 ml-3 p-2",
                  "inner": [
                    {
                      "id": "question-tabs",
                      "class": "list-group",
                      "role": "tablist"
                    }
                  ]
                },
                {
                  "id": "answer-col",
                  "class": "col-6 p-2",
                  "inner": [
                    {
                      "id": "answer-panel",
                      "class": "tab-content"
                    }
                  ]
                }
              ]
            }
          ]
        }
      },

      'css': [ 'ccm.load',
        { url: '../lib/css/bootstrap.min.css', type: 'css' },
        { url: '../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
      ],

      'js': [ 'ccm.load', [
          { url: '../lib/js/jquery-3.3.1.slim.min.js', type: 'js', context: 'head' },
          { url: '../lib/js/bootstrap.bundle.min.js', type: 'js', context: 'head' }
        ]
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
                  renderQA( questions.entries[ questionId ], answers.entries, isActive );
                },
                reason => console.log( 'get answers rejected: ' + reason )
                ).catch( err => console.log( 'get answers failed: ' + err.error ) );
              } );
            },
            reason => console.log( 'get questions rejected: ' + reason )
          ).catch( err => console.log( 'get questions failed: ' + err.error ) );
        },
        reason => {
          console.log( 'login rejected: ' + reason );
        } ).catch( ( exception ) => console.log( 'login failed: ' + exception.error ) );

        function renderQA( questionText, answers, isActive ) {
          questionTabsDiv.appendChild( getQuestionTab( questionText, isActive ) );
          console.log(answers);
        }  // end renderQA()

        function getQuestionTab( questionText, isActive ) {
          const questionTab = document.createElement( 'a' );
          questionTab.className = 'list-group-item list-group-item-action flex-column align-items-start';
          if ( isActive ) questionTab.className += ' active';
          questionTab.innerHTML = questionText;
          return questionTab;
        }

      };  // end start

    }  // end Instance
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();