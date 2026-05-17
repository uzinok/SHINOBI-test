import {
	src,
	dest,
	watch,
	series,
	parallel
} from 'gulp';

import plumber from 'gulp-plumber';
import notify from 'gulp-notify';

import replace from 'gulp-replace';
import sourcemaps from 'gulp-sourcemaps';

import clean from 'gulp-clean';

import {
	nunjucksCompile
} from 'gulp-nunjucks';
import htmlmin from 'gulp-htmlmin';

import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import postcss from 'gulp-postcss';
import autoprefixer from 'gulp-autoprefixer';
import sortMediaQueries from 'postcss-sort-media-queries';
import cssnano from 'cssnano';

import babel from 'gulp-babel';
import terser from 'gulp-terser';
import header from 'gulp-header';

import serverSynk from 'browser-sync';
const browserSync = serverSynk.create();

// дополнительные задачи
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';

import imagemin from 'gulp-imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminOptipng from 'imagemin-optipng';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminSvgo from 'imagemin-svgo';

import svgSprite from 'gulp-svg-sprite';

let isDevelopment = true;

// Конфигурация обработчиков ошибок
const errorHandlers = {
	html: notify.onError({
		title: 'HTML Compilation Error',
		message: '<%= error.message %>',
		icon: './source/images/html-error.png',
		sound: 'Basso'
	}),

	styles: notify.onError({
		title: 'SASS Error',
		message: '<%= error.message %>',
		sound: 'Frog'
	}),

	scripts: notify.onError({
		title: 'JavaScript Error',
		message: '<%= error.message %>',
		sound: 'Hero'
	}),

	copy: notify.onError({
		title: 'Copy Error',
		message: '<%= error.message %>',
		sound: 'Pop'
	}),

	clean: notify.onError({
		title: 'Clean Error',
		message: '<%= error.message %>',
		sound: 'Bottle'
	}),

	fonts: notify.onError({
		title: 'Fonts Conversion Error',
		message: '<%= error.message %>',
		sound: 'Funk'
	}),

	images: notify.onError({
		title: 'Images Optimization Error',
		message: '<%= error.message %>',
		sound: 'Glass'
	}),

	sprite: notify.onError({
		title: 'SVG Sprite Error',
		message: '<%= error.message %>',
		sound: 'Glass'
	})
};

// Настройки для путей исходных файлов
const sourcePaths = {
	copy: [
		"./source/fonts/*.{woff2,woff,ttf,otf}",
		"./source/*.ico",
		"./source/images/**/*.{svg,jpg,jpeg,png,webp,avif,gif}",
		"./source/videos/**/*.{mp4,webm}",
		"./source/vendor/**/*.{css,js}",
	],
	copyMedia: [
		"./source/images/**/*.{svg,jpg,jpeg,png,webp,avif,gif}",
		"./source/videos/**/*.{mp4,webm}"
	],
	html: [
		'source/*.html',
		'source/*.njk'
	],
	styles: {
		main: 'source/styles/*.scss',
	},
	scripts: [
		'source/scripts/**/*.js'
	],
	fonts: ['source/fonts/**/*.ttf'],
	images: [
		'./source/images/**/*.{jpg,jpeg,png,gif,svg}',
		'!./source/images/icons/**/*',
		'!./source/images/sprite.svg',
		'!./source/images/stack.svg'
	],
	sprite: './source/images/icons/sprite/*.svg',
	stack: './source/images/icons/stack/*.svg',
	clean: 'dist/',
	output: {
		dist: 'dist/',
		styles: 'dist/styles',
		scripts: 'dist/scripts',
		fonts: 'source/fonts/',
		images: './source/images/'
	},
	watch: {
		html: [
			'source/*.{html,njk}',
			'source/parts/*.{html,njk}'
		],
		styles: 'source/styles/**/*.scss',
		scripts: 'source/scripts/**/*.js'
	},
	base: {
		source: './source',
		images: './source/images'
	}
};

// Функции для получения конфигураций, зависящих от isDevelopment
const getPluginConfigs = () => ({
	htmlmin: {
		removeComments: !isDevelopment,
		collapseWhitespace: !isDevelopment,
		collapseBooleanAttributes: true,
		removeAttributeQuotes: false,
		removeRedundantAttributes: true,
		removeEmptyAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		minifyJS: true,
		minifyCSS: true
	},
	autoprefixer: {
		cascade: false
	},
	postcss: [
		sortMediaQueries({ sort: 'mobile-first' }),
		...(isDevelopment ? [] : [cssnano()])
	],
	imagemin: [
		imageminMozjpeg({ quality: 85, progressive: true }),
		imageminOptipng({ optimizationLevel: 3 }),
		imageminGifsicle({ interlaced: true }),
		imageminSvgo({
			plugins: [
				{ name: 'removeViewBox', active: false },
				{ name: 'removeDimensions', active: true }
			]
		})
	],
	imageminOptions: {
		silent: true
	},
	ttf2woff2: {
		ignoreExt: true,
		clone: false
	},
	sprite: {
		mode: {
			symbol: {
				dest: '.',
				sprite: 'sprite.svg',
				example: false
			}
		},
		shape: {
			id: {
				separator: '--',
				generator: '%s'
			}
		},
		svg: {
			namespaceClassnames: false // отключаем изменение классов
		}
	},
	svgStack: {
		mode: {
			stack: {
				dest: '.',
				sprite: 'stack.svg',
				example: false
			}
		},
		shape: {
			id: {
				separator: '--',
				generator: '%s'
			}
		}
	},
	clean: {
		force: true
	},
	srcOptions: {
		base: sourcePaths.base.source,
		encoding: false
	},
	cleanOptions: {
		read: false,
		allowEmpty: true
	},
	browserSync: {
		server: {
			baseDir: 'dist/'
		}
	}
});

