'use strict';

// VERY IMPORTANT NOTE : Application ONLY HAVE ACCESS to `NightDocument`, NOT to `Animations`, `NightElement` ...

/** Get the computed style of an element
  * @param {string} tag The element's tag
  * @return {CSSStyleDeclaraion}
  */
function getElementComputedStyle(tag) {
    var el = document.createElement(tag);
    el.style.display = 'none';
    document.body.appendChild(el);
    var style = ("getComputedStyle" in window) ? window.getComputedStyle(el, "") : el.currentStyle;
    document.body.removeChild(el);
    return style;
}

/**
  * Get the element default's display ('inline' 'inline-block' 'block')
  * @param {string} tag The element's tag
  * @return {string}
  */
function getElementDefaultDisplay(tag) {
    return getElementComputedStyle(tag).display;
}

/* Contains all running animations */
var Animations = [];

/**
  * Animation class
  * @constructor
  * @param {NightElement} nel Element to animate
  * @param {object} ...
  // NOTE: Place the setInterval in Animation.start();
  */
var Animation = function(nel /* NightElement */, css, duration, callback) {

    // Current frame
    var frame    = 0;
    // Total duration, in frames
    var duration = duration / 13;

    // If the number of durations is a decimal number, make an around to the superior number
    if(duration % 1)
        duration = Math.floor(duration) + 1;

    // cssStart: CSS rules of the element at the start
    // cssAtFinish: CSS rules to apply only at the end of the animation (rules that can't progress, like {display: 'none'})
    var cssStart = {}, cssAtFinish = {};

    // for each rule to animate
    for(var i in css) {
        // If the final value is NOT a number
        if(Number.isNaN(parseInt(css[i]))) {
            // Change the rule only at the end of the animation, because it can't progress (like 'display' property)
            cssAtFinish[i] = css[i];
            // Delete it from the rules to animate
            delete css[i];
        } else { // If the final value is a number
            // If it's a string, make it a number to gain speed during animation
            css[i]      = parseInt(css[i]);
            // Look to the value of this rule before the beginning of the animation
            cssStart[i] = parseInt(nel.css(i)) || 0;
        }
    }

    // Perform a frame
    this.step  = function() {
        // Increase the current frame
        frame += 1;

        // If the limit is reached
        // NOTE : The >= symbol permit to stop the animation even if this function is running two times at the same time because of a bug
        if(frame >= duration) {
            // For each rule to change only at the end (like 'display')
            for(var i in cssAtFinish)
                // Change it !
                nel.css(i, cssAtFinish[i]);

            // Clear the interval
            clearInterval(this.timer);
            // Remove this animation from the running animations list
            delete Animations[this.id];

            // Run the callback (if there is one)
            if(typeof callback === 'function')
                callback.apply(this, [this]);

            // Quit the function to not perform a new changing
            return ;
        }

        // For each rule to change dynamically
        for(var i in css)
            // Change it !
            nel.css(i, cssStart[i] + (css[i] - cssStart[i]) * (frame / duration));
    };

};

/**
  * NightElement class
  * @constructor
  * @param {DOMElement} element HTML DOM element
  * @param {DOMElement} dom An HTML DOM element that contains all of the other elements of the document
  * @param {NightDocument} doc A Night document, parent of this element
  */
