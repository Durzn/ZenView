# About this Visual Studio Code extension

Allows to add files or directories to a custom view to have a quick overview over the important files of a project.
Files can be opened and interacted with, so all uninteresting files can effectively be ignored and the explorer only needs to be used for more complex use cases.

# Features
- Configuration of links to directories and files to gain quick access
- Search over pinned files and recursive search through pinned directories attached to ZenView

# Support
If you find this extension helpful, please consider supporting its development with a donation.  
Your contributions help me maintain and improve the extension over time. Every bit is appreciated and keeps this project going.

<a href='https://ko-fi.com/H2H4Q3C6N' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi2.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

# Disclaimer
Use the context menu in the file explorer to add relative or absolute paths to the configuration.  
Manually editing the configuration should mainly be done to give paths custom names or remove unwanted/obsolete entries.  
This extension only works when a workspace was opened and all configured relative paths need to be relative from the workspace root.  
Absolute paths may be across the entire file system.

Regular expressions can be configured, but must be applied manually later on. Files or folders added via regular expressions will not be synchronized later on,
so if another file or folder matching this regular expression is added, it needs to be manually applied again! You can use the meatballs menu in the ZenView or
run the command that is provided by the extension.
Applying regular expressions may take some time, because the whole root directory needs to recursively be checked for a match.

# Usage
* `zenView.foldersTop`: True (default): Places directories before files. False: Places entries as found on the filesystem.
* `zenView.resolveSymlinks`: True (default): Resolves found symlinks to directories or files instead of symlinks. False: Does not resolve the symlink.
* `zenView.enableRegExWarning`: True (default): Enables a message box which shows how many files will be added by a configured regular expression.
* `zenView.zenPaths`: User defined paths to directories or files which shall be added to the zen view.
E.g.
```
"zenView.zenPaths": [
    {
        "name": "Src",
        "path": "./src"
    },
    {
        "name": "Tests",
        "path": "D:/tests"
    },
    {
        "name": "Tests",
        "path": "/home/user/tests"
    }
]
```
* `zenView.zenRegExps`: User defined regular expressions, which need to be applied manually via command.
E.g.
```
"zenView.zenRegExps": [
    "unit_implementation",
    "unit_tests"
]
```
# Known Issues
- So far none

# Release Notes
For all notes please refer to the changelog.
# Planned improvements
- Nothing planned for now, feature requests are welcome.

# Feature requests and bug reports
Please mail them to me at dev@durzn.com or create an open issue at https://github.com/Durzn/ZenView
Thanks to everyone reporting issues and requesting new features.

# Special thanks
## Art_of_bini 
for the great extension icon. See more from her on her instagram page https://www.instagram.com/art_of_bini/
## You
for using this extension :)