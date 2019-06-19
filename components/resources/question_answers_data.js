/**
 * @overview sample data specs for the question answers components
 * @author Minh Nguyen <minh.nguyen@smail.inf.h-brs.de>
 * @copyright 2019
 * @license The MIT License (MIT)
 */
ccm.files[ 'question_answers_data.js' ] = {
    "questions": {
        "key" : "questions",
        "entries" : {
            "9c7d5b046878838d" : "How are you?",
            "51ebe90aeed77259" : "what is robotics?"
        }
    },

    "mnguy12s": {
        "answers": {
            "9c7d5b046878838d": {
                "text": "es geht",
                "hash": "d97363b4cb5ce806"
            },
            "51ebe90aeed77259": {
                "text": "I don't know",
                "hash": "807a4f302e7bbba1"
            }
        },
        "ranking": {
            "9c7d5b046878838d": { },
            "51ebe90aeed77259": { }
        }
    },

    "answers_9c7d5b046878838d": {
        "entries": {
            "d97363b4cb5ce806": { "text": "es geht", "ranked_by": {} },
            "answer_hash_01": { "text": "es geht 1", "ranked_by": { 'username01': 0.2 } },
            "answer_hash_02": { "text": "es geht 2", "ranked_by": { 'username02': 0.6, 'username01': 0.4 } },
            "answer_hash_03": { "text": "es geht 3", "ranked_by": { 'username01': 0.4, 'username03': 0.2 } },
            "answer_hash_04": { "text": "es geht 4", "ranked_by": {} },
            "answer_hash_05": { "text": "es geht 5", "ranked_by": {} }
        }
    },

    "answers_51ebe90aeed77259": {
        "entries": {
            "807a4f302e7bbba1": { "text": "I don't know", "ranked_by": { 'username01': 0.0 } },
            "answer_hash_06": { "text": "I don't know 1", "ranked_by": { 'username02': 0.2, 'username01': 0.6 } },
            "answer_hash_07": { "text": "I don't know 2", "ranked_by": { 'username02': 1.0, 'username03': 0.6 } },
            "answer_hash_08": { "text": "I don't know 3", "ranked_by": {} },
            "answer_hash_09": { "text": "I don't know 4", "ranked_by": {} },
            "answer_hash_10": { "text": "I don't know 5", "ranked_by": {} }
        }
    },

    "role": {
        "name": "student"
    }
};
