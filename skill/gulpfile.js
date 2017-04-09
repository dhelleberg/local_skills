const gulp = require('gulp');
const zip = require('gulp-zip');
const awsLambda = require('node-aws-lambda');
const dotenv = require('dotenv');
var clean = require('gulp-clean');
var spawn = require('child_process').spawn;
 
dotenv.config({path: './config/.env'})

gulp.task('clean', function() {
  gulp.src('distribution/*.zip', {read: false})
        .pipe(clean())
});

gulp.task('build', function (callback) {
    spawn('npm', ['install'], { cwd: 'src/', stdio: 'inherit' })
      .on('close', callback);
});

gulp.task('package', function() {
	gulp.src('src/**/*')
		.pipe(zip('aws_lambda_upload.zip'))
		.pipe(gulp.dest('distribution'))
});

gulp.task('upload', function(callback) {
  	awsLambda.deploy('./distribution/aws_lambda_upload.zip', 
  					require("./config/lambda-config.js"), 
  					callback);
})