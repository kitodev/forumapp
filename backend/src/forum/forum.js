// TODO tesztelni kell mindent, ami nem GET

var service = require('../../helperService.js');

const sources = {
    users: './src/forum/users.json',
    roles: './src/forum/roles.json',
    topics: './src/forum/forum.json'
};

module.exports = {
    sources: sources,
    paths: [
        {
            path: '/users',
            method: 'GET',
            description: 'get all users',
            handle: getUsers
        },
        {
            path: '/user/:userId',
            method: 'GET',
            description: 'get user by ID',
            handle: getUserById
        },
        {
            path: '/user/:userId',
            method: 'PUT',
            description: 'update user by ID',
            handle: updateUserById
        },
        {
            path: '/user/:userId/password',
            method: 'PUT',
            description: 'update user password by ID',
            handle: updatePassword
        },
        {
            path: '/roles',
            method: 'GET',
            description: 'get all roles',
            handle: getRoles
        },
        {
            path: '/role/:roleId',
            method: 'GET',
            description: 'get role by ID',
            handle: getRoleById
        },
        {
            path: '/role/:roleId',
            method: 'PUT',
            description: 'update role by ID',
            handle: updateRoleById
        },
        {
            path: '/role/:roleId/users',
            method: 'GET',
            description: 'get users of role by ID',
            handle: getUsersOfRole
        },
        {
            path: '/topics',
            method: 'GET',
            description: 'get all topics, and all the comments',
            handle: getTopics
        },
        {
            path: '/topic/add',
            method: 'POST',
            description: 'add new topic',
            handle: addTopic
        },
        {
            path: '/topic/:topicId',
            method: 'GET',
            description: 'get topic by ID',
            handle: getTopic
        },
        {
            path: '/topic/:topicId',
            method: 'POST',
            description: 'update topic by ID',
            handle: updateTopic
        },
        {
            path: '/topic/:topicId',
            method: 'DELETE',
            description: 'remove topic by ID',
            handle: removeTopic
        },
        {
            path: '/topic/:topicId/comment/add',
            method: 'POST',
            description: 'add comment to topic root by ID',
            handle: addCommentToRoot
        },
        {
            path: '/topic/:topicId/comment/:commentId',
            method: 'PUT',
            description: 'update comment of specified comment of topic',
            handle: updateComment
        },
        {
            path: '/topic/:topicId/comment/:commentId',
            method: 'DELETE',
            description: 'remove comment by commentId from specified topic',
            handle: removeComment
        },
        {
            path: '/topic/:topicId/comment/:commentId/add',
            method: 'POST',
            description: 'add comment to specified comment of topic',
            handle: addCommentToComment
        }
    ]
};

// - - - - - - - - - - -
// Handle functions
// - - - - - - - - - - -

function addCommentToComment(data, req) {
    const topicId = req.params.topicId;
    const topic = findTopicById(data, topicId);
    const commentId = maxCommentId(topic.comments);
    const comment = findCommentById(topicId, req.params.commentId);
    const newComment = {
        id: commentId + 1,
        body: req.body.body,
        author: req.body.author,
        comments: []
    };
    comment.comments.push(newComment);
    return {
        data: newComment,
        message: 'Comment added'
    };
}

function addCommentToRoot(data, req) {
    const topicId = req.params.topicId;
    const topic = findTopicById(data, topicId);
    const commentId = maxCommentId(topic.comments);
    const comment = {
        id: commentId + 1,
        body: req.body.body,
        author: req.body.author,
        comments: []
    };
    topic.comments.push(comment);
    return {
        data: comment,
        message: 'Comment added'
    };
}

function addTopic(data, req) {
    const newId = data.topics.reduce(function(prev, next) {
        return prev.id > next.id ? prev.id : next.id;
    });
    const topic = {
        id: newId + 1,
        author: req.body.author,
        title: req.body.title,
        body: req.body.body,
        comments: []
    };
    data.topics.push(topic);
    return {
        data: topic,
        message: 'Topic added'
    };
}

