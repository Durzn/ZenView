# Change Log

All notable changes to the "zenview" extension will be documented in this file.

## [1.3.0] - 2022-01-29
### Added
- Configured paths will now be updated in configuration if the files are renamed or deleted.
NOTE: If a parent directory is renamed, the configured paths are no longer valid and will not be shown in the file tree anymore. Not the whole folder structure is scanned, only the pinned files are checked.
This means that these invalid paths can remain in the configuration, but will no longer be shown in the file view.

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