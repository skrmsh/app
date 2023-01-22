# SKIRMISH App

* This repo contains the source for a react-native implementation of a skirmish client-app
* :warning: This is still *very* much work in progress
* Application has not been tested on iOS and will probably fail because of missing permissions.


### Requirements
* Youll need a JDK, i would recommend `openjdk-11.0.12`. Use sdkman to ensure a smooth installation process.
### Setup dev environment:
```
npm install
```
### Start App on local (Android-)device with Metro live reloading enabled:
```
npx react-native run-android --terminal terminator --list-devices
```
* Note that you have to change the `--terminal` argument to a terminal of your choosen as this will fail without any debug information, if the given terminal is not found

### Automatic building
* Until a proper release mechanism is established, each build has to be triggered manually.
* There is a github actions worklfow configured which will build, sign and publish the APKs and AABs