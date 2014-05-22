"use strict";
Object.defineProperties(exports, {
  createProviderFromFnOrClass: {get: function() {
      return createProviderFromFnOrClass;
    }},
  createProviderFromValue: {get: function() {
      return createProviderFromValue;
    }},
  __esModule: {value: true}
});
var $__3 = $traceurRuntime.assertObject(require('./annotations')),
    SuperConstructorAnnotation = $__3.SuperConstructor,
    readAnnotations = $__3.readAnnotations;
var $__3 = $traceurRuntime.assertObject(require('./util')),
    isClass = $__3.isClass,
    isFunction = $__3.isFunction,
    isObject = $__3.isObject,
    toString = $__3.toString;
var EmptyFunction = Object.getPrototypeOf(Function);
var ClassProvider = function ClassProvider(clazz, params, isPromise) {
  this.provider = clazz;
  this.isPromise = isPromise;
  this.params = [];
  this.constructors = [];
  this._flattenParams(clazz, params);
  this.constructors.unshift([clazz, 0, this.params.length - 1]);
};
($traceurRuntime.createClass)(ClassProvider, {
  _flattenParams: function(constructor, params) {
    var SuperConstructor;
    var constructorInfo;
    for (var $__1 = params[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var param = $__2.value;
      {
        if (param.token === SuperConstructorAnnotation) {
          SuperConstructor = Object.getPrototypeOf(constructor);
          if (SuperConstructor === EmptyFunction) {
            throw new Error((toString(constructor) + " does not have a parent constructor. Only classes with a parent can ask for SuperConstructor!"));
          }
          constructorInfo = [SuperConstructor, this.params.length];
          this.constructors.push(constructorInfo);
          this._flattenParams(SuperConstructor, readAnnotations(SuperConstructor).params);
          constructorInfo.push(this.params.length - 1);
        } else {
          this.params.push(param);
        }
      }
    }
  },
  _createConstructor: function(currentConstructorIdx, context, allArguments) {
    var constructorInfo = this.constructors[currentConstructorIdx];
    var nextConstructorInfo = this.constructors[currentConstructorIdx + 1];
    var argsForCurrentConstructor;
    if (nextConstructorInfo) {
      argsForCurrentConstructor = allArguments.slice(constructorInfo[1], nextConstructorInfo[1]).concat([this._createConstructor(currentConstructorIdx + 1, context, allArguments)]).concat(allArguments.slice(nextConstructorInfo[2] + 1, constructorInfo[2] + 1));
    } else {
      argsForCurrentConstructor = allArguments.slice(constructorInfo[1], constructorInfo[2] + 1);
    }
    return function InjectedAndBoundSuperConstructor() {
      return constructorInfo[0].apply(context, argsForCurrentConstructor);
    };
  },
  create: function(args) {
    var context = Object.create(this.provider.prototype);
    var constructor = this._createConstructor(0, context, args);
    var returnedValue = constructor();
    if (isFunction(returnedValue) || isObject(returnedValue)) {
      return returnedValue;
    }
    return context;
  }
}, {});
var FactoryProvider = function FactoryProvider(factoryFunction, params, isPromise) {
  this.provider = factoryFunction;
  this.params = params;
  this.isPromise = isPromise;
  for (var $__1 = params[Symbol.iterator](),
      $__2; !($__2 = $__1.next()).done; ) {
    var param = $__2.value;
    {
      if (param.token === SuperConstructorAnnotation) {
        throw new Error((toString(factoryFunction) + " is not a class. Only classes with a parent can ask for SuperConstructor!"));
      }
    }
  }
};
($traceurRuntime.createClass)(FactoryProvider, {create: function(args) {
    return this.provider.apply(undefined, args);
  }}, {});
var ValueProvider = function ValueProvider(value) {
  this.provider = function() {};
  this.params = [];
  this.isPromise = false;
  this._value = value;
};
($traceurRuntime.createClass)(ValueProvider, {create: function() {
    return this._value;
  }}, {});
function createProviderFromFnOrClass(fnOrClass, annotations) {
  if (isClass(fnOrClass)) {
    return new ClassProvider(fnOrClass, annotations.params, annotations.provide.isPromise);
  }
  return new FactoryProvider(fnOrClass, annotations.params, annotations.provide.isPromise);
}
function createProviderFromValue(value) {
  return new ValueProvider(value);
}