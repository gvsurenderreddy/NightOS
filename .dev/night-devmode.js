
console.info('development file has been loaded');

// Development code
var win = Night.Windows.create('Test window', '<strong:Hello !>');

// Load Unit Test framework
var UnitTest = (new (function() {

    var testOutput, DOMOutput, ConsoleOutput;

    this.load = function(name, _DOMOutput, _ConsoleOutput) {
        var test_content = fs.readFileSync(__dirname + '/../.dev/unit-tests/' + name + '.js', 'utf-8'), testI, _test = true;
        DOMOutput = _DOMOutput;
        ConsoleOutput = _ConsoleOutput;
        if(typeof DOMOutput === 'undefined') DOMOutput = true;

        if(DOMOutput) {
            if(!testOutput) {
                testOutput = document.createElement('div');
                testOutput.setAttribute('id', 'tests-output');
                testOutput.style.border  = '1px solid gray';
                testOutput.style.padding = '5px';
                document.body.appendChild(testOutput);
            } else
                testOutput.innerHTML = '';
        }

        if(ConsoleOutput)
            console.debug('Starting unit test : ' + name);

        function describe(name, callback) {
            var dom;

            if(!_test)
                return ;

            if((dom = document.getElementsByClassName('describe')).length)
                dom[dom.length - 1].style.color = 'green';

            if(DOMOutput)
                UnitTest.output('<pre style="font-size:20px;margin:0;padding:0;" class="describe">' + name + '</pre><br />');
            if(ConsoleOutput)
                console.debug('Describe: ' + name);
            testI = 0;
            var durey, started = Date.now();
            callback();
            durey = Date.now() - started;

            if(_test) {
                dom = document.getElementsByClassName('describe');
                dom[dom.length - 1].style.color = 'green';
                dom[dom.length - 1].innerHTML  += ' <small>' + durey + ' ms</small>';
            }
        }

        function it(name, callback) {
            if(!_test)
                return ;

            testI  += 1;
            var msg = '&nbsp;&nbsp;&nbsp;&nbsp;' + testI + ') ' + name, started = Date.now();

            try { callback(); }
            catch(e) {
                if(ConsoleOutput)
                    console.error(msg.replace(/&nbsp;/g, ' ') + ' (' + (Date.now() - started) + ' ms)');
                if(DOMOutput)
                    UnitTest.output('<pre style="color:red;margin:0;padding:0;" class="log log-failed">' + msg + ' (' + (Date.now() - started) + ' ms)</pre>');
                UnitTest.failed(e.stack);
                _test = false;
                return ;
            }

            if(DOMOutput)
                UnitTest.output('<pre style="color:green;margin:0;padding:0;" class="log">' + msg + ' (' + (Date.now() - started) + ' ms)</pre>');
            if(ConsoleOutput)
                console.debug(msg.replace(/&nbsp;/g, ' ') + ' (' + (Date.now() - started) + ' ms)');
        }

        function assert(val1, val2, message, nonStrict) {
            if(nonStrict ? val1 != val2 : val1 !== val2)
                throw new Error('<em>' + (message || 'No description') + '</em>\nAssertion failed. Expected "' + val2 + '", but "' + val1 + '" gived');
        }

        var durey, started = Date.now();

        try { (new Function(['describe', 'it', 'assert'], test_content)).apply(window, [describe, it, assert]); }
        catch(e) { _test = false; this.failed('Test failed : Runtime error\n' + e.stack); }

        durey = Date.now() - started;

        if(_test) {
            if(DOMOutput)
                testOutput.innerHTML += '<br /><pre style="color:green;margin:0;padding:0;" class="success">Test succeed in ' + durey + ' ms !</pre>'
            if(ConsoleOutput)
                console.info('Test succeed in ' + durey + ' ms !');
        }
    };

    this.output = function(content) {
        testOutput.innerHTML += content;
    };

    this.failed = function(stack) {
        if(DOMOutput) {
            var dom = document.getElementsByClassName('describe');

            if(dom.length)
                dom[dom.length - 1].style.color = 'red';

            testOutput.innerHTML += '<br /><pre style="color:red;margin:0;padding:0;" class="failed">' + stack + '</pre>';
        }

        if(ConsoleOutput)
            console.error(stack);
    };

})());
