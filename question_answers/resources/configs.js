/**
 * @overview configurations of ccm component for rendering a predefined content
 * @author André Kless <andre.kless@web.de> 2017
 * @license The MIT License (MIT)
 */

ccm.files[ 'configs.js' ] = {
  "demo": {
    "key": "demo",
    "data": {
      "question": "how to foo bar?",
      "answers": {
        "id": "sortable_demo",
        "items": [
          { "id": "answer_1", "content": "Foo bar" },
          { "id": "answer_2", "content": "FOo bar" },
          { "id": "answer_3", "content": "FOO bar" },
          { "id": "answer_4", "content": "FOO Bar" }
        ]
      }
    }
  }
};