import * as migration_20261118_122202_initial from './20261118_122202_initial';

export const migrations = [
  {
    up: migration_20261118_122202_initial.up,
    down: migration_20261118_122202_initial.down,
    name: '20261118_122202_initial'
  },
];
