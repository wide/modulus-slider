import Component from '@wide/modulus/lib/component'
import { seek } from '@wide/modulus'
import hotkeys from 'hotkeys-js'
import Swiper from 'swiper'


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
 * Focusable element selector
 * @type {String}
 */
export const FOCUSABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'


/**
 * Slider Component
 */
export default class Slider extends Component {


  /**
   * Initialize slider
   * @param {Object} opts
   * @param {Object} opts.config 
   * @param {Object<string, String>} opts.classlist 
   */
  run({ classlist, config } = {}) {

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
    this.config = Object.assign(DEFAULT_CONFIG, config)

    /**
     * Element's CSS classes
     * @type {Object<string, String>}
     */
    this.classlist = Object.assign(DEFAULT_CLASSLIST, classlist)

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
      const isVisible = slides[i].classList.contains(this.classlist.slideVisible)
      slides[i].setAttribute('aria-hidden', !isVisible)
      slides[i].setAttribute('tabindex', isVisible ? 0 : -1)

      // and to its focusable content
      const focusables = slides[i].querySelectorAll(FOCUSABLES)
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
