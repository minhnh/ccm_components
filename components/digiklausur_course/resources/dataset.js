/**
 * @overview data to configure the components of a course
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de>
 * @copyright 2019
 * @license The MIT License (MIT)
 */
ccm.files[ "dataset.js" ] = {
  "course_name": "Course Name",

  // unique ID for course, to be prepended to 'collection_id' below when accessing database
  "course_id": "demo",

  "store_url": "https://digiklausur.ddns.net",

  "home_menu": {
    "key": "home_menu",
    "sections": [
      {
        "title": "Lecture 1", "id": "lecture-1",

        "entries": [
          {
            "title": "Questions and Answers",
            "component_name": "question_answer",
            // unique ID of collection containing data for the entry
            "collection_id": "question_answers_sample",
            "entry_type": "qa"
          }
        ]
      },
      {
        "title": "Lecture 2", "id": "lecture-2",

        "entries": [
          {
            "title": "Questions and Answers",
            "component_name": "question_answer",
            "collection_id": "question_answers_sample_2",
            "entry_type": "qa"
          }
        ]
      }
    ]
  }
};
