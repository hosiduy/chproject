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
  var ms = [0, 0, 0, 0, 0, 0];
  for (var t = 0; t < y0s.length; ++t) {
    ms[t] = Math.log(y0s[t]) / Math.log(a0s[t]) + x0;
  }
  return ms;
}

function getYbyT(data, t) {
  return [data.y1[t], data.y2[t], data.y3[t], data.y4[t], data.y5[t], data.y6[t]];
}

function getOneYbyT(data, t) {
  return data.y[t];
}

function getY0s(ys, dentaYs) {
  var y0s = [0, 0, 0, 0, 0, 0];
  for (var t = 0; t < ys.length; ++t) {
    y0s[t] = parseInt(ys[t]) + dentaYs[t];
  }
  return y0s;
}

function getY0(y, dentaY) {
  return (parseInt(y) + dentaY);
}

function getRealX(data, limit) {
  for (var t = 0; t < data.x.length; ++t) {
    if (data.x[t] > limit) {
      return {x: data.x[t - 1], t: t - 1, ys: getYbyT(data, t - 1)};
    }
  }
}

function getT(data, x) {
  for (var t = 0; t < data.x.length; ++t) {
    if (data.x[t] == x) {
      return t;
    }
  }
  return null;
}

function getRealX(data, x) {
  for(var i = 0; i<data.x.length; ++i) {
    if(i+1 < data.x.length) {
      if(data.x[i] <= x && data.x[i+1] >= x) {
        if(data.x[i] - x < data.x[i+1] - x) {
          return data.x[i];
        } else {
          return data.x[i+1];
        }
      }
    }
  }
}

function calAs(x0, y0s) {
  var a0s = [0, 0, 0, 0, 0, 0];
  for (var t = 0; t < y0s.length; ++t) {
    a0s[t] = Math.pow(y0s[t], (1 / x0));
  }
  return a0s;
}

function calA(dentaX, y0) {
  return Math.pow(y0, (1 / dentaX));
}

function calY2(a, x, x0, m) {
  if (x <= x0) {
    return Math.pow(a, x);
  } else {
    return Math.pow(a, (m - x));
  }
}

function calY3(a, b, x, dentaX_left, dentaX_right, x0, m) {
  if (x <= x0) {
    return Math.pow(a, dentaX_left);
  } else {
    return Math.pow(b, (dentaX_right));
  }
}

function writeToFile(data, fileName) {
  var stemp = '';
  for (var t = 0; t < data.x.length; ++t) {
    stemp += data.x[t] + '\t' + data.y1[t] + '\t' + data.y2[t] + '\t' + data.y3[t] + '\t' + data.y4[t] + '\t' + data.y5[t] + '\t' + data.y6[t] + '\n';
  }
  writeFile('assets/' + fileName + '.txt', stemp, function (err) {
    if (err) console.log(err);
  });
}

function writeOneToFile(data, fileName) {
  var stemp = '';
  for (var t = 0; t < data.x.length; ++t) {
    stemp += data.x[t] + '\t' + data.y[t] + '\n';
  }
  writeFile('assets/' + fileName, stemp, function (err) {
    if (err) console.log(err);
  });
}

function createPeak(data, peak) {
  //init vars
  var minX = peak.minX;
  var maxX = peak.maxX;
  var x0 = peak.x0;
  var dentaX_left = x0 - minX;
  var dentaX_right = maxX - x0;
  var dentaY = peak.dentaY;
  var t0 = getT(data, x0);
  console.log('this is t0 ');
  console.log(t0);
  /*var y = getOneYbyT(data, t0);
   console.log('this is y');
   console.log(y);*/
  //var y0 = getY0(y, dentaY);
  var y0 = dentaY;
  /*

   console.log('this is y0 after cal');
   console.log(y0);
   */
  var a0 = calA(dentaX_left, y0);
  var b0 = calA(dentaX_right, y0);
  /*
   console.log('this is a number');
   console.log(a0);
   console.log('this is b number');
   console.log(b0);*/
  //var ms = calMs(y0s, a0s, x0);
  var ms = dentaX_left;
  /* console.log('this is ms');
   console.log(ms);

   console.log('this is param data');
   console.log(peak.lech_phai);
   console.log(peak.lech_trai);
   console.log(peak.giam_lon);
   console.log(peak.giam_nho);
   console.log(peak.giat_manh_duoi);*/

// x0, dentaY, minX, maxX, lech_trai, lech_phai, giam_lon, giam_nho, giat_manh_tren, giat_manh_duoi, giat_nhe_tren, giat_nhe_duoi,
  for (var t = 0; t < data.x.length; t++) {
    if (data.x[t] > minX && data.x[t] < maxX) {/*
     if (data.x[t] < x0 - peak.lech_trai || data.x[t] > x0 + peak.lech_phai) {
     data.y[t] = Math.round(data.y[t] / peak.giam_lon + calY3(a0, data.x[t], data.x[t] - minX, maxX - data.x[t], x0, ms) + getRandomArbitrary(- peak.giat_manh_duoi, peak.giat_manh_tren));
     } else {
     data.y[t] = Math.round(data.y[t] / peak.giam_nho + calY3(a0, data.x[t], data.x[t] - minX, maxX - data.x[t], x0, ms) + getRandomArbitrary(- peak.giat_nhe_duoi, peak.giat_nhe_tren));
     }*/
      data.y[t] = parseInt(data.y[t]) + Math.round(calY3(a0, b0, data.x[t], data.x[t] - minX, maxX - data.x[t], x0, ms));
    }
  }
  console.log('this is add pick');
  return data;
}

