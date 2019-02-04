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
      "question_html": "<div class=\"input-group-prepend\">\n" +
          "  <span class=\"input-group-text\" id=\"$question_id$_label\">Question</span>\n" +
          "</div>\n" +
          "<input type=\"text\" name=\"$question_id$\" class=\"form-control\" aria-label=\"Question\"\n" +
          "       aria-describedby=\"$question_id$_label\" value=\"$question_text$\">",

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
        this.data['user'] = !!this.user;
        const dataset = await $.dataset( this.data );

        // has logger instance? => log 'start' event
        this.logger && this.logger.log( 'start', $.clone( dataset ) );

        // render main HTML structure
        $.setContent( this.element, $.html( this.html.main ) );

        // get page fragments
        const questionsElem = this.element.querySelector( '#questions' );
        const addQuestionElem = this.element.querySelector( '#add_question' );
        const saveElem = this.element.querySelector( '#save' );

        await renderQuestions();

        const saveButton = document.createElement('button');
        saveElem.appendChild(saveButton);
        saveButton.setAttribute('type', 'button');
        saveButton.className = "btn btn-info";
        saveButton.innerText = 'Save';
        saveButton.addEventListener('click', (event) => {
          console.log(self.ccm.helper.formData(questionsElem));
        });

        //self.data.store.set({'key': 'task_1', 'q_2': { 'text': 'question 2', 'answers': [], 'user': 'mnguy12s' }})

        console.log(dataset["question_ids"].length);
        async function renderQuestions() {
          dataset["question_ids"].forEach((questionId) => {
            const question = dataset[questionId];
            questionsElem.appendChild(renderQuestionDiv(questionId, question.text));
          });
        }

        function renderQuestionDiv(questionId, questionText) {
          const questionDiv = document.createElement('div');
          questionDiv.className = "input-group mb-3";
          questionDiv.innerHTML = self.question_html;

          questionDiv.innerHTML = questionDiv.innerHTML.replace(/\$question_id\$/g, questionId);
          questionDiv.innerHTML = questionDiv.innerHTML.replace(/\$question_text\$/g, questionText);

          return questionDiv;
        }
      };
    }
  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();