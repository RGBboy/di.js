"use strict";
Object.defineProperties(exports, {
  Injector: {get: function() {
      return Injector;
    }},
  __esModule: {value: true}
});
var $__4 = $traceurRuntime.assertObject(require('./annotations')),
    annotate = $__4.annotate,
    readAnnotations = $__4.readAnnotations,
    hasAnnotation = $__4.hasAnnotation,
    hasParameterAnnotation = $__4.hasParameterAnnotation,
    ProvideAnnotation = $__4.Provide,
    InjectAnnotation = $__4.Inject,
    TransientScopeAnnotation = $__4.TransientScope;
var $__4 = $traceurRuntime.assertObject(require('./util')),
    isFunction = $__4.isFunction,
    isObject = $__4.isObject,
    toString = $__4.toString;
var profileInjector = $traceurRuntime.assertObject(require('./profiler')).profileInjector;
var $__4 = $traceurRuntime.assertObject(require('./providers')),
    createProviderFromFnOrClass = $__4.createProviderFromFnOrClass,
    createProviderFromValue = $__4.createProviderFromValue;
function constructResolvingMessage(resolving, token) {
  if (arguments.length > 1) {
    resolving.push(token);
  }
  if (resolving.length > 1) {
    return (" (" + resolving.map(toString).join(' -> ') + ")");
  }
  return '';
}
var Injector = function Injector() {
  var modules = arguments[0] !== (void 0) ? arguments[0] : [];
  var parentInjector = arguments[1] !== (void 0) ? arguments[1] : null;
  var providers = arguments[2] !== (void 0) ? arguments[2] : new Map();
  this.cache = new Map();
  this.providers = providers;
  this.parent = parentInjector;
  this._loadModules(modules);
  profileInjector(this, $Injector);
};
var $Injector = Injector;
($traceurRuntime.createClass)(Injector, {
  _collectProvidersWithAnnotation: function(annotationClass, collectedProviders) {
    this.providers.forEach((function(provider, token) {
      if (!collectedProviders.has(token) && hasAnnotation(provider.provider, annotationClass)) {
        collectedProviders.set(token, provider);
      }
    }));
    if (this.parent) {
      this.parent._collectProvidersWithAnnotation(annotationClass, collectedProviders);
    }
  },
  _loadModules: function(modules) {
    for (var $__2 = modules[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var module = $__3.value;
      {
        if (isFunction(module)) {
          this._loadFnOrClass(module);
          continue;
        }
        throw new Error('Invalid module!');
      }
    }
  },
  _loadFnOrClass: function(fnOrClass) {
    var annotations = readAnnotations(fnOrClass);
    var token = annotations.provide.token || fnOrClass;
    var provider = createProviderFromFnOrClass(fnOrClass, annotations);
    this.providers.set(token, provider);
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
    var resolving = arguments[1] !== (void 0) ? arguments[1] : [];
    var wantPromise = arguments[2] !== (void 0) ? arguments[2] : false;
    var wantLazy = arguments[3] !== (void 0) ? arguments[3] : false;
    var $__0 = this;
    var resolvingMsg = '';
    var provider;
    var instance;
    var injector = this;
    if (token === null || token === undefined) {
      resolvingMsg = constructResolvingMessage(resolving, token);
      throw new Error(("Invalid token \"" + token + "\" requested!" + resolvingMsg));
    }
    if (token === $Injector) {
      if (wantPromise) {
        return Promise.resolve(this);
      }
      return this;
    }
    if (wantLazy) {
      return function createLazyInstance() {
        var lazyInjector = injector;
        if (arguments.length) {
          var locals = [];
          var args = arguments;
          for (var i = 0; i < args.length; i += 2) {
            locals.push((function(ii) {
              var fn = function createLocalInstance() {
                return args[ii + 1];
              };
              annotate(fn, new InjectAnnotation());
              annotate(fn, new ProvideAnnotation(args[ii]));
              return fn;
            })(i));
          }
          lazyInjector = injector.createChild(locals);
        }
        return lazyInjector.get(token, resolving, wantPromise, false);
      };
    }
    if (this.cache.has(token)) {
      instance = this.cache.get(token);
      provider = this.providers.get(token);
      if (provider.isPromise && !wantPromise) {
        resolvingMsg = constructResolvingMessage(resolving, token);
        throw new Error(("Cannot instantiate " + toString(token) + " synchronously. It is provided as a promise!" + resolvingMsg));
      }
      if (!provider.isPromise && wantPromise) {
        return Promise.resolve(instance);
      }
      return instance;
    }
    provider = this.providers.get(token);
    if (!provider && !this._hasProviderFor(token)) {
      if (isFunction(token) && (hasAnnotation(token, InjectAnnotation)) || hasParameterAnnotation(token, InjectAnnotation)) {
        provider = createProviderFromFnOrClass(token, readAnnotations(token));
        this.providers.set(token, provider);
      } else if (isFunction(token) || isObject(token)) {
        provider = createProviderFromValue(token);
        this.providers.set(token, provider);
      }
    }
    if (!provider) {
      if (!this.parent) {
        resolvingMsg = constructResolvingMessage(resolving, token);
        throw new Error(("No provider for " + toString(token) + "!" + resolvingMsg));
      }
      return this.parent.get(token, resolving, wantPromise, wantLazy);
    }
    if (resolving.indexOf(token) !== -1) {
      resolvingMsg = constructResolvingMessage(resolving, token);
      throw new Error(("Cannot instantiate cyclic dependency!" + resolvingMsg));
    }
    resolving.push(token);
    var delayingInstantiation = wantPromise && provider.params.some((function(param) {
      return !param.isPromise;
    }));
    var args = provider.params.map((function(param) {
      if (delayingInstantiation) {
        return $__0.get(param.token, resolving, true, param.isLazy);
      }
      return $__0.get(param.token, resolving, param.isPromise, param.isLazy);
    }));
    if (delayingInstantiation) {
      var delayedResolving = resolving.slice();
      resolving.pop();
      return Promise.all(args).then(function(args) {
        try {
          instance = provider.create(args);
        } catch (e) {
          resolvingMsg = constructResolvingMessage(delayedResolving);
          var originalMsg = 'ORIGINAL ERROR: ' + e.message;
          e.message = ("Error during instantiation of " + toString(token) + "!" + resolvingMsg + "\n" + originalMsg);
          throw e;
        }
        if (!hasAnnotation(provider.provider, TransientScopeAnnotation)) {
          injector.cache.set(token, instance);
        }
        return instance;
      });
    }
    try {
      instance = provider.create(args);
    } catch (e) {
      resolvingMsg = constructResolvingMessage(resolving);
      var originalMsg = 'ORIGINAL ERROR: ' + e.message;
      e.message = ("Error during instantiation of " + toString(token) + "!" + resolvingMsg + "\n" + originalMsg);
      throw e;
    }
    if (!hasAnnotation(provider.provider, TransientScopeAnnotation)) {
      this.cache.set(token, instance);
    }
    if (!wantPromise && provider.isPromise) {
      resolvingMsg = constructResolvingMessage(resolving);
      throw new Error(("Cannot instantiate " + toString(token) + " synchronously. It is provided as a promise!" + resolvingMsg));
    }
    if (wantPromise && !provider.isPromise) {
      instance = Promise.resolve(instance);
    }
    resolving.pop();
    return instance;
  },
  getPromise: function(token) {
    return this.get(token, [], true);
  },
  createChild: function() {
    var modules = arguments[0] !== (void 0) ? arguments[0] : [];
    var forceNewInstancesOf = arguments[1] !== (void 0) ? arguments[1] : [];
    var forcedProviders = new Map();
    for (var $__2 = forceNewInstancesOf[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var annotation = $__3.value;
      {
        this._collectProvidersWithAnnotation(annotation, forcedProviders);
      }
    }
    return new $Injector(modules, this, forcedProviders);
  }
}, {});
;
