define(function (require) {
  var module = require('modules').get('app/dashboard');
  var _ = require('lodash');

  // This is the only thing that gets injected into controllers
  module.service('updateDashboards', function (config, es) {
    // this.type = SavedDashboard.type;

    // // Returns a single dashboard by ID, should be the name of the dashboard
    // this.get = function (id) {

    //   // Returns a promise that contains a dashboard which is a subclass of docSource
    //   return (new SavedDashboard(id)).init();
    // };

    // this.urlFor = function (id) {
    //   return kbnUrl.eval('#/dashboard/{{id}}', {id: id});
    // };

    // this.delete = function (ids) {
    //   ids = !_.isArray(ids) ? [ids] : ids;
    //   return Promise.map(ids, function (id) {
    //     return (new SavedDashboard(id)).delete();
    //   });
    // };



    // this.find = function (searchString) {
    //   var self = this;
    //   var body = searchString ? {
    //       query: {
    //         simple_query_string: {
    //           query: searchString + '*',
    //           fields: ['title^3', 'description'],
    //           default_operator: 'AND'
    //         }
    //       }
    //     }: { query: {match_all: {}}};
    //   return es.search({
    //     index: config.file.kibana_index,
    //     type: 'dashboard',
    //     body: body,
    //     size: 100
    //   })
    //   .then(function (resp) {
    //     return {
    //       total: resp.hits.total,
    //       hits: resp.hits.hits.map(function (hit) {
    //         var source = hit._source;
    //         source.id = hit._id;
    //         source.url = self.urlFor(hit._id);
    //         return source;
    //       })
    //     };
    //   }); 
    // };
    this.updateGrafanaDash = function (timefilter) {
      console.log(timefilter);
    };
  });
});
