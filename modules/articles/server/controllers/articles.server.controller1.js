'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var jsonfile = require('jsonfile');
var LineByLineReader = require('line-by-line');
var writeFile = require('write');

/**
 * Create a article
 */
exports.create = function (req, res) {
  var article = new Article(req.body);
  article.user = req.user;

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  function calY(x) {
    return Math.round(-60 / 7 * x + 985 + getRandomArbitrary(0, 100));
  }

  function calMs(y0s, a0s, x0) {
    var ms = [0];
    for(var t =0; t<y0s.length; ++t) {
      ms[t] = Math.log(y0s[t])/Math.log(a0s[t]) + x0;
    }
    return ms;
  }

  function getYbyT(data, t) {
    return [data.y1[t]];
  }

  function getY0s(ys, dentaYs) {
    var y0s = [0];
    for (var t = 0; t<ys.length; ++t) {
      y0s[t] = parseInt(ys[t]) + dentaYs[t];
    }
    return y0s;
  }
  function getRealX(data, limit) {
    for(var t = 0; t < data.x.length; ++t) {
      if(data.x[t] > limit) {
        return {x: data.x[t-1], t: t-1, ys: getYbyT(data, t-1)};
      }
    }
  }

  function getT(data, x) {

    for(var t = 0; t<data.x.length; ++t) {
      if(data.x[t] == x) {
        return t;
      }
    }
    return null;
  }

  function calAs(x0, y0s) {
    var a0s = [0];
      for(var t = 0; t<y0s.length; ++t) {
        console.log('this is where is cal a');
        console.log('this is y');
        console.log(y0s[t]);
        console.log('this is 1/x');
        console.log(1 / x0);
        a0s[t] = Math.pow(y0s[t], (1/x0));
      }
      return a0s;
  }

  function calY2(a, x, x0, m) {
    if(x<=x0) {
      return Math.pow(a, x);
    } else {
      return Math.pow(a, (m-x));
    }
  }

  function writeToFile(data, fileName) {
    var stemp = '';
    for (var t = 0; t < data.x.length; ++t) {
      stemp += data.x[t] + '\t' + data.y1[t] + '\n';
    }
    writeFile('assets/'+fileName+'.txt', stemp, function (err) {
      if (err) console.log(err);
    });
  }



exports.modifyData = function (req, res) {
var data = {
        x: [],
        y1: []
      };
      var temp = [];
      var count = 0;
      var type = req.params.type;
      if(type == 'decrease') {
      var lr = new LineByLineReader('assets/solieuXRD1.txt');
      } else if(type == 'peak') {
        var lr = new LineByLineReader('assets/abc.txt');
      }

      lr.on('error', function (err) {
        // 'err' contains error object
        console.log('err on read file');
        console.log(err);
      });

      lr.on('line', function (line) {
        // 'line' contains the current line without the trailing newline character.
        //console.log('file line');
        if (count > 0) {
          temp = line.split("\t");
          //console.log(temp);
          data.x.push(temp[0]);
          data.y1.push(temp[1]);
        }
        count++;

      });

      lr.on('end', function () {
        // All lines are read, file is closed now.
        console.log('end read file');
        //res.send('test for fun');
        //console.log(data);

        if(type == 'decrease') {
          for (var t = 0; t < data.x.length; ++t) {
            if (data.x[t] > 17 && data.x[t] < 38.5) {
              if (getRandomArbitrary(0, 5) > 4) {
                data.y1[t] = Math.round(data.y1[t] / 15.5 + calY(data.x[t]) + getRandomArbitrary(-35, 35));
              }
              else {
                data.y1[t] = Math.round(data.y1[t] / 15.5 + calY(data.x[t]) + getRandomArbitrary(-2, 2));
              }
            }
          }
        } else if(type == 'peak') {
          //init vars
          var minX = 14;
          var maxX = 14.6;
          var x0 = 14.294194;

          var dentaYs = [100];

          var t0 = getT(data, x0);
          console.log('this is t0 ');
          console.log(t0);

          var ys = getYbyT(data, t0);
          console.log('this is ys');
          console.log(ys);

          var y0s = getY0s(ys, dentaYs);

          console.log('this is y0s after cal');
          console.log(y0s);

          var a0s = calAs(x0, y0s);
          console.log('this is as number');
          console.log(a0s);

          //var ms = calMs(y0s, a0s, x0);
          var ms = 2*x0;
          console.log('this is ms');
          console.log(ms);

          for(var t = 0; t<data.x.length; t++) {
            if(data.x[t]>minX && data.x[t]<maxX) {
              if (data.x[t] < x0-0.05 || data.x[t] > x0+0.05) {
                data.y1[t] = Math.round(data.y1[t] / 25 + calY2(a0s[0], data.x[t], x0, ms) + getRandomArbitrary(-20, 20));
              } else {
                data.y1[t] = Math.round(data.y1[t] / 10 + calY2(a0s[0], data.x[t], x0, ms) + getRandomArbitrary(-15, 15));
              }

            }
          }

          console.log('this is add pick');
        }

        // write data to file. write to file function
        writeToFile(data, type);

        //console.log(data);
        res.send(data);
      });  

};
/**
 * Show the current article
 */
exports.read = function (req, res) {
  res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
  var article = req.article;

  article.title = req.body.title;
  article.content = req.body.content;

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
  var article = req.article;

  article.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

/**
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  Article.findById(id).populate('user', 'displayName').exec(function (err, article) {
    if (err) {
      return next(err);
    } else if (!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.article = article;
    next();
  });
};