var NightElement = function(element, dom, doc) {
    /**
      * Create a NightCollection, put it here because the main DOM tree is required to create a collection, and the app MUST NOT BE ABLE to access this tree, so it's stored into a private privable.
      * @param {Array} collection
      * @return {NightCollection}
      */
    this._createNightCollection = function(collection) { return new NightCollection(dom, collection, doc); };

    /**
      * Get the parent element
      * @return {NightElement}
      */
    this.parent = function() {
        var p = element.parentElement;
        return p ? new NightElement(p) : this;
    };

    /**
      * Read or write an attributes. NOTE : Some attributes of forbidden in safe mode
      * @param {string} attr Attribute
      * @param {string} [value] Value
      * @return {string} Attrbute's value
      */
    this.attr = function(attr, value) {
        // If a value was specified
        if(typeof value !== 'undefined') {
            // If the document is in safe mode and the attribute is forbidden (like 'onclick' 'onmousemove' and all DOM events)
            if(doc.isSafeMode() && NightDocument.DOMEvents.indexOf(attr.substr(2)) !== -1)
                // Make an error
                throw new Error('Can\'t set attribute `' + attr + '` because document is in safe mode');

            // Else, set the attribute
            element.setAttribute(attr, value);
        }

        // Return the attribute's value
        return element.getAttribute(attr);
    };

    /**
      * Read or write the element's content
      * @param {string} [content] Content, in NTML or HTML format
      */
    this.content = function(content) {
        // If a content was specified
        if(typeof content !== 'undefined')
            // Set it after parsing
            element.innerHTML = doc.parse(content, doc.isSafeMode())

        // Return the element's content
        return element.innerHTML;
    };

    /**
      * Check if has a CSS class
      * @param {string} cl Class name
      * @return {boolean}
      */
    this.hasClass = function(cl) {
        return element.className.split(' ').indexOf(cl) !== -1;
    };

    /**
      * Add a CSS class
      * @param {string} cl Class name
      */
    this.addClass = function(cl) {
        var classes = element.className;

        if(classes.split(' ').indexOf(cl) !== -1)
            return ;

        element.className += ' ' + cl;
    };

    /**
      * Remove a CSS class
      * @param {string} cl Class name
      */
    this.removeClass = function(cl) {
        var classes = element.className;

        if(!classes.length)
            return ;

        var split = classes.split(' '), index = split.indexOf(cl);

        if(index === -1)
            return ;

        split.splice(index, 1);
        element.className = split.join(' ');
    };

    /**
      * Toggle a CSS class : If the class is present, it will be removed, else it will be added
      * @param {string} cl
      */
    this.toggleClass = function(cl) {
        return this.hasClass(cl) ? this.removeClass(cl) : this.addClass(cl);
    };

    /** Remove the element */
    this.remove   = function() { element.remove(); };
    /** Get all the element's children
      * @return {NightCollection}
      */
    this.children = function() { return this._createNightCollection(element.children); };
    /**
      * Set or get a CSS rule
      * @param {string} rule CSS rule's name
      * @param {string|number} [value] CSS rule's value
      * @return {string} CSS rule's value
      */
    this.css      = function(rule, value) {
        // If a value was specified
        if(typeof value !== 'undefined') {
            // If the value is a number and is not a numeric CSS value
            if((typeof value === 'number' || !Number.isNaN(parseInt(value))) && NightDocument.CSSNumber.indexOf(rule) === -1)
                // Turn it into pixel
                element.style[rule] = value + 'px';
            else
                // Else, set it, simply
                element.style[rule] = value;
        }

        // Return the rule's value
        return element.style[rule];
    };

    /**
      * Append an element as a children of this element
      * @param {Element|NightElement} child
      */
    this.append = function(child) {
        if(child instanceof Element)
            element.appendChild(child);
        else if(child instanceof NightElement)
            child.appendTo(element);
        else
            return false;
    };

    /**
      * Append this element as a child of a parent
      * @param {Element|NightElement} parent
      */
    this.appendTo = function(parent) {
        if(parent instanceof Element)
            parent.appendChild(element);
        else if(parent instanceof NightElement)
            parent.append(element);
        else
            return false;
    };

    /** Hide this element */
    this.hide = function() { this.css('display', 'none'); };
    /** Show this element */
    this.show = function() { this.css('display', getElementDefaultDisplay(element.tagName)); };

    /**
      * Fade in
      * @param {number} [duration] In miliseconds, default is 3000 ms
      */
    this.fadeIn = function(duration) {
        this.animate({
            opacity: 1
        }, duration || 3000);
    };

    /**
      * Fade out
      * @param {number} [duration] In miliseconds, default is 3000 ms
      */
    this.fadeOut = function(duration) {
        this.animate({
            opacity: 0
        }, duration || 3000);
    };

    /**
      * Animate some CSS rules of the element
      * @param {object} css CSS rules (rule is the key)
      * @param {number} duration In miliseconds
      * @param {function} [callback] Callback, called after the end of the animation
      */
    this.animate = function(css, duration, callback) {
        var animation = new Animation(this, css, duration, callback);
        Animations.push(animation);
        animation.id = Animations.length - 1;

        var timer = setInterval(animation.step, 13);
        animation.timer = timer;
    }; // DEMO : element.animate({display: 'block', opacity: 1, height: 400});

    /**
      * Set the NTML or HTML content of the element (No, no, your text editor is not bugging, that really this.ntml)
      */
    this.ntml = this.content;

    // Freeze this object to make malicious applications unable to modify functions and get the DOM main tree
    Object.freeze(this);

};

