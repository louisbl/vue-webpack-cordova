/* global rm, mkdir, cp, env */
// https://github.com/shelljs/shelljs
require('shelljs/global')

const path = require('path')
const config = require('../config')

function versionCode(version) {
    var nums = version.split('-')[0].split('.');
    var versionCode = 0;
    if (+nums[0]) {
        versionCode += +nums[0] * 10000;
    }
    if (+nums[1]) {
        versionCode += +nums[1] * 100;
    }
    if (+nums[2]) {
        versionCode += +nums[2];
    }
    return versionCode * 10;
}
const version = env.npm_package_version
const cdvVersionCode = versionCode(version)

cp('config/config.xml', config.build.cordovaRoot)
const configXml = path.join(config.build.cordovaRoot, 'config.xml')

sed('-i', '__PACKAGE_VERSION__', version, configXml)

if (env.NODE_ENV === 'production') {
  sed('-i', '__CONTENT_SRC__', 'index.html', configXml)
  sed('-i', ' /.*__CONTENT_ORIGIN__.*\n/', '', configXml)
} else {
  sed('-i', '__CONTENT_SRC__', 'http://192.168.1.119:8080/index.html', configXml)
  sed('-i', '__CONTENT_ORIGIN__', 'http://192.168.1.119:8080/*', configXml)
}


cd('./dist')
// exec(`../node_modules/.bin/cordova-icon --icon=../src/assets/icon.png`)
// exec(`../node_modules/.bin/cordova-splash --splash=../src/assets/splash.png`)
// rm(
//   './platforms/android/res/drawable-port-hdpi/screen.png',
//   './platforms/android/res/drawable-port-ldpi/screen.png',
//   './platforms/android/res/drawable-port-mdpi/screen.png',
//   './platforms/android/res/drawable-port-xhdpi/screen.png',
//   './platforms/android/res/drawable-port-xxhdpi/screen.png',
//   './platforms/android/res/drawable-port-xxxhdpi/screen.png'
// )

exec('../node_modules/.bin/cordova platform add android')
exec('../node_modules/.bin/cordova clean')

const name = 'vue-cordova'
const platform = 'android'
const variant = 'all'
const mode = env.NODE_ENV === 'production' ? 'release' : 'debug'
const versionName = `v${version}`
const apkName = `./${name}-${platform}-${variant}-${versionName}.apk`

if (env.NODE_ENV === 'production') {
  console.log('** production **')
  exec('../node_modules/.bin/cordova build android --release --buildConfig=../config/build.json')
  mv('./platforms/android/build/outputs/apk/android-release.apk', apkName)
} else {
  console.log('** development **')
  exec('../node_modules/.bin/cordova run android --debug --device --buildConfig=../config/build.json')
  mv('./platforms/android/build/outputs/apk/android-debug.apk', apkName)
}
