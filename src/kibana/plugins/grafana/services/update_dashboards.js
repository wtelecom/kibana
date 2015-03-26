define(function (require) {
  var module = require('modules').get('app/dashboard');
  var _ = require('lodash');

  module.service('updateDashboards', function (config, es, $window) {

    this.find = function (timefilter) {
      var self = this;
      var body = { query: {match_all: {}}};
      return es.search({
        index: 'grafana-dash',
        type: 'dashboard',
        body: body,
        size: 100
      })
      .then(function (resp) {
        var dash = _.filter(resp.hits.hits, function(grafanaEl) {
          // TODO: Set this elements in a proper way in the config file
          if (grafanaEl._index == "grafana-dash" && grafanaEl._type == "dashboard" && grafanaEl._id == "grafana") {
            return true;
          }
          return false;  
        });

        var dashboardData = JSON.parse(dash[0]._source.dashboard)
        dashboardData.time.from = timefilter.from;
        dashboardData.time.from = timefilter.to;

        return es.update({
          index: 'grafana-dash',
          type: 'dashboard',
          id: 'grafana',
          body: {
            doc: {
              dashboard: JSON.stringify(dashboardData)
            }
          }
        })
        .then(function (resp) {
          $window.location.reload();
        });
      }); 
    };

    this.updateGrafanaDash = function (timefilter) {
      this.find(timefilter);
    };
  });
});
