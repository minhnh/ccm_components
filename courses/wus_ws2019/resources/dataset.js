/**
 * @overview data to configure the components of a course
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de>
 * @copyright 2019
 * @license The MIT License (MIT)
 */
ccm.files[ 'dataset.js' ] = {
  'course_name': 'WuS WS2019',

  // unique ID for course, to be prepended to 'collection_id' below when accessing database
  "course_id": "wus_ws2019",

  "store_url": "https://digiklausur.ddns.net",

  "home_menu": {
    "key": "home_menu",
    "sections": [
      {
        'title': 'Assignment 1', 'id': 'assignment-1',

        "entries": [
          {
            "title": "Questions and Answers",
            "component_name": "question_answer",
            "collection_id": "wus_ws2019_assignment_1",
            "entry_type": "qa"
          }
        ]
      }
    ]
  },

  "help_menu": {
    "key": "help_menu",
    "html": "../../components/digiklausur_course/resources/help.js"
  }
};
