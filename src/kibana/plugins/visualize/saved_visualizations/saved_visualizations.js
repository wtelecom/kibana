define(function (require) {
  var app = require('modules').get('app/visualize');
  var _ = require('lodash');

  require('plugins/visualize/saved_visualizations/_saved_vis');

  // Register this service with the saved object registry so it can be
  // edited by the object editor.
  require('plugins/settings/saved_object_registry').register({
    service: 'savedVisualizations',
    title: 'visualizations'
  });

  app.service('savedVisualizations', function (Promise, es, config, SavedVis, Private, Notifier, kbnUrl) {
    var visTypes = Private(require('registry/vis_types'));
    var notify = new Notifier({
      location: 'saved visualization service'
    });

    this.type = SavedVis.type;

    this.get = function (id) {
      return (new SavedVis(id)).init();
    };

    this.urlFor = function (id) {
      return kbnUrl.eval('#/visualize/editdsds/{{id}}', {id: id});
    };

    this.delete = function (ids) {
      ids = !_.isArray(ids) ? [ids] : ids;
      return Promise.map(ids, function (id) {
        return (new SavedVis(id)).delete();
      });
    };

    this.buildPanel = function (data, time) {
      panel = {};
      panel.description = "";
      panel.icon = "fa-plug";
      panel.id = "sample-Visualization-" + data.title + "-"+ data.id + "-" + new Date(time.from).getTime() + "-" + new Date(time.to).getTime();
      panel.savedSearchId= "grafana";
      panel.title = data.title;
      panel.type = { 
        description: "Grafana export",
        hierarchicalData: false,
        icon: "fa-plug",
        name: "area",
        title: "Chart",
        url: "http://89.140.11.71:8088/#/dashboard/db/grafana?" + "panelId=" + data.id + "&fullscreen&from=" + new Date(time.from).getTime() + "&to=" + new Date(time.to).getTime(),
        version: 1,
        visState: '{}'
      };
      return panel;
    };

    this.find = function (searchString) {
      var self = this;
      var body = searchString ? {
          query: {
            simple_query_string: {
              query: searchString + '*',
              fields: ['title^3', 'description'],
              default_operator: 'AND'
            }
          }
        }: { query: {match_all: {}}};
      return es.search({
        index: config.file.kibana_index,
        type: 'visualization',
        body: body,
        size: 100,
      })
      .then(function (resp) {
        var t = {};
        t.total = resp.hits.total;
        t.hits = _.transform(resp.hits.hits, function (hits, hit) {
            var source = hit._source;
            source.id = hit._id;
            source.url = self.urlFor(hit._id);

            var typeName = source.typeName;
            if (source.visState) {
              try { typeName = JSON.parse(source.visState).type; }
              catch (e) { /* missing typename handled below */ }
            }

            if (!typeName || !visTypes.byName[typeName]) {
              notify.info('unable to detect type from visualization source', hit);
              return;
            }

            source.type = visTypes.byName[typeName];
            source.icon = source.type.icon;
            source.type.description ="po cmeme";
            hits.push(source);
        }, []);
        
        var grafanaEls = [];

        es.search({
          index: "grafana-dash",
          type: "dashboard",
          body: body,
          size: 100,
        })
        .then(function (resp) {
          var grafanaDashboard = JSON.parse(resp.hits.hits[0]._source.dashboard);
          _.forEach(grafanaDashboard.rows, function(row) {
            _.forEach(row.panels, function(panel) {
              if (panel.title) {
                grafanaEls.push(self.buildPanel(panel, grafanaDashboard.time));
              }
            });
          });
          t.total += grafanaEls.length;
          _.forEach(grafanaEls, function(gPanel) {
            t.hits.push(gPanel);
          });
        });
        return t;
      });
    };
  });
});
