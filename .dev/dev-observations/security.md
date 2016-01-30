
Security issues encountered during development :

Approach
========

I)   Approach : Object.freeze(Night)
     Result   : It's possible to overwrite the `Night` object or extend sub-properties (Night.???.oneProperty = 'issue' => will work)

II)  Approach : Object.fullFreeze(Night)
     Result   : It's possible to overwrite the `Night` object and permit to receive all sensible data sent to this object

III) Approach : MakeSafe('Night', Night, global)
     Result   : The `Night` object can no longer be extended or deleted


Observations
============

By using `Object.clone(Night)` it's possible to extend a copy of the `Night` object which have the same private variables !
Fortunally, this method is useless. See it :

```javascript
// We'll try to get all entries defined in the NightOS memory
// They are stored in the private var `_reg` in `Night.mem`
var copy = Object.clone(Night);
copy.mem.getPrivate = function() {
    return _reg;
};
console.log(copy.mem.getPrivate); // We see the function, so this issue works

copy.mem.getPrivate(); // Fatal error : `_reg` is not defined
```

As you can see, it's possible to extend the copy, but the extended functions can't access to private variables.

Conclusion
==========

The 3rd approach works great and doesn't seem to have issues. Maybe there are, and I hope they will be reported to permit me fix them.
