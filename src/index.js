import Component from '@wide/modulus/lib/component'
import { seek } from '@wide/modulus'
import hotkeys from 'hotkeys-js'
import Swiper from 'swiper/esm/components/core/core-class'
import Navigation from 'swiper/esm/components/navigation/navigation'

/**
 * Default Swiper modules
 * @type {Object<Object>}
 */
export const DEFAULT_MODULES = {
  Navigation
}

/**
 * Default Swiper config
 * @type {Object<string, String>}
 */
export const DEFAULT_CONFIG = {
  loop: true,
  autoplay: true,
  spaceBetween: 40,
  slidesPerView: 3
}

/**
 * Default elements CSS classes
 * @type {Object<string, String>}
 */
export const DEFAULT_CLASSLIST = {
  prev:         'swiper-button-prev',
  next:         'swiper-button-next',
  pagination:   'swiper-pagination',
  bullets:      'swiper-pagination-bullet',
  bulletActive: 'swiper-pagination-bullet-active',
  slide:        'swiper-slide',
  slideVisible: 'swiper-slide-visible',
  slideActive:  'swiper-slide-active',
}

/**
 * Focusable element data attribute
 * @type {String}
 */
export const FOCUSABLE_DATA_ATTRIBUTE = 'data-focusable'

/**
 * Focusable element data attribute's value
 * @type {String}
 */
export const FOCUSABLE_DATA_ATTRIBUTE_VALUE = 1

/**
 * Non focusable element data attribute's value
 * @type {String}
 */
export const NON_FOCUSABLE_DATA_ATTRIBUTE_VALUE = 0

/**
 * Focusable element selector
 * @type {String}
 */
export const FOCUSABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Non focusable element selector
 * @type {String}
 */
export const NON_FOCUSABLE = `[${FOCUSABLE_DATA_ATTRIBUTE}="${NON_FOCUSABLE_DATA_ATTRIBUTE_VALUE}"]`


/**
 * Slider Component
 */
export default class Slider extends Component {


  /**
   * Initialize slider
   * @param {Object} opts
   * @param {Object<string, String>} opts.classlist
   * @param {Object} opts.config
   * @param {Object} opts.modules
   */
  run({ classlist = {}, config = {}, modules = {} } = {}) {
    /**
     * Swiper instance
     * @type {Swiper}
     */
    this.swiper = null

    /**
     * Wether the slider was touched by the used or not
     * @type {Boolean}
     */
    this.manualChange = false

    /**
     * Aria label for buttons and bullets
     * @type {Object<string, String>}
     */
    this.arialLabels = {
      prevSlide: this.dataset.prevslidemessage || 'Previous slide',
      nextSlide: this.dataset.nextslidemessage || 'Next slide',
      paginationBullet: this.dataset.paginationmessage || 'Go to slide',
      paginationBulletActive: this.dataset.currentslidemessage || '(current slide)'
    }

    /**
     * Swiper config
     * @type {Object}
     */
    this.config = Object.assign({}, DEFAULT_CONFIG, config)

    /**
     * Swiper modules
     */
    this.modules = Object.assign({}, DEFAULT_MODULES, modules)

    /**
     * Element's CSS classes
     * @type {Object<string, String>}
     */
    this.classlist = Object.assign({}, DEFAULT_CLASSLIST, classlist)

    /**
     * Control elements
     * @type {Object<string, HTMLElement>}
     */
    this.els = {
      prev: this.child(`.${this.classlist.prev}`),
      next: this.child(`.${this.classlist.next}`),
      pagin: this.child(`.${this.classlist.pagination}`),
      bullets: this.children(`.${this.classlist.bullets}`)
    }

    // override config with dataset
    if(this.dataset.slidesPerView) {
      this.config.slidesPerView = parseInt(this.dataset.slidesPerView)
    }
    if(this.dataset.spaceBetween) {
      this.config.spaceBetween = parseInt(this.dataset.spaceBetween)
    }

    // Set the focusable elements by excluding the non-focusable elements
    this.focusablesSelector = FOCUSABLES.split(',').map(f => `${f}:not(${NON_FOCUSABLE})`.trim())

    // Handle accessibility
    this.handleAccessibility()

    // instanciate slider
    this.createSlider()
    this.enableKeyboardNav()
    this.flagManualChange()
    this.onSlideChange()

    // sync with another instance
    this.swiper.on('init', () => this.syncControl())

    // compute visibility and focus on slide change
    this.swiper.on('transitionEnd', () => this.onSlideChange())
  }


