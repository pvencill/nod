var Rule = require('./rule');
var Ability = function(){
    this.rules = [];
};

// API to the rule engine.  in CanCan this would get inherited by the implementation class
//
// action is the string describing what is being done; "read", "create", "manage", etc
// subject is the object that we're allowing it to be done to; usually a function that's intended to be a model class but
// conditions is an object that whos properties will be compared against the subjects to try and assert equality
// delegate is a function that will be called to validate the action and subject dynamically
Ability.prototype.permit = function(user, action,subject,conditions,delegate){
  if(conditions && 'function' === typeof conditions){
        delegate = conditions;
        conditions = null;
  }
  this.rules.push(new Rule(user, action,subject, conditions, delegate));
}

Ability.prototype.can = function(user, action, subject,cb){
    var rules = this.rules;
    if(!cb || 'function' !== typeof cb)
      cb = function(){};

    var len = rules.length-1;
    try{
      console.log('starting try');
        for(var i=len; i>=0;i--){
          console.log('looping ' + i);
            var rule = rules[i];
            if(rule.allows(user, action,subject)){
              console.log('rule attempted and returned "allows"');
                continue;
            }else{
              console.log('rule invoked as not allowed');
                cb(null, false);
                return false;
            }
        }
        cb(null,true);
        return true;
    }catch(err){
        cb(err);
        return false;
    }
}

module.exports = Ability;
