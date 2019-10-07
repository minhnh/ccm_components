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

        'question_answer': [ 'ccm.component', '../question_answer/ccm.question_answer.js' ],

        'question_edit': [ 'ccm.component', '../question_edit/ccm.question_edit.js' ],

        'answer_edit': [ 'ccm.component', '../answer_edit/ccm.answer_edit.js' ],

        'answer_ranking': [ 'ccm.component', '../answer_ranking/ccm.answer_ranking.js' ],

        'answer_scores': [ 'ccm.component', '../answer_scores/ccm.answer_scores.js' ],

        'course_admin': [ 'ccm.component', '../course_admin/ccm.course_admin.js' ],

        'katex': [ 'ccm.component', '../katex/ccm.katex.js' ],

        'sortable': [ 'ccm.component', '../sortable/ccm.sortable.js' ],

        'countdown': [ 'ccm.component', '../countdown_timer/ccm.countdown_timer.js' ]
      },

      "user_realm": "hbrsinfkaul", 'user': null,

      'dataset': [ 'ccm.load', 'resources/dataset.js' ],

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'fontawesome': '../../lib/css/fontawesome-all.min.css',
        'katex': '../../lib/css/katex.min.css'
      },

      'js': {
        "crypto": "../../lib/js/crypto-js.min.js",
        'katex': '../../lib/js/katex.min.js',
        'katex_auto_render': '../../lib/js/auto-render.min.js',
        'sortable': '../../lib/js/Sortable.min.js',
        'jquery': '../../lib/js/jquery-3.3.1.slim.min.js'
      },

      'html': [ 'ccm.load', 'resources/html.js' ],  // end HTML configurations

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
        let storeUrl = self.dataset.store_url;
        let courseId = self.dataset.course_id;

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

        document.title = self.dataset.course_name;
        await self.ccm.store( { 'name': 'courses#' + courseId, 'url': storeUrl, 'parent': self, 'method': 'POST' } )
        .then ( infoStore => { courseInfoStore = infoStore; } )
        .catch( exception => {
          console.log( exception );
          $.setContent( article,
            $.html( self.html.alert_message, {
              'type': 'danger', 'message': 'Reading course information failed.'
            } ) );
        } );
        setupNavigation( self.dataset.course_name )
        .then(
          () => renderArticle( 'home' ),
          reason => {
            $.setContent( article, $.html( self.html.alert_message, {
              'type': 'warning', 'message': reason
            } ) );
          }
        );

        /********************
         * FUNCTIONS
         ********************/
        /**
         * @description Setup top navigation bar for class
         * @param {String} courseName
         */
        async function setupNavigation( courseName ) {
          header.appendChild( $.html( self.html.navigation , {
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
            return getUserInfo().then(
              userInfo => {
                renderLoggedInNav( loginArea, userInfo );
                return userInfo;
              },
              () => {
                renderLoggedOutNav( loginArea );
                return Promise.reject( 'querying for user role failed' );
              }
            );
          } else {
            renderLoggedOutNav( loginArea );
            return Promise.reject( 'Please login to continue!' );
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
          const userInfoElem = $.html( self.html.user_info, {
            'username': userInfo.username, 'role': userInfo.role,
            'click': () => {
              // only allow the course admin view for 'admin' users
              if ( userInfo.role !== 'admin' ) return;
              self.components.course_admin.start( {
                'root': article, 'js': self.js, 'css': self.css, 'user_realm': self.user_realm,
                'components': self.components, 'course_id': courseId, 'store_url': storeUrl
              } );
            }
          } );

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
          // clear the 'article' element
          while ( article.firstChild ) { article.removeChild( article.firstChild ); }

          self.dataset.home_menu.sections.forEach( section => {
            const sectionElem = $.html( self.html.section, {
              'section_id': section.id, 'section-title': section.title
            } );
            const sectionContent = sectionElem.querySelector( '#s-' + section.id + '-body-content' );
            const sectionBtn = sectionElem.querySelector( '#s-' + section.id + '-header' );

            // toggle visibility of the section and its content
            sectionBtn.addEventListener( 'click', async event => {
              event.srcElement.classList.toggle( 'collapsed' );
              sectionContent.parentElement.classList.toggle( 'show' );
            } );

            // render menu entries for the section
            section.entries.forEach( entryConfig => {
              sectionContent.appendChild( renderMenuEntry( entryConfig ) )
            } );

            article.appendChild( sectionElem );
          } );
        }  // end renderHome()

        function renderMenuEntry( entryConfig ) {
          return $.html( self.html.entry, {
            'icon': self.entry_icons[ entryConfig.entry_type ],
            'title': entryConfig.title,
            'click': async () => {
              const compName = $.clone( entryConfig.component_name );
              if ( !self.components[ compName ] ) {
                $.setContent( article, $.html( self.html.alert_message, {
                  'type': 'danger', 'message': 'component does not exist for menu entry: ' + compName
                } ) );
                return;
              }

              // add configurations to the CCM instance
              self.components[ compName ].start( {
                'root': article, 'js': self.js, 'css': self.css, 'user_realm': self.user_realm,
                'components': self.components,
                'data': { 'store': [ 'ccm.store', {
                  'name': entryConfig.collection_id + '#' + courseId,
                  'url': storeUrl, 'method': 'POST'
                } ] }
              } );
            }
          } );
        }  // end renderMenuEntry()

      };  // end start()

    }  // end Instance()

  };  // end component()

  let b='ccm.'+component.name+(component.version?'-'+component.version.join('.'):'')+'.js';if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);'string'===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||['latest'])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement('script');document.head.appendChild(a);component.ccm.integrity&&a.setAttribute('integrity',component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute('crossorigin',component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
