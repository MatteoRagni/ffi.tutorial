#!/usr/bin/env node

var ffi = require('ffi');
var ref = require('ref');

var voidPtr = ref.refType('void');

var libObject = ffi.Library('./libObject.so', {
  "object_int_init": [voidPtr , ['int']],
  "object_int_destroy": ['void' , [voidPtr]],
  "object_int_n_get": ['int' , [voidPtr]],
  "object_int_n_put": [voidPtr , [voidPtr, 'int']],
  "object_int_id": ['string', [voidPtr]],

  "object_float_init": [voidPtr , ['float']],
  "object_float_destroy": ['void' , [voidPtr]],
  "object_float_n_get": ['float' , [voidPtr]],
  "object_float_n_put": [voidPtr , [voidPtr, 'float']],
  "object_float_id": ['string' , [voidPtr]],
});

var ObjectInt = function(n) { 
    this.ptr = libObject.object_int_init(n);

    this.delete = function() {
      if (this.ptr) libObject.object_int_id(this.ptr);
      this.ptr = undefined;
    };
};

ObjectInt.prototype = {
  get n () { 
    if (this.ptr)
      return libObject.object_int_n_get(this.ptr);  
    return undefined;
  },
  set n(m) { 
    if (this.ptr) {
      libObject.object_int_n_put(this.ptr, m); 
      return this; 
    }
    return undefined;
  },
  get id () {
    if (this.ptr)
      return libObject.object_int_id(this.ptr);
    return undefined;
  }
}

var ObjectFloat = function (n) {
  this.ptr = libObject.object_float_init(n);

  this.delete = function () {
    if (this.ptr) libObject.object_float_id(this.ptr);
    this.ptr = undefined;
  };
};

ObjectFloat.prototype = {
  get n() {
    if (this.ptr)
      return libObject.object_float_n_get(this.ptr);
    return undefined;
  },
  set n(m) {
    if (this.ptr) {
      libObject.object_float_n_put(this.ptr, m);
      return this;
    }
    return undefined;
  },
  get id() {
    if (this.ptr)
      return libObject.object_float_id(this.ptr);
    return undefined;
  }
}


var obj_i1 = new ObjectInt(123);
var obj_i2 = new ObjectInt(987);
var obj_f1 = new ObjectFloat(3.14);

console.log("Integer object 1 is " + obj_i1.id + " with n = " + obj_i1.n);
console.log("Integer object 2 is " + obj_i2.id + " with n = " + obj_i2.n);
console.log("Float object 1 is " + obj_f1.id + " with n = " + obj_f1.n);

console.log("Updating n for objects");
obj_i1.n = 321;
obj_i2.n = 789;
obj_f1.n = 4.13;

console.log("Integer object 1 is " + obj_i1.id + " with n = " + obj_i1.n);
console.log("Integer object 2 is " + obj_i2.id + " with n = " + obj_i2.n);
console.log("Float object 1 is " + obj_f1.id + " with n = " + obj_f1.n);

obj_i1.delete();
obj_i2.delete();
obj_f1.delete();