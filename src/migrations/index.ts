import * as migration_20261118_122202_initial from './20261118_122202_initial';
import * as migration_20261118_123422_website_cms from './20261118_123422_website_cms';
import * as migration_20261118_130550_admin_names_and_media from './20261118_130550_admin_names_and_media';
import * as migration_20261118_155018_internal_links from './20261118_155018_internal_links';
import * as migration_20261118_162225_home_hero_artwork from './20261118_162225_home_hero_artwork';
import * as migration_20261118_165720_rheivo_home_content from './20261118_165720_rheivo_home_content';
import * as migration_20261119_000001_dynamic_footer_brand from './20261119_000001_dynamic_footer_brand';
import * as migration_20261120_000001_customer_auth_limits from './20261120_000001_customer_auth_limits';
import * as migration_20261120_113759_optional_customer_company from './20261120_113759_optional_customer_company';
import * as migration_20261120_140000_customer_mfa from './20261120_140000_customer_mfa';
import * as migration_20261120_140001_customer_session_grants from './20261120_140001_customer_session_grants';
import * as migration_20261120_153646_shop_ordering from './20261120_153646_shop_ordering';
import * as migration_20261120_154407_shop_orders from './20261120_154407_shop_orders';

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
    name: '20261118_162225_home_hero_artwork',
  },
  {
    up: migration_20261118_165720_rheivo_home_content.up,
    down: migration_20261118_165720_rheivo_home_content.down,
    name: '20261118_165720_rheivo_home_content',
  },
  {
    up: migration_20261119_000001_dynamic_footer_brand.up,
    down: migration_20261119_000001_dynamic_footer_brand.down,
    name: '20261119_000001_dynamic_footer_brand',
  },
  {
    up: migration_20261120_000001_customer_auth_limits.up,
    down: migration_20261120_000001_customer_auth_limits.down,
    name: '20261120_000001_customer_auth_limits',
  },
  {
    up: migration_20261120_113759_optional_customer_company.up,
    down: migration_20261120_113759_optional_customer_company.down,
    name: '20261120_113759_optional_customer_company',
  },
  {
    up: migration_20261120_140000_customer_mfa.up,
    down: migration_20261120_140000_customer_mfa.down,
    name: '20261120_140000_customer_mfa',
  },
  {
    up: migration_20261120_140001_customer_session_grants.up,
    down: migration_20261120_140001_customer_session_grants.down,
    name: '20261120_140001_customer_session_grants',
  },
  {
    up: migration_20261120_153646_shop_ordering.up,
    down: migration_20261120_153646_shop_ordering.down,
    name: '20261120_153646_shop_ordering',
  },
  {
    up: migration_20261120_154407_shop_orders.up,
    down: migration_20261120_154407_shop_orders.down,
    name: '20261120_154407_shop_orders'
  },
];
