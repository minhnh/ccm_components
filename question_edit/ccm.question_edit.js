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
        let username;
        // this.data['user'] = !!self.user;

        // login
        self.user && await self.user.login().then ( () => {
          username = self.user.data().user;
        } ).catch((exception) => console.log('login: ' + exception.error));

        let dataset = await $.dataset( this.data );

        // has logger instance? => log 'start' event
        this.logger && this.logger.log( 'start', $.clone( dataset ) );
        const origData = $.clone(dataset);

        // render main HTML structure
        $.setContent( this.element, $.html( this.html.main ) );

        // get page fragments
        const questionsElem = this.element.querySelector( '#questions' );
        const saveElem = this.element.querySelector( '#save' );

        await renderQuestions();

        // render save button
        const saveButton = document.createElement('button');
        saveElem.appendChild(saveButton);
        saveButton.setAttribute('type', 'button');
        saveButton.className = "btn btn-info";
        saveButton.innerText = 'Save';
        saveButton.addEventListener('click', async () => {
          await self.data.store.set({ key: dataset.key, 'question_ids': dataset['question_ids'] });
          dataset['question_ids'].forEach(async (questionId) => {
            // TODO: confirm answers are stored?
            const writeData = { key: dataset.key };
            writeData[questionId] = dataset[questionId];
            await self.data.store.set(writeData);
          });
          await renderQuestions();
        });

        async function renderQuestions() {
          questionsElem.innerHTML = '';
          dataset["question_ids"].forEach((questionId) => {
            const question = dataset[questionId];
            questionsElem.appendChild(renderQuestionDiv(questionId, question ? question.text : ''));
          });

          // render add question button/link
          const answerButton = document.createElement('button');
          answerButton.className = 'btn btn-link';
          answerButton.setAttribute('type', 'button');
          answerButton.innerText = 'Add New Question';
          answerButton.addEventListener('click', async () => {
            const newQuestionId = 'q_' + (dataset["question_ids"].length + 1);
            if (dataset[newQuestionId]) {
              reindexQuestions();
            }

            dataset["question_ids"].push(newQuestionId);
            dataset[newQuestionId] = {
              'text': '',
              'user': username,
              'answers': []
            };
            await renderQuestions();
          });
          questionsElem.appendChild(answerButton);
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
            dataset[questionId].text = inputElem ? inputElem.value : '';
          });

          // handle removing a question
          const removeButton = questionDiv.querySelector('#' + questionId + '_button');
          removeButton.addEventListener('click', async () => {
            delete dataset[questionId];
            reindexQuestions();
            await renderQuestions();
          });
          questionDiv.appendChild(removeButton);

          return questionDiv;
        }

        // ensure the question ids are correct
        function reindexQuestions() {
          let questionNum = 1;
          let newData = { 'key': dataset.key, 'updated_at': dataset.updated_at, 'question_ids': [] };
          Object.keys(dataset).sort().forEach( key => {
            // skipping metadata
            if (!key.match(/q_\d+/)) {
              delete dataset[key];
              return;
            }

            // copying questions to new object
            const questionId = 'q_' + questionNum;
            newData[questionId] = dataset[key];
            newData['question_ids'].push(questionId);
            delete dataset[key];

            questionNum++;
          });
          dataset = newData;
        }

        function cleanUpOrphanedQuestions() {
        }
      };
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();