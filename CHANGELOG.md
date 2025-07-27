# Change Log

All notable changes to the "zenview" extension will be documented in this file.

## [2.1.2] - 2025-07-27
### Added
- Made search results look more like native search

## [2.1.1] - 2025-07-27
### Added
- Minified extension

### Fixed
- Missing icons in search bar

## [2.1.0] - 2025-07-27
### Added
- Settings now support ${workspaceFolder}

## [2.0.1] - 2025-07-27
### Added
- Added icons for new views

## [2.0.0] - 2025-07-26
### Added
- Search and search result views
- Searching happens over all files part of the ZenView (single pinned files and recursive through pinned directories)

## [1.6.1] - 2023-02-03
### Changed
- Added missing changelog entry for 1.6.0

## [1.6.0] - 2023-02-03
### Changed
- Added option to remove ZenView root items via context menu in ZenView

## [1.5.1] - 2022-10-04
### Changed
- Fixed error where nothing would be shown in case a symlink couldn't be resolved

## [1.5.0] - 2022-02-07
### Added
- Added regular expressions to configuration
- Added command to add configured regular expressions to the zen view configuration
- Added configuration parameter to disable warning when applying regular expressions to the config
- Added meatball menu (can be used to apply regular expressions for now)

## [1.4.0] - 2022-02-06
### Added
- Context menu for entries in the zen view (add file/folder, rename and delete)

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