var Rule = function(actor, action,subject, conditions, delegate){
    this.user = actor;
    this.action = action ? action.toLowerCase() : 'all';
    this.subject = subject;
    this.conditions = conditions;
    this.delegate = delegate;
}

Rule.prototype.is_relevant_for = function(actor,action,subject){
    return true;
}

Rule.prototype.allows = function(actor,action,subject){
    if(this.action==='all' || !this.is_relevant_for(actor,action,subject))
      return true;

}

module.exports = Rule;
