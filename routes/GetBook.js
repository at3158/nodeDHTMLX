
/*
 * GET GetBook page.
 */

exports.index = function(req, res){
  res.render('GetBook', { title: 'Hello World' });
};