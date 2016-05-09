# Change Log

## [Unreleased]
### Added
- Unit tests for
  - Models: User, Log

### Changed
- Bot now requires parameter `bot`, `web` or `both` to start
- Updated dependencies:
  
  | Package                             | Old version | New version |
  | ----------------------------------- | ----------- | ----------- |
  | babel-cli                           | ^6.7.5      | ^6.8.0      |
  | babel-core                          | 6.7.6       | 6.8.0       |
  | babel-eslint                        | 6.0.2       | 6.0.4       |
  | babel-plugin-syntax-async-functions | 6.5.0       | 6.8.0       |
  | babel-plugin-transform-runtime      | 6.7.5       | 6.8.0       |
  | babel-polyfill                      | 6.7.4       | 6.8.0       |
  | babel-register                      | 6.7.2       | 6.8.0       |
  | body-parser                         | 1.15.0      | 1.15.1      |
  | eslint                              | 2.8.0       | 2.9.0       | 
  | eslint-friendly-formatter           | 2.0.2       | 2.0.4       |
  | gulp-open                           | 1.0.0       | 2.0.0       |                                 
  | html-webpack-plugin                 | 2.15.0      | 2.16.1      |
  | mockery                             | ^1.6.2      | ^1.7.0      |
  | redis                               | 2.6.0-1     | 2.6.0-2     |
  | vue                                 | 6.7.6       | 6.8.0       |
  | vue-loader                          | 8.2.3       | 8.3.1       |

### Fixed
- Log: Seconds not being 2 digits when < 10 seconds in timestamp

## [0.0.1] - 2016-05-02
### Added
- PM2 process file
- Settings for each module

### Fixed
- Errors from async web routes being eateni
- API not responding when no settings in database

[Unreleased]: https://github.com/michaelowens/xikbot/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/michaelowens/xikbot/commits/v0.0.1
