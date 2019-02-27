/**
 * @overview View for viewing question_edit or answer_edit view based on user role
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

    const component = {

        name: 'question_answer',

        ccm: 'https://ccmjs.github.io/ccm/ccm.js',

        config: {
            'user': [
                'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.3.1.js',
                [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
            ],

            "data": { "store": [ "ccm.store" ] },

            'comp_question_edit': [ 'ccm.component', '../question_edit/ccm.question_edit.js' ],

            'comp_answer_edit': [ 'ccm.component', '../answer_edit/ccm.answer_edit.js' ]
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

                // user role
                let role;
                await self.data.store.get( 'role' ).then( roleInfo => {
                    role = roleInfo.name;
                } );

                // render content based on user role
                if ( role === 'admin' || role === 'grader' ) {
                    self.comp_question_edit.start( { root: self.element, data: self.data } );
                } else if ( role === 'student' ) {
                    self.comp_answer_edit.start( { root: self.element, data: self.data } );
                } else {
                    self.element.innerHTML = 'role "' + role + '" is unrecognized';
                }
            };
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();