exports.modifyData = function (req, res) {
  var data = {
    x: [],
    y1: [],
    y2: [],
    y3: [],
    y4: [],
    y5: [],
    y6: []
  };
  var temp = [];
  var count = 0;
  var type = req.params.type;
  if (type == 'decrease') {
    var lr = new LineByLineReader('assets/solieuXRD1.txt');
  } else if (type == 'peak') {
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
      data.y2.push(temp[2]);
      data.y3.push(temp[3]);
      data.y4.push(temp[4]);
      data.y5.push(temp[5]);
      data.y6.push(temp[6]);
    }
    count++;

  });

  lr.on('end', function () {
    // All lines are read, file is closed now.
    console.log('end read file');
    //res.send('test for fun');
    //console.log(data);

    if (type == 'decrease') {
      for (var t = 0; t < data.x.length; ++t) {
        if (data.x[t] > 17 && data.x[t] < 38.5) {
          if (getRandomArbitrary(0, 5) > 4) {
            data.y1[t] = Math.round(data.y1[t] / 15.5 + calY(data.x[t]) + getRandomArbitrary(-35, 35));
            data.y2[t] = Math.round(data.y2[t] / 15 + calY(data.x[t]) + getRandomArbitrary(-35, 35));
            data.y3[t] = Math.round(data.y3[t] / 15 + calY(data.x[t]) + getRandomArbitrary(-35, 35));
            data.y4[t] = Math.round(data.y4[t] / 15 + calY(data.x[t]) + getRandomArbitrary(-35, 35));
            data.y5[t] = Math.round(data.y5[t] / 40 + calY(data.x[t]) + getRandomArbitrary(-35, 35));
            data.y6[t] = Math.round(data.y6[t] / 30 + calY(data.x[t]) + getRandomArbitrary(-35, 35));
          }
          else {
            data.y1[t] = Math.round(data.y1[t] / 15.5 + calY(data.x[t]) + getRandomArbitrary(-2, 2));
            data.y2[t] = Math.round(data.y2[t] / 15 + calY(data.x[t]) + getRandomArbitrary(-2, 2));
            data.y3[t] = Math.round(data.y3[t] / 15 + calY(data.x[t]) + getRandomArbitrary(-3, 3));
            data.y4[t] = Math.round(data.y4[t] / 15 + calY(data.x[t]) + getRandomArbitrary(-2, 2));
            data.y5[t] = Math.round(data.y5[t] / 40 + calY(data.x[t]) + getRandomArbitrary(-2, 2));
            data.y6[t] = Math.round(data.y6[t] / 30 + calY(data.x[t]) + getRandomArbitrary(-2, 2));
          }
        }
      }
    }
    else if (type == 'peak') {
      //init vars
      var minX = 14;
      var maxX = 14.6;
      var x0 = 14.294194;

      var dentaYs = [100, 100, 100, 100, 100, 100];

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
      var ms = 2 * x0;
      console.log('this is ms');
      console.log(ms);

      for (var t = 0; t < data.x.length; t++) {
        if (data.x[t] > minX && data.x[t] < maxX) {
          if (data.x[t] < x0 - 0.05 || data.x[t] > x0 + 0.05) {
            data.y1[t] = Math.round(data.y1[t] / 25 + calY2(a0s[0], data.x[t], x0, ms) + getRandomArbitrary(-20, 20));
            data.y2[t] = Math.round(data.y2[t] / 25 + calY2(a0s[1], data.x[t], x0, ms) + getRandomArbitrary(-20, 20));
            data.y3[t] = Math.round(data.y3[t] / 25 + calY2(a0s[2], data.x[t], x0, ms) + getRandomArbitrary(-20, 20));
            data.y4[t] = Math.round(data.y4[t] / 25 + calY2(a0s[3], data.x[t], x0, ms) + getRandomArbitrary(-20, 20));
            data.y5[t] = Math.round(data.y5[t] / 25 + calY2(a0s[4], data.x[t], x0, ms) + getRandomArbitrary(-20, 20));
            data.y6[t] = Math.round(data.y6[t] / 25 + calY2(a0s[5], data.x[t], x0, ms) + getRandomArbitrary(-20, 20));
          } else {
            data.y1[t] = Math.round(data.y1[t] / 10 + calY2(a0s[0], data.x[t], x0, ms) + getRandomArbitrary(-15, 15));
            data.y2[t] = Math.round(data.y2[t] / 10 + calY2(a0s[1], data.x[t], x0, ms) + getRandomArbitrary(-15, 15));
            data.y3[t] = Math.round(data.y3[t] / 10 + calY2(a0s[2], data.x[t], x0, ms) + getRandomArbitrary(-15, 15));
            data.y4[t] = Math.round(data.y4[t] / 10 + calY2(a0s[3], data.x[t], x0, ms) + getRandomArbitrary(-15, 15));
            data.y5[t] = Math.round(data.y5[t] / 10 + calY2(a0s[4], data.x[t], x0, ms) + getRandomArbitrary(-15, 15));
            data.y6[t] = Math.round(data.y6[t] / 10 + calY2(a0s[5], data.x[t], x0, ms) + getRandomArbitrary(-15, 15));
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
/*
 * Add peaks
 */
exports.createPeaks = function (req, res) {
  /*
   * CODE PLAN
   * What we have:
   * file in, out name, peaks content.
   * each peak include:
   * x0, dentaY, minX, maxX, lech_trai, lech_phai, giat_manh_tren, giat_manh_duoi, giat_nhe_tren, giat_nhe_duoi, giam_lon, giam_nho
   * Output:
   * file out name with peaks
   *
   * PLAN
   * 1. get params from req.body
   * 2. read file in
   * 3. parse file in
   * 4. get data after parse
   * 5. call create pick function
   * 6. write to file
   * 7. send data
   */

  // get params from body
  var body = req.body;
  var peaks = body.peaks;
  var temp = [];
  var count = 0;
  var data = {
    x: [],
    y: []
  };

  var lr = new LineByLineReader('assets/' + body.file_in);

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
      data.y.push(temp[1]);
    }
    count++;
  });

  lr.on('end', function () {
    // loop through all peak
    for (var m = 0; m < peaks.length; ++m) {
      data = createPeak(data, peaks[m]);
    }

    writeOneToFile(data, body.file_out);

    res.send({message: 'done'});
  });


};

function getExpVars(dentaX, y0) {
  return { slope: Math.pow(y0, (1 / dentaX))};
}
function getParaVars(peak) {
  var dentaY = peak.y0 - peak.left.y0;
  var a = dentaY/(Math.pow(peak.x0, 2) - peak.x0*(peak.left.x0 + peak.right.x0) + peak.left.x0*peak.right.x0);
  var b = (peak.left.x0 + peak.right.x0)*(-1)*a;
  var c = peak.left.x0*peak.right.x0*a + peak.left.y0;
  return {
    a: a,
    b: b,
    c: c
  };
}
function calYFinal(minX, maxX, leftVars, midVars, rightVars, x, x0Left, x0, x0Right) {
  if(x<=x0Left) {
    // use left vars
    return Math.pow(leftVars.slope, x - minX);
  } else if(x<x0Right) {
    return midVars.a*Math.pow(x, 2) + midVars.b*x + midVars.c;
  } else if(x >= x0Right) {
    // use right vars
    return Math.pow(rightVars.slope, maxX - x);
  }
}
function createPeak2(data, peak) {
  /*
   * 3. Calculate pre vars
   *   a. y0 = peak.y0
   * 4. Cal fnLeft -> a^x = y
   * 5. Cal fnRight -> b^x = y
   * 6. Cal fnMid
   * 7. For loop and cal Y value, run through:
   *   a. a0 -> x0left
   *   b. x0left -> x0
   *   c. x0 -> x0right
   *   d. x0right -> b0
   *   */
  peak.x0 = parseFloat(getRealX(data, peak.x0));
  peak.left.x0 = parseFloat(getRealX(data, peak.left.x0));
  peak.right.x0 = parseFloat(getRealX(data, peak.right.x0));

  console.log('this is peak after modify');
  console.log(peak);
  peak.y0Index = getT(data, peak.x0);
  var fnLeftVars = getExpVars(peak.left.x0 - peak.minX, peak.left.y0);
  var fnRightVars = getExpVars(peak.maxX - peak.right.x0, peak.right.y0);
  var fnMidVars = getParaVars(peak);

  for(var i = 0; i<data.x.length; ++i) {
    if (data.x[i] > peak.minX && data.x[i] < peak.maxX) {

      data.y[i] = parseInt(data.y[i]) +
        Math.round(calYFinal(peak.minX, peak.maxX, fnLeftVars, fnMidVars, fnRightVars, data.x[i], peak.left.x0, peak.x0, peak.right.x0));
    }
  }

  return data;
}
/*
 * Create peak new version
 * */
exports.createPeaks2 = function (req, res) {
  /*
   * Code plan:
   * 1. Get params from req
   * 2. Read data from file
   *   a. save x
   *   b. save y
   cal createPeak2 function
   * 9. save data to file
   * */
  // get prams from req
  var body = req.body;
  var peaks = body.peaks;
  console.log('this is peaks');
  console.log(peaks);
  var count = 0;
  var temp = [];
  var data = {
    x: [],
    y: []
  };

  var lr = new LineByLineReader('assets/' + body.file_in);
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
      data.y.push(temp[1]);
    }
    count++;
  });

  lr.on('end', function () {
    for (var i = 0; i < peaks.length; ++i) {
      data = createPeak2(data, peaks[i]);
    }

    writeOneToFile(data, body.file_out);

    res.send({message: 'done'});
  })
};

