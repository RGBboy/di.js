"use strict";
var __moduleName = (void 0);
var $__4 = require('./annotations'),
    getProvideAnnotation = $__4.getProvideAnnotation,
    getInjectAnnotation = $__4.getInjectAnnotation,
    Inject = $__4.Inject,
    SuperConstructor = $__4.SuperConstructor,
    getInjectTokens = $__4.getInjectTokens;
var $__4 = require('./util'),
    isUpperCase = $__4.isUpperCase,
    isClass = $__4.isClass,
    isFunction = $__4.isFunction,
    isObject = $__4.isObject,
    toString = $__4.toString;
var getUniqueId = require('./profiler').getUniqueId;
var EmptyFunction = Function.__proto__;
var Injector = function Injector() {
  var modules = arguments[0] !== (void 0) ? arguments[0]: [];
  var parentInjector = arguments[1] !== (void 0) ? arguments[1]: null;
  var providers = arguments[2] !== (void 0) ? arguments[2]: new Map();
  var $__0 = this;
  this.cache = new Map();
  this.providers = providers;
  this.parent = parentInjector;
  this.id = getUniqueId();
  for (var $__2 = modules[Symbol.iterator](),
      $__3; !($__3 = $__2.next()).done;) {
    var module = $__3.value;
    {
      if (isFunction(module)) {
        this._loadProvider(module);
        continue;
      }
      Object.keys(module).forEach((function(key) {
        $__0._loadProvider(module [key], key);
      }));
    }
  }
};
var $Injector = Injector;
($traceurRuntime.createClass)(Injector, {
  _collectProvidersWithAnnotation: function(annotationClass, collectedProviders) {
    this.providers.forEach((function(provider, token) {
      if (provider.provider.annotations) {
        for (var $__2 = provider.provider.annotations[Symbol.iterator](),
            $__3; !($__3 = $__2.next()).done;) {
          var annotation = $__3.value;
          {
            if (annotation instanceof annotationClass && !collectedProviders.has(token)) {
              collectedProviders.set(token, provider);
            }
          }
        }
      }
    }));
    if (this.parent) {
      this.parent._collectProvidersWithAnnotation(annotationClass, collectedProviders);
    }
  },
  _loadProvider: function(provider, key) {
    if (!isFunction(provider)) {
      return;
    }
    var token = getProvideAnnotation(provider) || key || provider;
    this.providers.set(token, {
      provider: provider,
      params: getInjectTokens(provider),
      isClass: isClass(provider)
    });
  },
  _hasProviderFor: function(token) {
    if (this.providers.has(token)) {
      return true;
    }
    if (this.parent) {
      return this.parent._hasProviderFor(token);
    }
    return false;
  },
  get: function(token) {
    var resolving = arguments[1] !== (void 0) ? arguments[1]: [];
    var $__0 = this;
    var defaultProvider = null;
    if (isFunction(token)) {
      defaultProvider = token;
    }
    if (this.cache.has(token)) {
      return this.cache.get(token);
    }
    var provider = this.providers.get(token);
    var resolvingMsg = '';
    if (!provider && defaultProvider && !this._hasProviderFor(token)) {
      provider = {
        provider: defaultProvider,
        params: getInjectTokens(defaultProvider),
        isClass: isClass(defaultProvider)
      };
    }
    if (!provider) {
      if (!this.parent) {
        if (resolving.length) {
          resolving.push(token);
          resolvingMsg = (" (" + resolving.map(toString).join(' -> ') + ")");
        }
        throw new Error(("No provider for " + toString(token) + "!" + resolvingMsg));
      }
      return this.parent.get(token, resolving);
    }
    if (resolving.indexOf(token) !== - 1) {
      if (resolving.length) {
        resolving.push(token);
        resolvingMsg = (" (" + resolving.map(toString).join(' -> ') + ")");
      }
      throw new Error(("Cannot instantiate cyclic dependency!" + resolvingMsg));
    }
    resolving.push(token);
    var context = undefined;
    if (provider.isClass) {
      context = Object.create(provider.provider.prototype);
    }
    var injector = this;
    var args = provider.params.map((function(token) {
      if (token === SuperConstructor) {
        var superConstructor = provider.provider.__proto__;
        if (superConstructor === EmptyFunction) {
          resolvingMsg = (" (" + resolving.map(toString).join(' -> ') + ")");
          throw new Error(("Only classes with a parent can ask for SuperConstructor!" + resolvingMsg));
        }
        return function() {
          if (arguments.length > 0) {
            resolvingMsg = (" (" + resolving.map(toString).join(' -> ') + ")");
            throw new Error(("SuperConstructor does not accept any arguments!" + resolvingMsg));
          }
          var superArgs = getInjectTokens(superConstructor).map((function(token) {
            return injector.get(token, resolving);
          }));
          superConstructor.apply(context, superArgs);
        };
      }
      return $__0.get(token, resolving);
    }));
    try {
      var instance = provider.provider.apply(context, args);
    } catch (e) {
      resolvingMsg = (" (" + resolving.map(toString).join(' -> ') + ")");
      var originalMsg = 'ORIGINAL ERROR: ' + e.message;
      e.message = ("Error during instantiation of " + toString(token) + "!" + resolvingMsg + "\n" + originalMsg);
      throw e;
    }
    if (provider.isClass && !isFunction(instance) && !isObject(instance)) {
      instance = context;
    }
    this.cache.set(token, instance);
    resolving.pop();
    return instance;
  },
  invoke: function(fn, context) {},
  createChild: function() {
    var modules = arguments[0] !== (void 0) ? arguments[0]: [];
    var forceNewInstancesOf = arguments[1] !== (void 0) ? arguments[1]: [];
    var forcedProviders = new Map();
    for (var $__2 = forceNewInstancesOf[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done;) {
      var annotation = $__3.value;
      {
        this._collectProvidersWithAnnotation(annotation, forcedProviders);
      }
    }
    return new $Injector(modules, this, forcedProviders);
  },
  dump: function() {
    var $__0 = this;
    var dump = {
      id: this.id,
      parent_id: this.parent ? this.parent.id: null,
      providers: {}
    };
    Object.keys(this.providers).forEach((function(token) {
      dump.providers[token] = {
        name: token,
        dependencies: $__0.providers[token].params
      };
    }));
    return dump;
  }
}, {});
;
module.exports = {get Injector() {
    return Injector;
  }};
