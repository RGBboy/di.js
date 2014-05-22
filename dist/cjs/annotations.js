"use strict";
Object.defineProperties(exports, {
  annotate: {get: function() {
      return annotate;
    }},
  hasAnnotation: {get: function() {
      return hasAnnotation;
    }},
  readAnnotations: {get: function() {
      return readAnnotations;
    }},
  SuperConstructor: {get: function() {
      return SuperConstructor;
    }},
  TransientScope: {get: function() {
      return TransientScope;
    }},
  Inject: {get: function() {
      return Inject;
    }},
  InjectPromise: {get: function() {
      return InjectPromise;
    }},
  InjectLazy: {get: function() {
      return InjectLazy;
    }},
  Provide: {get: function() {
      return Provide;
    }},
  ProvidePromise: {get: function() {
      return ProvidePromise;
    }},
  __esModule: {value: true}
});
var isFunction = $traceurRuntime.assertObject(require('./util')).isFunction;
var SuperConstructor = function SuperConstructor() {};
($traceurRuntime.createClass)(SuperConstructor, {}, {});
var TransientScope = function TransientScope() {};
($traceurRuntime.createClass)(TransientScope, {}, {});
var Inject = function Inject() {
  for (var tokens = [],
      $__5 = 0; $__5 < arguments.length; $__5++)
    tokens[$__5] = arguments[$__5];
  this.tokens = tokens;
  this.isPromise = false;
  this.isLazy = false;
};
($traceurRuntime.createClass)(Inject, {}, {});
var InjectPromise = function InjectPromise() {
  for (var tokens = [],
      $__6 = 0; $__6 < arguments.length; $__6++)
    tokens[$__6] = arguments[$__6];
  this.tokens = tokens;
  this.isPromise = true;
  this.isLazy = false;
};
($traceurRuntime.createClass)(InjectPromise, {}, {}, Inject);
var InjectLazy = function InjectLazy() {
  for (var tokens = [],
      $__7 = 0; $__7 < arguments.length; $__7++)
    tokens[$__7] = arguments[$__7];
  this.tokens = tokens;
  this.isPromise = false;
  this.isLazy = true;
};
($traceurRuntime.createClass)(InjectLazy, {}, {}, Inject);
var Provide = function Provide(token) {
  this.token = token;
  this.isPromise = false;
};
($traceurRuntime.createClass)(Provide, {}, {});
var ProvidePromise = function ProvidePromise(token) {
  this.token = token;
  this.isPromise = true;
};
($traceurRuntime.createClass)(ProvidePromise, {}, {}, Provide);
function annotate(fn, annotation) {
  fn.annotations = fn.annotations || [];
  fn.annotations.push(annotation);
}
function hasAnnotation(fn, annotationClass) {
  if (!fn.annotations || fn.annotations.length === 0) {
    return false;
  }
  for (var $__1 = fn.annotations[Symbol.iterator](),
      $__2; !($__2 = $__1.next()).done; ) {
    var annotation = $__2.value;
    {
      if (annotation instanceof annotationClass) {
        return true;
      }
    }
  }
  return false;
}
function readAnnotations(fn) {
  var collectedAnnotations = {
    provide: {
      token: null,
      isPromise: false
    },
    params: []
  };
  if (fn.annotations && fn.annotations.length) {
    for (var $__1 = fn.annotations[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var annotation = $__2.value;
      {
        if (annotation instanceof Inject) {
          collectedAnnotations.params = annotation.tokens.map((function(token) {
            return {
              token: token,
              isPromise: annotation.isPromise,
              isLazy: annotation.isLazy
            };
          }));
        }
        if (annotation instanceof Provide) {
          collectedAnnotations.provide.token = annotation.token;
          collectedAnnotations.provide.isPromise = annotation.isPromise;
        }
      }
    }
  }
  if (fn.parameters) {
    fn.parameters.forEach((function(param, idx) {
      for (var $__3 = param[Symbol.iterator](),
          $__4; !($__4 = $__3.next()).done; ) {
        var paramAnnotation = $__4.value;
        {
          if (isFunction(paramAnnotation) && !collectedAnnotations.params[idx]) {
            collectedAnnotations.params[idx] = {
              token: paramAnnotation,
              isPromise: false,
              isLazy: false
            };
          } else if (paramAnnotation instanceof Inject) {
            collectedAnnotations.params[idx] = {
              token: paramAnnotation.tokens[0],
              isPromise: paramAnnotation.isPromise,
              isLazy: paramAnnotation.isLazy
            };
          }
        }
      }
    }));
  }
  return collectedAnnotations;
}
;
