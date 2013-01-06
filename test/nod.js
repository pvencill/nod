var nod = require('../lib/nod');

describe('nod', function(){
  describe('grant', function(){
    it('should add permissions to the resource for the subject', function(){
      var resource = 1;
      var subjectId = 1;
      nod.grant(subjectId,resource,'read');

      nod.getPermissions()[resource].permissions['read'].should.include(subjectId);
    })
  })

  describe('revoke', function(){
    it('should remove permission from the resource for the subject', function(){
      var resource = 1;
      var subjectId = 1;
      nod.grant(subjectId, resource, 'read');

      nod.revoke(subjectId, resource, 'read');
      nod.getPermissions()[resource].permissions.read.should.not.include(subjectId);
    })
  })

  // TODO: should grant and revoke operate on arrays of subjectIds or arrays of permissions or both?

  describe('check', function(){
    it('should return true if the subjectId has the permission', function(){
      var resource = 1;
      var subjectId = 1;
      nod.grant(subjectId, resource, 'read');

      nod.check(subjectId, resource, 'read').should.be.true;
    })
    it('should return false if the subjectId does not have the permission', function(){
      var resource = 1;
      var subjectId = 1;
      nod.grant(subjectId, resource,'read');

      nod.check(subjectId, resource, 'write').should.be.false;
    })
  })

  describe('enforce', function(){
    it('should throw an exception if the check fails', function(){
      var resource = 1;
      var subjectId = 'some object';
      nod.grant(subjectId, resource, 'read');

      var enforced = false;
      try{
        nod.enforce(subjectId, resource, 'write');
      }catch(e){
        if(e.name == nod.AccessDeniedError.name)
          enforced = true;
      }

      enforced.should.be.true;

    })
  })

  describe('setPermissions', function(){
    it('should allow a well formed permissions object to be injected', function(){
      var perms = { obj1 : { permissions : { read : ['paul']}}};
      nod.setPermissions(perms);

      nod.check('paul', 'obj1','read').should.be.true;
    })
  })
})