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
```

And use the provided `twig` template:
```html
{% include '@wide::modulus-slider' with {
  slides: [
    'Some HTML',
    'Some HTML again'
  ],
  sync: '#slider2'
} %}
```

Or build your own `html`:
```html
<div class="slider swiper-container" is="slider" data-sync="#slider2">
    <div class="swiper-wrapper">
        <div class="slider_slide swiper-slide">
            Some HTML
        </div>
        <div class="slider_slide swiper-slide">
            Some HTML again
        </div>
    </div>
</div>
```


## Advanced usage

Extend the `Slider` class and change the configuration (see [Swiper docs](https://swiperjs.com)):
```js
import Slider from '@wide/modulus-slider'

class MySlider extends Slider {

    run() {
        super.run({
            slidesPerView: 1
        })
    }

}
```

Or programmatically instanciate a slider:
```js
import Slider from '@wide/modulus-slider'

const slider = Slider.create(el, name, {
    slidesPerView: 1
}) 
```


## Libraries

This package uses :
- [`hotkeys-js`](https://github.com/jaywcjlove/hotkeys)
- [`swiper`](https://github.com/nolimits4web/swiper)


## Authors

- **Aymeric Assier** - [github.com/myeti](https://github.com/myeti)
- **Julien Martins Da Costa** - [github.com/jdacosta](https://github.com/jdacosta)


## License

This project is licensed under the MIT License - see the [licence](licence) file for details