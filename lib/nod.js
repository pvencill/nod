var _ = require('underscore'),
    AccessDeniedError = require('./access_error');

function hasPermission(resourceId, permission){
  var resource = map[resourceId];
  return resource && resource[permission];
}

var map = {};

exports.grant = function grant(subjectId, resourceId, permission){
  if(!map[resourceId])
    map[resourceId] = {};

  var resource = map[resourceId];

  if(!resource) resource = {};

  if(!resource[permission]) resource[permission] = [];

  resource[permission].push(subjectId);
  map[resourceId] = resource;
}

exports.revoke = function revoke(subjectId, resourceId, permission){
  if(hasPermission(resourceId, permission)){
    map[resourceId][permission] = _.without(map[resourceId][permission], subjectId);
  }
}

function check(subjectId, resourceId, permission){
  // default false
  if(hasPermission(resourceId, permission)){
    return map[resourceId][permission].indexOf(subjectId) != -1;
  }
  return false;
}
exports.check = check;

exports.getPermissions = function getPermissions(){
  return _.extend({}, map);
}

exports.setPermissions = function setPermissions(permissions){
  map = permissions; // blind overwrite..
}

exports.enforce = function enforce(subjectId, resourceId, permission){
  if(!check(subjectId, resourceId, permission))
    throw new AccessDeniedError('Subject ' + subjectId + ' does not have permission to ' + permission + ' the resource ' + resourceId);
}

exports.AccessDeniedError = AccessDeniedError;