/*
* Draw background
* */
function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function getRandY(y, rand) {
  var min = Math.ceil(rand.min);
  var max = Math.floor(rand.max);
  return y + Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCalY(start, end, index) {
  var a = (start.y - end.y)/(start.x - end.x);
  var b = start.y - a*start.x;

  return Math.round(a*index + b);
}

function getYValue(start, end, current_index, rand) {
  var cal_y = getCalY(start, end, current_index);
  var a = (start.y - end.y)/(start.x - end.x);
  var b = start.y - a*start.x;

 /* if(cal_y < 0) {
    console.log('this y is < 0');
    console.log(start);
    console.log(end);
    console.log(current_index);
    console.log(cal_y);
    console.log(a);
    console.log(b);
  }
  if(cal_y > 2000) {
    console.log('this y is > 2000');
    console.log(start);
    console.log(end);
    console.log(current_index);
    console.log(cal_y);
    console.log(a);
    console.log(b);
  }*/
  var rand_y = getRandY(cal_y, rand);

  return rand_y;
}

function getPrecision(step) {
  var check = 0;
  var temp = 0;
  while(temp < 1) {
    check +=1;
    temp = step * Math.pow(10, check);
  }
  return temp;
}

exports.createBackground = function(req, res) {
  /*var test = {
    "lines": [
      {
        "start": {
          "x": 0,
          "y": 100
        },
        "end": {
          "x": 30,
          "y": 300
        },
        "rand": {
          "min": -5,
          "max": 10
        }
      },
      {
        "start": {
          "x": 31,
          "y": 400
        },
        "end": {
          "x": 80,
          "y": 800
        },
        "rand": {
          "min": -5,
          "max": 10
        }
      },
      {
        "start": {
          "x": 81,
          "y": 200
        },
        "end": {
          "x": 120,
          "y": 200
        },
        "rand": {
          "min": -5,
          "max": 10
        }
      }
    ],
    "step": 0.1,
    "file_out": "background01.txt"
  };*/
  var body = req.body;
  var lines = body.lines;
  var step = body.step;
  var precision = getPrecision(step);
  var data = {
    x: [],
    y: []
  };

  for(var i = 0; i<lines.length; ++i) {
    var line = lines[i];
    var start = line.start;
    var end = line.end;

    for(var m = start.x; m<= end.x; m+=step) {
      m = round(m, precision);
      var index = Math.round(m/step);
      data.x[index] = m;
      data.y[index] = getYValue(start, end, m, line.rand);
    }

  }

  writeOneToFile(data, body.file_out);

  res.send({message: 'done'});
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
