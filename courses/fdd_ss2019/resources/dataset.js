/**
 * @overview data to configure the components of a course
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de>
 * @copyright 2019
 * @license The MIT License (MIT)
 */
ccm.files[ 'dataset.js' ] = {
  'course_name': 'FDD SS2019',

  'home_menu': {
    'key': 'home_menu',
    'sections': [
      {
        'title': 'Lecture 2019-06-27',

        'store': [ "ccm.store", {
          "name": "fd_ss2019_20190627",
          "url": "https://digiklausur.ddns.net", "method": "POST"
        } ],

        'entries': [
          {
            'title': 'Questions and Answers',
            'content': [ 'ccm.instance', '../../components/question_answer/ccm.question_answer.js' ]
          }
        ]
      }
    ]
  },
};
