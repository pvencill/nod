Nod
=====

Fast, generic, simple access control system for node.js.

## Installation

	$ npm install nod

## Introduction

nod is used by consuming applications to manage a map of permissions that let you later check or enforce that certain subjects have permissions on specific objects.

### grant
_ grant(subject, resource, permission) _

Arguments can be strings, numbers, or arrays.  Strings or numbers will be treated as individual keys where arrays will be treated as a collection of keys to objects.
A wildcard string can be used as well to indicate 'all' in any position, but use this sparingly (see revoke).

Note that all the parameters are pretty arbitrary; nod attaches no semantic meaning to your permission names, nor does it assume any kind of inheritance in this release.
However, resources and permissions will be used as property keys in a javascript object (see getPermissions below), so they must be valid for use as object keys.  

```javascript
// assuming some object named article
nod.grant('peter', article.id, 'read');   // peter can read the article with article.id
nod.grant(['admins','users'], 'article', 'read'); // admins and users can read an article
nod.grant('admins', 'users', '*'); // admins have all rights to affect users
```

### check or enforce
_ check(subject, resource, permission) _

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

If you later change your mind, you can always `revoke` permissions as well.

```javascript
nod.revoke('peter', article.id, 'read');
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

You can also view a copy of the permissions map through `getPermissions`

```javascript
nod.grant('peter', '102029192', 'read');
nod.getPermissions();
// returns { '102029192' : { read : ['peter'] }}
```

### setPermissions

And finally, you can set permissions as well

```javascript
nod.setPermissions({'102029192' : {read : ['peter','stewie']}});
nod.check('stewie', '102029192', 'read'); // returns true
```

### Configuration

At the moment, the only option that does anything is setting the wildcard character (by default, '*').  You do this by calling nod as a function.

```javascript
var nod = require('nod');
nod({ wildcard : '$'});
```
