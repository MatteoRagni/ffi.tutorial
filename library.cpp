/** 
 * \file Foreign Function Interface Turorial
 * \brief This file contains an example of class and an example for function interface.
 * 
 * We will define a simple class for an extremely simple object that wil be used
 * inside other interpret languages (node, python, ruby).
 * The object MUST expose a C interface and  the object reference is handled with a
 * reinterpret_cast
 */
#include <string>
#include <sstream>

#define POINTER2STRING(x) static_cast<std::ostringstream *>(&(std::ostringstream() << static_cast<const void*>(x)))->str();

template <class T>
class Object {
  private:
  std::string _id; /**< contains an unique class id in string */

  public:
  T _n;          /**< A simple variable for naming */
  
  Object() : _n(0) {
    _id = POINTER2STRING(this);
  }

  Object(T n) : _n(n) {
    _id = POINTER2STRING(this);
  }

  const std::string& id() {
    return _id;
  }
};


/** 
 * Unfortunately, if we ahave a templetized class we must
 * create a C interface for each typename, with a different name
 */
#define VOIDPTR_2_OBJECT(x, type) reinterpret_cast<Object<type> *>(x)
#define OBJECT_2_VOIDPTR(x) reinterpret_cast<void *>(x)

extern "C" {
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
}

void *object_int_init(int n) {
  Object<int> * self = new Object<int>(n);
  return OBJECT_2_VOIDPTR(self);
}

void object_int_destroy(void *self) {
  delete VOIDPTR_2_OBJECT(self, int);
}

int object_int_n_get(void *self) {
  return VOIDPTR_2_OBJECT(self, int)->_n;
}

void *object_int_n_put(void *self, int n) {
  VOIDPTR_2_OBJECT(self, int)->_n = n;
  return self;
}

const char *object_int_id(void *self)  {
  return VOIDPTR_2_OBJECT(self, int)->id().c_str();
}

void *object_float_init(float n) {
  Object<float> *self = new Object<float>(n);
  return OBJECT_2_VOIDPTR(self);
}

void object_float_destroy(void *self)  {
  delete VOIDPTR_2_OBJECT(self, float);
}

float object_float_n_get(void *self) {
  return VOIDPTR_2_OBJECT(self, float)->_n;
}

void *object_float_n_put(void *self, float n) {
  VOIDPTR_2_OBJECT(self, float)->_n = n;
  return self;
}

const char *object_float_id(void *self)  {
  return VOIDPTR_2_OBJECT(self, int)->id().c_str();
}