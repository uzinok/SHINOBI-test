const catalogSwiperOptopns = {
	speed: 400,
	spaceBetween: 100,
	pagination: {
		el: '.catalog__navigation',
		clickable: true,
		bulletActiveClass: 'catalog__bullet--current',
		type: 'bullets',
		renderBullet: function (index, className) {
			return `<span class="${className} catalog__bullet" data-index="${index}"></span>`;
		}
	},

	on: {
		init: function () {
			updateBulletsColor(this);
			updateCount(this);
		},
		slideChange: function () {
			updateCount(this);
		}
	}
};

function updateBulletsColor(swiper) {
	const slides = swiper.slides;
	const bullets = swiper.pagination.bullets;

	bullets.forEach((bullet, index) => {
		const dataColor = slides[index].dataset.color;

		if (dataColor) {
			try {
				const colorObj = JSON.parse(dataColor.replace(/'/g, '"'));
				bullet.style.color = colorObj.code;
			} catch (e) {
				console.warn('Не удалсь получить цвет ' + e);
			}
		}

	});
};

function updateCount(swiper) {
	const activeSlide = swiper.slides[swiper.activeIndex];

	const sliderContainer = swiper.el.closest('.catalog__slider');
	const infoCountElement = sliderContainer.querySelector('.catalog__info-count');
	const infoElement = sliderContainer.querySelector('.catalog__info');
	const count = activeSlide.getAttribute('data-count');

	if (infoCountElement) {
		const n = parseInt(count, 10);

		if (isNaN(n)) {
			infoCountElement.classList.toggle('catalog__info-count--hidden', true);
			return;
		}

		if (n === 0) {
			infoElement.classList.toggle('catalog__info-count--hidden', true);
			return;
		}

		if (n === 1) {
			infoCountElement.classList.toggle('catalog__info-count--hidden', true);
			return;
		}

		infoElement.classList.toggle('catalog__info-count--hidden', false);
		infoCountElement.classList.toggle('catalog__info-count--hidden', false);

		const lastDigit = n % 10;
		const lastTwoDigits = n % 100;

		let text;
		if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
			text = 'автомобилей';
		} else if (lastDigit === 1) {
			text = 'автомобиль';
		} else if (lastDigit >= 2 && lastDigit <= 4) {
			text = 'автомобиля';
		} else {
			text = 'автомобилей';
		}

		infoCountElement.innerText = `${count} ${text}`;
	}

}

document.addEventListener('DOMContentLoaded', () => {
	const swiperM6 = new Swiper('.catalog__slider--m6 .swiper', catalogSwiperOptopns);
	const swiperDargox = new Swiper('.catalog__slider--dargox .swiper', catalogSwiperOptopns);
});
