
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log('params', req.route.loaderParams);
  res.render('index', { title: 'Express' });
};