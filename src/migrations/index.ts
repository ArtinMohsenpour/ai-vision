import * as migration_20261118_122202_initial from './20261118_122202_initial';
import * as migration_20261118_123422_website_cms from './20261118_123422_website_cms';

export const migrations = [
  {
    up: migration_20261118_122202_initial.up,
    down: migration_20261118_122202_initial.down,
    name: '20261118_122202_initial',
  },
  {
    up: migration_20261118_123422_website_cms.up,
    down: migration_20261118_123422_website_cms.down,
    name: '20261118_123422_website_cms'
  },
];
