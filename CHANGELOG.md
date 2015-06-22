# Change Log

This is a list of manually mantained changes and updates for each version.

***

## Version 0.3.5

## Added

None

## Changed

#### -l, --log=[path] can now be used with other commands than start

status, restart, and reload can now add/change logging path to currently running daemon application.

#### status/list text output improved

It the application is running with worker processes, it displays as a tree structure.

Text output for the running processes and monitor are shorter now.

## Deprecated

None

## Removed

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
