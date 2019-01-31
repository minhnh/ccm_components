/**
 * @overview example ccm component that just renders "Hello, World!"
 * @author Minh Nguyen <minh.nguyen@web.de> 2018-2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'course_demo',

    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-20.0.0.min.js',

    config: {
      // TODO add loggers for menu, user for analytics of click events

      'user': [
          'ccm.instance', 'https://ccmjs.github.io/akless-components/user/versions/ccm.user-8.3.1.js',
          [ 'ccm.get', 'https://ccmjs.github.io/akless-components/user/resources/configs.js', 'hbrsinfkaul' ]
      ],

      'comp_accordion': [
          'ccm.component', 'https://ccmjs.github.io/tkless-components/accordion/versions/ccm.accordion-2.0.0.js',
        { // "css": [ "ccm.load", "resources/menu.css" ],
        }
      ],

      'comp_blank': [ "ccm.component", "https://ccmjs.github.io/akless-components/blank/ccm.blank.js" ],

      'dataset': [ 'ccm.store', 'resources/dataset.js' ],

      'css': [
        'ccm.load', {
            url: 'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css', type: 'css',
            attr: { integrity: 'sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS', crossorigin: 'anonymous' }
          }, {
            url: 'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css', type: 'css', context: 'head',
            attr: { integrity: 'sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS', crossorigin: 'anonymous' }
          }, {
            url: 'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', type: 'css',
            attr: { integrity: 'sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN', crossorigin: 'anonymous' }
          }, {
            url: 'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css', type: 'css', context: 'head',
            attr: { integrity: 'sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN', crossorigin: 'anonymous' }
          }
      ],

      'js': [ 'ccm.load', [
        {
          url: 'https://code.jquery.com/jquery-3.3.1.slim.min.js', type: 'js', context: 'head',
          attr: { integrity: 'sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo', crossorigin: 'anonymous' }
        },
        {
          url: 'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.bundle.min.js', type: 'js', context: 'head',
          attr: { integrity: 'sha384-zDnhMsjVZfS3hiP7oCBRmfjkQC4fzxVxFhBx8Hkz2aZX8gEvA/jsP3eXRCvzTofP', crossorigin: 'anonymous' }
        }
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
          const username = header.querySelector('#username');
          const signOut = header.querySelector('#sign-out');
          const signIn = header.querySelector('#sign-in');

          signIn.addEventListener( 'click', async () => {
            self.user && await self.user.login().then ( () => {
              username.innerHTML = "<i class=\"fa fa-user\"></i>" + self.user.data().user;
              signIn.style.display = "none";
              signOut.style.display = "block";
              renderArticle();
            } ).catch((exception) => console.log('login: ' + exception.error));
          } );

          signOut.addEventListener('click', async () => {
            self.user && await self.user.logout().then ( () => {
              username.innerHTML = "";
              signIn.style.display = "block";
              signOut.style.display = "none";
              renderArticle();
            } ).catch((exception) => console.log('logout: ' + exception.error));
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
            self.dataset.get('home_menu').then(
                result => {
                  let accordion_configs = { root: article, color: "info", size: "lg", entries: [] };
                  result.sections.forEach( section => {
                    let menuEntries = document.createDocumentFragment();
                    section.entries.forEach(
                        entry => menuEntries.appendChild(getMenuEntryDiv(entry.title, entry.content))
                    );
                    accordion_configs.entries.push({ 'title': section.title, 'content': menuEntries })
                  });
                  self.comp_accordion.start( accordion_configs );
                });

            function getMenuEntryDiv(title, content) {
              const div = document.createElement( 'div' );
              div.className = 'menu-entry';
              div.setAttribute( 'style', 'width=100%;' );
              div.innerText = title;

              div.addEventListener('click', async( event ) => {
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
              return div;
            }
          }
        }
      };

    }

  };

  let b='ccm.'+component.name+(component.version?'-'+component.version.join('.'):'')+'.js';if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);'string'===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||['latest'])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement('script');document.head.appendChild(a);component.ccm.integrity&&a.setAttribute('integrity',component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute('crossorigin',component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();