/**
  * Create a Night Collection
  * @param {DOMElement} dom The main DOM tree
  * @param {Array} collection Collection of NightElement and Element
  * @return {Array} Collection of NightElement
  */
function NightCollection(dom, collection) {

    // If there is no collection OR no elements into
    if(!collection || !collection.length)
        // Return an empty Night Collection
        return [];

    // c  : The Night Collection
    // ex : Example Night Element
    // doc: A simple Night Document, in safe mode
    var c = [], i, ex = new NightElement(document.createElement('div'), document.createElement('div')),
        doc = new NightDocument('', true);
    // For each element of the specified collection
    for(i = 0; i < collection.length; i += 1)
        // If the element is not a Night Element
        if(!(collection[i] instanceof NightElement))
            // Put in the final collection a Night Element
            c.push(new NightElement(collection[i], dom, doc));
        else
            // Else, put the element 'as is'
            c.push(collection[i]);

    // For each property of the example Night Element
    for(i in ex)
        // If that's not a JavaScript native property (like 'toString' 'valueOf' ...)
        if(ex.hasOwnProperty(i))
            // If this property is a function
            if(typeof ex[i] === 'function')
                // Create a function and attach it to the collection
                // This permit to apply certain operations to all of the elements contained in the createNightCollection
                // EXAMPLE 1 : collection.hide(); will hide all the elements
                // EXAMPLE 2 : collection.parent(); will return all of the elements' parents
                // NOTE: If the output is composed uniquely of Night Elements, then a Night Collection is returned instead of the results
                // NOTE: ...This permit to receive a Night Collection for collection.parent() for example
                c[i] = new Function([], 'var results=[],isNightCollection=true;for(var i=0;i<this.length;i+=1){results.push(this[i].' + i + '.apply(this[i],arguments));if(isNightCollection&&!(results[results.length-1] instanceof NightElement)){isNightCollection=false;}}return isNightCollection?this.createNightCollection(results):results;');

    /**
      * Permit to create a Night Collection from the collection herself
      * @param {Array} results
      * @return {NightCollection}
      */
    c.createNightCollection = function(results) {
        return this[0]._createNightCollection(results);
    };

    // Return the collection
    return c;

};

/**
  * NightDocument class
  * @constructor
  * @param {string} [content] NTML or HTML content
  * @param {boolean} [safeMode] Set the document in safe mode or not. Default: not
  * @param {boolean} [dontMark] Don't mark this div with attributes to recognize a Night Document. Default: false
  * @param {string} [tagName] The DOM main tree tag's name. Default: div
  */
