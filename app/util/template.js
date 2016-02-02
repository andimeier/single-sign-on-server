var handlebars = require('handlebars');
var fs = require('fs');

exports.render = function (res, templateFile, data) {

  fs.readFile(viewBaseDir + '/' + templateFile, 'utf8', function(err, templateRaw) {

    if (err) {
      res.status(500).send(err);
    }

    res.send(handlebars.compile(templateRaw)(data));
  });
}
