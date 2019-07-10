/**
 * @overview View for viewing question_edit or answer_edit view based on user role
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'question_answer',

    ccm: '../../lib/js/ccm/ccm-21.1.3.min.js',

    config: {
      'components': {

        'user': [ 'ccm.component', '../../lib/js/ccm/ccm.user-9.2.0.min.js' ],

        'question_edit': [ 'ccm.component', '../question_edit/ccm.question_edit.js' ],

        'answer_edit': [ 'ccm.component', '../answer_edit/ccm.answer_edit.js' ],

        'answer_ranking': [ 'ccm.component', '../answer_ranking/ccm.answer_ranking.js' ],

        'answer_scores': [ 'ccm.component', '../answer_scores/ccm.answer_scores.js' ]
      },

      "user_realm": "guest", "user": null,

      "data": { "store": [ "ccm.store" ] },

      'qa_view_names': {
        'question_edit': 'Edit Questions',
        'answer_edit': 'Edit Answers',
        'answer_ranking': 'Rank Answers',
        'answer_scores': 'Ranking Scores'
      },  // end 'qa_view_names'

      'user_views': {
        'grader': [ 'question_edit', 'answer_edit', 'answer_ranking', 'answer_scores' ],
        'student': [ 'answer_edit', 'answer_ranking', 'answer_scores' ]
      },

      "html": {
        'main': {
          'inner': [
            {
              'id': 'qa-tabs',
              'inner': [ { 'tag': 'ul', 'id': 'qa-tabs-ul', 'class': 'nav nav-tabs', 'role': 'tablist' } ]
            },
            { 'id': 'qa-content', 'class': 'tab-content' }
          ]
        },  // end 'main'

        // HTML config for each tab of the selection menu, largely based on bootstrap tab menu example
        'menu_tab': {
          'tag': 'li', 'class': 'nav-item', 'inner': [
            {
              'tag': 'a', 'data-toggle': 'tab', 'role': 'tab', 'inner': '%tab-text%', 'id': '%menu-tab-id%',
              'href': '#%view-panel-id%', 'aria-controls': '%view-panel-id%', 'onclick': '%click%'
            }
          ]
        },

        // HTML config for the view panel that display content based on the menu tabs
        'view_panel': { 'role': 'tabpanel', 'id': '%view-panel-id%', 'aria-labelledby': '%menu-tab-id%' },

        // message to display when user is not logged in
        'login_message': { 'class': 'alert alert-info', 'role': 'alert', 'inner': 'Please login to continue!\n' },

        // error message
        'error_message': { 'class': 'alert alert-danger', 'role': 'alert', 'inner': '%message%\n' }

      },  // end 'html'

      'css': {
        'bootstrap': '../../lib/css/bootstrap.min.css',
        'fontawesome': '../../lib/css/fontawesome-all.min.css'
      },

      'js': {
        "crypto": "../../lib/js/crypto-js.min.js",
        'sortable': '../../lib/js/Sortable.min.js',
        'jquery': '../../lib/js/jquery-3.3.1.slim.min.js'
      }

    },  // end config

    Instance: function () {

      let $;

      this.ready = async () => {
        // set shortcut to help functions
        $ = this.ccm.helper;

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );
      };  // end ready()

      this.start = async () => {
        const self = this;
        const isViewActive = {};

        // create a div element for rendering content and allow for CSS loading
        const mainDivElem = document.createElement( 'div' );
        $.setContent( self.element, mainDivElem );

        // load bootstrap CSS
        self.ccm.load(
          { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: self.element }
        );

        // login
        let username;
        self.user = await self.components.user.start( {
          "css": [ "ccm.load",
            { url: self.css.bootstrap, type: 'css' }, { url: self.css.bootstrap, type: 'css', context: 'head' },
            { url: self.css.fontawesome, type: 'css' }, { url: self.css.fontawesome, type: 'css', context: 'head' }
          ],
          "title": "Guest Mode: please enter any username", "realm": self.user_realm
        } );
        await self.user.login().then ( () => {
          username = self.user.data().user;
        } ).catch( ( exception ) => console.log( 'login: ' + exception.error ) );

        if ( !username ) {
          $.setContent( mainDivElem, $.html( self.html.login_message ) );
          return;
        }

        // render main HTML structure
        $.setContent( mainDivElem, $.html( self.html.main ) );
        const contentElem = mainDivElem.querySelector( '#qa-content' );

        // user role
        self.data.store.get( 'role' ).then(
          roleInfo => {
            let roleView;
            if ( roleInfo.name === 'admin' || roleInfo.name === 'grader' ) {
              roleView = 'grader';
            } else if ( roleInfo.name === 'student' ) {
              roleView = 'student';
            } else {
              $.setContent( mainDivElem, $.html( self.html.error_message,
                                                 { 'message': "role '" + roleView + "' is unrecognized" } ) );
              return;
            }

            renderQA( roleView );
          },
          rejectReason => {
            console.log( rejectReason.error );
            $.setContent( mainDivElem, $.html( self.html.error_message,
                                               { 'message': 'Reading role from server failed' } ) );
          }
        );  // end getting user role

        function renderQA( roleView ) {
          // render tabs and contents based on user role
          const tabUlElem = mainDivElem.querySelector( '#qa-tabs-ul' );
          const userViews = self.user_views[ roleView ];
          userViews.forEach( ( viewKey, index ) => {
            const viewName = self.qa_view_names[ viewKey ];
            const viewComp = self.components[ viewKey ];
            const isActive = ( index === 0 ) ? true : false;
            isViewActive[ viewKey ] = isActive;

            // render tab for current viewKey
            tabUlElem.appendChild( getMenuTab( viewKey, viewName, isActive ) );

            // render panel for current viewKey
            contentElem.appendChild( getMenuPanel( viewKey, viewComp, isActive ) );
          });
        }  // end renderQA()

        function getMenuTab( viewKey, viewName, isActive ) {
          // largely based on bootstrap tab menu example
          const menuTabId = getViewTabId( viewKey );
          // create element from json configs using CCM helper
          const liElem = $.html( self.html.menu_tab, {
            'tab-text': viewName, 'menu-tab-id': menuTabId, 'view-panel-id': getViewPanelId( viewKey ),

            // handle view switching when menu tabs are clicked
            'click': event => {
              event.preventDefault();

              // if tab is already active, do nothing
              if ( isViewActive[ viewKey ] ) return;

              const viewTabAElem = event.srcElement;
              const viewTabUlElem = viewTabAElem.parentElement.parentElement
              Object.keys( isViewActive ).forEach( checkViewKey => {

                const checkPanel = contentElem.querySelector( '#' + getViewPanelId( checkViewKey ) );

                // set tab & panel to active for current viewKey
                if ( checkViewKey === viewKey ) {
                  isViewActive[ checkViewKey ] = true;
                  setViewTabActive( viewTabAElem, true );
                  setViewPanelActive( checkPanel, true );
                  return;
                }

                // do nothing for inactive key
                if ( !isViewActive[ checkViewKey ] ) return;

                // hide tab & panel of previously active viewKey
                isViewActive[ checkViewKey ] = false;
                const checkTab = viewTabUlElem.querySelector( '#' + getViewTabId( checkViewKey ) );
                setViewTabActive( checkTab, false );
                setViewPanelActive( checkPanel, false );
              } );
            }  // end 'click' event handler
          } );  // end $.html()

          const aElem = liElem.querySelector( '#' + menuTabId );
          setViewTabActive( aElem, isActive );

          return liElem;
        }  // end getMenuTab()

        function getMenuPanel( viewKey, viewComp, isActive ) {
          // create element from json configs using CCM helper
          const divElem = $.html( self.html.view_panel, {
            'view-panel-id': getViewPanelId( viewKey ), 'menu-tab-id': getViewTabId( viewKey )
          } );
          setViewPanelActive( divElem, isActive );

          // load CCM component in the panel
          viewComp.start( { root: divElem, data: self.data, 'js': self.js, 'css': self.css } );
          return divElem;
        }  // end getMenuPanel()

        function setViewTabActive( viewTabElem, isActive ) {
            viewTabElem.className = isActive ? 'nav-link active' : 'nav-link';
            viewTabElem.setAttribute( 'aria-selected', isActive ? 'true' : 'false' );
        }

        function setViewPanelActive( viewPanelElem, isActive ) {
            viewPanelElem.className = isActive ? 'tab-pane fade show active' : 'tab-pane fade';
        }

        function getViewTabId( viewKey ) { return viewKey + '-tab' }

        function getViewPanelId( viewKey ) { return viewKey + '-panel' }

      };  // end start()
    }  // end Instance()
  };  // end component

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
