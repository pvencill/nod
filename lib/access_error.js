function AccessDeniedError(message){
  this.name = AccessDeniedError.name;
  this.message = message || "";
}

AccessDeniedError.prototype = Error.prototype;

AccessDeniedError.name = 'AccessDeniedError';

module.exports = AccessDeniedError;