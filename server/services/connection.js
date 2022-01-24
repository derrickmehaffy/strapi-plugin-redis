'use strict';

const Redis = require('ioredis');
const chalk = require('chalk');
const debug = require('debug')('strapi:strapi-plugin-redis');

module.exports = ({ strapi }) => ({
  buildAll(config) {
    const coreConfig = config

    Object.keys(coreConfig.connections).forEach((name) => {
      debug(`${chalk.yellow('Building')} ${name} connection`);
      const nameConfig = coreConfig.connections[name];

      if (nameConfig.connection.nodes) {
        try {
          strapi.redis.connections[name] = {
            client: new Redis.Cluster(nameConfig.connection.nodes, nameConfig.connection.options),
          };
          debug(`${chalk.green('Built')} ${name} connection - ${chalk.blue('cluster')}`);
        } catch (e) {
          debug(`${chalk.red('Failed to build')} ${name} connection - ${chalk.blue('cluster')}`);
        }
      } else {
        if (nameConfig.connection.sentinels) {
          delete nameConfig.host;
          delete nameConfig.port;
          try {
            strapi.redis.connections[name] = {
              client: new Redis(nameConfig.connection),
            };
            debug(`${chalk.green('Built')} ${name} connection - ${chalk.yellow('sentinel')}`);
          } catch (e) {
            debug(`${chalk.red('Failed to build')} ${name} connection - ${chalk.yellow('sentinel')}`);
          }
        } else {
          try {
            strapi.redis.connections[name] = {
              client: new Redis(nameConfig.connection),
            };
            debug(`${chalk.green('Built')} ${name} connection - ${chalk.magenta('stand-alone')}`);
          } catch (e) {
            debug(`${chalk.red('Failed to build')} ${name} connection - ${chalk.magenta('stand-alone')}`);
          }
        }
      }
    });
  },
});