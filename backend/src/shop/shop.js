var service = require('../../helperService.js');

const sources = {
    elements: './src/shop/products.json'
};

module.exports = {
    sources: sources,
    paths: [
        {
            path: '/products',
            method: 'GET',
            description: 'get all products',
            handle: getProducts
        },
        {
            path: '/categories',
            method: 'GET',
            description: 'get all categories',
            handle: getCategories
        },
        {
            path: '/product/add',
            method: 'POST',
            description: 'add new product',
            handle: addProduct
        },
        {
            path: '/category/add',
            method: 'POST',
            description: 'add new category',
            handle: addCategory
        }
    ]
};

// - - - - - - - - - - -
// Handle functions
// - - - - - - - - - - -

function addCategory(data, req) {
    var parent = null;
    const parentName = req.body.parent;
    if (parentName) {
        parent = findCategoryByName(data.elements, req.body.parent.toLowerCase());
        if (!parent) {
            throw 'Cannot find category by name: \'' + parentName + '\'';
        }
        parent = parent.children;
    } else {
        parent = data.elements;
    }
    const category = {
        children: [],
        name: req.body.name,
        type: 'CATEGORY'
    };
    parent.push(category);
    return {data: category};
}

function addProduct(data, req) {
    const productId = maxProductId(data.elements, -1);
    const product = {
        id: productId + 1,
        name: req.body.name,
        price: req.body.price,
        type: 'PRODUCT'
    };
    const parent = findCategoryByName(data.elements, req.body.parent.toLowerCase());
    if (!parent) {
        throw 'Cannot find category by name: \'' + req.body.parent + '\'';
    }
    parent.children.push(product);
    return {data: product};
}

function getCategories(data) {
    return {data: buildCategoryList(data.elements)};
}

function getProducts(data) {
    return {data: data.elements};
}

// - - - - - - - - - - -
// Helper functions
// - - - - - - - - - - -

function buildCategoryList(elements, path) {
    var list = [];
    path = path || '';
    elements.forEach(function(element) {
        if (element.type === 'CATEGORY') {
            const obj = service.clone(element);
            delete obj.children;
            delete obj.type;
            obj.parent = path;
            list.push(obj);

            const currentPath = path ? path + '/' + element.name : element.name;
            list = list.concat(buildCategoryList(element.children, currentPath));
        }
    });
    return list;
}

function findCategoryByName(elements, name) {
    var group = null;
    elements.forEach(function(element) {
        if (element.type === 'CATEGORY') {
            if (element.name.toLowerCase() === name) {
                group = element;
            } else {
                const foundGroup = findCategoryByName(element.children, name);
                if (foundGroup) {
                    group = foundGroup;
                }
            }
        }
    });
    return group;
}

function maxProductId(elements, maxId) {
    maxId = maxId === undefined ? -1 : maxId;
    elements.forEach(function(element) {
        maxId = Math.max(maxId, element.type === 'CATEGORY' ? maxProductId(element.children, maxId) : element.id);
    });
    return maxId;
}