/**
 * @overview example ccm component that just renders "Hello, World!"
 * @author André Kless <andre.kless@web.de> 2017-2018
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'answer_edit',

    config: {
      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.3.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      "data": { "store": [ "ccm.store" ] },

      // predefined strings
      "constants" : {
        "key_questions": "questions",   // key of store document containing question entries
        "qa_prefix": "qa_",             // will be prepended to question-answer pair indices to create element ID's
      },

      "html": {
        'main': [
          { 'id': 'content' },
          { 'id': 'save' }
        ]
      },

      // '$qa_id$', '$qa_question$' will be replaced with according values for each question
      "qa_html": '<div class="input-group row m-1">\n' +
          '  <div class="input-group-prepend col-sm-0 p-1">' +
          '    <label for="$qa_id$_question" class="text-secondary">Question</label>' +
          '  </div>\n' +
          '  <div class="col-sm-0">\n' +
          '    <input type="text" readonly class="form-control-plaintext p-1 text-info" id="$qa_id$_question"' +
          '           value="$qa_question$">\n' +
          '  </div>\n' +
          '</div>\n' +
          '<div class="input-group row mb-3 m-1">\n' +
          '  <div class="input-group-prepend col-md-0" >\n' +
          '    <label for="$qa_id$_answer" class="p-2 input-group-text">Answer</label>\n' +
          '  </div>\n' +
          '  <div class="col-lg-0">' +
          '    <textarea class="form-control" aria-label="Answer" id="$qa_id$_answer" style="resize: both;">' +
          '      $qa_answer$' +
          '    </textarea>' +
          '  </div>\n' +
          '</div>',

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

    ccm: 'https://ccmjs.github.io/ccm/ccm.js',

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
        const qaData = {};

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
        const contentElem = self.element.querySelector( '#content' );
        const saveElem = self.element.querySelector( '#save' );

        // load questions from store
        await self.data.store.get(self.constants.key_questions).then( (questions) => {
          questions && questions.entries && questions.entries.forEach( (entry, i) => {
            const qaId = self.constants.qa_prefix + i;
            qaData[qaId] = {};
            qaData[qaId]['question'] = entry.text;
          } );
        });

        renderQAPairs();

        // render save button
        const saveButton = document.createElement('button');
        saveElem.appendChild(saveButton);
        saveButton.setAttribute('type', 'button');
        saveButton.className = "btn btn-info";
        saveButton.innerText = 'Save';
        saveButton.addEventListener('click', async () => {
          // TODO
        });

        function renderQAPairs() {
          Object.keys(qaData).sort().forEach( (qaId) => {
            const qaDiv = document.createElement('div');
            qaDiv.innerHTML = self.qa_html;

            qaDiv.innerHTML = qaDiv.innerHTML.replace(/\$qa_id\$/g, qaId);
            qaDiv.innerHTML = qaDiv.innerHTML.replace(/\$qa_question\$/g, qaData[qaId].question);
            const answer = qaData[qaId].answer ? qaData[qaId].answer : '';
            qaDiv.innerHTML = qaDiv.innerHTML.replace(/\$qa_answer\$/g, answer);
            contentElem.appendChild(qaDiv);
          } );
        }
      };

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();