/**
 * Копирование статических файлов (шрифты, изображения, видео, вендорные файлы)
 */
function copy() {
	return src(sourcePaths.copy, getPluginConfigs().srcOptions)
		.pipe(plumber({ errorHandler: errorHandlers.copy }))
		.pipe(dest(sourcePaths.output.dist));
}

/**
 * Копирование только медиа-файлов (изображения и видео) во время разработки
 */
function copyMedia() {
	return src(sourcePaths.copyMedia, getPluginConfigs().srcOptions)
		.pipe(plumber({ errorHandler: errorHandlers.copy }))
		.pipe(dest(sourcePaths.output.dist))
		.pipe(browserSync.stream());
}

/**
 * Очистка папки dist перед сборкой
 */
function cleanDist() {
	return src(sourcePaths.clean, getPluginConfigs().cleanOptions)
		.pipe(plumber({ errorHandler: errorHandlers.clean }))
		.pipe(clean(getPluginConfigs().clean));
}

/**
 * Компиляция HTML/Nunjucks файлов с минификацией
 */
function html() {
	return src(sourcePaths.html)
		.pipe(plumber({ errorHandler: errorHandlers.html }))
		.pipe(nunjucksCompile())
		.pipe(htmlmin(getPluginConfigs().htmlmin))
		.pipe(dest(sourcePaths.output.dist))
		.pipe(browserSync.stream());
}

/**
 * Компиляция SCSS в CSS с автопрефиксами и минификацией
 */
function styles() {
	let stream = src(sourcePaths.styles.main)
		.pipe(plumber({ errorHandler: errorHandlers.styles }));

	if (isDevelopment) {
		stream = stream.pipe(sourcemaps.init());
	}

	stream = stream
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer(getPluginConfigs().autoprefixer))
		.pipe(postcss(getPluginConfigs().postcss))
		.pipe(replace(/url\((['"]?)((\.\.\/)+)([^'")]+)\1\)/g, 'url($1../$4$1)'));

	if (isDevelopment) {
		stream = stream.pipe(sourcemaps.write('.'));
	}

	return stream.pipe(dest(sourcePaths.output.styles))
		.pipe(browserSync.stream());
}

/**
 * Транспиляция и минификация JavaScript файлов
 */
function scripts() {
	let stream = src(sourcePaths.scripts)
		.pipe(plumber({ errorHandler: errorHandlers.scripts }));

	if (isDevelopment) {
		stream = stream.pipe(sourcemaps.init());
	}

	stream = stream
		.pipe(babel())
		.pipe(header("'use strict';\n\n"));

	if (!isDevelopment) {
		stream = stream.pipe(terser());
	}

	if (isDevelopment) {
		stream = stream.pipe(sourcemaps.write('.'));
	}

	return stream.pipe(dest(sourcePaths.output.scripts))
		.pipe(browserSync.stream());
}

/**
 * Отслеживание изменений в файлах
 */
function watchFiles() {
	watch(sourcePaths.watch.html, html);
	watch(sourcePaths.watch.styles, styles);
	watch(sourcePaths.watch.scripts, scripts);
	watch(sourcePaths.copyMedia, copyMedia);
}

/**
 * Запуск локального сервера с browser-sync
 */
function server() {
	browserSync.init(getPluginConfigs().browserSync);
	watchFiles();
}

/**
 * Основная задача для разработки
 */
function start(done) {
	isDevelopment = true;
	return series(cleanDist, copy, parallel(scripts, styles, html), server)(done);
}

/**
 * Сборка проекта для продакшена
 */
function build(done) {
	isDevelopment = false;
	return series(cleanDist, copy, parallel(scripts, styles, html))(done);
}

/**
 * Конвертация TTF шрифтов в WOFF и WOFF2 форматы
 */
function fonts() {
	return src(sourcePaths.fonts, { encoding: false })
		.pipe(plumber({ errorHandler: errorHandlers.fonts }))
		.pipe(ttf2woff2(getPluginConfigs().ttf2woff2))
		.pipe(dest(sourcePaths.output.fonts))
		.pipe(src(sourcePaths.fonts, { encoding: false }))
		.pipe(ttf2woff())
		.pipe(dest(sourcePaths.output.fonts));
}

/**
 * Оптимизация изображений
 */
function optimizeImages() {
	return src(sourcePaths.images, {
		base: sourcePaths.base.images,
		encoding: false
	})
		.pipe(plumber({ errorHandler: errorHandlers.images }))
		.pipe(imagemin(getPluginConfigs().imagemin, getPluginConfigs().imageminOptions))
		.pipe(dest(sourcePaths.output.images));
}

/**
 * Создание SVG спрайта
 */
function sprite() {
	return src(sourcePaths.sprite)
		.pipe(plumber({ errorHandler: errorHandlers.sprite }))
		.pipe(svgSprite(getPluginConfigs().sprite))
		.pipe(dest(sourcePaths.output.images));
}

/**
 * Создание SVG stack
 */
function stack() {
	return src(sourcePaths.sprite) // Используем тот же источник, что и для sprite
		.pipe(plumber({ errorHandler: errorHandlers.sprite }))
		.pipe(svgSprite(getPluginConfigs().svgStack))
		.pipe(dest(sourcePaths.output.images));
}

// Экспорт задач для Gulp
export {
	start,
	build,
	cleanDist,
	copy,
	copyMedia,
	html,
	styles,
	scripts,
	fonts,
	optimizeImages,
	sprite,
	stack
};

// Задача по умолчанию
export default start;
