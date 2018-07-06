#!/usr/bin/env python3

# FFI for Python 3 (in debian based): python3-ffi package
#
# This script interfaces with the library and connexts to external C functions.
# The functions are then used to run the subsequent part of the script.
#
# The python interface can work inline or out of line (in the first case
# every times it runs it does a dlopen, while in the second case an interface
# code is generated and compiled). We will see the inline version. In order to
# do so the C interface must be manually given to this file (unfortunately,
# it cannot live in a separate header, the parser is quite shitty)

from cffi import FFI

ffi = FFI()

ffi.cdef("""
  void *object_int_init(int n);
  void object_int_destroy(void *self);
  int object_int_n_get(void *self);
  void *object_int_n_put(void *self, int n);
  const char *object_int_id(void *self);

  void *object_float_init(float n);
  void object_float_destroy(void *self);
  float object_float_n_get(void *self);
  void *object_float_n_put(void *self, float n);
  const char *object_float_id(void *self);
""")
libObject = ffi.dlopen("./libObject.so")


class ObjectInt:
  def __init__(self, n = 0):
    self.ptr = libObject.object_int_init(n)
  
  def __del__(self, ):
    libObject.object_int_destroy(self.ptr)
  
  @property
  def n(self):
    return libObject.object_int_n_get(self.ptr)
  
  @n.setter
  def n(self, m):
    libObject.object_int_n_put(self.ptr, m)
    return self

  @property
  def id(self):
    return ffi.string(libObject.object_int_id(self.ptr)).decode('ascii')


class ObjectFloat:
  def __init__(self, n = 0):
    self.ptr = libObject.object_float_init(n)
  
  def __del__(self, ):
    libObject.object_float_destroy(self.ptr)
  
  @property
  def n(self):
    return libObject.object_float_n_get(self.ptr)
  
  @n.setter
  def n(self, m):
    libObject.object_float_n_put(self.ptr, m)
    return self

  @property
  def id(self):
    return ffi.string(libObject.object_float_id(self.ptr)).decode('ascii')

if __name__ == "__main__":

  print("Creating three new objects...")
  obj_i1 = ObjectInt(123)
  obj_i2 = ObjectInt(987)
  obj_f1 = ObjectFloat(3.14)

  print("Integer object 1 is {} with n = {}".format(obj_i1.id, obj_i1.n))
  print("Integer object 2 is {} with n = {}".format(obj_i2.id, obj_i2.n))
  print("Float object 1 is {} with n = {}".format(obj_f1.id, obj_f1.n))

  print("Updating n for objects")
  obj_i1.n = 321
  obj_i2.n = 789
  obj_f1.n = 4.13

  print("Integer object 1 is {} with n = {}".format(obj_i1.id, obj_i1.n))
  print("Integer object 2 is {} with n = {}".format(obj_i2.id, obj_i2.n))
  print("Float object 1 is {} with n = {}".format(obj_f1.id, obj_f1.n))
