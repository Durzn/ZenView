# Change Log

All notable changes to the "zenview" extension will be documented in this file.

## [1.2.0] - 2022-01-25
### Added
- new configuration parameter: resolveSymlinks
- new configuration parameter: foldersTop
- Zen view items can now be renamed

### Changed
- Symlinks are now properly resolved in zen view
- Folders can now be listed before files
- `zenView.zenPaths` is now a {Path, Name} tuple.

## [1.1.0] - 2022-01-24
### Added
- Context menu in file explorer to add paths as absolute or relative path

### Fixed
- Fixed directories not using the correct icon from the icon theme in the zen view

## [1.0.0] - 2022-01-23
### Added
- Initial release