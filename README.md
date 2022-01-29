# About this Visual Studio Code extension

Allows to add files or directories to a custom view to have a quick overview over the important files of a project.
Files can be opened and (in the future) interacted with, so all uninteresting files can effectively be ignored.

# Features
- Configuration of links to directories and files to gain quick access


# Disclaimer
Use the context menu in the file explorer to add relative or absolute paths to the configuration.  
Manually editing the configuration should mainly be done to give paths custom names or remove unwanted/obsolete entries.  
This extension only works when a workspace was opened and all configured relative paths need to be relative from the workspace root.  
Absolute paths may be across the entire file system.
# Usage
* `zenView.foldersTop`: True (default): Places directories before files. False: Places entries as found on the filesystem.
* `zenView.resolveSymlinks`: True (default): Resolves found symlinks to directories or files instead of symlinks. False: Does not resolve the symlink.
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
# Known Issues
- So far none

# Release Notes
For all notes please refer to the changelog.
# Planned improvements
- Add option to add or remove files/directories to settings via context menu in the zen view
- Further features on request

# Feature requests and bug reports
Please mail them to me at dev@durzn.com or create an open issue at https://github.com/Durzn/ZenView
Thanks to everyone reporting issues and requesting new features.

# Special thanks
## You
for using this extension :)

# Support
I'm working on projects like this extension in my free time. 
If you want to buy me a coffee to keep me awake for more work on my projects, I'd greatly appreciate it.

<a href="https://www.buymeacoffee.com/Durzn" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

I also gladly accept ``Ada`` over this address: ``addr1qyz4hp9a5m844c5dn7nz56vget0lcx2lxg9eg02x9nyg82m7306tyvjqygl08grv79tm2jw0sh9lg8nr5u0g0qvf2nlsw376z4``