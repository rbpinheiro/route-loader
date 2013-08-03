
var fs = require('fs')
  ,	path = require('path')
  , assert = require('assert')
  ,	extend = require("xtend")
  ,	routes = {};

module.exports = function (options) {
	var defaults = {
			routes_file: 'routes.json',
			routes_directory: 'routes',
			base_path: process.argv[1].replace(/[a-z.]*$/i, '')
		}
	  ,	routes = {}
	  , route
	  ,	routes_metadata
	  ,	route_path
	  , callback
	  , app = options;
	
	if (typeof options === 'object') {
		assert.strictEqual(typeof options.app, 'function', 'app needs to be an instance of express app');
		app = options.app;
		options = extend(defaults, options);
	} else {
		options = defaults;
	}


	function readDir (dir, _package) {
		fs.readdirSync(dir).forEach(function(file) {
			(function (_package) {
				var stat = fs.statSync(path.resolve(options.base_path, dir, file));
				if (stat.isDirectory()) {
					routes[file] = {};
					readDir(dir + '/' + file, file);
				} else {
					if (_package !== undefined) {
						_package = routes[_package];
					} else {
						_package = routes;
					}
					_package[file.substr(0, file.length - 3)] = require(path.resolve(options.base_path, dir, file));
				}
			}(_package));
		});	
	}

	fs.readFile(options.routes_file, 'utf8', function (err, data) {
		if (err) {
			console.log('Error: ' + err);
			return;
		}

		routes_data = JSON.parse(data);
		readDir(options.routes_directory);
		for (var r = 0; r < routes_data.length; r++) {
			route = routes_data[r];
			route_path = route.callback.split('.');
			callback = routes;
			for (var i = 0; i < route_path.length; i++) {
				callback = callback[route_path[i]]
			};
			(function (data) {
				app[route.method || 'get'](route.route, function (req, res, next) {
					req.route.loaderParams = data;
					next();
				}, callback);
			}(route));
		}

	});
};