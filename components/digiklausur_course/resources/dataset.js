/**
 * @overview data to configure the components of a course
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de>
 * @copyright 2019
 * @license The MIT License (MIT)
 */
ccm.files[ "dataset.js" ] = {
  "course_name": "Course Name",

  // unique ID for course, to be prepended to 'collection_id' below when accessing database
  "course_id": "question_answers",

  "store_url": "https://digiklausur.ddns.net",

  "home_menu": {
    "key": "home_menu",
    "sections": [
      {
        "title": "Lecture 1",

        "entries": [
          {
            "title": "Questions and Answers",
            "content": [ "ccm.instance", "../../components/question_answer/ccm.question_answer.js" ],
            "collection_id": "sample",
            "entry_type": "qa"
          }
        ]
      },
      {
        "title": "Lecture 2",

        "entries": [
          {
            "title": "Questions and Answers",
            "content": [ "ccm.instance", "../../components/question_answer/ccm.question_answer.js" ],
            "collection_id": "sample_2",
            "entry_type": "qa"
          }
        ]
      }
    ]
  }
};
