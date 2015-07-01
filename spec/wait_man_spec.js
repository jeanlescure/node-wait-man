var WaitMan = require('../lib/wait-man');

describe('WaitMan module', function(){
  beforeAll(function(){
    waitMan = new WaitMan();
  });

  it('is a constructor',function(){
    expect(typeof WaitMan).toBe('function');
  });

  it('can be instantiated',function(){
    expect(typeof waitMan).toBe('object');
  });

  it('can extend objects', function(){
    var obj_a = {"first_key": "value", "second_key": "value 2"};
    var obj_b = {"first_key": "value 1", "third_key": "value 3"};

    waitMan.extend(obj_a, obj_b);

    expect(obj_a).toEqual({"first_key": "value 1", "second_key": "value 2", "third_key": "value 3"});
  });

  it('has Waiter constructor',function(){
    expect(typeof waitMan.Waiter).toBe('function');
  });

  it('has WaiterCollection constructor',function(){
    expect(typeof waitMan.WaiterCollection).toBe('function');
  });
});