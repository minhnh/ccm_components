/**
 * @overview View for viewing question_edit or answer_edit view based on user role
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

    const component = {

        name: 'question_answer',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.7.1.js',

        config: {
            'user': [
                'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.1.1.js',
                [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
            ],

            "data": { "store": [ "ccm.store" ] },

            'qa_views': {
                'question_edit': {
                    'name': 'Edit Questions',
                    'component': [ 'ccm.component', '../question_edit/ccm.question_edit.js' ]
                },
                'answer_edit': {
                    'name': 'Edit Answers',
                    'component': [ 'ccm.component', '../answer_edit/ccm.answer_edit.js' ]
                },
                'answer_ranking': {
                    'name': 'Rank Answers',
                    'component': [ 'ccm.component', '../answer_ranking/ccm.answer_ranking.js' ]
                },
                'answer_scores': {
                    'name': 'Ranking Scores',
                    'component': [ 'ccm.component', '../answer_scores/ccm.answer_scores.js' ]
                }
            },

            'user_views': {
                'grader': [ 'question_edit', 'answer_edit', 'answer_ranking', 'answer_scores' ],
                'student': [ 'answer_edit', 'answer_ranking', 'answer_scores' ]
            },

            'css': [ 'ccm.load',
              { url: '../lib/css/bootstrap.min.css', type: 'css'},
              { url: '../lib/css/bootstrap.min.css', type: 'css', context: 'head' }
            ],

            "html": {
              'main': [
                { 'id': 'qa-tabs' },
                {
                    'id': 'qa-content',
                    'class': 'tab-content'
                }
              ]
            },
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
                const self = this;
                const isViewActive = {};

                // render main HTML structure
                $.setContent( self.element, $.html( self.html.main ) );
                const tabElem = self.element.querySelector( '#qa-tabs' );
                const contentElem = self.element.querySelector( '#qa-content' );
                // set up bootstrap tabs
                const tabUlElem = document.createElement( 'ul' );
                tabUlElem.id = 'qa-tabs-ul';
                tabUlElem.className = 'nav nav-tabs'
                tabUlElem.setAttribute( 'role', 'tablist' );
                tabElem.appendChild( tabUlElem );

                // login
                self.user && await self.user.login().then( () => {
                    const username = self.user.data().user;
                    if ( !username ) {
                        self.element.innerHTML = '<div class="alert alert-info" role="alert">\n' +
                            '  Please login to continue!\n' +
                            '</div>';
                        return;
                    }

                    // user role
                    self.data.store.get( 'role' ).then( roleInfo => {
                        let roleView;
                        if ( roleInfo.name === 'admin' || roleInfo.name === 'grader' ) {
                            roleView = 'grader';
                        } else if ( roleInfo.name === 'student' ) {
                            roleView = 'student';
                        } else {
                            self.element.innerHTML = 'role "' + roleView + '" is unrecognized';
                            return;
                        }

                        renderQA( roleView );
                    } );

                } ).catch( ( exception ) => console.log( 'login: ' + exception.error ) );

                function renderQA( roleView ) {
                    // render tabs and contents based on user role
                    const userViews = self.user_views[ roleView ];
                    userViews.forEach( ( viewKey, index ) => {
                        const viewName = self.qa_views[ viewKey ].name;
                        const viewComp = self.qa_views[ viewKey ].component;
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
                    const liElem = document.createElement( 'li' );
                    liElem.className = 'nav-item';

                    const aElem = document.createElement( 'a' );
                    aElem.innerText = viewName;
                    aElem.id = getViewTabId( viewKey );
                    setViewTabActive( aElem, isActive );
                    setAttributes( aElem, {
                        'data-toggle': 'tab',
                        'href': '#' + getViewPanelId( viewKey ),
                        'role': 'tab',
                        'aria-controls': getViewPanelId( viewKey )
                    } );
                    aElem.addEventListener( 'click', ( e ) => {
                        e.preventDefault();
                        if ( isViewActive[ viewKey ] ) {
                            // is already active, do nothing
                            return;
                        }

                        Object.keys( isViewActive ).forEach( checkViewKey => {

                            const checkPanel = contentElem.querySelector( '#' + getViewPanelId( checkViewKey ) );

                            // view tab & panel for current viewKey
                            if ( checkViewKey === viewKey ) {
                                isViewActive[ checkViewKey ] = true;
                                setViewTabActive( aElem, true );
                                setViewPanelActive( checkPanel, true );
                                return;
                            }

                            // do nothing for inactive key
                            if ( !isViewActive[ checkViewKey ] ) return;

                            // hide tab & panel of previously active viewKey
                            isViewActive[ checkViewKey ] = false;
                            const checkTab = tabUlElem.querySelector( '#' + getViewTabId( checkViewKey ) );
                            setViewTabActive( checkTab, false );
                            setViewPanelActive( checkPanel, false );
                        } );
                    } );

                    liElem.appendChild(aElem);
                    return liElem;
                }  // end getMenuTab()

                function getMenuPanel( viewKey, viewComp, isActive ) {
                    // largely based on bootstrap tab menu example, load CCM component in the panel
                    const divElem = document.createElement( 'div' );
                    divElem.id = getViewPanelId( viewKey );
                    setViewPanelActive( divElem, isActive );
                    setAttributes( divElem, {
                        'role': 'tabpanel',
                        'aria-labelledby': getViewTabId( viewKey )
                    } );
                    viewComp.start( { root: divElem, data: self.data } );
                    return divElem;
                }  // end getMenuPanel()

                function setAttributes( element, attribtues ) {
                    for ( var key in attribtues ) {
                        element.setAttribute(key, attribtues[key]);
                    }
                }

                function setViewTabActive( viewTabElem, isActive ) {
                    viewTabElem.className = isActive ? 'nav-link active' : 'nav-link';
                    viewTabElem.setAttribute( 'aria-selected', isActive ? 'true' : 'false' );
                }

                function setViewPanelActive( viewPanelElem, isActive ) {
                    viewPanelElem.className = isActive ? 'tab-pane fade show active' : 'tab-pane fade';
                }

                function getViewTabId( viewKey ) { return viewKey + '-tab' }

                function getViewPanelId( viewKey ) { return viewKey + '-panel' }
            };
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();