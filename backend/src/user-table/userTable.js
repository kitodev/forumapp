const service = require('../../helperService.js');

const USER_ID = 'userId';
const attributeSet = new Set(['city', 'email', 'name', 'userId']);
let maxId = 4;

module.exports = {
    sources: service.createSources('user-table', ['attributes', 'users']),
    paths: [
        {
            path: '/users',
            method: 'GET',
            description: 'get all users',
            handle: getUsers
        },
        {
            path: '/users',
            method: 'POST',
            description: 'add new user',
            handle: addUser
        },
        {
            path: '/users/:userId',
            method: 'GET',
            description: 'get user by userId',
            handle: getUser
        },
        {
            path: '/users/:userId',
            method: 'PUT',
            description: 'update user by userId',
            handle: updateUser
        },
        {
            path: '/users/:userId',
            method: 'DELETE',
            description: 'remove user by userId',
            handle: deleteUser
        },
        {
            path: '/attributes',
            method: 'GET',
            description: 'get all attributes',
            handle: getAttributes
        }
    ]
};

// - - - - - - - - - - -
// Handle functions
// - - - - - - - - - - -

function addUser(data, req) {
    const user = {
        attributes: [{
            key: USER_ID,
            type: 'NUMBER',
            value: maxId++
        }]
    };
    data.users.push(user);
    updateUserObj(user, req.body);
    updateAttributes(data);
    return {data: user};
}

function deleteUser(data, req) {
    const userId = +req.params.userId;
    const index = data.users.findIndex(({attributes}) => attributes.some(({key, value}) => key === USER_ID && value === userId));
    console.log(index);

    if (index > -1) {
        data.users.splice(index, 1);
        return {data: 'User removed'};
    } else {
        throw `Cannot find user by ID: "${userId}"`;
    }
}

function getAttributes(data) {
    return {data: data.attributes};
}

function getUser(data, req) {
    const userId = +req.params.userId;
    const user = findUser(data, userId);

    if (user) {
        return {data: user};
    } else {
        throw `Cannot find user by ID: "${userId}"`;
    }
}

function getUsers(data) {
    return {data: data.users};
}

function updateUser(data, req) {
    const user = findUser(data, +req.params.userId);
    updateUserObj(user, req.body);
    updateAttributes(data);
    return {data: user};
}

// - - - - - - - - - - -
// Helper functions
// - - - - - - - - - - -

function findUser({users}, userId) {
    return users.find(({attributes}) => attributes.some(({key, value}) => key === USER_ID && value === userId));
}

function updateAttributes(data) {
    data.users.forEach(({attributes}) => attributes.forEach(({key, type}) => {
        if (!attributeSet.has(key)) {
            data.attributes.push({key, type});
            attributeSet.add(key);
        }
    }));
}

function toMap(data) {
    const ret = {};
    data.forEach(attr => {
        if (attr.key !== USER_ID) {
            ret[attr.key] = attr;
        }
    });
    return ret;
}

function updateUserObj({attributes}, newAttributes) {
    const newAttrs = toMap(newAttributes);
    const oldAttrs = toMap(attributes);

    Object.keys(newAttrs).forEach(key => {
        if (oldAttrs[key]) { // update
            oldAttrs[key].value = newAttrs[key].value;
        } else { // add
            attributes.push(newAttrs[key]);
        }
    });

    Object.keys(oldAttrs).forEach(key => {
        if (!/^(email|name|userId)$/.test(key) && !newAttrs[key]) { // delete
            const index = attributes.findIndex(attr => attr.key === key);
            attributes.splice(index, 1);
        }
    });
}
