const helpers = require('./helpers');
const tmp = require('tmp');
tmp.setGracefulCleanup();
const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const Git = require("nodegit");
const yaml = require('js-yaml');

// prometheus things
const promClient = require('prom-client');

//TODO: create a gauge for request duration
//      https://www.npmjs.com/package/prom-client#gauge

module.exports = {
  getMetrics: async ({github}) => {
    // make temp dir
    var tmpDir = tmp.dirSync({ prefix: 'bme_strategic_projects_', dir: "." });
    console.log('Dir: ', tmpDir.name);

    const cleanup = () => {
      //clear register
      promClient.register.clear();

      // remove temp dir
      rimraf.sync(tmpDir.name);
      console.error('removed tpm dir', tmpDir.name);
      tmpDir.removeCallback();
    };
    const errorHandler = (err) => {
      console.error('failed: ', err);
      cleanup();
    };

    // git clone into temp dir
    const remote = `https://${github.user}:${github.token}@${github.domain}/${github.org}/${github.repo}`;
     
    console.log("clone", `${github.domain}/${github.org}/${github.repo}`, github.branch);
    return Git.Clone(remote, tmpDir.name, {
      checkoutBranch: github.branch
    }).then(function(repository) {
      console.log("clone done", repository);

      const strategicProjectsDir = `${tmpDir.name}/strategic-projects`;
      const strategicProjects = fs.readdirSync(strategicProjectsDir);

      console.log("strategicProjects", strategicProjects)
      // iterate strategic-projects/*/metrics.yaml
      strategicProjects.forEach(strategicProjectDir => {
        const strategicProjectDirFull = `${strategicProjectsDir}/${strategicProjectDir}`
        if(fs.lstatSync(strategicProjectDirFull).isDirectory()){
          console.log(strategicProjectDirFull);
          const metricsPath = `${strategicProjectDirFull}/metrics.yaml`;
          try{
            fs.lstatSync(metricsPath).isFile();
            console.log("has metrics file", strategicProjectDir);

            // yaml read file: strategic-projects/{dir}/metrics.yaml
            try{
              const doc = yaml.safeLoad(fs.readFileSync(metricsPath, 'utf8'));
              // console.log(`${strategicProjectsDir} metrics`, doc);            
              //    iterate objects (metric)

              doc && Object.keys(doc).forEach(metricKey => {
                const metricList = doc[metricKey];
                const metricName = `strategic_projects:${strategicProjectDir.replace('-','_')}:${metricKey}`;

                //get unique label names
                let labelNames = [];
                metricList.forEach(m => {
                  labelNames = [...labelNames,...Object.keys(m.tags)]
                });
                labelNames = [...new Set(labelNames)];

                //set metric
                const g = new promClient.Gauge({
                  name: metricName,
                  help: metricName,
                  labelNames
                });
                
                metricList && metricList.length && metricList.forEach(metric => {
                  console.log("adding metricName", metricName, metric);
                  //generate metric: strategic_projects:{dir}:metric{iterate metric.tags} metric.value
                  //    example: strategic_projects:devops:example_simple{tagAa="foo"} 1
                  g.set(metric.tags, metric.value);
                });
              });

            }catch(e){
              //TODO: if TypeError
              console.log("error reading yaml file", e); 
            }
          }catch(e){
            console.log("no metrics file", strategicProjectDir);
          }
        }

      });

      const registerMetrics = promClient.register.metrics();
      
      cleanup();

      return registerMetrics;

    }).catch(errorHandler);

  },
  getMetricsContentType: () => {
    return promClient.register.contentType;
  }
};