var NightDocument = function(content, safeMode, dontMark, tagName) {

    // This is the main DOM tree, which will contains all of the other elements
    var dom = document.createElement(tagName || 'div');

    // If the document can be marked to recognize it's a Night Document
    if(!dontMark) {
        dom.setAttribute('role', 'night-document');
        dom.setAttribute('night-role', 'document');
    }

    /**
      * Append the document to a DOM Element
      * @param {Element} The DOM Element
      */
    this.appendTo = function(element) {
        element.appendChild(dom);
    };

    /**
      * Read or write the document's content
      * @param {string} [content] NTML or HTML content
      * @return {string} HTML content
      */
    this.content = function(content) {
        var parsed, collection, i;

        if(typeof content !== 'undefined')
            dom.innerHTML = this.parse(content, true);

        return dom.innerHTML;
    };

    /**
      * Create an element from a tag name
      * @param {string} tagName The element's tag name (like 'span' or 'div')
      * @return {NightElement}
      */
    this.createElement = function(tagName) {
        return new NightElement(document.createElement(tagName), dom, this);
    };

    /**
      * Do a query on the document, like jQuery ones
      * @param {string} query
      * @return {NightCollection|null}
      */
    this.query = function(query) {
        // Continue to perform the next regex
        var nfi = true;
        // While have to continue
        // This loop permit to replace all '#' by `nid` attributes
        // EXAMPLE : `#search[class="error"]` will become `[nid="search"][class="error"]`
        while(nfi) {
            nfi   = false;
            query = query.replace(/^(.*)#([a-zA-Z0-9_]+)(.*)$/, function(match, before, id, after) {
                // If there is an unclosed " symbol before that
                if((before.split('"').length - 1) % 1)
                    // Ignore this match
                    return match;
                else
                    // Else, replace '#' by `nid` attribute
                    return before + '[nid="' + id + '"]' + after;
            });
        }

        // Return a Night Collection from the query's results
        return NightCollection(dom, dom.querySelectorAll(query));
    };

    /**
      * Parse a NTML content to make HTML. NOTE : This works with HTML, but that's useless.
      * @param {string} content NTML content
      * @param {boolean} safeMode Compile in safe mode or not. Default: not
      * @return {string} HTML content
      */
    this.parse = function(content, safeMode) {
        // Perform some `little` regex :)
        content = content
            // `<div: class="test">` => `<div class="test"></div>`
            .replace(/<([a-zA-Z0-9_]+):( *)([^<>]+)>/g, function(match, tag, spaces, attributes) {
                if(attributes.trim().substr(-1) === '/' || (!spaces.length && attributes.length))
                    return match;
                else
                    return '<' + tag + ' ' + attributes + '></' + tag + '>';
            })
            // `<div :output>` => '<div nid="output">'
            .replace(/<([a-zA-Z0-9_]+)( +):([a-zA-Z0-9_]+)( *)([^<>]*)>/g, function(match, tag, spaces1, id, spaces2, rest) {
                if(!spaces2.length && rest.length)
                    return match;

                return '<' + tag + ' nid="' + id + '" ' + rest + '>';
            })
            // `<div:"Some content">` => `<div>Some content</div>`
            .replace(/<([a-zA-Z0-9_]+):"([^"]+)"( *)([^<>]*)>/g, function(match, tag, content, spaces, rest) {
                if(rest.trim().substr(-1) === '/')
                    return match;

                return '<' + tag + (rest ? ' ' + rest : '') + '>' + content + '</' + tag + '>';
            })
            // Special replaces, removed because they are unsafe
            /*.replace(/<([a-zA-Z0-9_]+)( +)event:([a-zA-Z]+):"([a-zA-Z0-9_]+)\$([a-zA-Z0-9_:;]*)"( *)([^<>]*)>/g, function(match, tag, spaces1, event, callback, args, spaces2, rest) {
                if(!spaces2.length && rest.length)
                    return match;
                else {
                    var jsargs = args.length ? ',[dom.query(\'' + args.split(';').join('\'),dom.query(\'') + '\')]' : '';

                    return '<' + tag + ' on' + event.toLocaleLowerCase() + '="dom.callback(\'' + callback + '\'' + jsargs + ');"' + (rest ? ' ' + rest : '') + '>';
                }
            })
            .replace(/<script:javascript( *)([^<>]*)>/g, function(match, spaces, rest) {
                if(!spaces.length && rest.length)
                    return match;
                else
                    return '<script type="text/javascript" ' + rest + '>';
            })*/
            ;

        // `<div class:"name" data:"error">` => `<div class="name" data="error">`
        var nfi = true;
        while(nfi) {
            nfi = false;
            content = content
                .replace(/<([^<>]+):([^<>]+)>/g, function(match, before, after) {
                    if(((before.split('"').length - 1) / 2) % 1)
                        return match;

                    nfi = true;
                    return '<' + before + '=' + after + '>';
                });
        }

        // Treat safe mode
        if(safeMode) {
            // Create a DOM Element
            var tmp = document.createElement('div'), i, j;
            // Set the HTML content as his content
            tmp.innerHTML = content;

            // Remove all dangerous elements, like `script` or `iframe`, specified in NightDocument.UnsafeTags
            collection = tmp.querySelectorAll(NightDocument.UnsafeTags.join(','));
            for(i = 0; i < collection.length; i += 1)
                collection[i].remove();

            // Remove all JS event attributes, like 'onclick' or 'onmouseover', specified in NightDocument.DOMEvents
            collection = tmp.querySelectorAll(NightDocument.DOMEvents.joinParts(',[on', ']').substr(1));
            for(i = 0; i < collection.length; i += 1)
                for(j = 0; j < NightDocument.DOMEvents.length; j += 1)
                    collection[i].removeAttribute('on' + NightDocument.DOMEvents[i]);

            return tmp.innerHTML;
        }

        // Return the cleaned HTML content
        return content;
    };

    // Set the specified content
    this.content(content);

    // Freeze this object to make malicious applications unable to modify functions and get the DOM main tree
    Object.freeze(this);

};

