# aeterno

©Nobuyori Takahashi < voltrue2@yahoo.com >

A daemonazation module written in node.js.

This module can be used programatically.

## How To Install

```
npm install
```

## How To Use

### Use aeterno programatically

aeterno gives your node.js application an option to become a daemon.

Example:

```javascript
var aeterno = require('aeterno');
aeterno.run(function () {
	// here is your application logic
});
```

With the set up above, your application is ready to be a daemon.

##### How to execute as a daemon

```
node myApp.js start
```

##### Run as a daemon with daemon logging

```
node myApp.js start -l /path/to/log/dir/
```

##### Run as a daemon with auto-restart when watched file(s) are changed

```
node myApp.js start -w /dir/to/watch/for/change/ /file/to/watch/for/change
```

##### Check the daemon status

```
node myApp.js status
```

##### Stop the daemon

```
node myApp.js stop
```

##### Restart the daemon

```
node myApp.js restart
```

##### Reload the daemon

**NOTE:** This command works only if your application listens for `SIGHUP` and reloads properly.

```
node myApp.js reload
```

##### List all daemon processes that runs with aeterno

```
node myApp.js list
```

### Use aeterno from command-line

aeterno also allows you to daemonize your application without change your application's code.

Example

```
node_modules/aeterno/aeterno start /path/to/your/app/
```

## Commands And Options

### Commands

#### start [PATH]

#### stop [PATH]

#### status [PATH]

#### restart [PATH]

#### reload [PATH]

#### list

### Options

#### -v, --verbose

Be more verbose.

#### -l [PATH]

Writes log data in the given directory

#### -w [PATH] [PATH] ...

Watch changes in the given directories and/or files to auto-restart.

#### -h, --help

