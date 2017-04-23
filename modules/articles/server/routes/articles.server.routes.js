'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/articles.server.policy'),
  articles = require('../controllers/articles.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/articles').all(articlesPolicy.isAllowed)
    .get(articles.list)
    .post(articles.create);

  // Single article routes
  app.route('/api/articles/:articleId').all(articlesPolicy.isAllowed)
    .get(articles.read)
    .put(articles.update)
    .delete(articles.delete);

  app.route('/api/mproject/parsefile/:type')
    .get(articles.modifyData);

  app.route('/api/mproject/createpeaks')
    .post(articles.createPeaks);
  app.route('/api/mproject/createPeaks2')
    .post(articles.createPeaks2);

  app.route('/api/mproject/createBackground')
    .post(articles.createBackground);

  app.route('/api/mproject/getRandBackground')
    .post(articles.getRandBackground);

  app.route('/api/mproject/addRandomToData')
    .post(articles.addRandomToData);
  // Finish by binding the article middleware
  app.param('articleId', articles.articleByID);
};
