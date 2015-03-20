define(function (require) {
  var module = require('modules').get('app/dashboard');
  var _ = require('lodash');

  module.service('updateDashboards', function (config, es, $window) {

    this.find = function (searchString) {
      var self = this;
      var body = searchString ? {
          query: {
            simple_query_string: {
              query: searchString + '*',
              fields: ['dashboard'],
              default_operator: 'AND'
            }
          }
        }: { query: {match_all: {}}};
      return es.search({
        index: 'grafana-dash',
        type: 'dashboard',
        body: body,
        size: 100
      })
      .then(function (resp) {
        console.log(resp);
        // return {
        //   total: resp.hits.total,
        //   hits: resp.hits.hits.map(function (hit) {
        //     var source = hit._source;
        //     source.id = hit._id;
        //     source.url = self.urlFor(hit._id);
        //     return source;
        //   })
        // };
      }); 
    };

    this.updateGrafanaDash = function (timefilter) {
      console.log(timefilter);
      this.find({_id:"grafana"});
      // $window.location.reload();
    };
  });
});
