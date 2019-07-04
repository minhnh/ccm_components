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
            "82038a67088dce5f" : "How are you? with multiple\n lines and equations: $\\alpha + \\delta$",
            "51ebe90aeed77259" : "what is robotics?"
        },

        "answer_deadline": null,  // example: { 'date': '2019-01-01', 'time': '23:00' }

        "ranking_deadline": null  // same format with 'answer_deadline'
    },

    "mnguy12s": {
        "answers": {
            "82038a67088dce5f": {
                "text": "es geht with $\\alpha + \\beta$ as test equations",
                "hash": "e29bf6a881baa0c5"
            },
            "51ebe90aeed77259": {
                "text": "I don't know with $ \\gamma + \\beta$ as test equations",
                "hash": "c921640e71ef9278"
            }
        },
        "ranking": {
            "82038a67088dce5f": { },
            "51ebe90aeed77259": { }
        }
    },

    "answers_82038a67088dce5f": {
        "entries": {
            "e29bf6a881baa0c5": {
                "text": "es geht with $\\alpha + \\beta$ as test equations",
                "authors": { "mnguy12s": true }, "ranked_by": {}
            },
            "answer_hash_01": {
                "text": "es geht 1 test equations \n in rank view $ \\alpha + \\beta $",
                "authors": { "username03": true }, "ranked_by": { 'username01': 0.2 }
            },
            "answer_hash_02": { "text": "es geht 2", "authors": { "username04": true }, "ranked_by": { 'username02': 0.6, 'username01': 0.4 } },
            "answer_hash_03": { "text": "es geht 3", "authors": { "username05": true }, "ranked_by": { 'username01': 0.4, 'username03': 0.2 } },
            "answer_hash_04": { "text": "es geht 4", "authors": { "username06": true }, "ranked_by": {} },
            "answer_hash_05": { "text": "es geht 5", "authors": { "username07": true }, "ranked_by": {} }
        }
    },

    "answers_51ebe90aeed77259": {
        "entries": {
            "c921640e71ef9278": {
                "text": "I don't know with $\\gamma + \\beta$ as test equations",
                "authors": { "mnguy12s": true }, "ranked_by": { 'username01': 0.0 }
            },
            "answer_hash_06": { "text": "I don't know 1", "authors": { "username03": true }, "ranked_by": { 'username02': 0.2, 'username01': 0.6 } },
            "answer_hash_07": { "text": "I don't know 2", "authors": { "username04": true }, "ranked_by": { 'username02': 1.0, 'username03': 0.6 } },
            "answer_hash_08": { "text": "I don't know 3", "authors": { "username05": true }, "ranked_by": {} },
            "answer_hash_09": { "text": "I don't know 4", "authors": { "username06": true }, "ranked_by": {} },
            "answer_hash_10": { "text": "I don't know 5", "authors": { "username07": true }, "ranked_by": {} }
        }
    },

    "role": {
        "name": "grader"
    }
};
