var nod = require('../lib/nod');

describe('nod', function(){
  beforeEach(function(){
    nod.setPermissions({}); // clear it
  })
  describe('grant', function(){
    it('should add permissions to the resource for the subject', function(){
      var resource = 1;
      var subjectId = 1;

      nod.grant(subjectId,resource,'read');

      nod.getPermissions()[resource]['read'][subjectId].should.be.true;
    });

    it('should add permissions to the resource for an array of subjects', function(){
      var resource = 'books';
      var subjects = ['paul','erin','becca'];
      nod.grant(subjects, resource, 'read');

      subjects.forEach(function(subj){
        nod.getPermissions()[resource]['read'][subj].should.be.true;
      })
    });

    it('should add permissions to all resources in an array of resources for a subject', function(){
      var resources = ['books/1', 'books/2', 'books/3'];
      var subject = 'admin';

      nod.grant(subject, resources, 'read');
      resources.forEach(function(book){
        nod.check(subject, book, 'read').should.be.true;
      })
    });

    it('should add all permissions to a resource for a subject', function(){
      var resource = 'users';
      var subject = 'admin';
      var permissions = ['read', 'write'];
      nod.grant(subject, resource, permissions);

      permissions.forEach(function(perm){
        nod.check(subject,resource,perm).should.be.true;
      })
    })

    it('should add all permissions to all resources for all subjects', function(){

      var resources = ['admin', 'users'];
      var subjects = ['products','news'];
      var permissions = ['read', 'comment'];
      nod.grant(subjects,resources,permissions);

      resources.forEach(function(res){
        permissions.forEach(function(perm){
          subjects.forEach(function(sub){
            nod.check(sub,res,perm).should.be.true;
          })
        })
      })
    });

    it('should be able to grant to all subjects using a wildcard character', function(){
      nod.grant('*', 'comments', 'read'); // everyone can read comments
      nod.check('bob', 'comments', 'read').should.be.true;
    });

    it('should be able to grant a permission to a subject for all resources using a wildcard character', function(){
      nod.grant('admin', '*', 'read'); //admin can read everything
      nod.check('admin', 'books', 'read').should.be.true;
    });

    it('should be able to grant all permissions to a subject for a resource using a wildcard character', function(){
      nod.grant('admin', 'users', '*'); // admin can do anything to users
      nod.check('admin', 'users', 'read').should.be.true;
    });

    it('should grant to an object based on the default idField', function(){
      nod.grant({name:'paul', _id:'1'}, 'books', 'read');
      nod.check('1','books','read').should.be.true;
    });

    it('should grant for a resource based on the default idField', function(){
      nod.grant('paul', {_id:1, title:'How the West Was Won'}, 'read');
      nod.check('paul', 1, 'read').should.be.true;
    })
  })

  describe('revoke', function(){
    it('should remove permission from the resource for the subject', function(){
      var resource = 1;
      var subjectId = 1;
      nod.grant(subjectId, resource, 'read');

      nod.revoke(subjectId, resource, 'read');
      nod.check(subjectId, resource,'read').should.be.false;
    });

    it('should remove permission from the resource for all subjects in an array', function(){
      var resource = 'books';
      var subjects = ['paul', 'john', 'bill'];
      nod.grant(subjects,resource,'read');

      nod.revoke(['john','bill'], resource, 'read');
      nod.check('paul',resource, 'read').should.be.true;
      nod.check(['john','bill'], resource,'read').should.be.false;
    });

    it('should remove permission from all resources in an array for the subject', function(){
      var resources = ['books','audio', 'users'];
      var subject = 'admins';
      var permission = 'read';

      nod.grant(subject,resources,permission);
      nod.revoke(subject, ['books','audio'], permission);
      nod.check(subject, 'users',permission).should.be.true;
      nod.check(subject,'books', permission).should.be.false;
      nod.check(subject,'audio', permission).should.be.false;
    })

    it('should remove all permissions from a resource for the subject', function(){
      var resource = 'books';
      var subject = 'admins';
      var permissions = ['read','write','execute'];

      nod.grant(subject,resource,permissions);
      nod.revoke(subject, resource, ['write','execute']);

      nod.check(subject,resource,'read').should.be.true;
      nod.check(subject,resource,'write').should.be.false;
      nod.check(subject,resource,'execute').should.be.false;
    });

    it('should revoke based on the subject _id field if passed an object', function(){
      nod.grant(1, 'books', 'read');
      nod.revoke({_id:1, name:'paul'},'books','read');
      nod.check(1,'books','read').should.be.false;
    });

    it('should revoke based on the object _id field if passed an object', function(){
      nod.grant(1,'books','read');
      nod.revoke(1,{_id:'books', sku:'1234567'}, 'read');
      nod.check(1,'books','read').should.be.false;
    })
  })

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
    });

    it('should be able to check an array of subjectIds to see if any of them match (e.g. roles)', function(){
      var resource = 'articles';
      var allowed = 'admin';
      var roles = ['user','admin'];
      nod.grant(allowed, resource, 'read'); // admin can do anything to articles

      nod.check(roles, resource, 'read').should.be.true;
    });

    it('should be able to check against an object as the subject using the default _id field', function(){
      nod.grant(1,'books','read');
      nod.check({_id:1, name:'paul'}, 'books', 'read').should.be.true;
    })

    describe('when a condition function is provided', function(){
      it('should run the condition instead of the native check function',function(){
        var wasRun = false;
        nod.grant(1,1,1, function(s,r,p){ wasRun = true; return true;});
        nod.check(1,1,1).should.be.true;
        wasRun.should.be.true;
      });
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
      var perms = { obj1 : { read : {'paul' : true}}};
      nod.setPermissions(perms);

      nod.check('paul', 'obj1','read').should.be.true;
    })
  })
})