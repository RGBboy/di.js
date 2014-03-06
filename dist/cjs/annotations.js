"use strict";
var __moduleName = (void 0);
var isFunction = require('./util').isFunction;
var SuperConstructor = function SuperConstructor() {};
($traceurRuntime.createClass)(SuperConstructor, {}, {});
var InjectAnnotation = function InjectAnnotation() {
  for (var params = [],
      $__3 = 0; $__3 < arguments.length; $__3++) params[$__3] = arguments[$__3];
  this.params = params;
};
($traceurRuntime.createClass)(InjectAnnotation, {}, {});
var ProvideAnnotation = function ProvideAnnotation(id) {
  this.id = id;
};
($traceurRuntime.createClass)(ProvideAnnotation, {}, {});
var Inject = InjectAnnotation;
var Provide = ProvideAnnotation;
function annotate(fn, annotation) {
  fn.annotations = fn.annotations || [];
  fn.annotations.push(annotation);
}
function getProvideAnnotation(provider) {
  if (!provider || !provider.annotations || !provider.annotations.length) {
    return null;
  }
  var annotations = provider.annotations;
  for (var $__1 = annotations[Symbol.iterator](),
      $__2; !($__2 = $__1.next()).done;) {
    var annotation = $__2.value;
    {
      if (annotation instanceof ProvideAnnotation) {
        return annotation.id;
      }
    }
  }
  return null;
}
function getInjectAnnotation(provider) {
  if (!provider || !provider.annotations || !provider.annotations.length) {
    return null;
  }
  var annotations = provider.annotations;
  for (var $__1 = annotations[Symbol.iterator](),
      $__2; !($__2 = $__1.next()).done;) {
    var annotation = $__2.value;
    {
      if (annotation instanceof InjectAnnotation) {
        return annotation.params;
      }
    }
  }
  return null;
}
function getInjectTokens(provider) {
  var params = getInjectAnnotation(provider) || [];
  if (provider.parameters) {
    provider.parameters.forEach((function(param, idx) {
      for (var $__1 = param[Symbol.iterator](),
          $__2; !($__2 = $__1.next()).done;) {
        var paramAnnotation = $__2.value;
        {
          if (isFunction(paramAnnotation) && !params[idx]) {
            params[idx] = paramAnnotation;
          } else if (paramAnnotation instanceof Inject) {
            params[idx] = paramAnnotation.params[0];
            continue;
          }
        }
      }
    }));
  }
  return params;
}
;
module.exports = {
  get annotate() {
    return annotate;
  },
  get SuperConstructor() {
    return SuperConstructor;
  },
  get Inject() {
    return Inject;
  },
  get InjectAnnotation() {
    return InjectAnnotation;
  },
  get Provide() {
    return Provide;
  },
  get ProvideAnnotation() {
    return ProvideAnnotation;
  },
  get getInjectAnnotation() {
    return getInjectAnnotation;
  },
  get getProvideAnnotation() {
    return getProvideAnnotation;
  },
  get getInjectTokens() {
    return getInjectTokens;
  }
};
