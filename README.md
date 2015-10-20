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

##### Tail daemon logs

```
node myApp.js tail
```

##### Stop the daemon

```
node myApp.js stop
```

##### Stop all daemons

Stops all daemon processes that runs with `aeterno`.

**NOTE:** Each daemon process requires user input to stop the process. If you do not wish to enter user input to stop all daemons, then use `-f` option.

```
node myApp.js stopall
```

##### Restart the daemon

```
node myApp.js restart
```

##### Restart all daemons

Restarts all daemon processes that runs with `aeterno`.

**NOTE:** Each daemon process requires user input to restart the process. If you do not wish to enter user input to restart all daemons, then use `-f` option.

```
node myApp.js restartall
```

##### Reload the daemon

**NOTE:** This command works only if your application listens for `SIGHUP` and reloads properly.

```
node myApp.js reload
```

##### Update the daemon

With `update` command, `aeterno` allows you to add/change logging path and auto-reload watching paths.

Example For Adding/Changing Logging Path

```
node myApp.js update -l /my/logging/path/
```

Example For Adding/Changing Auto-reload Watching Paths

```
node myApp.js update -w /watch/this/folder/ /watch/that/folder/
```

**NOTE:** You may update both logging and auto-reloading paths at the same time.

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

##### Stop all daemons

Stop all daemons that runs with `aeterno`.

**NOTE:** Each daemon process requires user input to stop the process. If you do not wish to enter user input to stop all daemons, then use `-f` option.

```
./aeterno stopall
```

##### Restart your daemon

```
./aeterno restart /path/to/your/app/
```

##### Restart all daemons

Restart all daemons that runs with `aeterno`.

**NOTE:** Each daemon process requires user input to restart the process. If you do not wish to enter user input to restart all daemons, then use `-f` option.

