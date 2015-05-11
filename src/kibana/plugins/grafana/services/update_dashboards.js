define(function (require) {
  var module = require('modules').get('app/dashboard');
  var _ = require('lodash');

  module.service('updateDashboards', function (config, es, $window, configFile) {

    this.find = function (timefilter) {
      var self = this;
      var body = { query: {match_all: {}}};
      return es.search({
        index: configFile.grafana_index,
        type: 'dashboard',
        body: body,
        size: 100
      })
      .then(function (resp) {
        var dash = _.filter(resp.hits.hits, function(grafanaEl) {
          if (grafanaEl._index == configFile.grafana_index && grafanaEl._type == "dashboard" && grafanaEl._id == configFile.grafana_dashboard) {
            return true;
          }
          return false;  
        });

        var dashboardData = JSON.parse(dash[0]._source.dashboard)

        dashboardData.time.from = timefilter.time.from;
        dashboardData.time.to = timefilter.time.to;
        
        return es.update({
          index: configFile.grafana_index,
          type: 'dashboard',
          id: configFile.grafana_dashboard,
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
