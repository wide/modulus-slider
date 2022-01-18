# Modulus Slider

Enhanced slider component, based on `Swiper`, to be used with `@wide/modulus`.


## Install

```
npm install @wide/modulus-slider --save
```


## Usage

Register this component using `Modulus`:
```js
import modulus from '@wide/modulus'
import Slider from '@wide/modulus-slider'

modulus.component('slider', Slider)
```

Import base `scss` styles (contains `Swiper` styles):
```scss
@use '@wide/modulus-slider';
/**
 * Add pagination module for this example
 * @tutorial https://swiperjs.com/swiper-api#modules
 */
@use 'node_modules/swiper/modules/pagination/pagination.scss';
```

And use the provided `twig` template:
```html
{% include '@wide::modulus-slider' with {
  webcomponent: true,
  slides: [
    'Some HTML',
    'Some HTML again'
  ],
  pagination: true,
  dataset: {
    sync: '#slider2'
  }
} %}
```

Or build your own `html`:
```html
<div class="slider swiper" is="slider" data-sync="#slider2">
    <div class="swiper-wrapper">
        <div class="slider_slide swiper-slide">
            Some HTML
        </div>
        <div class="slider_slide swiper-slide">
            Some HTML again
        </div>
    </div>
    <div class="slider_pagination swiper-pagination"></div>
</div>
```


## Advanced usage

Extend the `Slider` class and change the configuration (see [Swiper API](https://swiperjs.com/swiper-api)):
```js
import modulus from '@wide/modulus'
import Slider from '@wide/modulus-slider'
/**
 * Add pagination module for this example
 * @tutorial https://swiperjs.com/swiper-api#modules
 */
import { Pagination } from 'swiper'

modulus.component('slider', class extends Slider {
    run() {
        const config = {
          slidesPerView: 1,
          modules: [ Pagination ]
        }
        super.run({ config })
    }
}
```


## Libraries

This package uses :
- [`hotkeys-js`](https://github.com/jaywcjlove/hotkeys)
- [`swiper`](https://github.com/nolimits4web/swiper)


## Authors

- **Aymeric Assier** - [github.com/myeti](https://github.com/myeti)
- **Julien Martins Da Costa** - [github.com/jdacosta](https://github.com/jdacosta)
- **Sébastien Robillard** - [github.com/robiseb](https://github.com/robiseb)


## License

This project is licensed under the MIT License - see the [licence](licence) file for details