'use strict';

var docment = new NightDocument('<div: :desktop><div: :windows>', false, 'body', true);
document.getElementsByTagName('body')[0].remove();
docment.appendTo(document.getElementsByTagName('html')[0]);

// Define an object named `NightLockedBit` which permit to :
// - Check if the bit is locked
// - Lock it. When locked, there is no way to unlock it because this object is propected by the EcmaScript interpreter
// There is no way to add any property (or function) to this object because the `freeze` function protect it
Object.defineProperty(global, 'NightLockedBit', {
    value: new function() {
        var locked = false;
        this.locked = function() { return locked; };
        this.lock = function() { locked = true; };
        Object.freeze(this);
    },
    writable: false,
    enumerable: false,
    configurable: false
});

var $ = function(query) {
    return docment.query(query);
};

var fs = require('fs'), ini = require(__dirname + '/ext/ini.js');

/**
  * NightOS constructor
  */
Object.defineProperty(global, 'NightCnstr', {
    value: function() {

    /* @type {number} */
    var windows = 0;

    /**
      * Window class
      * @constructor
      * @param {NightCnstr} that
      * @param {string} [title] Window's title
      * @param {string} [content] Window's content
      */
    this.Window = function(that, title, content) {

        if(!(that instanceof NightCnstr))
            throw new Error('`that` argument must be `Night` instance');

        var iframe = document.createElement('iframe');
        var nel    = docment.make(iframe).attr('id', 'window-' + that.mem.get('windows')).appendTo(docment.tree());
        var doc    = new NightDocument(null, true, 'body', true);
        iframe.contentDocument.getElementsByTagName('body')[0].remove();
        doc.appendTo(iframe.contentDocument.getElementsByTagName('html')[0]);
    };

    /**
      * Windows manager
      */
    this.Windows = (new (function(that) {

        var _windows = [];

        /**
          * Create a window
          * @param {string} [title] Window's title
          * @param {string} [content] Window's content
          * @return {object} `Window` instance
          */
        this.create = function(title, content) {
            var win = new that.Window(that, title, content);
            _windows.push(win);
            return win;
        };

    })(this));

    /**
      * Memory manager
      */
    this.mem = (new (function(that) {
        // _reg : Contain all registry entries
        // _regs: List of registries supported
        //        inc: Can only be increased
        //        dec: Can only be decreased
        //        rom: Can only be read
        //        mop: Can be modified with any value
        //        otw: Can be rewrited one time
        var _reg = {}, _regs = ['inc', 'dec', 'rom', 'mop', 'otw'];

        /**
          * Create an entry
          * @param {string} type Registry type : 'inc' 'dec' 'rom'...
          * @param {string} name Entry name
          * @param {number} value Entry value
          */
        this.set = function(type, name, value) {
            // Check if registry type is supported
            if(_regs.indexOf(type) === -1)
                throw new Error('Memory : Registry "' + type + '" is not set');

            // Check if this entry has not been already set*
            if(_reg.hasOwnProperty(name))
                throw new Error('Memory : Registry already contains entry "' + name + '" (' + _reg[name].type + ')');

            // Check if this registry type requires a numeric value
            if(['inc', 'dec', 'mop'].indexOf(type) !== -1) {
                // If specified value is a boolean, convert it to a number
                if(typeof value === 'boolean')
                    value = value ? 1 : 0;

                // Check if value is a number
                if(!Number.is(value))
                    throw new Error('Memory : Value must be a number');
            }

            _reg[name] = {
                type  : type,
                value : value,
                writed: 0
            };
        };

        /**
          * Get an entry
          * @param {string} Entry name
          * @return {number}
          */
        this.get = function(name) {
            // Check if this entry exists
            if(!_reg.hasOwnProperty(name))
                throw new Error('Memory : "' + name + '" is not set');

            return _reg[name].value;
        };

        /**
          * Increase an entry (inc, mop)
          * @param {string} name Entry name
          * @return {number} Entry value
          */
        this.inc = function(name) {
            // Check if this entry exists
            if(!_reg.hasOwnProperty(name))
                throw new Error('Memory : "' + name + '" is not set');

            // Check if the entry's type is 'inc' or 'mop'
            if(['inc', 'mop'].indexOf(_reg[name].type) === -1)
                throw new Error('Memory : "' + name + '" (' + _reg[name].type + ') doesn\'t support operation "inc"');

            _reg[name].value  += 1;
            _reg[name].writed += 1;
            return _reg[name].value;
        };

        /**
          * Decrease an entry (dec, mop)
          * @param {string} name Entry name
          * @return {number} Entry value
          */
        this.dec = function(name) {
            // Check if this entry exists
            if(!_reg.hasOwnProperty(name))
                throw new Error('Memory : "' + name + '" is not set');

            // Check if the entry's type is 'dec' or 'mop'
            if(['dec', 'mop'].indexOf(_reg[name].type) === -1)
                throw new Error('Memory : "' + name + '" (' + _reg[name].type + ') doesn\'t support operation "dec"');

            _reg[name].value  -= 1;
            _reg[name].writed += 1;
            return _reg[name].value;
        };

        /**
          * Write an entry (mop, rom)
          * @param {string} name Entry name
          * @param {number} value Entry value
          */
        this.write = function(name, value) {
            // Check if this entry exists
            if(!_reg.hasOwnProperty(name))
                throw new Error('Memory : "' + name + '" is not set');

            // Check if the entry's type is 'mop' or 'otw'
            if(['mop', 'otw'].indexOf(_reg[name].type) === -1)
                throw new Error('Memory : "' + name + '" (' + _reg[name].type + ') doesn\'t support operation "inc"');

            // If the entry's type is 'otw', check if it has already been rewrited
            if(_reg[name].type === 'otw' && _reg[name].writed >= 1)
                throw new Error('Memory : "' + name + '" (otw) has already been rewrited one time');

            // Check if this registry type requires a numeric value
            if(_reg[name].type === 'mop') {
                // If specified value is a boolean, convert it to a number
                if(typeof value === 'boolean')
                    value = value ? 1 : 0;

                // Check if value is a number
                if(!Number.is(value))
                    throw new Error('Memory : Value must be a number');
            }

            _reg[name].value   = value;
            _reg[name].writed += 1;
            return _reg[name].value;
        };
    })(this));

    /**
      * Start NightOS (initialization)
      */
    this.init = function() {
        var startup;
        // Run the startup configuration file
        // Load `system/startup.ini` from hard drive
        try { startup = fs.readFileSync('system/startup.ini', 'utf-8'); }
        catch(e) { throw new Error('Failed to load startup configuration file :\n' + e.stack); }

        // Parse it
        try { startup = ini.parse(startup); }
        catch(e) { throw new Error('Failed to parse startup configuratino file :\n' + e.stack); }

        // Run it !
        // Here are the instructions for development mode
        if(startup.development) {
            var dev = startup.development;
            Night.mem.set('rom', 'DEV_MODE', startup.development.dev_mode); // Change it to `false` on production mode !
            Night.mem.set('rom', 'STARTUP', Object.clone(startup));
            Night.mem.set('rom', 'STARTUP_DEV', Object.clone(startup.development));
            // Run development file
            if(this.mem.get('DEV_MODE')) {
                if(dev.run_dev_file) {
                    try { var devfile = fs.readFileSync('.dev/night-devmode.js', 'utf-8'); }
                    catch(e) { console.error('Failed to load development file :\n' + e.stack); }

                    if(devfile) {
                        try { global.eval(devfile); }
                        catch(e) { throw new Error('Fatal error while running development file :\n' + e.stack); }
                    }
                }

                if(dev.log_it)
                    console.log(Object.clone(startup)); // Ensure startup file will not be modified by cloning it

                if(dev.benchmark_startup_times) {
                    var query = location.search.substr(1);
                    var result = {};
                    query.split("&").forEach(function(part) {
                        var item = part.split("=");
                        result[item[0]] = decodeURIComponent(item[1]);
                    });
                    console.debug('Electron      started in ' + result.electron + ' ms');
                    console.debug('NightOS frame started in ' + (Date.now() - started) + ' ms');
                    console.debug('NightOS       started in ' + (Date.now() - result.started + ' ms'));
                }
            } else
                Night.mem.set('rom', 'STARTUP_DEV', false);
        }

        // Prepare web page
        docment
    };

    /**
      * Variables manager
      */
    this.vars = (new (function(that) {

        var _vars = {};

        this.set = function(name, value) { _vars[name] = value; };
        this.get = function(name)        { return _vars[name]; };
        this.all = function()            { return _vars; };

    })(this));

    /**
      * FileSystem manager
      */
    this.fs = (new (function(that) {

        var fs = require('fs'), path = require('path');

        /**
          * Format a path
          * @param {string} p
          * @return {string} Formatted path
          */
        function _path(p) {
            // format path and return it
            return p;
        }

        /**
          * Create a NightOS FileSystem error from a Node.js FileSystem error
          * @param {Error} e
          * @return {NightError}
          */
        function _error(e) {
            return new Night.Error(Object.merge(e, {source: 'Night.fs'}));
        }

        /**
          * Write a file
          * @param {string} file
          * @param {string} content
          * @param {string} [charset] Default: SystemInfo.fs.charset
          */
        this.writeFile = function(file, content, charset) {
            // check path is not a folder
            try      { fs.writeFileSync(_path(file), content, charset || SystemInfo.fs.charset); }
            catch(e) { return _error(e); }
        };

        /**
          * Read a file
          * @param {string} file
          * @param {string} [charset] Default: SystemInfo.fs.charset
          */
        this.readFile = function(file, charset) {
            // check file exists and is not a folder
            try      { fs.readFileSync(_path(file), content, charset || SystemInfo.fs.charset); }
            catch(e) { return _error(e); }
        };

        this.makeDir = function(dir) {
            // check dir doesn't exist AND isn't a file
        };

    })(this));

    this.mem.set('inc', 'windows', 0);

    Object.freeze(this);
}, writable: false, enumerable: false, configurable: false});

// Make Night object
// And make malicious applications unable to modify it and get access to secret variables, like windows...
MakeSafe('Night', new NightCnstr(), global);

// Old and useless method which contains a security issue
/*// We use `defineProperty` to make malicious application unable to modify it and get access to secret variables, like windows...
Object.defineProperty(global, 'Night', {
    value: new NightCnstr(),
    writable: false,
    enumerable: false,
    configurable: false,
    writable: false
});*/
// --- END ---

// Start NightOS
Night.init();