function getRoleById(data, req) {
    const id = req.params.roleId;
    const role = findRoleById(data, id);
    return {data: role};
}

function getRoles(data) {
    return {data: data.roles};
}

function getTopic(data, req) {
    const topicId = req.params.topicId;
    const topic = findTopicById(data, topicId);
    return {data: topic};
}

function getTopics(data) {
    console.log(data);
    return {data: data.topics};
}

function getUserById(data, req) {
    const id = req.params.userId;
    const user = findUserByID(data, id);
    return {data: user};
}

function getUsers(data) {
    return {data: data.users};
}

function getUsersOfRole(data, req) {
    const roleId = req.params.roleId;
    const users = data.users.filter(function(user) {
        return user.role == roleId;
    });
    return {data: users};
}

function removeComment(data, req) {
    const topicId = req.params.topicId;
    const commentId = req.params.commentId;
    const comment = findCommentById(data, topicId, commentId);
    comment.removed = true;
    return {message: 'Comment removed'};
}

function removeTopic(data, req) {
    const topicId = req.params.topicId;
    const index = data.topics.findIndex(function(topic) {
        return topic.id == topicId;
    });
    if (index < 0) {
        throw 'Topic not found';
    }
    data.topics.splice(index, 1);
    return {message: 'Topic removed'};
}

function updateComment(data, req) {
    const topicId = req.params.topicId;
    const commentId = req.params.commentId;
    const comment = findCommentById(data, topicId, commentId);
    comment.body = req.body.body;
    return {data: comment};
}

function updatePassword(data, req) {
    const userId = req.params.userId;
    const user = findUserByID(data, userId);
    const password1 = req.body.password1;
    const password2 = req.body.password2;
    var msg = 'Passwords doesn\'t match!';
    if (password1 === password2 && password1) {
        var passRegex = (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
        if (passRegex.test(password1)) {
            msg = 'Password successfully updated!';
            user.password = password1;
        } else {
            msg = 'Password complexity doesn\'t match!';
        }
    }
    return {
        data: user,
        message: msg
    };
}

function updateRoleById(data, req) {
    const id = req.params.roleId;
    const role = findRoleById(data, id);
    service.update(role, req.body);
    return {data: role};
}

function updateTopic(data, req) {
    const topicId = req.params.topicId;
    const topic = findTopicById(data, topicId);
    service.update(topic, req.body, ['comments', 'author']);
    return {data: topic};
}

function updateUserById(data, req) {
    const id = req.params.userId;
    const user = findUserByID(data, id);
    service.update(user, req.body);
    return {data: user};
}

// - - - - - - - - - - -
// Helper functions
// - - - - - - - - - - -

function findCommentById(data, topicId, commentId) {
    const topic = findTopicById(data, topicId);
    return findTopicCommentById(data, topic.comments, commentId);
}

function findRoleById(data, id) {
    const role = data.roles.find(function(r) {
        return r.id == id;
    });
    if (!role) {
        throw 'Role not found';
    }
    return role;
}

function findTopicById(data, id) {
    const topic = data.topics.find(function(t) {
        return t.id == id;
    });
    if (!topic) {
        throw 'Topic not found';
    }
    return topic;
}

function findTopicCommentById(data, comments, id) {
    var comment = comments.find(function(c) {
        return c.id == id;
    });
    if (!comment) {
        comments.forEach(function(c) {
            const current = findTopicCommentById(data, c.comments, id);
            if (current) {
                comment = current;
            }
        });
    }
    return comment;
}

function findUserByID(data, id) {
    const user = data.users.find(function(u) {
        return u.id == id;
    });
    if (!user) {
        throw 'User not found';
    }
    return user;
}

function maxCommentId(comments) {
    var maxId = comments.reduce(function(prev, next) {
        return prev.id > next.id ? prev.id : next.id;
    }, -1);
    comments.forEach(function(c) {
        const max = maxCommentId(c.comments);
        if (max > maxId) {
            maxId = max;
        }
    });
    return maxId;
}
