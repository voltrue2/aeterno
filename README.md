# aeterno

©Nobuyori Takahashi < voltrue2@yahoo.com >

A daemonazation module written in node.js.

`aeterno` can be used programatically.

`aeterno` can also daemonize applications that are not written in javascript as well. 

## How To Install

**NOTE:** If you are running your application with older version of aeterno, please make sure to stop all the daemons before installing the new version.

```
npm install aeterno
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

When installed from by `npm install aeterno`, the module creates an executable in your application's root directory.

`aeterno` will be created in your application's directory.

Example

##### Start your application as a daemon

```
./aeterno start /path/to/your/app/
```

##### Start your application as a daemon with logging

```
./aetero start /path/to/your/app/ -l /path/to/your/log/dir/
```

###### Start your application as a daemon and watch for changes in the given directories/files to auto-restart.

```
./aeterno start /path/to/your/app/ -w /path/to/watch/ file/to/watch
```

##### Stop your daemon

```
./aeterno stop /path/to/your/app/
```

##### Restart your daemon

```
./aeterno restart /path/to/your/app/
```

##### Reload your daemon

**NOTE:** `reload` only works if your application listenes to `SIGHUP` and handles it as reload.

```
./aeterno reload /path/to/your/app/
```

##### Check the status of your daemon

```
./aeterno status /path/to/your/app/
```

##### List all daemon processes that run with aeterno

```
./aeterno list
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

#### -l [PATH], --log=[PATH]

Writes log data in the given directory

#### -e [PATH], --exec=[PATH]

Daemonize the target application with the given interpreter.

Example:

```
./aeterno start myapp.py -e python
```

The above example will daemonize a python script.

#### -w [PATH] [PATH] ..., -a [PATH] [PATH]

Watch changes in the given directories and/or files to auto-restart.

#### -h, --help

## Methods

### .run(callback [function])

Used when you are using aeterno programatically.

### .setName(daemonName [string])

You may change the name of daemon.

**NOTE:** This is used only when you are using aeterno programatically.

### .setApplicationPath(path [string])

You may manually change the target application path to daemonize.

**NOTE:** This is used only when you are using aeterno programatically.

## .aeternorc file

aeterno module can read `.aeternorc` file to allow configurations from outside.

The configurable values are:

- Daemon tool name. This will have the same effect as calling `aeterno.setName();`.

- Help text content.

Default Vaule:

```
{
        "name": "aeterno",
        "help": {
                        "usage": "Usage: ./aeterno {start|stop|restart|reload|status|list|clean} [PATH] [OPTION]",
                        "reloadNote": "{reload} works ONLY if your application handles SIGHUP.",
                        "description": "Daemonaize a target application process and monitor it.\n",
                        "options": "Options:",
                        "log": "       -l, --log=[path]:",
                        "logDesc": "  Write log data into a file",
                        "exec": "       -e, --exec=[path]:",
                        "execDesc": " Daemonize the target application with the given interpreter.",
                        "watch": "       -w, -a:",
                        "watchDesc": "            Automatically restart the daemon process if watch file(s) change.",
                        "verbose": "       -v, --verbose:",
                        "verboseDesc": "     Be more verbose.",
                        "example": "Examples:",
                        "start": "     ./aeterno start",
                        "startDesc": "                       Start a daemon process.",
                        "startWithPath": "     ./aeterno start ./myServer.js",
                        "startWithPathDesc": "         Start a daemon process of \"./myServer.js\".",
                        "startWithLog": "     ./aeterno start -l ./daemonlog/",
                        "startWithLogDesc": "       Start a daemon process and write log data to \"./daemonlog/\" directory.",
                        "startAndWatch": "     ./aeterno start -w ./modules ./lib",
                        "startAndWatchDesc": "    Start a daemon process and watch \"./modules\" and \"./lib\". Anything changes in the watched directory, daemon process will automatically restart"
        }
}
```
