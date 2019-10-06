/**
 * @overview ccm component to edit answers for questions created with question_edit
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'course_admin',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      'components': {
        'user': [ 'ccm.component', '../../lib/js/ccm/ccm.user-9.2.0.min.js' ]
      },

      "user_realm": "hbrsinfkaul", "user": null,

      "course_id": null,

      "store_url": null,

      "html": {
        'main': {
          'class': 'container-fluid',
          'inner': [
            {
              'class': 'mt-3', 'inner': [
              { 'class': 'row text-info ml-1', 'inner': '<h3>Course ID: %course-id%</h3>' }, { 'tag': 'hr' } ]
            },

            // area for users signed into the course
            {
              'id': 'users', 'class': 'mt-3',
              'inner': [
                { 'class': 'row text-info ml-1', 'inner': '<h3>Users</h3>' }, { 'tag': 'hr' },
                {
                  'class': 'row text-info p-1 mb-2', 'inner': [
                    { 'class': 'col-2', 'inner': '<h5>Username</h5>' },
                    { 'class': 'col-2 d-flex justify-content-center ml-2', 'inner': '<h5>Role</h5>' }
                  ]
                }
              ]
            },

            // area for the course's collections
            {
              'id': 'collections', 'class': 'mt-3',
              'inner': [ { 'class': 'row text-info ml-1', 'inner': '<h3>Course Collections</h3>' }, { 'tag': 'hr' } ]
            },
            // area for save button
            {
              'id': 'save',
              'inner': [
                { 'id': 'save-button', 'tag': 'button', 'type': 'button', 'class': 'btn btn-info', 'inner': 'Save',
                  'onclick': '%save-click%' },
                { 'id': 'save-notification', 'tag': 'span', 'class': 'alert alert-dismissible text-success' }
              ]
            }
          ]
        },  // end main

        // render entry for a user
        'user_entry': {
          'class': 'row',
          'inner': [
            // username
            { 'class': 'col-2 ml-3 p-2', 'inner': '%username%' },
            // role selection or just text if admin
            { 'class': 'col-2 d-flex justify-content-center', 'id': '%username%-role' }
          ],
        },  // end user_entry

        'role_select': {
          'tag': 'select', 'id': '%username%-select', 'class': 'form-control', 'onchange': '%change%',
          'inner': [
            { 'tag': 'option', 'value': 'student', 'inner': 'Student' },
            { 'tag': 'option', 'value': 'grader', 'inner': 'Grader' }
          ]
        },

        // display alert messages of different Bootstrap CSS types
        'alert_message': { 'class': 'alert alert-%type%', 'role': 'alert', 'inner': '%message%\n' }
      },

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'fontawesome': '../../lib/css/fontawesome-all.min.css'
      }
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

        // create a div element for rendering content and allow for CSS loading
        const mainDivElem = document.createElement( 'div' );
        $.setContent( self.element, mainDivElem );

        // load bootstrap CSS
        self.ccm.load(
          { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: self.element }
        );

        // login
        self.user = await self.components.user.start( {
          "css": [ "ccm.load",
            { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: 'head' },
            { url: self.css.fontawesome, type: 'css' }, { url: self.css.fontawesome, type: 'css', context: 'head' }
          ],
          "title": "Guest Mode: please enter any username", "realm": self.user_realm
        } );

        let courseInfoStore;
        await self.user.login()
        .then ( () => {
          // load course info from store
          self.ccm.store( {
            'name': 'courses#' + self.course_id, 'url': self.store_url, 'parent': self, 'method': 'POST'
          } )
          .then(
            infoStore => {
              courseInfoStore = $.clone( infoStore );
              return infoStore.get( self.course_id )
            } )
          .then(
            courseInfo => {
              if ( !courseInfo ) {
                return Promise.reject( 'no information for course ' + self.course_id );
              }

              let courseInfoClone = $.clone( courseInfo );
              $.setContent( mainDivElem, $.html( self.html.main, {
                'course-id': self.course_id,

                // handle saving new course info to database
                'save-click': () => {
                  courseInfoStore.set( courseInfoClone ).then( () => {
                    const notificationSpan = mainDivElem.querySelector( '#save-notification' );
                    notificationSpan.innerText = 'Success';
                    setTimeout( () => { notificationSpan.innerText = ''; }, 1000 );  // message disappear after 1 second
                  } );
                }
              } ) );

              const usersElem = mainDivElem.querySelector( '#users' );
              courseInfoClone.roles && Object.keys( courseInfoClone.roles ).forEach(
                username => {
                  const userRole = $.clone( courseInfoClone.roles[ username ] );
                  const userEntry = $.html( self.html.user_entry, { 'username': username } );
                  const roleArea = userEntry.querySelector( '#' + username + '-role' );
                  if ( userRole === 'admin' ) {
                    // do not allow modifying admin user's role
                    roleArea.innerText = userRole;
                  } else {
                    // add dropdown select for student/grader
                    const roleSelectElem = $.html( self.html.role_select, {
                      'username': username, 'change': event => {
                        courseInfoClone.roles[ username ] = event.srcElement.value;
                      }
                    } );
                    roleSelectElem.value = userRole;
                    roleArea.appendChild( roleSelectElem );
                  }
                  usersElem.appendChild( userEntry );
                }
              );
            }
          ).catch( exception => {
            console.log( exception );
            $.setContent( mainDivElem, $.html( self.html.alert_message, {
              'type': 'danger', 'message': `Querying course information for '${ self.course_id }' from database failed!`
            } ) );
          } );
        } )
        .catch ( exception => {
          console.log( exception );
          $.setContent( mainDivElem, $.html( self.html.alert_message, {
            'type': 'warning', 'message': 'logging in failed, please try again!'
          } ) );
        } );
      };  // end this.start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
