import * as migration_20261118_122202_initial from './20261118_122202_initial';
import * as migration_20261118_123422_website_cms from './20261118_123422_website_cms';
import * as migration_20261118_130550_admin_names_and_media from './20261118_130550_admin_names_and_media';
import * as migration_20261118_155018_internal_links from './20261118_155018_internal_links';

export const migrations = [
  {
    up: migration_20261118_122202_initial.up,
    down: migration_20261118_122202_initial.down,
    name: '20261118_122202_initial',
  },
  {
    up: migration_20261118_123422_website_cms.up,
    down: migration_20261118_123422_website_cms.down,
    name: '20261118_123422_website_cms',
  },
  {
    up: migration_20261118_130550_admin_names_and_media.up,
    down: migration_20261118_130550_admin_names_and_media.down,
    name: '20261118_130550_admin_names_and_media',
  },
  {
    up: migration_20261118_155018_internal_links.up,
    down: migration_20261118_155018_internal_links.down,
    name: '20261118_155018_internal_links'
  },
];
