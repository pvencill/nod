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

function grant(subjectId, resourceId, permission){

  if(_.isArray(resourceId)){
    resourceId.forEach(function(item){
      grant(subjectId, item, permission);
    })
    return;
  }

  if(!map[resourceId])
    map[resourceId] = {};

  var resource = map[resourceId];

  if(!resource) resource = {};

  if(_.isArray(permission)){
    permission.forEach(function(perm){
      grant(subjectId, resourceId, perm);
    });
    return;
  }

  if(!resource[permission]) resource[permission] = [];

  if(_.isArray(subjectId)){
    resource[permission] = _.union(resource[permission], subjectId);
  }else{
    resource[permission].push(subjectId);
  }
  _.uniq(resource[permission]);

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

  if(hasPermission(resourceId, permission)){
    map[resourceId][permission] = _.without(map[resourceId][permission], subjectId);
  }
}
exports.revoke = revoke;

function check(subjectId, resourceId, permission){

  if(_.isArray(subjectId)){
    return _.any(subjectId, function(sub){
      return check(sub, resourceId, permission);
    })
  }

  if(hasPermission(resourceId, permission)){
    var matches = _.intersection(map[resourceId][permission], [subjectId,opts.wildcard]);
    return matches.length > 0;
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
