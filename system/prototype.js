/**
  * Prototype library for NightOS
  * @author Clément Nerma
  * @license MIT
  */

Object.defineProperty(global, 'MakeSafe', {
    value: function(varName, value, context) {
        context = context || window; // `window` because `global` doesn't allow redefinitions

        if(context.hasOwnProperty(varName)) {
            if(!(delete context[varName]))
                throw new Error('Can\'t remove property "' + varName + '" from his context');
        }

        Object.defineProperty(context, varName, {
            value: value,
            writable: false,    // Disable writing
            enumerable: true,   // Permit to see it in a for(i in obj) {} loop
            configurable: false
        });

        if(typeof context[varName] === 'object')
            Object.fullFreeze(context[varName]);
            //Object.safeFullFreeze(context[varName]);
    },
    writable: false,
    enumerable: false,
    configurable: false
});

function isset(v) { return (typeof v !== 'undefined'); }

Date.sleep = function(miliseconds) {
    var e = new Date().getTime() + miliseconds;

     while (new Date().getTime() <= e) {
       ;
     }
};

Object.fullFreeze = function(obj) {
    for(var i in obj) {
        if(obj.hasOwnProperty(i) && typeof obj[i] === 'object') {
            Object.fullFreeze(obj[i]);
        }
    }

    Object.freeze(obj);
    return obj;
};

MakeSafe('fullFreeze', Object.fullFreeze, Object);
/*
Object.safeFullFreeze = function(obj) {
    for(var i in obj) {
        if(typeof obj[i] === 'object') {
            MakeSafe(i, obj[i], obj);

            if(!Object.isCyclic(obj[i]))
                Object.safeFullFreeze(obj);
        }
    }

    return obj;
};

MakeSafe('safeFullFreeze', Object.safeFullFreeze, Object);
*/
Object.isCyclic = function(obj) {
    var seenObjects = [];

    function detect (obj) {
        if(obj && typeof obj === 'object') {
            if (seenObjects.indexOf(obj) !== -1)
                return true;
            seenObjects.push(obj);
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && detect(obj[key]))
                    console.log(key || true);
            }
        }

        return false;
    }

    return detect(obj);
};

MakeSafe('isCyclic', Object.isCyclic, Object);

Object.compare = function(obj1, obj2) {
    if(!Object.is(obj1) || !Object.is(obj2))
        return false;

    if(obj1.length !== obj2.length)
        return false;

    for(var i in obj1)
        if(obj1.hasOwnProperty(i)) {
            if(Object.is(obj1[i]) && !Object.is(obj1[i]))
                return false;
            else if(Object.is(obj1[i]) && !Object.is(obj1[i]))
                return false;
            else if(Array.is(obj1[i])) {
                if(!Array.compare(obj1[i], obj2[i]))
                    return false;
            } else if(Object.is(obj1[i])) {
                if(!Object.compare(obj1[i], obj2[i]))
                    return false;
            } else if(obj1[i] !== obj2[i])
                return false;
        }

    return true;
};

Object.merge = function(model, merge) {
    model = (model || {});
    merge = (merge || {});

    for(var i in merge)
        if(merge.hasOwnProperty(i))
            model[i] = merge[i];

    return model;
};

Object.clone = function(e){var n;if(null==e||"object"!=typeof e)return e;if(e instanceof Date)return n=new Date,n.setTime(e.getTime()),n;if(e instanceof Array){n=[];for(var t=0,r=e.length;r>t;t++)n[t]=Object.clone(e[t]);return n}if(e instanceof Object){n={};for(var o in e)e.hasOwnProperty(o)&&(n[o]=Object.clone(e[o]));return n}throw new Error("Unable to copy obj! Its type isn't supported.")};
Object.is = function(obj, strict) {
    return (strict ? (obj && typeof(obj) === 'object' && !Array.isArray(obj)) : typeof obj === 'object');
};

Object.prototype.forEach = function(callback) {
    for(var i in this)
        if(this.hasOwnProperty(i))
            callback(i, this[i]);
}

Object.lengthOf = function(obj) {
    return Object.keys(obj).length;
};

Number.is = function(num) {
    return (typeof num === 'number');
};

Boolean.is = function(bool) {
    return (bool === true || bool === false);
};

String.is = function(str) {
    return (typeof str === 'string');
};

String.prototype.toPlainText = function() {
    return this
        .replace(/</g, '')
        .replace(/>/g, '');
};

String.prototype.toCamelCase = function() {
    return this.toLowerCase()
    // Replaces any - or _ characters with a space
    .replace( /[-_]+/g, ' ')
    // Removes any non alphanumeric characters
    .replace( /[^\w\s]/g, '')
    // Uppercases the first character in each group immediately following a space
    // (delimited by spaces)
    .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
    // Removes spaces
    .replace( / /g, '' );
};

String.prototype.cutHTML = function() {
    return this.cutHTML();
};

Math.randomInt = function(max) {
    return Math.floor(Math.random() * max) + 1;
};

Array.is = Array.isArray;

Array.compare = function(arr1, arr2) {
    if(!Array.isArray(arr1) || !Array.isArray(arr2))
        return false;

    if(arr1.length !== arr2.length)
        return false;

    for(var i = 0; i < arr1.length; i += 1)
        if(Array.isArray(arr1[i]) && !Array.isArray(arr1[i]))
            return false;
        else if(Object.is(arr1[i]) && !Object.is(arr1[i]))
            return false;
        else if(Array.isArray(arr1[i])) {
            if(!Array.compare(arr1[i], arr2[i]))
                return false;
        } else if(Object.is(arr1[i])) {
            if(!Object.compare(arr1[i], arr2[i]))
                return false;
        } else if(arr1[i] !== arr2[i])
            return false;

    return true;
};

Array.prototype.joinParts = function(before, after) {
    return before + this.join(after + before) + after;
};

Array.randomOne = Object.randomOne = function(obj) {
    var keys = Object.keys(obj);
    return obj[keys[Math.randomInt(keys.length) - 1]];
};

Array.prototype.sum = function() {
    var sum = 0;

    for(var i = 0; i < this.length; i += 1)
        sum += arr[i];

    return sum;
};

Array.create = function(height, width, fill) {
    var arr = new Array(height);

    for(var y = 0; y < height; y += 1)
        arr[y] = (new Array(width)).fill(fill);

    return arr;
};

Function.prototype.behove = function(obj) {
    for(var i in obj)
        if(obj.hasOwnProperty(i))
            if(obj[i] === this)
                return true;

    return false;
};

Function.is = function(func) {
    return (typeof func === 'function');
};

if(typeof Image === 'object') {
    Image.create = function(url) {
        var img = new Image();
        img.src = url;
        return img;
    };

    Image.toBase64 = function(image) {
        if(!image.width || image.height)
            return false;

        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return canvas.toDataURL();
    };

    Image.prototype.toBase64 = function() {
        return Image.toBase64(this);
    };
}
