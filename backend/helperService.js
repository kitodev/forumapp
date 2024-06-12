module.exports = {
    clone,
    createSources,
    deleteById,
    findById,
    maxId,
    update
};

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function createSources(folder, files) {
    const sources = {};
    files.forEach(function(file) {
        sources[file] = './src/' + folder + '/' + file + '.json';
    });
    return sources;
}

function deleteById(objects, id, name) {
    const index = objects.findIndex(function(o) {
        return o.id == id;
    });
    if (index > -1) {
        return objects.splice(index, 1)[0];
    } else {
        throw (name || 'Object') + ' not found';
    }
}

function findById(objects, id, name) {
    const obj = objects.find(function(o) {
        return o.id == id;
    });
    if (!obj) {
        throw (name || 'Object') + ' not found';
    }
    return obj;
}

function maxId(objects) {
    return objects.reduce(function(prev, next) {
        return prev.id > next.id ? prev.id : next.id;
    }, 0);
}

function update(o, n, expetcs) {
    if (!expetcs) {
        expetcs = ['id', 'password'];
    } else {
        expetcs.push('id');
    }
    expetcs.forEach(function(key) {
        delete n[key];
    });
    Object.keys(n).forEach(function(key) {
        o[key] = n[key];
    });
}
