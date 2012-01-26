var vows = require('vows'),
    assert = require('assert'),
    Ability = require('../lib/ability');


var suite = vows.describe('Ability')
.addBatch({
    'Ability':{
      'with read all access defined' :{
        topic : function(){
            var ability = new Ability();
            var user = {};
            ability.permit('read','all');
            ability.can(user,'read',123,this.callback);
        },
        'it should be able to "read" a number': function(err,res){
            assert.isTrue(res);
            assert.isNull(err);
        }

      },
        'with no access defined' : {
            topic :function(){
                var ability = new Ability();
                var user = {};
                return ability.can(user,'read',123);
            },
            'it should yield false' :function(res){
                assert.isBoolean(res);
                assert.isFalse(res);
            }
        }
    }    
})

.export(module);
