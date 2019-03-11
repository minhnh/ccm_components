/**
 * @overview TODO
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de>
 * @copyright 2019
 * @license The MIT License (MIT)
 */
ccm.files[ 'dataset.js' ] = {

  'home_menu': {
    'key': 'home_menu',
    'sections': [
      {
        'title': 'Lecture 1',

        'store': [ "ccm.store", {
          "name": "question_answers_sample",
          "url": "https://digiklausur.ddns.net", "method": "POST"
        } ],

        'entries': [
          {
            'title': 'Edit Questions or Answers',
            'content': [ 'ccm.instance', '../question_answer/ccm.question_answer.js' ]
          },
          {
            'title': 'Question Edit View',
            'content': [ 'ccm.instance', '../question_edit/ccm.question_edit.js' ]
          },
          {
            'title': 'Answer Edit View',
            'content': [ 'ccm.instance', '../answer_edit/ccm.answer_edit.js' ]
          }
        ]
      },
      {
        'title': 'Lecture 2',

        'store': [ "ccm.store", {
          "name": "question_answers_sample_2",
          "url": "https://digiklausur.ddns.net", "method": "POST"
        } ],

        'entries': [
          {
            'title': 'Question Edit View',
            'content': [ 'ccm.instance', '../question_edit/ccm.question_edit.js' ]
          },
          {
            'title': 'Answer Edit View',
            'content': [ 'ccm.instance', '../answer_edit/ccm.answer_edit.js' ]
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
        'content': [ 'ccm.instance', 'https://ccmjs.github.io/akless-components/cloze/versions/ccm.cloze-5.0.3.js', {
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
