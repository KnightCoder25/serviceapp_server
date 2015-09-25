var loopback = require('loopback');
var boot = require('loopback-boot');
var config = require('./config');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

/* After config and models loaded */

var Application = app.models.application;

    var mikeApp = {
      id: 'com.demo.mike',
      userId: 'rohit',
      name: config.appName,

      description: 'Demo Mike App',
      pushSettings: {
        gcm: {
          serverApiKey: config.gcmServerApiKey
        }
      }
    };


 updateOrCreateApp(mikeApp, function (err, appModel) {
      if (err) {
        throw err;
      }
      console.log('Application id: %j', appModel.id);
    });


    //--- Helper functions ---
    function updateOrCreateApp(appObject, cb) {
      Application.findOne({
          where: { id: appObject.id }
        },
        function (err, result) {
          if (err) cb(err);
          if (result) {
            console.log('Updating application: ' + result.id);
            result.updateAttributes(appObject, cb);
          } else {
            return registerApp(appObject, cb);
          }
        });
    }

    function registerApp(appObject, cb) {
      console.log('Registering a new Application...');
      Application.observe('before save', function(ctx, next) {
        if (!ctx.instance) {
          // Partial update - don't generate new keys
          // NOTE(bajtos) This also means that an atomic updateOrCreate
          // will not generate keys when a new record is creatd
          return next();
        }

        var app = ctx.instance;
        app.created = app.modified = new Date();
        app.id = appObject.id;
        next();
      });
      Application.register(
        appObject.userId,
        appObject.name,
        {
          description: appObject.description,
          pushSettings: appObject.pushSettings
        },
        function (err, app) {
          if (err) {
            return cb(err);
          }
          return cb(null, app);
        }
      );
    }