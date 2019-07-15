/**
 * @overview example ccm component that just renders "Hello, World!"
 * @author Minh Nguyen <minh.nguyen@web.de> 2018-2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'digiklausur_course',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      // TODO add loggers for menu, user for analytics of click events
      'components': {

        'user': [ 'ccm.component', '../../lib/js/ccm/ccm.user-9.2.0.min.js' ],

        'question_edit': [ 'ccm.component', '../question_edit/ccm.question_edit.js' ],

        'answer_edit': [ 'ccm.component', '../answer_edit/ccm.answer_edit.js' ],

        'answer_ranking': [ 'ccm.component', '../answer_ranking/ccm.answer_ranking.js' ],

        'answer_scores': [ 'ccm.component', '../answer_scores/ccm.answer_scores.js' ],

        'sortable': [ 'ccm.component', '../sortable/ccm.sortable.js' ],

        'countdown': [ 'ccm.component', '../countdown_timer/ccm.countdown_timer.js' ]
      },

      "user_realm": "hbrsinfkaul",

      'user': null,

      'comp_accordion': [
          'ccm.component', 'https://ccmjs.github.io/tkless-components/accordion/versions/ccm.accordion-2.0.0.js'
      ],

      'comp_content': [
        "ccm.component", "https://ccmjs.github.io/akless-components/content/versions/ccm.content-5.2.1.js", {
          config: {
            'css': [
              'ccm.load',
              { url: '../../lib/css/bootstrap.min.css', type: 'css' },
              { url: '../../lib/css/fontawesome-all.min.css', type: 'css' }
            ],
          }
        }
      ],

      'dataset': [ 'ccm.store', 'resources/dataset.js' ],

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'fontawesome': '../../lib/css/fontawesome-all.min.css'
      },

      'js': [ 'ccm.load', [
          { url: '../../lib/js/jquery-3.3.1.slim.min.js', type: 'js', context: 'head' },
          { url: '../../lib/js/bootstrap.bundle.min.js', type: 'js', context: 'head' }
        ]
      ],

      'html': {
        'main': {
          'inner': [
            { 'id': 'header' },
            { 'id': 'article' },
            { 'id': 'feedback' },
            { 'id': 'footer' }
          ]
        },

        'content': {
          'inner': [
            { 'id': 'section' },
            { 'id': 'menu-list' }
          ]
        },

        'navigation': {
          'tag': 'nav',
          'class': 'navbar navbar-expand-md navbar-dark bg-info',
          'id': 'navigation-bar',
          'inner': [
            // navbar brand
            {
              'tag': 'a', 'class': "navbar-brand", 'href': "#", 'id': "course-name",
              'onclick': '%course-name-click%', 'inner': '%course-name%'
            },

            // collapsible button for when screen width is small
            {
              'tag': 'button', 'class': 'navbar-toggler', 'type': 'button', 'data-toggle': 'collapse',
              'data-target': '#navbarSupportedContent', 'aria-controls': 'navbarSupportedContent',
              'aria-expanded': 'false', 'aria-label': 'Toggle navigation',
              'inner': [ { 'tag': 'span', 'class': 'navbar-toggler-icon' } ]
            },

            // collapsible content div
            {
              'class': 'collapse navbar-collapse',
              'id': 'navbarSupportedContent',
              'inner': [
                // left side navigation buttons
                {
                  'tag': 'ul', 'class': 'navbar-nav mr-auto',
                  'inner': [
                    // Home button
                    {
                      'tag': 'li', 'class': 'nav-item active',
                      'inner': [ {
                        'tag': 'a', 'href': '#', 'class': 'nav-link', 'title': 'Home', 'id': 'home',
                        'inner': '<i class="fa fa-home"></i><span class="sr-only">Home</span>',
                        'onclick': '%home-click%'
                      } ]
                    },
                    // Help button
                    {
                      'tag': 'li', 'class': 'nav-item',
                      'inner': [ {
                        'tag': 'a', 'href': '#', 'class': 'nav-link', 'title': 'Help', 'id': 'help',
                        'inner': '<i class="fa fa-info-circle"></i><span class="sr-only">Help</span>'
                      } ]
                    }
                  ]
                },
                // username field and login/logout buttons to the right
                { 'tag': 'ul', 'class': 'navbar-nav', 'id': 'login-area' }
              ]
            }  // end navbar collapsible content
          ]
        },  // end navigation HTML definition

        // HTML configuration for each menu entry
        'entry': {
          'inner': [
            // fontawesome icon
            { 'tag': 'span', 'inner': [ { 'tag': 'i', 'class': 'fa %icon% text-info' } ] },
            // button link that load entry content
            { 'tag': 'button', 'class': 'btn btn-link', 'type': 'button', 'inner': '%title%', 'onclick': '%click%' }
          ]
        },

        'login_button': {
          'tag': 'li', 'class': 'nav-item',
          'inner': {
            'tag': 'button', 'type': 'button', 'class': 'btn btn-light',
            'inner': '%label%', 'onclick': '%click%'
          }
        },

        'user_info': {
          'tag': 'li', 'class': 'nav-item text-white pt-1', 'inner': [
            { 'tag': 'i', 'class': 'fa fa-user pr-1' },
            { 'tag': 'span', 'id': 'username', 'inner': '%username%', 'class': 'p-1' },
            { 'tag': 'span', 'id': 'user-role', 'inner': '(%role%)', 'class': 'pr-2' }
          ]
        },

        // message to display when user is not logged in
        'alert_message': { 'class': 'alert alert-%type%', 'role': 'alert', 'inner': '%message%\n' }

      },  // end HTML configurations

      // icon class name for each entry type
      'entry_icons': {
        'qa': 'fa-question-circle'
      }
    },

    Instance: function () {

      const self = this;
      let $;

      this.ready = async () => {

        // set shortcut to help functions
        $ = self.ccm.helper;

        // logging of 'ready' event
        $.privatize( self, true );

      };

      this.start = async () => {
        let courseInfoStore;
        let storeUrl;
        let courseId;

        // load HTML configuration and query for main elements
        const main = $.html( self.html.main );
        const header = main.querySelector( '#header' );
        const article = main.querySelector( '#article' );
        $.setContent( self.element, main );

        // load bootstrap CSS
        self.ccm.load(
          { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: self.element },
          { url: self.css.fontawesome, type: 'css' }, { url: self.css.fontawesome, type: 'css', context: self.element }
        );

        // start user component
        self.user = await self.components.user.start( {
          "css": [ "ccm.load",
            { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: 'head' },
            { url: self.css.fontawesome, type: 'css' }, { url: self.css.fontawesome, type: 'css', context: 'head' }
          ],
          "realm": self.user_realm
        } );

        Promise.all( [
          self.dataset.get( 'course_name' ),
          self.dataset.get( 'course_id' ),
          self.dataset.get( 'store_url' ) ] )
        .then( async ( [ pCourseName, pCourseId, pStoreUrl ] ) => {
          document.title = pCourseName;
          courseId = pCourseId;
          storeUrl = pStoreUrl;

          await self.ccm.store( {
            'name': courseId + '_course_info', 'url': storeUrl, 'parent': self, 'method': 'POST'
          } )
          .then( infoStore => { courseInfoStore = infoStore; } );

          setupNavigation( pCourseName );
          renderArticle( 'home' );
        } )
        .catch( exception => {
          console.log( exception );
          $.setContent( article,
            $.html( self.html.alert_message, {
              'type': 'danger', 'message': 'Reading course information failed.'
            } ) );
        } );

        /********************
         * FUNCTIONS
         ********************/
        /**
         * @description Setup top navigation bar for class
         * @param {String} courseName
         */
        function setupNavigation( courseName ) {
          header.appendChild( $.html( self.html.navigation, {
            'course-name': courseName,
            'course-name-click': () => { renderArticle( 'home' ) },
            'home-click': () => { renderArticle( 'home' ) }
          } ) );

          // setup toggle button
          header.querySelector( ".navbar-toggler" ).addEventListener( 'click', () => {
            header.querySelector( ".navbar-collapse" ).classList.toggle( 'show' );
          } );

          // setup signing in and out
          const loginArea = header.querySelector( '#login-area' );
          if ( self.user && self.user.isLoggedIn() ) {
            getUserInfo().then( userInfo => renderLoggedInNav( loginArea, userInfo ) );
          } else {
            renderLoggedOutNav( loginArea );
          }
        }  // end setupNavigation()

        function getUserInfo() {
          return new Promise( ( resolve, reject ) => {
            if ( !self.user ) reject( 'no user module specified' );

            self.user.login()
            .then( () => {
              const username = self.user.data().user;
              courseInfoStore.get( 'role' )
              .then( roleInfo => {
                const userRole = roleInfo.name;
                resolve( { 'username': username, 'role': userRole } );
              }, rejectReason => reject( rejectReason ) )
              .catch( exception => reject( exception ) );
            } )
            .catch( exception => reject( exception ) );
          } );
        }  // end getUserInfo()

        function renderLoggedInNav( rootElem, userInfo ) {
          // clean content in rootElem
          while ( rootElem.firstChild ) { rootElem.removeChild( rootElem.firstChild ); }

          // add user info and 'Sign Out' button
          const userInfoElem = $.html( self.html.user_info, userInfo );
          const signOutBtn = $.html( self.html.login_button, {
            'label': 'Sign Out', 'click': async () => {
              self.user && await self.user.logout().then ( () => {
                renderLoggedOutNav( rootElem );
                renderArticle( 'home' );
              } ).catch( exception => console.log( 'logout: ' + exception.error ) );
            }
          } );

          rootElem.appendChild( userInfoElem );
          rootElem.appendChild( signOutBtn );
        }  // end renderLoggedInNav()

        function renderLoggedOutNav( rootElem ) {
          // clean element content
          while ( rootElem.firstChild ) { rootElem.removeChild( rootElem.firstChild ); }

          // add 'Sign In' button
          const signInBtn = $.html( self.html.login_button, {
            'label': 'Sign In', 'click': async () => {
              getUserInfo()
              .then ( userInfo => {
                renderLoggedInNav( rootElem, userInfo );
                renderArticle( 'home' );
              } )
              .catch( exception => {
                console.log( exception );
                $.setContent( article,
                  $.html( self.html.alert_message, {
                    'type': 'warning', 'message': 'Login unsuccessful! Please try again.'
                  } ) );
              } );
            }
          } );

          rootElem.appendChild( signInBtn );
        }  // end renderLoggedOutNav()

        function renderArticle( pageName ) {

          if ( !self.user || !self.user.isLoggedIn() ) {
            $.setContent( article,
              $.html( self.html.alert_message, { 'type': 'info', 'message': 'Please login to continue!' } ) );
            return;
          }

          switch ( pageName ) {
            case 'home':
            default:
              renderHome();
              break;
          }
        }  // end renderArticle()

        function renderHome() {
          self.dataset.get( 'home_menu' ).then(
              result => {
                let accordionConfigs = {
                  root: article, color: "info", size: "lg", entries: [],
                  // load bootstrap with content
                  content: self.comp_content
                };
                result.sections.forEach( section => {
                  const menuEntries = document.createDocumentFragment();
                  section.entries.forEach( entryConfig => menuEntries.appendChild( renderMenuEntry( entryConfig ) ) );
                  accordionConfigs.entries.push( { 'title': section.title, 'content': menuEntries } )
                });
                self.comp_accordion.start( accordionConfigs );
              });
        }  // end renderHome()

        function renderMenuEntry( entryConfig ) {
          let content = $.clone( entryConfig.content );
          return $.html( self.html.entry, {
            'icon': self.entry_icons[ entryConfig.entry_type ],
            'title': entryConfig.title,
            'click': async () => {
              // add configurations to the CCM instance
              content.push( {
                "data": { "store": [ "ccm.store", {
                  "name": courseId + '_' + entryConfig.collection_id,
                  "url": storeUrl, "method": "POST"
                } ] },
                "user_realm": self.user_realm
              } );

              // content is given as ccm dependency? => solve dependency
              content = await $.solveDependency( content );
              // content is ccm instance? => render instance as content
              if ( $.isInstance( content ) ) {
                $.setContent( article, content.root );
                await content.start();
              }
              // render given content as HTML
              else $.setContent( article, $.html( content ) );
            }
          } );
        }  // end renderMenuEntry()

      };  // end start()

    }  // end Instance()

  };  // end component()

  let b='ccm.'+component.name+(component.version?'-'+component.version.join('.'):'')+'.js';if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);'string'===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||['latest'])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement('script');document.head.appendChild(a);component.ccm.integrity&&a.setAttribute('integrity',component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute('crossorigin',component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
