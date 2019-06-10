/**
 * @overview example ccm component that just renders "Hello, World!"
 * @author Minh Nguyen <minh.nguyen@web.de> 2018-2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'digiklausur_course',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.0.0.min.js',

    config: {
      // TODO add loggers for menu, user for analytics of click events

      'user': [
          'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.3.1.js',
          [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      'comp_accordion': [
          'ccm.component', 'https://ccmjs.github.io/tkless-components/accordion/versions/ccm.accordion-2.0.0.js'
      ],

      'comp_content': [
        "ccm.component", "https://ccmjs.github.io/akless-components/content/versions/ccm.content-5.2.0.js", {
          config: {
            'css': [
              'ccm.load',
              { url: '../lib/css/bootstrap.min.css', type: 'css' },
              { url: '../lib/css/fontawesome-all.min.css', type: 'css' }
            ],
          }
        }
      ],

      'dataset': [ 'ccm.store', 'resources/dataset.js' ],

      'css': [ 'ccm.load',
        { url: '../lib/css/bootstrap.min.css', type: 'css' },
        { url: '../lib/css/bootstrap.min.css', type: 'css', context: 'head' },
        { url: '../lib/css/fontawesome-all.min.css', type: 'css' },
        { url: '../lib/css/fontawesome-all.min.css', type: 'css', context: 'head' }
      ],

      'js': [ 'ccm.load', [
          { url: '../lib/js/jquery-3.3.1.slim.min.js', type: 'js', context: 'head' },
          { url: '../lib/js/bootstrap.bundle.min.js', type: 'js', context: 'head' }
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
        }
      },

      'navigation': [ 'ccm.load', { url: 'resources/navigation.html', type: 'data', method: 'get' } ]
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
        let main = $.html(self.html.main);

        setupNavigation();

        renderArticle();

        $.setContent( self.element, main );

        function setupNavigation() {
          const header = main.querySelector( '#header' );
          header.innerHTML = self.navigation;

          // setup toggle button
          header.querySelector( ".navbar-toggler" ).addEventListener( 'click', () => {
            header.querySelector( ".navbar-collapse" ).classList.toggle( 'show' );
          } );

          // setup signing in and out
          const username = header.querySelector( '#username' );
          const signOut = header.querySelector( '#sign-out' );
          const signIn = header.querySelector( '#sign-in' );

          // styling
          username.className = 'text-light';

          signIn.addEventListener( 'click', async () => {
            self.user && await self.user.login().then ( () => {
              username.innerHTML = '<i class="fa fa-user"></i><span style="padding: 5px;">' +
                                    self.user.data().user + '</span>';
              signIn.style.display = "none";
              signOut.style.display = "block";
              renderArticle();
            } ).catch((exception) => console.log( 'login: ' + exception.error) );
          } );

          signOut.addEventListener('click', async () => {
            self.user && await self.user.logout().then ( () => {
              username.innerHTML = "";
              signIn.style.display = "block";
              signOut.style.display = "none";
              renderArticle();
            } ).catch( exception => console.log( 'logout: ' + exception.error ) );
          });

          // Home button
          const home = header.querySelector('#home');
          home.addEventListener('click', () => { renderArticle() });
        }

        function renderArticle(pageName = 'home') {
          const article = main.querySelector( '#article' );

          if (!self.user || !self.user.isLoggedIn()) {
            article.innerHTML = '<div class="alert alert-info" role="alert">\n' +
                '  Please login to continue!\n' +
                '</div>';
            return;
          }

          // TODO: confirm authentication

          switch (pageName) {
            case 'home':
            default:
              renderHome();
              break;
          }

          function renderHome() {
            self.dataset.get( 'home_menu' ).then(
                result => {
                  let accordionConfigs = {
                    root: article, color: "info", size: "lg", entries: [],
                    // load bootstrap with content
                    content: self.comp_content
                  };
                  result.sections.forEach( section => {
                    const store = section.store;
                    const menuEntries = document.createDocumentFragment();
                    section.entries.forEach(
                        entry => menuEntries.appendChild( renderMenuEntry( entry.title, entry.content, store ) )
                    );
                    accordionConfigs.entries.push( { 'title': section.title, 'content': menuEntries } )
                  });
                  self.comp_accordion.start( accordionConfigs );
                });

            function renderMenuEntry( title, content, store ) {
              const divElem = document.createElement( 'div' );
              const questionIconSpan = document.createElement( 'span' );
              questionIconSpan.innerHTML = '<i class="fa fa-question-circle text-info"></i>';

              const entryLink = document.createElement( 'button' );
              entryLink.className = 'btn btn-link';
              entryLink.setAttribute( 'type', 'button' );
              entryLink.innerText = title;
              entryLink.addEventListener( 'click', async( event ) => {
                // use the common store defined for each section
                content.push( { "data": { "store": store } } );

                // content is given as ccm dependency? => solve dependency
                content = await $.solveDependency( content );
                // content is ccm instance? => render instance as content
                if ( $.isInstance( content ) ) {
                  $.setContent( article, content.root );
                  await content.start();
                }
                // render given content
                else $.setContent( article, $.html( content ) );
              });

              divElem.appendChild( questionIconSpan );
              divElem.appendChild( entryLink );
              return divElem;
            }
          }
        }
      };

    }

  };

  let b='ccm.'+component.name+(component.version?'-'+component.version.join('.'):'')+'.js';if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);'string'===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||['latest'])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement('script');document.head.appendChild(a);component.ccm.integrity&&a.setAttribute('integrity',component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute('crossorigin',component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
