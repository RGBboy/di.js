"use strict";
var __moduleName = (void 0);
var Injector = require('./injector').Injector;
var $__3 = require('./annotations'),
    Inject = $__3.Inject,
    annotate = $__3.annotate,
    getProvideAnnotation = $__3.getProvideAnnotation,
    getInjectTokens = $__3.getInjectTokens;
var currentSpec = null;
beforeEach(function() {
  currentSpec = this;
  currentSpec.$$providers = [];
});
afterEach(function() {
  currentSpec.$$providers = null;
  currentSpec.$$injector = null;
  currentSpec = null;
});
function isRunning() {
  return !!currentSpec;
}
function isUpperCase(char) {
  return char.toUpperCase() === char;
}
function isClass(clsOrFunction) {
  if (clsOrFunction.name) {
    return isUpperCase(clsOrFunction.name.charAt(0));
  }
  return Object.keys(clsOrFunction.prototype).length > 0;
}
function use(mock) {
  if (currentSpec && currentSpec.$$injector) {
    throw new Error('Cannot call use() after inject() has already been called.');
  }
  var providerWrapper = {provider: mock};
  var fn = function() {
    currentSpec.$$providers.push(providerWrapper);
  };
  fn.as = function(token) {
    if (currentSpec && currentSpec.$$injector) {
      throw new Error('Cannot call as() after inject() has already been called.');
    }
    providerWrapper.as = token;
    if (isRunning()) {
      return undefined;
    }
    return fn;
  };
  if (isRunning()) {
    fn();
  }
  return fn;
}
function inject() {
  for (var params = [],
      $__2 = 0; $__2 < arguments.length; $__2++) params[$__2] = arguments[$__2];
  var behavior = params.pop();
  annotate(behavior, new (Function.prototype.bind.apply(Inject, $traceurRuntime.spread([null], params)))());
  var run = function() {
    if (!currentSpec.$$injector) {
      var providers = new Map();
      var modules = [];
      for (var $__0 = currentSpec.$$providers[Symbol.iterator](),
          $__1; !($__1 = $__0.next()).done;) {
        var providerWrapper = $__1.value;
        {
          if (!providerWrapper.as) {
            modules.push(providerWrapper.provider);
          } else {
            if (typeof providerWrapper.provider !== 'function') {
              providers.set(providerWrapper.as, {
                provider: function() {
                  return providerWrapper.provider;
                },
                params: [],
                isClass: false
              });
            } else {
              providers.set(providerWrapper.as, {
                provider: providerWrapper.provider,
                params: getInjectTokens(providerWrapper.provider),
                isClass: isClass(providerWrapper.provider)
              });
            }
          }
        }
      }
      ;
      currentSpec.$$injector = new Injector(modules, null, providers);
    }
    currentSpec.$$injector.get(behavior);
  };
  return isRunning() ? run(): run;
}
;
module.exports = {
  get use() {
    return use;
  },
  get inject() {
    return inject;
  }
};
