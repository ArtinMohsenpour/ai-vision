import * as migration_20261118_122202_initial from './20261118_122202_initial';
import * as migration_20261118_123422_website_cms from './20261118_123422_website_cms';
import * as migration_20261118_130550_admin_names_and_media from './20261118_130550_admin_names_and_media';
import * as migration_20261118_155018_internal_links from './20261118_155018_internal_links';
import * as migration_20261118_162225_home_hero_artwork from './20261118_162225_home_hero_artwork';

import * as rheivoHomeContent from './20261118_165720_rheivo_home_content';

import * as dynamicFooterBrand from './20261119_000001_dynamic_footer_brand';
import * as customerAuthLimits from './20261120_000001_customer_auth_limits';
import * as optionalCustomerCompany from './20261120_113759_optional_customer_company';
import * as customerMfa from './20261120_140000_customer_mfa';
import * as customerSessionGrants from './20261120_140001_customer_session_grants';

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
    name: '20261118_155018_internal_links',
  },
  {
    up: migration_20261118_162225_home_hero_artwork.up,
    down: migration_20261118_162225_home_hero_artwork.down,
    name: '20261118_162225_home_hero_artwork'
  },
  {
    up: rheivoHomeContent.up,
    down: rheivoHomeContent.down,
    name: '20261118_165720_rheivo_home_content',
  },
  {
    up: dynamicFooterBrand.up,
    down: dynamicFooterBrand.down,
    name: '20261119_000001_dynamic_footer_brand',
  },
  {
    up: customerAuthLimits.up,
    down: customerAuthLimits.down,
    name: '20261120_000001_customer_auth_limits',
  },
  {
    up: optionalCustomerCompany.up,
    down: optionalCustomerCompany.down,
    name: '20261120_113759_optional_customer_company',
  },
  {
    up: customerMfa.up,
    down: customerMfa.down,
    name: '20261120_140000_customer_mfa',
  },
  {
    up: customerSessionGrants.up,
    down: customerSessionGrants.down,
    name: '20261120_140001_customer_session_grants',
  },
];
