 /*! Vance Auto Sales Vehicle Gallery v1.0
 * https://vanceauto.com
 * Copyright 2016 Vance Auto Sales; Licensed Apache 2.0 */
 /*! lightgallery - v1.2.21 - 2016-06-28
 * http://sachinchoolur.github.io/lightGallery/
 * Copyright (c) 2016 Sachin N; Licensed Apache 2.0 */
$('#vehicle-gallery').lightGallery({
  selector: '.gallery',
  thumbnail: false,
  animateThumb: false,
  showThumbByDefault: false,
  mode: 'lg-slide',
  loop: true,
  hideControlOnEnd: true,
  getCaptionFromTitleOrAlt: false,
  download: false,
  counter: true
});