// CSSNumber : CSS properties that have to be numbers
// DOMEvents : HTML attributes to call a JavaScript function when there are some events
// UnsafeTags: Unsafe tags which can permit to run, with some ways, JavaScript code directly in the web page
// Thanks to jQuery
NightDocument.CSSNumber  = ["columnCount", "fillOpacity", "flexGrow", "flexShrink", "fontWeight", "lineHeight", "opacity", "order", "orphans", "widows", "zIndex", "zoom"];
NightDocument.DOMEvents  = ["click", "contextmenu", "dblclick", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseout", "mouseup", "keydown", "keypress", "keyup", "abort", "beforeunload", "error", "hashchange", "load", "pageshow", "pagehide", "resize", "scroll", "unload", "blur", "change", "focus", "focusin", "focusout", "input", "invalid", "reset", "search", "select", "submit", "drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop", "copy", "cut", "paste", "afterprint", "beforeprint", "abort", "canplay", "canplaythrough", "durationchange", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting", "error", "message", "open", "online", "offline", "show", "toggle", "wheel"];
NightDocument.UnsafeTags = ["frame", "iframe", "webkit", "script", "style", "meta", "link"];

// Freeze these arrays to make malicious applications unable to modify it
Object.freeze(NightDocument.CSSNumber);
Object.freeze(NightDocument.DOMEvents);
Object.freeze(NightDocument.UnsafeTags);

// Test code
Array.prototype.joinParts = function(before, after) {
    return before + this.join(after + before) + after;
};

console.clear(); // Clear debug output
document.body.innerHTML = '';
var o, content = o = '<title:"Empty document">\n<meta charset:"utf-8" />\n\n<div :container><input :name type:"text" placeholder:"Nom" />\n<input :age  type:"text" placeholder:"Age" />\n<div: :hello class="hidden">\n<button:"Hello !" event:click:"sayHello$name;age;hello"></div>\n\n<script:javascript>\n\tdoc.callback("sayHello", function(name, age, hello) {\n\t\thello.content("Your name is <italic>\' + name.content() + \'</italic> and you are <bold>\' + age.content() + \'</bold> years old");\n\t});\n</script>'
var doc     = new NightDocument(content, true);
doc.appendTo(document.body);
var q = doc.query('input');
q.animate({
    display: 'none',
    height: 4000
}, 30000);
