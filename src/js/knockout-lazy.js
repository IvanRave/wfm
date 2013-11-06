define(['knockout'], function (ko) {
	// http://www.knockmeout.net/2011/06/lazy-loading-observable-in-knockoutjs.html

	ko.lazyObservable = function (callback, context) {
		var value = ko.observable();
		return lazyComputed(callback, value, context);
	};

	ko.lazyObservableArray = function (callback, context) {
		var value = ko.observableArray();

		var result = lazyComputed(callback, value, context);

		//add underlying array methods onto computed observable
		ko.utils.arrayForEach(["remove", "removeAll", "destroy", "destroyAll", "indexOf", "replace", "pop", "push", "reverse", "shift", "sort", "splice", "unshift", "slice"], function (methodName) {
			result[methodName] = function () {
				value[methodName].apply(value, arguments);
			};
		});

		return result;
	};

	function lazyComputed(callback, value, context) {
		var result = ko.computed({
			read: function () {
				//if it has not been loaded, execute the supplied function
				if (!result.loaded()) {
					callback.call(context);
				}
				//always return the current value
				return value();
			},
			write: function (newValue) {
				//indicate that the value is now loaded and set it
				result.loaded(true);
				value(newValue);
			},
			deferEvaluation: true  //do not evaluate immediately when created
		});

		//expose the current state, which can be bound against
		result.loaded = ko.observable();

		//load it again
		result.refresh = function () {
			result.loaded(false);
		};

		return result;
	}
});