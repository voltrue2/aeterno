# Change Log

This is a list of manually mantained changes and updates for each version.

Version 0.6.0

## Added

None

## Changed

#### Reformatted list and status output

#### Corrected the way to find application processes

#### Corrected cluster process output of node.js

## Deprecated

None

## Removed

None

Version 0.5.6

## Added

None

## Changed

#### Removed async as dependency

#### Updated dependency gracelog's version

## Deprecated

None

## Removed

None

Version 0.5.5

## Added

None

## Changed

#### Bug fix on logging from application for error (stderr)

## Deprecated

None

## Removed

None

***

Version 0.5.4

## Added

None

## Changed

#### Bug fix in monitor process using logger.warn() that did not exist

#### Logging data now has prefix for daemon log and application log

## Deprecated

None

## Removed

None

***

Version 0.5.3

## Added

#### Captures and logs application stdout and stderr streams

## Changed

#### Outputs an error when invalid log path is given to start command

## Deprecated

None

## Removed

None

***

Version 0.5.2

## Added

#### -c, --config option added

The daemon command can now read options from a JSON configuration file.

## Changed

None

## Deprecated

None

## Removed
None

***

Version 0.5.1

## Added

None

## Changed

#### Bug fix with file watch that it can now detect file changes in a watched directories

## Deprecated

None

## Removed

None

***

Version 0.5.0

## Added

None

## Changed

#### Logging of watched files improved

#### Bug fix: watch files is now working (previously only watching directories worked)

## Deprecated

None

## Removed

None

***

Version 0.4.10

## Added

None

## Changed

#### File wather for auto-reload refactored and improved

File watcher now detects new files/directories being added or removed.

## Deprecated

None

## Removed

None

***

Version 0.4.9

## Added

#### tail command added

`./aeterno tail /my/app/`

To tail daemon logs.

## Chanded

#### Aeterno can now check status and restart/stop daemon applications with different daemon name

#### Bug fix: list/status output for watched file list was not resetting when restarted or reloaded

## Deprecated

None

## Removed

None

***

Version 0.4.8

## Added

None

## Changed

#### Status output for watched files improved

#### Status output text changed

## Deprecated

None

## Removed

None

***

Version 0.4.7

## Added

#### Auto-reload now ignores very rapid auto-reloading within 1 second

## Changed

#### -w and -l now supports relative paths

`-w` and `-l` options now understands relative paths given. 

The paths are treated as relative to the application root path.

Example:

```
./aeterno start my/app/ -w src/ -l logs/
```

The above example would mean:

```
./aeterno start my/app/ -w my/app/src/ -l my/app/logs/
```

#### Improved error catching for auto-reloading setup failure

## Deprecated

None

## Removed

None

***

Version 0.4.6

## Added

None

## Changed

#### Bug fix in status.setup: Incorrect error handling when target process is not found

#### Added application path validation

#### Improved start command failure text output

## Deprecated

None

## Removed

None

***

Version 0.4.5

## Added

#### Added update command to add/change logging

#### Added daemon application start options to status output

## Changed

#### Bug fix for multiple command-line options passed to daemon application

#### Dependency gracelog version updated to 0.5.1

With this version, the daemon logging file will be combined for all log levels.

#### Exception in monitor process will now force exit daemonized application process

## Deprecated

None

## Removed

None

***

Version 0.4.4

## Added

#### Now supports command-line options

aeterno now passes command-line options to daemon application.

#### Added checks for auto-reload files/directories

## Changed

#### Minor improvements

## Deprecated

None

## Removed

None

***

## Version 0.4.3

## Added

#### restartall command added

## Changed

#### list/status command text output: Order of processes is now forced and fixed

## Deprecated

None

## Removed

None

***

## Version 0.4.2

### Added

None

### Changed

#### FIX: -w, -a auto-reload for recursive detection fixed

When watching multi-layered directories for auto-reload, it was not working properly, but now this issue is fixed.

#### list/status command can now display a list of watched files/directories

When you start your daemon with `-a` or `-w`, list/status command will display which files/directories your daemon is watching your auto-reload.

#### list/status command text output for running days will now be formatted

#### list/status text output aligment for reloaded time fixed

### Deprecated

None

### Removed

None

***

## Version 0.4.1

### Added

None

### Changed

#### Improved application path finding

The logic to determine the target application's path has been improved and now it can find the correct path even if `aeterno` is a dependency of dependencies.

