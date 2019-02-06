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

      // predefined keys for the question answers collections
      "collection_keys" : {
        "questions": "questions",   // contain all question entries
        "question_prefix": "q_"
      },

      // $question_id$ and $question_text$ will be replaced with according values for each question
      // id $question_id$_button will be used for handling remove event
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

        // has logger instance? => log 'start' event
        // self.logger && self.logger.log( 'start', $.clone( dataset ) );
        self.logger && self.logger.log( 'start' );

        // render main HTML structure
        $.setContent( self.element, $.html( self.html.main ) );

        // get page fragments
        const questionsElem = self.element.querySelector( '#questions' );
        const addQuestionElem = self.element.querySelector( '#add_question' );
        const saveElem = self.element.querySelector( '#save' );

        // load initial data from store
        await self.data.store.get(self.collection_keys.questions).then( (questions) => {
          let questionIds = [];
          questions && questions.entries && questions.entries.forEach( (entry, i) => {
            const questionId = self.collection_keys.question_prefix + i;
            questionIds.push(questionId);
            questionData[questionId] = entry;
          } );
          questionData["question_ids"] = questionIds;
        });

        // render questions
        await renderQuestions();

        // render button to add new questions
        renderAddQuestionButton();

        // render save button
        const saveButton = document.createElement('button');
        saveElem.appendChild(saveButton);
        saveButton.setAttribute('type', 'button');
        saveButton.className = "btn btn-info";
        saveButton.innerText = 'Save';
        saveButton.addEventListener('click', async () => {
          // TODO: confirm answers are stored?
          let entries = [];
          Object.keys(questionData).sort().forEach( ( key ) => {
            if ( key === 'question_ids' ) return;
            entries.push(questionData[key]);
          } );
          await self.data.store.set({ key: self.collection_keys.questions, 'entries': entries });
          await renderQuestions();
        });

        async function renderQuestions() {
          questionsElem.innerHTML = '';
          questionData["question_ids"].forEach(async (questionId) => {
            const question = questionData[questionId];
            questionsElem.appendChild(renderQuestionDiv(questionId, question ? question.text : ''));
          });
        }

        function renderAddQuestionButton() {
          const answerButton = document.createElement('button');
          answerButton.className = 'btn btn-link';
          answerButton.setAttribute('type', 'button');
          answerButton.innerText = 'Add New Question';
          answerButton.addEventListener('click', async () => {
            const newQuestionId = self.collection_keys.question_prefix + (questionData["question_ids"].length + 1);
            if (questionData[newQuestionId]) {
              reindexQuestions();
            }

            questionData["question_ids"].push(newQuestionId);
            questionData[newQuestionId] = {
              'key': newQuestionId,
              'text': '',
              'user': username,
              'answers': []
            };
            await renderQuestions();
          });
          addQuestionElem.appendChild(answerButton);
        }

        function renderQuestionDiv(questionId, questionText) {
          const questionDiv = document.createElement('div');
          questionDiv.className = "input-group mb-3";
          questionDiv.innerHTML = self.question_html;

          questionDiv.innerHTML = questionDiv.innerHTML.replace(/\$question_id\$/g, questionId);
          questionDiv.innerHTML = questionDiv.innerHTML.replace(/\$question_text\$/g, questionText);

          // write text content to dataset when question field is unfocused
          const questionInput = questionDiv.querySelector('input[name=' + questionId + ']');
          questionInput.addEventListener('blur', (event) => {
            const inputElem = event.srcElement;
            questionData[questionId].text = inputElem ? inputElem.value : '';
          });

          // handle removing a question
          const removeButton = questionDiv.querySelector('#' + questionId + '_button');
          removeButton.addEventListener('click', async () => {
            delete questionData[questionId];
            reindexQuestions();
            await renderQuestions();
          });
          questionDiv.appendChild(removeButton);

          return questionDiv;
        }

        // ensure the question ids are correct
        function reindexQuestions() {
          let questionNum = 1;
          let newData = { 'question_ids': [] };
          Object.keys(questionData).sort().forEach( key => {
            // skipping metadata
            if (key === 'question_ids') {
              delete questionData[key];
              return;
            }

            // copying questions to new object
            const questionId = self.collection_keys.question_prefix + questionNum;
            newData[questionId] = questionData[key];
            newData[questionId].key = questionId;
            newData['question_ids'].push(questionId);
            delete questionData[key];

            questionNum++;
          });
          questionData = newData;
        }
      };
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();