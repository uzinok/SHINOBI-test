const catalogSwiperOptopns = {
	speed: 400,
	spaceBetween: 100,
};

document.addEventListener('DOMContentLoaded', () => {
	const swiperM6 = new Swiper('.catalog__slider--m6 .swiper', catalogSwiperOptopns);
	const swiperDargox = new Swiper('.catalog__slider--dargox .swiper', catalogSwiperOptopns);
});
