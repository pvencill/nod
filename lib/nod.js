var _ = require('underscore'),
    AccessDeniedError = require('./access_error');

function hasPermission(resourceId, permission){
  var resource = map[resourceId];
  return resource && resource[permission];
}

var map = {};
var opts = {
  idField : '_id',
  roleField : 'roles',
  wildcard : '*'
}; // defaults


module.exports = exports = function(options){
  opts = _.defaults(options, opts);
}

// private function for normalizing objects into ids
function getId(item){
  if(_.isObject(item))
    return item[opts.idField];
  return item;
}

// TODO: this is in need of some serious house cleaning
function grant(subjectId, resourceId, permission, condition){
  if(!_.isFunction(condition)) condition = true;

  if(_.isArray(resourceId)){
    resourceId.forEach(function(item){
      grant(subjectId, item, permission);
    })
    return;
  }

  if(_.isArray(permission)){
    permission.forEach(function(perm){
      grant(subjectId, resourceId, perm);
    });
    return;
  }

  if(_.isArray(subjectId)){
    subjectId.forEach(function(sub){
      grant(sub, resourceId, permission);
    });
    return;
  }

  if(!map[resourceId])
    map[resourceId] = {};

  var resource = map[resourceId];

  if(!resource) resource = {};

  subjectId = getId(subjectId);
  resourceId = getId(resourceId);

  if(!resource[permission]) resource[permission] = {};

  resource[permission][subjectId] = condition;

  map[resourceId] = resource;
}

exports.grant = grant;

function revoke(subjectId, resourceId, permission){
  if(_.isArray(subjectId)){
    subjectId.forEach(function(subj){
      revoke(subj, resourceId,permission);
    })
    return;
  }

  if(_.isArray(resourceId)){
    resourceId.forEach(function(res){
        revoke(subjectId, res,permission);
      })
    return;
    }

  if(_.isArray(permission)){
    permission.forEach(function(perm){
      revoke(subjectId, resourceId, perm);
    })
    return;
  }

  subjectId = getId(subjectId);
  resourceId = getId(resourceId);

  if(hasPermission(resourceId, permission)){
    delete map[resourceId][permission][subjectId];
  }
}
exports.revoke = revoke;

function check(subjectId, resourceId, permission){

  if(_.isArray(subjectId)){
    return _.any(subjectId, function(sub){
      return check(sub, resourceId, permission);
    })
  }

  resourceId = getId(resourceId);
  subjectId = getId(subjectId);

  if(hasPermission(resourceId, permission)){
    var condition = map[resourceId][permission][subjectId] || map[resourceId][permission][opts.wildcard];
    if(_.isFunction(condition)){
      return condition(subjectId, resourceId, permission);
    }
    return !!(condition);
  }else if (hasPermission(opts.wildcard, permission)){
    return check(subjectId, opts.wildcard, permission);
  }else if (hasPermission(resourceId, opts.wildcard)){
    return check(subjectId,resourceId, opts.wildcard);
  };
  return false;
}
exports.check = check;

exports.getPermissions = function getPermissions(){
  return _.extend({}, map);
}

exports.setPermissions = function setPermissions(permissions){
  map = permissions; // blind overwrite...
}

exports.enforce = function enforce(subjectId, resourceId, permission){
  if(!check(subjectId, resourceId, permission))
    throw new AccessDeniedError('Subject ' + subjectId + ' does not have permission to ' + permission + ' the resource ' + resourceId);
}

exports.AccessDeniedError = AccessDeniedError;

exports.config = function(){ return opts;}
