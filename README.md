# FFI Tutorial

A tutorial on the Foreign Function Interface for shared objects in different languages.

## Example Object

The object at the core of the example is a template class, with a public attribute (`n`)
and an additional read only attribute (`id`), which is the string equivalent of the `this` pointer (in C++)
```
template <typename T>
class Object {
  public:
    T n;
    Object();
    Object(T n);
    id();
  private:
    string id;
};
```

## C interface

For this object, two specialized C interface are provided, one for `int` type
```
extern "C" {
  void *object_int_init(int n);
  void object_int_destroy(void *self);
  int object_int_n_get(void *self);
  void *object_int_n_put(void *self, int n);
  const char *object_int_id(void *self);
}
```
and one for `float` type:
```
extern "C" {
  void *object_float_init(float n);
  void object_float_destroy(void *self);
  float object_float_n_get(void *self);
  void *object_float_n_put(void *self, float n);
  const char *object_float_id(void *self);
}
```
The real core of the problem is to have only in memory a representation of a generated
object. This is done through a void pointer to an instance pointer.
```
#define VOIDPTR_2_OBJECT(x, type) reinterpret_cast<Object<type> *>(x)
#define OBJECT_2_VOIDPTR(x) reinterpret_cast<void *>(x)
```

## Compile the library

The library should be compiled as a shared object. Looking at the Makefile:
```
default: 
	$(CXX) -Wall -std=c++11 library.cpp -fPIC -shared -o libObject.so
```
`-fPIC` and `-shared` will do the job. Looking at the defined symbols (`nm -g libObject.so`)
we can see the exported and demangled function (thanks to `extern "C"`):
```
0000000000001216 T object_float_destroy
0000000000001278 T object_float_id
00000000000011bd T object_float_init
0000000000001244 T object_float_n_get
0000000000001257 T object_float_n_put
0000000000001141 T object_int_destroy
000000000000119b T object_int_id
00000000000010f0 T object_int_init
000000000000116f T object_int_n_get
0000000000001180 T object_int_n_put
```

## Foreign interface

We use three different languages:

 * Python 3: `apt install python3-cffi` or `pip install cffi`
 * Ruby: `apt install ruby-ffi` or `gem install ffi`
 * Node: `npm install [-g] node-ffi`

## Python

Python is a little more complex with respect to the other interface. It allows both an in-line and an off-line
interface (the second one generates C code to compile and link with the shared object, 
while the first loads runtime the shared object).

Both version require a "C like" short header with only the function to import.

### FFI Methods

```
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
```
all the methods are now in the `libObject` module. A function can be called with (e.g.) `libObject.object_int_init(10)`.

## Ruby

Ruby is the simplest to be used IMHO

### FFI Methods

```
require 'ffi'

module LibObject
  extend FFI::Library

  ffi_lib './libObject.so'
  attach_function :object_int_init, [:int], :pointer
  attach_function :object_int_destroy, [:pointer], :void
  attach_function :object_int_n_get, [:pointer], :int
  attach_function :object_int_n_put, [:pointer, :int], :pointer
  attach_function :object_int_id, [:pointer], :string

  attach_function :object_float_init, [:float], :pointer
  attach_function :object_float_destroy, [:pointer], :void
  attach_function :object_float_n_get, [:pointer], :float
  attach_function :object_float_n_put, [:pointer, :float], :pointer
  attach_function :object_float_id, [:pointer], :string
end
```
all the methods are now in the `LibObject` module. A function can be called with (e.g.) `LibObject.object_int_init(10)`.

## Node

Probably the git version of the module is required (the one in the repository does not compile?!?).

### FFI Methods

```
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
```
the `ref` module is required for pointers and references. A function can be called with (e.g.) `libObject.object_int_init(10)`.
