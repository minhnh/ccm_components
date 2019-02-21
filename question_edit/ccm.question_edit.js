/**
 * @overview example ccm component that add question entries to a database
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'question_edit',

    ccm: 'https://ccmjs.github.io/ccm/ccm.js',

    config: {
      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.3.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      "data": { "store": [ "ccm.store" ] },

      // predefined strings
      "constants" : {
        "key_questions": "questions",   // key of store document containing question entries
        "question_prefix": "q_",        // will be prepended to question indices to create element ID's
        "truncate_length": 16           // number of characters to keep as ID for hashed questions
      },

      // $question_id$ and $question_text$ will be replaced with according values for each question
      // id '$question_id$_button' will be used for handling remove event
      "question_html": "<div class=\"input-group-prepend\">\n" +
          "  <span class=\"input-group-text\" id=\"$question_id$_label\">Question</span>\n" +
          "</div>\n" +
          "<input type=\"text\" name=\"$question_id$\" class=\"form-control\" aria-label=\"Question\"\n" +
          "       aria-describedby=\"$question_id$_label\" value=\"$question_text$\">\n" +
          "<div class=\"input-group-append\">\n" +
          "  <button class=\"btn btn-link\" type=\"button\" id=\"$question_id$_button\">Remove</button>\n" +
          "</div>",

      "html": {
        'main': [
          { 'id': 'questions' },
          { 'id': 'add_question' },
          { 'id': 'save' }
        ]
      },

      'css': [
        'ccm.load', {
          url: 'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css', type: 'css',
          attr: { integrity: 'sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS', crossorigin: 'anonymous' }
        }, {
          url: 'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css', type: 'css', context: 'head',
          attr: { integrity: 'sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS', crossorigin: 'anonymous' }
        }
      ],

      'js': [
        'ccm.load', {
          // crypto-js module for hashing question data TODO: move to repo for faster loading
          url: "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js", type: 'js', context: 'head'
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
        let questionData = {};

        // login
        let username;
        self.user && await self.user.login().then ( () => {
          username = self.user.data().user;
        } ).catch((exception) => console.log('login: ' + exception.error));

        if (!username) {
          self.element.innerHTML = '<div class="alert alert-info" role="alert">\n' +
              '  Please login to continue!\n' +
              '</div>';
          return;
        }

        // has logger instance? => log 'start' event
        self.logger && self.logger.log( 'start' );

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main ) );

        // get page fragments
        const questionsElem = self.element.querySelector( '#questions' );
        const addQuestionElem = self.element.querySelector( '#add_question' );
        const saveElem = self.element.querySelector( '#save' );

        // load initial data from store
        await self.data.store.get( self.constants.key_questions ).then(
            questions => {
              Object.assign( questionData, questions && questions.entries ? questions.entries : {} );
            },
            reason => {   // read questions failed
              console.log( reason );
            }).catch( err => console.log( err.message ) );    // unhandled exception

        // render questions
        renderQuestions();

        // render button to add new questions
        renderAddQuestionButton();

        // render area with save button and notification
        renderSaveElem();

        function renderSaveElem(){
          const saveButton = document.createElement( 'button' );
          const notificationSpan = document.createElement( 'span' );
          saveElem.appendChild( saveButton );
          saveElem.appendChild( notificationSpan );

          saveButton.setAttribute('type', 'button' );
          saveButton.className = "btn btn-info";
          saveButton.innerText = 'Save';
          saveButton.addEventListener('click', async () => {
            await self.data.store.set( { key: self.constants.key_questions, 'entries': questionData } ).then (
                () => {       // successful update
                  notificationSpan.innerHTML = 'Success';
                  notificationSpan.className = "alert alert-dismissible";
                  setTimeout(function () {
                    notificationSpan.innerHTML = ' ';
                  }, 1000);
                },
                reason => {   // write failed
                  console.log( reason );
                }).catch( err => console.log( err.message ) );    // unhandled exception
            renderQuestions();
        });
    }

        function renderQuestions() {
          questionsElem.innerHTML = '';
          Object.keys( questionData ).forEach( questionId => {
            const question = questionData[ questionId ];
            questionsElem.appendChild( renderQuestionDiv( questionId, question ? question.text : '' ) );
          });
        }

        function renderAddQuestionButton() {
          const addQuestionButton = document.createElement('button' );
          addQuestionButton.className = 'btn btn-link';
          addQuestionButton.setAttribute('type', 'button' );
          addQuestionButton.innerText = 'Add New Question';
          addQuestionButton.addEventListener('click', async () => {
            const emptyQuestionId = getQuestionId( '' );

            // if there is already an empty entry return
            if ( questionData[ emptyQuestionId ] ) return;

            // add empty question entry
            questionData[ emptyQuestionId ] = {
              'text': '',
              'last_modified': username,
              'answered_by': []
            };
            renderQuestions();
          });
          addQuestionElem.appendChild( addQuestionButton );
        }

        function renderQuestionDiv( questionId, questionText ) {
          const questionDiv = document.createElement('div');
          questionDiv.className = "input-group mb-3";
          questionDiv.innerHTML = self.question_html;

          // ensure valid question ID's and name, i.e. no leading number
          const questionIdHtml = self.constants.question_prefix + questionId;
          questionDiv.innerHTML = questionDiv.innerHTML.replace(
              /\$question_id\$/g, questionIdHtml );
          questionDiv.innerHTML = questionDiv.innerHTML.replace(/\$question_text\$/g, questionText);

          // write text content to dataset when question field is unfocused
          const questionInput = questionDiv.querySelector( 'input[name=\'' + questionIdHtml + '\']' );
          questionInput.addEventListener( 'blur', ( event ) => {
            const inputElem = event.srcElement;
            questionData[ questionId ].text = inputElem ? inputElem.value : '';
            reindexQuestions();
          });

          // handle removing a question
          const removeButton = questionDiv.querySelector('#' + questionIdHtml + '_button' );
          removeButton.addEventListener('click', async () => {
            delete questionData[ questionId ];
            renderQuestions();
          });
          questionDiv.appendChild( removeButton );

          return questionDiv;
        }

        // ensure the question ids are correct
        function reindexQuestions() {
          Object.keys( questionData ).forEach( key => {
            // calculate new question ID
            const questionId = getQuestionId( questionData[ key ][ "text" ] );

            // return if key matches calculated id
            if ( questionId === key ) return;

            questionData[ questionId ] = questionData[ key ];
            delete questionData[ key ];
          });
        }

        // create question ID from text
        function getQuestionId( questionText ) {
          // use a truncated SHA-256 as new question ID
          const hashObj = CryptoJS.SHA256( questionText.trim() );
          return hashObj.toString().substring( 0, self.constants.truncate_length );
        }
      };
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
