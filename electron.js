// Log started time
var started = Date.now();

// Ini parser
function dotSplit(r){return r.replace(/\1/g,"LITERAL\\1LITERAL").replace(/\\\./g,"").split(/\./).map(function(r){return r.replace(/\1/g,"\\.").replace(/\2LITERAL\\1LITERAL\2/g,"")})}function parse(r){var e={},t=e,n=null,a=/^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i,i=r.split(/[\r\n]+/g);return i.forEach(function(r,i,c){if(r&&!r.match(/^\s*[;#]/)){var s=r.match(a);if(s){if(void 0!==s[1])return n=unsafe(s[1]),void(t=e[n]=e[n]||{});var f=unsafe(s[2]),u=s[3]?unsafe(s[4]||""):!0;switch(u){case"true":case"false":case"null":u=JSON.parse(u)}f.length>2&&"[]"===f.slice(-2)&&(f=f.substring(0,f.length-2),t[f]?Array.isArray(t[f])||(t[f]=[t[f]]):t[f]=[]),Array.isArray(t[f])?t[f].push(u):t[f]=u}}}),Object.keys(e).filter(function(r,t,n){if(!e[r]||"object"!=typeof e[r]||Array.isArray(e[r]))return!1;var a=dotSplit(r),i=e,c=a.pop(),s=c.replace(/\\\./g,".");return a.forEach(function(r,e,t){i[r]&&"object"==typeof i[r]||(i[r]={}),i=i[r]}),i===e&&s===c?!1:(i[s]=e[r],!0)}).forEach(function(r,t,n){delete e[r]}),e}function isQuoted(r){return'"'===r.charAt(0)&&'"'===r.slice(-1)||"'"===r.charAt(0)&&"'"===r.slice(-1)}function unsafe(r,e){if(r=(r||"").trim(),!isQuoted(r)){for(var t=!1,n="",a=0,i=r.length;i>a;a++){var c=r.charAt(a);if(t)n+=-1!=="\\;#".indexOf(c)?c:"\\"+c,t=!1;else{if(-1!==";#".indexOf(c))break;"\\"===c?t=!0:n+=c}}return t&&(n+="\\"),n}"'"===r.charAt(0)&&(r=r.substr(1,r.length-2));try{r=JSON.parse(r)}catch(s){}return r}var eol="win32"===process.platform?"\r\n":"\n";

// Read startup configuration file
var fs = require('fs');
try {
    var startup = parse(fs.readFileSync('system/startup.ini', 'utf-8'));
} catch(e) { startup = {}; }

// Initialize application
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
// Disable HTTP cache
app.commandLine.appendSwitch('disable-http-cache');

// Report crashes to our server.
// require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if(process.platform !== 'darwin')
      app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    system = new BrowserWindow({width: 800, height: 600});
    system.setFullScreen(true);

    if(startup.development && startup.development.dev_mode)
        system.openDevTools();

    // and load the index.html of the app.
    system.loadUrl('file://' + __dirname + '/system/os.html?started=' + started + '&electron=' + (Date.now() - started));
    system.setMenuBarVisibility(false);

    // Emitted when the window is closed.
    system.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        system = null;
    });
});
