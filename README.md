Nod
=====

Fast, generic, simple access control system for node.js.

## Installation

	$ npm install nod

## Introduction

nod is used by consuming applications to manage a map of permissions that let you later check or enforce that certain subjects have permissions on specific objects.

### grant
_grant(subject, resource, permission, [condition])_

Subjects, resources, and permissions can be strings, numbers, objects or arrays.  Strings or numbers will be treated as individual keys where arrays will be treated as a collection of keys to objects.
If an object is used, then it must have an id field defined (_id by default, but this can be set through configuration).
A wildcard string can be used as well to indicate 'all' in any position, but use this sparingly (see revoke).

Note that all the mandatory parameters are pretty arbitrary; nod attaches no semantic meaning to your permission names, nor does it assume any kind of inheritance in this release.
However, resources and permissions will be used as property keys in a javascript object (see getPermissions below), so they must be valid for use as object keys.

The one optional parameter, condition, is a function that will be called instead of the normal 'check' call when evaluating if a given subject has the specified rights.
It has the same signature as check (subject, resource, permission) and should explicitly return true or false to indicate whether access should be granted or not.  Note,
however that it still has to find the condition based on the first three params, so it may be useful to place it with wildcards (see example)

```javascript
// assuming some object named article
nod.grant('peter', article.id, 'read');   // peter can read the article with article.id
nod.grant(['admins','users'], 'article', 'read'); // admins and users can read an article
nod.grant('admins', 'users', '*'); // admins have all rights to affect users
nod.grant('*', '*', 'read', function(s,r,p){ return /posts\/\d+/.test(r); }); // grants read rights to all users for all resources that pass the regex test
```

### check or enforce
_check(subject, resource, permission)_
_enforce(subject, resource, permission)_

`check` returns true if a subject has a permission on a given resource, and false if it does not.  You can also provide an array of subjects, in which case `check` returns true if *any* of the
subjects have that permission on the resource.  This is mostly to allow easy checking of a user's roles against a resource.

`enforce` by contrast calls `check` and then throws an AccessDeniedError if the `check` returns false.

You can, check peter's rights as follows:

```javascript
var peter = {_id : 'peter', roles : ['user', 'contributor']};
nod.check(peter._id, article.id, 'read'); // returns true
nod.check(peter._id, article.id, 'write'); // returns false
nod.enforce(peter._id, article.id', write'); // throws an AccessDeniedError
nod.check(peter.roles, article.id, 'read');
```

### revoke
_revoke(subject, resource, permission)_

If you later change your mind, you can always `revoke` permissions as well. As with `grant`, you can pass arrays instead of numbers or strings to revoke lists of things

```javascript
nod.revoke('peter', article.id, 'read');
nod.revoke('peter',article.id, ['read','write']);
nod.revoke(['peter','stewie'], article.id, 'read');
```

Note that wildcards must be revoked as a wildcard.  You cannot successfully grant with a wildcard and then revoke for something more specific:

```javascript
nod.grant('*', 'articles', 'write');
nod.revoke('peter', 'articles', write');
nod.check('peter','articles','write'); // returns true since the wildcard is still in place

// you must remove the wildcard:
nod.revoke('*','articles','write');
```


### getPermissions
_getPermissions()_

You can also view a copy of the permissions map through `getPermissions`

```javascript
nod.grant('peter', '102029192', 'read');
nod.getPermissions();
// returns { '102029192' : { read : {peter : true }}}
```

### setPermissions
_setPermissions(obj)_

And finally, you can set permissions as well

```javascript
nod.setPermissions({'102029192' : {read : {peter : true, stewie : true }}});
nod.check('stewie', '102029192', 'read'); // returns true
```

Note that setting permissions this way should be done with caution as it just does a bulk overwrite of the current hash.

### Configuration

At the moment, the only option that does anything is setting the wildcard character (by default, '*').  You do this by calling nod as a function.

```javascript
var nod = require('nod');
nod({ wildcard : '$'});
```
