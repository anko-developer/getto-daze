import { memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import styles from './Banner.module.scss';
import 'swiper/css';

export default memo(function Banner() {
  return (
    <Swiper
      loop
      autoplay={{
        delay: 5000,
        // disableOnInteraction: false,
      }}
      pagination={{
        type: 'fraction',
        el: '.custom-pagination',
      }}
      navigation={true}
      modules={[Pagination, Navigation, Autoplay]}
      className="mb-[20px]"
    >
      <SwiperSlide className={'!h-[200px] !bg-[#f9a825]'}>배너 1</SwiperSlide>
      <SwiperSlide className={'!h-[200px] !bg-[#ffd200]'}>배너 2</SwiperSlide>

      <div className={`custom-pagination ${styles.pagination}`} />
    </Swiper>
  );
});
