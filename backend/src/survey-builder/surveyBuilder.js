var service = require('../../helperService.js');

module.exports = {
    sources: service.createSources('survey-builder', ['questions', 'surveys', 'types']),
    paths: [
        {
            path: '/question/add',
            method: 'POST',
            description: 'add new question',
            handle: addQuestion
        },
        {
            path: '/question/:id',
            method: 'GET',
            description: 'get question by ID',
            handle: getQuestion
        },
        {
            path: '/question/:id',
            method: 'POST',
            description: 'update question by ID',
            handle: updateQuestion
        },
        {
            path: '/questions',
            method: 'GET',
            description: 'get questions',
            handle: getQuestions
        },
        {
            path: '/survey/add',
            method: 'POST',
            description: 'add new survey',
            handle: addSurvey
        },
        {
            path: '/survey/:id',
            method: 'GET',
            description: 'get survey by ID',
            handle: getSurvey
        },
        {
            path: '/survey/:id',
            method: 'POST',
            description: 'update survey by ID',
            handle: updateSurvey
        },
        {
            path: '/survey/:id',
            method: 'DELETE',
            description: 'delete survey by ID',
            handle: deleteSurvey
        },
        {
            path: '/surveys',
            method: 'GET',
            description: 'get surveys',
            handle: getSurveys
        },
        {
            path: '/surveys/simple',
            method: 'GET',
            description: 'get simple surveys which contains IDs and names',
            handle: getSimpleSurveys
        },
        {
            path: '/types',
            method: 'GET',
            description: 'get types',
            handle: getTypes
        }
    ]
};

// - - - - - - - - - - -
// Handle functions
// - - - - - - - - - - -

function addQuestion(data, req) {
    const maxId = service.maxId(data.questions);
    const question = {
        id: maxId + 1,
        question: req.body.question,
        type: req.body.type
    };
    if (question.type !== 'DESCRIPTION') {
        question.answers = req.body.answers;
    }
    data.questions.push(question);
    return {
        data: question,
        message: 'Question added'
    };
}

function addSurvey(data, req) {
    const maxId = service.maxId(data.surveys);
    const survey = {
        description: req.body.description,
        id: maxId + 1,
        name: req.body.name,
        questions: questionMap(req.body.questions)
    };
    data.surveys.push(survey);
    return {data: survey};
}

function deleteSurvey(data, req) {
    const id = req.params.id;
    const survey = service.deleteById(data.surveys, id, 'Survey');
    return {data: survey};
}

function getQuestion(data, req) {
    const id = req.params.id;
    const question = service.findById(data.questions, id, 'Question');
    return {data: question};
}

function getQuestions(data) {
    return {data: data.questions};
}

function getSimpleSurveys(data) {
    const surveys = data.surveys.map(function(survey) {
        return {
            id: survey.id,
            name: survey.name
        }
    });
    return {data: surveys};
}

function getSurvey(data, req) {
    const id = req.params.id;
    const survey = service.findById(data.surveys, id, 'Survey');
    return {data: survey};
}

function getSurveys(data) {
    return {data: data.surveys};
}

function getTypes(data) {
    return {data: data.types};
}

function updateQuestion(data, req) {
    const id = req.params.id;
    const question = service.findById(data.questions, id, 'Question');
    service.update(question, req.body);
    return {data: question};
}

function updateSurvey(data, req) {
    const id = req.params.id;
    const survey = service.findById(data.surveys, id, 'Survey');
    service.update(survey, req.body);
    return {data: survey};
}

// - - - - - - - - - - -
// Helper functions
// - - - - - - - - - - -

function questionMap(questions) {
    return questions.map(function(q) {
        return {
            finish: q.finish,
            id: q.id
        }
    })
}