  /**
   * Handle focusable elements
   */
  handleAccessibility() {
    const nonFocusables = this.children(NON_FOCUSABLE)
    for (let j = 0; j < nonFocusables.length; j++) {
      nonFocusables[j].setAttribute('aria-hidden', true)
      nonFocusables[j].setAttribute('tabindex', -1)
    }
  }


  /**
   * Instanciate Swiper
   */
  createSlider() {
    // set default necessary config values
    this.config.watchSlidesVisibility = true
    this.config.navigation = this.config.navigation || {
      prevEl: `.${this.classlist.prev}`,
      nextEl: `.${this.classlist.next}`
    }
    this.config.pagination = this.config.pagination || {
      el: `.${this.classlist.pagination}`,
      type: 'bullets',
      bulletElement: 'button',
      clickable: true
    }
    this.config.a11y = this.config.a11y || {
      prevSlideMessage: this.arialLabels.prevSlide,
      nextSlideMessage: this.arialLabels.nextSlide,
      paginationBulletMessage: this.arialLabels.paginationBullet + ' {{index}}'
    }

    // set Swiper modules
    Swiper.use(Object.values(this.modules))

    // instanciate with config
    this.swiper = new Swiper(this.el, this.config)
  }


  /**
   * Overide keyboard navigation (swiper's native has too many issues)
   */
  enableKeyboardNav() {
    hotkeys('left,right', (e, { key }) => {
      if (this.el === e.target || this.el.contains(e.target)) {
        this.manualChange = true
        if (key === 'left') this.swiper.slidePrev()
        if (key === 'right') this.swiper.slideNext()
      }
    })
  }


  /**
   * Sync with another swiper
   */
  syncControl() {
    if(this.dataset.sync && !this.swiper.params.controller) {
      const other = seek(this.name, this.dataset.sync)
      if(other) {
        this.swiper.params.controller = { control: other.swiper }
      }
    }
  }


  /**
   * Re-affect visibility and focus for accessibility purpose
   */
  onSlideChange() {
    // set aria-hidden and tabindex
    const slides = this.children(`.${this.classlist.slide}`)
    for(let i = 0; i < slides.length; i++) {

      // to slide
      const slide = slides[i]
      // Set aria hidden
      const isVisible = slide.classList.contains(this.classlist.slideVisible)
      slide.setAttribute('aria-hidden', !isVisible)
      // Set tabindex if slide is focusable
      const slideFocusableAttribute = slide.getAttribute(FOCUSABLE_DATA_ATTRIBUTE)
      const isSlideFocusable = slideFocusableAttribute && slideFocusableAttribute == FOCUSABLE_DATA_ATTRIBUTE_VALUE
      if (isSlideFocusable) {
        slide.setAttribute('tabindex', isVisible ? 0 : -1)
      }

      // and to its focusable content
      const focusables = slides[i].querySelectorAll(this.focusablesSelector)
      for (let j = 0; j < focusables.length; j++) {
        focusables[j].setAttribute('aria-hidden', !isVisible)
        focusables[j].setAttribute('tabindex', isVisible ? 0 : -1)
      }
    }

    // set focus on active slide
    if(this.manualChange) {
      this.el.querySelector(`.${this.classlist.slideActive}`).focus()
      this.manualChange = false
    }

    // set pagin bullet label
    for(let i = 0; i < this.els.bullets.length; i++) {
      const label = this.els.bullets[i].classList.contains(this.classlist.bulletActive)
        ? `${this.arialLabels.paginationBullet} ${i+1} ${this.arialLabels.paginationBulletActive}`
        : `${this.arialLabels.paginationBullet} ${i+1}`
      this.els.bullets[i].setAttribute('aria-label', label)
    }
  }


  /**
   * Set manual change flag on specific actions
   */
  flagManualChange() {
    this.swiper.on('touchEnd', e => this.manualChange = true)
    for (let prop in this.els) {
      if (this.els[prop] instanceof HTMLElement) {
        this.els[prop].addEventListener('click', e => this.manualChange = true)
      }
    }
  }

}
