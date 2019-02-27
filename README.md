<p align="center">
  <!--<img src="images/logo.png" alt="rLog logo" width="200" height="200"/>-->
  RLog
</p>
<h3 align="center">
A Roku logger
</h3>
<p align="center">
  Version 0.2.0
</p>

## Links
 - **[Youtube videos - TBD]()**
 - **[API Documentaiton](https://georgejecook.github.io/rLog)**
 - **[Release notes / History / Changes](CHANGELOG.md)**
 - [Roku developer slack group](https://join.slack.com/t/rokudevelopers/shared_invite/enQtMzgyODg0ODY0NDM5LTc2ZDdhZWI2MDBmYjcwYTk5MmE1MTYwMTA2NGVjZmJiNWM4ZWY2MjY1MDY0MmViNmQ1ZWRmMWUzYTVhNzJiY2M)
 - [Issue tracker](https://github.com/georgejecook/rLog/issues)
 - [Roadmap](ROADMAP.md)

## Development

rLog is an independent open-source project, maintained exclusively by volunteers.

You might want to help! Get in touch via the slack group, or raise issues.

## About rLog

rLog is a logging framework for Roku Scenegraph apps. It is specifically tailored to the nuances of Roku development. Notably it is:

 - Lightweight in both performance and syntax
 - Works across nodes, tasks and thread boundaries
 - Crash safe: i.e it safely logs values, without crashing on invalid, undefined, or unexpected value types
 - Highly configurable: You can configure log levels, include and exclude filters, various log transports, light logging mode, and more
 - compatible with various log transports - you can log to the following transports:
   - print - i.e. telnet output
   - screen - screen overlay
   - node/RALE (Roku Advanced Layout Editor) - log lines go to a node, where you can read/copy the values from
   - easy to add more - anyone want to add a socket transport? pm me

### rLog and performance

Performance is absolutely critical in Roku apps - rLog gives you professional-grade logging functionality while giving you various performance options:

 - Full featured, multi transport logging, with on-device filtering
 - Light logging (all logging is simple print statements), with no filtering
 - Disabled - any rLog calls will return instantly, without incurring any logging penalty
 - Fully disabled - all log lines are commented out - this means you won't even incur variable/string reference performance penalties.

### rLog, Burp and vscode-brightscript-language extension, sitting in a tree l o g g i n g

 rLog can leverage [Burp](https://github.com/georgejecook/burp) (brightscript file processing framework) to allow it to give you the best logging experience. rLog will automatically put burp compatible constants in your log output so you can benefit from:

  - file name, function name and line number in your log output
  - `pkg:file.brs(lineNumber)` log format, which gives you clickable log lines in [vscode brightscript language extension] (https://github.com/TwitchBronBron/vscode-brightscript-language/)
  - ability to easily comment out log lines.

Here's an example of what you can get set up:

![https://i.imgur.com/GcUK9iO.mp4](https://i.imgur.com/GcUK9iO.mp4)


#Using rLog
## Quick start

 1. Clone this repo
 1. Copy `dist/components/rLog` to your project's components folder (e.g whatever equates to `pkg:/components` at runtime)
 1. Copy `dist/source/rLog` to your project's source folder (e.g whatever equates to `pkg:/source` at runtime)
 1. Import the rLog mixin script, in your main scene xml file `<script type="text/brightscript" uri="pkg:/source/rLog/rLogMixin.brs" />`
 1. Create an rLog instance in your main scene e.g, in your main scene's brs init function, add `m.top._rLog = initializeRlog()` - pro tip: make it available as an interface variable for runtime inspection with [RALE](https://sdkdocs.roku.com/display/sdkdoc/Roku+Advanced+Layout+Editor)
 1. Register your class (i.e. module, or scenegraph component) with the logger, with a call to `registerLogger("ComponentName")`, with the name you wish rLog to use for log output
 1. Begin logging, using the rLog log methods, e.g. `logVerbose("Keypress {0}", key)`

## Logging API

For full API, see the [docs](https://georgejecook.github.io/rLog)

### initializeRlog

`initializeRLog(isForcedOff = false, isLightForcedOn = false, isLightForcedOff = false) as object`

This call must be made to create the rLog instance, which will be stored in global. As a convenience, the instance is also returned, for further configuration.

Note, you can force rlog off, or light logging on for everything, or off for everything. Pro tip: You can pass these values in from your manifest, which in turn can be configured by your build pipeline.

### registerLogger

`registerLogger(name = "general", isLight = false, target = invalid) as object`

Before you can invoke the logging methods, you have to register a logger. The `registerLogger` method is used for this purpose.

The logger will decorate the `target` in the args with the logger helpers. If invalid, this is assumed to be the value of `m`. This works fine for scenegraph nodes. However, if you you are using a module pattern, then you will want to pass in a reference to your module as the target argument. 

### General logging with logXXX methods

`logXXX(message, value = "#RLN#", value2 = "#RLN#", value3 = "#RLN#", value4 = "#RLN#", value5 = "#RLN#", value6 = "#RLN#", value7 = "#RLN#", value8 = "#RLN#", value9 = "#RLN#") as void`

rLog provides logging methods, which all have the same signature for the following levels

 - verbose - logVerbose
 - debug - logDebug
 - method - logMethod
 - info - logInfo
 - warn - logWarn
 - error  - logError

 The signature is as follows:

 `(message, value0, ..., value9)`

- message - the string message you wish to log
- value0..9 - values, which are appended to the message (surrounded by a space character). Values are automatically converted to a string. arrays, json and node types are pretty printed.

Note that the output includes the log level, and the class doing the logging, as set in your call to `registerLogger`

Also note, all the `logXXX` methods are available on `m`

### log method scope

the log helpers are by defualt scoped to `m`. As a convenience, you can call `logXXX`. However, if your scope is not the node's `m` scope, i.e. you are wishing to log from a module, then you mus use `m.logXXX` methods.

For example, in `NetModule.brs`

```
function createModule()
  module = {
    callNet: netMixin_callNet
  }

  return registerLogger("NetModule", false, module)
end function

function netMixin_callNet()
  m.logMethod("callNet")
end function
```

## FAQ
### Is rLog ready for production use?
rLog is the 3rd generation of my logging ideas on roku. The other 3 generations are all in production channels. I'm using this in my own work.

### Is rLog actively maintained?
I am actively invovled in rLogs's development, and add more features and fixes on a weekly basis. You can expect rapid responses to issues.

