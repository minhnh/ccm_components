/**
 * @overview TODO
 * @author Minh Nguyen <minh.nguyen@web.de> 2018
 * @license The MIT License (MIT)
 */
ccm.files[ 'dataset.js' ] = {

  'home_menu': {
    'key': 'home_menu',
    'sections': [
      {
        'title': 'Test Menu 1',
        'entries': [
          {
            'title': 'test entry 1',
            'content': [
                'ccm.instance', 'https://ccmjs.github.io/akless-components/content/versions/ccm.content-5.2.0.js',
                { 'inner': '<h2>Aenean commodo ligula eget dolor aenean massa</h2>' }
              ]
          },
          {
            'title': 'test entry 2',
            'content': [
              'ccm.instance', 'https://ccmjs.github.io/akless-components/content/versions/ccm.content-5.2.0.js',
              {
                'inner': '<ul>' +
                    '  <li>Lorem ipsum dolor sit amet, consectetuer adipiscing.</li>\n' +
                    '  <li>Cum sociis natoque.</li>\n' +
                    '</ul>' }
            ]
          }
        ]
      },
      {
        'title': 'Test Menu 2',
        'entries': [
          {
            'title': 'test entry 3',
            'content': [ 'ccm.instance', 'https://ccmjs.github.io/akless-components/blank/ccm.blank.js' ]
          }
        ]
      }
    ]
  },

  'test_menu_second': {
    'key': 'test_menu_second',
    'section': 'Test Menu 2',
    'entries': [
      {
        'title': '<span class="fa fa-pencil-square-o"></span>Test Entry 3',
        'content': [ 'ccm.instance', 'https://ccmjs.github.io/akless-components/cloze/versions/ccm.cloze-5.0.0.js', {
          'key': [ 'ccm.get', { 'store': 'w2c_cloze', 'url': 'https://ccm2.inf.h-brs.de' }, '1518692231862X6906233038090239' ],
          'data': {
            'store': [ 'ccm.store', { 'store': 'be2_ws18_cloze_results', 'url': 'https://ccm2.inf.h-brs.de', 'method': 'POST' } ],
            'key': 'test_entry_3',
            'user': true
          },
          'onfinish': {
            'login': true,
            'store': {
              'settings': {
                'url': 'http://localhost:3000',
                'method': 'POST',
                'store': 'be2_ws18_cloze_results'
              },
              'key': 'test_entry_3',
              'user': true,
              'permissions': {
                'creator': 'teacher',
                'realm': 'guest',
                'group': [ '%user%' ],
                'access': {
                  'get': 'group',
                  'set': 'creator',
                  'del': 'creator'
                }
              }
            },
            'alert': 'Saved for your student analytics!',
            'restart': true
          }
        } ]
      }
    ]
  }

};