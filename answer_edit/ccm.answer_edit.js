/**
 * @overview ccm component to edit answers for questions created with question_edit
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'answer_edit',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.7.1.js',

    config: {
      'user': [
        'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.1.1.js',
        [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      "data": { "store": [ "ccm.store" ] },

      // predefined values
      "constants" : {
        "key_questions": "questions",   // key of store document containing question entries
        "qa_prefix": "qa_",             // will be prepended to question-answer pair indices to create element ID's
        "truncate_length": 16           // number of characters to keep as ID for hashed answers
      },

      "html": {
        'main': [
          { 'id': 'content' },
          { 'id': 'save' }
        ]
      },

      // '$qa_id$' will be replaced with according values for each question
      "qa_html":
`
<div class="input-group row m-1">
  <div class="input-group-prepend col-sm-0 p-1">
    <label for="$qa_id$_question" class="text-secondary">Question</label>
  </div>
  <div class="col-sm-0">
    <input type="text" readonly class="form-control-plaintext p-1 text-info" id="$qa_id$_question" value="">
  </div>
</div>
<div class="input-group row mb-3 m-1">
  <div class="input-group-prepend col-md-0">
    <label for="$qa_id$_answer" class="p-2 input-group-text">Answer</label>
  </div>
  <div class="col-lg-0">
    <textarea class="form-control" aria-label="Answer" id="$qa_id$_answer" style="resize: both;">
    </textarea>
  </div>
</div>`,

      'css': [ 'ccm.load',
        { url: '../lib/css/bootstrap.min.css', type: 'css' },
        { url: '../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
      ],

      'js': [
        'ccm.load', {
          url: "../lib/js/crypto-js.min.js", type: 'js', context: 'head'
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
        const qaData = {};

        // login
        let username;
        self.user && await self.user.login().then ( () => {
          username = self.user.data().user;
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
        $.setContent( self.element, $.html( self.html.main ) );

        // get page fragments
        const contentElem = self.element.querySelector( '#content' );
        const saveElem = self.element.querySelector( '#save' );

        // load questions from store
        await self.data.store.get( self.constants.key_questions ).then(
            questions => {
              questions && questions.entries && Object.keys( questions.entries ).forEach( questionId => {
                qaData[ questionId ] = {};
                qaData[ questionId ][ 'question' ] = questions.entries[ questionId ];
              } );
            },
            reason => console.log( reason )             // read from data store failed
        ).catch( err => console.log( err.message ) );   // unhandled exception

        // load answers from store
        await self.data.store.get( username ).then(
            ud => {
              if ( !ud ) {
                // create new user data document if not exist
                ud = { "answers": {}, "ranking": {} }
              }

              ud.answers && Object.keys( ud.answers ).forEach( questionId => {
                // if no question on record for this answer, skip entry
                if ( !qaData[ questionId ] ) return;

                qaData[ questionId ][ 'answer' ] = ud.answers[ questionId ][ 'text' ];
              } );
            },
            reason => console.log( reason )             // read from data store failed
        ).catch( err => console.log( err.message ) );   // unhandled exception

        renderQAPairs();

        // render save button
        const notificationSpan = document.createElement( 'span' );
        const saveButton = document.createElement( 'button' );
        saveElem.appendChild( saveButton );
        saveElem.appendChild( notificationSpan );

        notificationSpan.className = "alert alert-dismissible";
        saveButton.setAttribute( 'type', 'button' );
        saveButton.className = "btn btn-info";
        saveButton.innerText = 'Save';

        saveButton.addEventListener( 'click', async () => {
          let payload = {
            key : username,
            answers: {}
          };

          Object.keys( qaData ).forEach( ( key ) => {
            const questionIdHtml = self.constants.qa_prefix + key;
            let aId = "textarea#" + questionIdHtml + "_answer";
            const ansText = contentElem.querySelector( aId ).value;
            const hashObj = CryptoJS.SHA256( ansText.trim() );
            const ansHash = hashObj.toString().substring( 0, self.constants.truncate_length );
            payload.answers[ key ] = { 'text': ansText, 'hash': ansHash }
          });

          await self.data.store.set( payload ).then( () => {
            notificationSpan.innerText = 'Success';
            setTimeout( function () {
              notificationSpan.innerText = '';
            }, 1000 );  // message disappear after 1 second
          } );
        } );  // end saveButton.addEventListener()

        function renderQAPairs() {
          Object.keys( qaData ).forEach( ( questionId ) => {
            const qaDiv = document.createElement( 'div' );
            qaDiv.innerHTML = self.qa_html;

            const questionIdHtml = self.constants.qa_prefix + questionId;
            qaDiv.innerHTML = qaDiv.innerHTML.replace( /\$qa_id\$/g, questionIdHtml );

            // set question text
            const questionTextElem = qaDiv.querySelector( "#" + questionIdHtml + "_question" );
            questionTextElem.setAttribute( 'value', qaData[ questionId ].question );

            // set answer text
            const answer = qaData[ questionId ].answer ? qaData[ questionId ].answer : '';
            const answerTextElem = qaDiv.querySelector( "#" + questionIdHtml + "_answer" );
            answerTextElem.innerHTML = answer;

            contentElem.appendChild( qaDiv );
          } );  // end Object.keys().forEach()
        }  // end renderQAPairs()
      };  // end this.start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