#### FIX: logging does not leave log for daemon stop

When logging path is added to a currently running daemon and the daemon is stopped, it used to not leave log data for stopping.

This issue has now been fixed.

#### FIX: executing commands with the path as "index.js" fails

It can now handle a path that is just `index.js`.

### Deprecated

None

### Removed

None

***

## Version 0.4.0

### Added

#### stopall command added

With `stopall` command, you can stop all daemons that runs with `aeterno`.

This command will check each running daemon process and ask you if you want to stop it or not.

Example:

```
./aeterno stopall

```

#### -f option added for stopall command

### Changed

#### Fixed: list/status command breaks when the command cannot find running daemon application

`list` and `status` used to break when you execute it while the daemon is restarting.

This issue has now been fixed.

### Deprecated 

None

### Removed

None

***

## Version 0.3.5

### Added

None

### Changed

#### -l, --log=[path] can now be used with other commands than start

status, restart, and reload can now add/change logging path to currently running daemon application.

#### status/list text output improved

It the application is running with worker processes, it displays as a tree structure.

Text output for the running processes and monitor are shorter now.

### Deprecated

None

### Removed

None

***

## Version 0.3.4

### Added

None

### Changed

#### Output text for running hours in status and list command improved

Now it displays www days xx hours yy minutes zz seconds instead of just hours.

#### status and list command no longer leave log

#### daemon logging now uses gracelog

#### status and list command outputs logging path

#### Starting a daemon process without logging option will output a warning

### Deprecated

None

### Removed

None 

***

## Version 0.3.3

### Added

### Changed

#### Output text color can be turned on/off from .aeternorc file

#### Output text color improved

### Deprecated

### Removed

***

## Version 0.3.2

### Added

#### License property added to package.json

### Changed

#### list command text output improved

#### invalid command now displays help text in cli mode

### Deprecated

### Removed

***

## Version 0.3.1

### Added

### Changed

#### status command corrected for non-javascript applications

#### Help text output updated

### Deprecated

### Removed

***

## Version 0.3.0

### Added

#### aeterno can now daemonize applications written in different language

### Changed

### Deprecated

### Removed

***

## Version 0.2.7

### Added

### Changed

#### list command now uses status class

#### list command can now list daemon process(es) that are of different name

#### Text output alignment fixed for list command

#### aeterno can now manage and handle daemon processes with different daemon names

The daemon processes must be started with aeterno module for this to work.

### Deprecated

### Removed

***

Version 0.2.6

### Added

#### Default fall back of .aeternorc file added

If there is no .aeternorc file, `aeterno` now falls back to its internal default automatically.

#### License statement added

### Changed

#### Application path finding logic improved

### Deprecated

### Removed

***

## Version 0.2.5

### Added

None

### Changed

#### Minor refactoring of the source code

### Deprecated

None

### Removed

None

***

## Version 0.2.4

### Added

### Changed

#### status command's text output improved

#### Text color adde brown

#### status command code refactored

#### list command code refactored

### Deprecated

None

### Removed

None

***

## Version 0.2.3

### Added

None

### Changed

#### status command's text output improved

#### help option's content improved

### Deprecated

None

### Removed

None

***

## Version 0.2.2

### Added

None

### Changed

#### .aeternorc file path changed

### Deprecated

None

### Removed

None

***

## Version 0.2.0

### Added

#### .aeternorc file and its support added

### Changed

#### Lint errors fixed

#### Makefile and lint.sh fixed

### Deprecated

None

### Removed

None

***

## Version 0.1.1

### Added

#### .setApplicationName() added

`.setApplicationName()` added to allow manually change the application path that otherwise decided automatically.

### Changed

None

## Deprecated

None

## Removed

None

***

## Version 0.1.0

### Added

#### .setName() added

`.setName()` is added to allow the user to change aeterno's daemon process name.

Default is `aeterno`.

### Changed

None

### Deprecated

None

### Removed

None

***

## Version 0.0.3

### Added

None

### Changed

#### Bug fix aeterno executable

The monitor process path would become incorrect when executed from aeterno executable script.

### Deprecated

None

### Removed

None

***

## Version 0.0.2

### Added

### Unit test scripts added

### aeterno executable added on install

### Changed

### Readme updated

### Deprecated

None

### Removed

None

***

## Version 0.0.1

First published version