```
./aeterno restartall
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

##### Tail daemon logs

```
./aeterno tail /path/to/your/app/
```

##### Update the daemon

With `update` command, `aeterno` allows you to add/change logging path and auto-reload watching paths.

Example For Adding/Changing Logging Path

```
./aeterno update /path/to/your/app/ -l /my/logging/path/
```

Example For Adding/Changing Auto-reload Watching Paths

```
./aeterno update /path/to/your/app/ -w /watch/this/folder/ /watch/that/folder/
```

**NOTE:** You may update both logging and auto-reloading paths at the same time.

##### List all daemon processes that run with aeterno

```
./aeterno list
```

## How To Add/Change Logging Path

You may add or change daemon log path.

Example:

```
./aeterno update myapp.js -l /my/new/log/path/
```

Above example will change the logging path to `/my/new/log/path/`.

It will add logging if the target daemon is not logging.

## How To Add/Change Watch Directories/Files For Auto-Reloading

Example:

```
./aeterno update /path/to/your/app -w /watch/this/folder/
```

Above example will change the watching directories/files to `/watch/this/folder/`.

It will add watching if there were no directories/files being watched.

## Command-line Options

`aeterno` passes command-line options to your daemon application.

To do that, you simply need to add options when you start your daemon with aeterno.

See the example below.

Example:

```
./aeterno start myapp.js --my-option-to-be-passed -rfv
```

The above example will be the same as:

```
node myapp.js  --my-option-to-be-passed -rfv
```

To read the command-line options being passed from your application:

```javascript
var myOptionToBePassed = process.argv[2];
var rfv = process.argv[3];
```

## Commands And Options

### Commands

#### start [PATH] [OPTIONS]

#### stop [PATH]

#### update [PATH] [OPTIONS]

#### status [PATH] [OPTIONS]

#### tail [PATH]

#### restart [PATH]

#### reload [PATH]

#### stopall

#### restartall

#### list

### Options

#### -c [PATH], --config=[PATH]

An absolute path to configuration path.

The configuration file **MUST** be a JSON file.

#### Configuration File

A configurations to pass options instead of giving them in command-line.

```
{
	"log": <string>,
	"watch": <array>,
	"verbose": <boolean>,
	"exec": <string>,
	"forced": <boolean>
}
```

##### log

A path to logging directory.

Equivalent to: `-l`, `--log`

##### watch

A list of files/directories to watch for auto-restarting.

Equivalent to: `-w`, `-a`

#### verbose

Execute the daemon command in verbose mode.

Equivalent to: `-v`, `--verbose`

#### exec

Specify an interpreter to run the daemon application.

Equivalent to: `-e`, `--exec`

#### forced

Executes `stopall` or `restartall` **WITHOUT** command prompting.

Equivalent to: `-f`

**Example**:

Configuration File:

```json
{
	"log": "/path/to/your/daemon/log/",
	"watch": [
		"/dir/to/watch/for/auto-restart/"
	]
}
```

`./aeterno start myapp.js --config=/path/to/my/config.json`

#### -v, --verbose

Be more verbose.

#### -l [PATH], --log=[PATH]

Logs daemon process information such as process termination, restarts etc.

It also captures application's stdout and stderr streams.

**NOTE:**

The paths are treated as relative to the application root path.

Example:

```
./aeterno start my/app/ -w src/ -l logs/
```

The above example would mean:

```
./aeterno start my/app/ -w my/app/src/ -l my/app/logs/
```

Writes log data in the given directory

#### -e [PATH], --exec=[PATH]

Daemonize the target application with the given interpreter.

Example:

```
./aeterno start myapp.py -e python
```

The above example will daemonize a python script.

#### -w [PATH] [PATH] ..., -a [PATH] [PATH] ...

Watch changes in the given directories and/or files to auto-restart.

**NOTE:**

The paths are treated as relative to the application root path.

Example:

```
./aeterno start my/app/ -w src/ -l logs/
```

The above example would mean:

```
./aeterno start my/app/ -w my/app/src/ -l my/app/logs/
```

#### -f

This option is for `stopall` or `restartall` command only. 

Executes `stopall` or `restartall` without command prompting.

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

- Output color. Use colored output text. Default is true.

- Help text content.

Default Vaule:

```
{
        "name": "aeterno",
        "color": true,
        "help": {
                        "usage": "Usage: ./aeterno {start|stop|stopall|restart|restartall|reload|update|status|list|clean} [PATH] [OPTION]",
                        "reloadNote": "{reload} works ONLY if your application handles SIGHUP.",
                        "description": "Daemonaize a target application process and monitor it.\n",
                        "options": "Options:",
                        "log": "       -l, --log=[path]:",
                        "logDesc": "  Write log data into a file.",
                        "exec": "       -e, --exec=[path]:",
                        "execDesc": " Daemonize the target application with the given interpreter.",
                        "watch": "       -w, -a:",
                        "watchDesc": "            Automatically restart the daemon process if watch file(s) change.",
                        "verbose": "       -v, --verbose:",
                        "verboseDesc": "     Be more verbose.",
                        "forced": "       -f:",
                        "forcedDesc": "                Stops or restarts all running daemon processes without user inputs. This option is for {stopall|restartall} command only.",
                        "example": "Examples:",
                        "start": "     ./aeterno start",
                        "startDesc": "                       Start a daemon process.",
                        "startWithPath": "     ./aeterno start ./myServer.js",
                        "startWithPathDesc": "         Start a daemon process of \"./myServer.js\".",
                        "startWithLog": "     ./aeterno start -l ./daemonlog/",
                        "startWithLogDesc": "       Start a daemon process and write log data to \"./daemonlog/\" directory.",
                        "startAndWatch": "     ./aeterno start -w ./modules ./lib",
                        "startAndWatchDesc": "    Start a daemon process and watch \"./modules\" and \"./lib\". Anything changes in the watched directory, daemon process will automatically restart",
                        "update": "     ./aeterno update ./myapp.js",
                        "updateDesc": "           Updates a currently running daemon application such as -l to add/change logging or -w [...] to add watch directories/files to auto-reload"
                }
}
```
