/* global require */

var gulp = require("gulp");
var shell = require("gulp-shell");
var count = require('gulp-count');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
/**
 * @type {{lang:string, language:string, ver:string, runtime:string, rt, run, debug, html5 , native}}
 */
var args = require('get-gulp-args')();
var fs = require('fs');

function getVersion() {
    var version = args.ver;
    if (!version) {
        throw Error("version required!");
    }
    return version;
}

/**
 * @type {{release : string, native:{ android_path:string }}}
 */
var properties = JSON.parse(fs.readFileSync("egretProperties.json"));
var g = {
    /** 发布文件夹位置 */
    releasePath: (properties.release || "release").replace(/([^/])$/, "$1/"),
    androidAppPath: properties.native.android_path + "/proj.android/assets/egret-game",
    get html5Path() {
        return this.releasePath + "html5/" + getVersion() + "/";
    },
	get nativePath() {
        return this.releasePath + "android/" + getVersion() + "/";
    },
    /** 发布语言 */
    language: args.lang || args.language || "zh",
    runtimeH5: args.runtime || args.rt || args.run || (args.runtime == "html5" ? "h5" : args.runtime),
    runtimeNative: "native",
    /** 是否为测试环境 */
    debug: args.debug || false,
    native: args.native || !args.html5,
    html5: args.html5 || !args.native,
    build: true
};


/**
 * @function release
 * 发布版本
 */
gulp.task("html5", function () {
    var version = getVersion();
    return gulp.src("")
        .pipe(shell([
            'echo \033[36mcompiling html5' + '\033[0m', 'egret build -e',
            'echo \033[36mpublishing html5 version: \033[35m' + version + '\033[0m', 'egret publish --version ' + version + ' -compile'
        ]));
});

/**
 * @function image
 * 图片压缩
 */
gulp.task("image", ["release"], function () {
    return gulp.src(g.html5Path + "resource/**/*")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(g.html5Path + "resource"));
});


gulp.task("release", ["html5"]);

gulp.task("default", ["release", "image"]);
