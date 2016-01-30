
describe('Testing NightOS memory registries', function() {
    it('test registry `inc`', function() {
        Night.mem.set('inc', 'unit_dev_1', 0);
        assert(Night.mem.get('unit_dev_1'), 0, 'Memory must be 0');
        assert(Night.mem.inc('unit_dev_1'), 1, 'Memory must be 1 after increase');
        var ferr;
        try { Night.mem.dec('unit_dev_1'); ferr = false; }
        catch(e) { ferr = true; }
        assert(ferr, true, 'Memory must not be decreasable');
    });

    it('test registry `dec`', function() {
        Night.mem.set('dec', 'unit_dev_2', 5);
        assert(Night.mem.get('unit_dev_2'), 5, 'Memory must be 0');
        assert(Night.mem.dec('unit_dev_2'), 4, 'Memory must be 1 after decrease');
        var ferr;
        try { Night.mem.inc('unit_dev_2'); }
        catch(e) { ferr = true; }
        assert(ferr, true, 'Memory must not be incresable');
    });

    it('test registry `rom`', function() {
        Night.mem.set('rom', 'unit_dev_3', 'One two one two');
        assert(Night.mem.get('unit_dev_3'), 'One two one two', 'Memory must be `One two one two`');
        var ferr;
        try { Night.mem.write('unit_dev_3', 'hello'); }
        catch(e) { ferr = true; }
        assert(ferr, true, 'Memory must not be rewritable');
    });

    it('test registry `mop`', function() {
        Night.mem.set('mop', 'unit_dev_4', 5);
        assert(Night.mem.get('unit_dev_4'), 5, 'Memory must be 5');
        assert(Night.mem.inc('unit_dev_4'), 6, 'Memory must be 6 after increase');
        assert(Night.mem.dec('unit_dev_4'), 5, 'Memory must be 5 after decrease');
        assert(Night.mem.write('unit_dev_4', 32), 32, 'Memory must be 32 after writing');
        var ferr;
        try { Night.mem.write('unit_dev_4', 'hello'); }
        catch(e) { ferr = true; }
        assert(ferr, true, 'Memory must not accept strings as values');
    });

    it('test registry `otw`', function() {
        Night.mem.set('otw', 'unit_dev_5', 'two');
        assert(Night.mem.get('unit_dev_5'), 'two', 'Memory must be `three`');
        assert(Night.mem.write('unit_dev_5', 'three'), 'three', 'Memory must be `three` after writing');
        var ferr;
        try { Night.mem.write('unit_dev_5', 'hello'); }
        catch(e) { ferr = true; }
        assert(ferr, true, 'Memory must not be rewritable more than 1 time');
    });

    it('test some things...', function() {
        var ferr;
        try { Night.mem.set('mop', 'unit_dev_5', 'hello'); }
        catch(e) { ferr = true; }
        assert(ferr, true, '`mop` registry must not accept strings as values');

        ferr = false;
        try { Night.mem.set('inc', 'unit_dev_1', 0); }
        catch(e) { ferr = true; }
        assert(ferr, true, 'Registries must not be re-declarable');
    });
});
