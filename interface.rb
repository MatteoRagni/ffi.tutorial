#!/usr/bin/env ruby

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

class ObjectInt
  include LibObject
  include ObjectSpace # for destructor
  def initialize(n = 0); @ptr = object_int_init(n); end
  def destroy; object_int_destroy(@ptr); end
  def n; object_int_n_get(@ptr); end
  def n=(m); object_int_n_put(@ptr, m); end
  def id; object_int_id(@ptr); end

  def ObjectInt.finalize(id)
    obj = ObjectSpace._id2ref(id)
    obj.destroy
  end
end

class ObjectFloat
  include LibObject
  include ObjectSpace # for destructor
  def initialize(n = 0); @ptr = object_float_init(n); end
  def destroy; object_float_destroy(@ptr); end
  def n; object_float_n_get(@ptr); end
  def n=(m); object_float_n_put(@ptr, m); end
  def id; object_float_id(@ptr); end

  def ObjectFloat.finalize(id)
    obj = ObjectSpace._id2ref(id)
    obj.destroy
  end
end

if __FILE__ == $0
  
  puts "Creating three new objects..."
  obj_i1 = ObjectInt.new 123
  obj_i2 = ObjectInt.new 987
  obj_f1 = ObjectFloat.new 3.14

  puts "Integer object 1 is #{obj_i1.id} with n = #{obj_i1.n}"
  puts "Integer object 2 is #{obj_i2.id} with n = #{obj_i2.n}"
  puts "Float object 1 is #{obj_f1.id} with n = #{obj_f1.n}"

  puts "Updating n for objects"
  obj_i1.n = 321
  obj_i2.n = 789
  obj_f1.n = 4.13
  
  puts "Integer object 1 is #{obj_i1.id} with n = #{obj_i1.n}"
  puts "Integer object 2 is #{obj_i2.id} with n = #{obj_i2.n}"
  puts "Float object 1 is #{obj_f1.id} with n = #{obj_f1.n}"  

end