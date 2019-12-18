const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

const isArray = obj => {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

const _inner = Symbol('_inner')
const _outer = Symbol('_outer')
const _handler = Symbol('_handler')
const _callback = Symbol('_callback')

/**
 * Call the callback function on click out of element
 */
class ClickOutside {
  constructor (inner, outer, callback) {
    this[_inner] = inner || []
    this[_outer] = outer || window.document
    this[_callback] = typeof callback === 'function' ? callback : () => {}
    this[_handler] = function (e) {
      try {
        if (!isArray(this[_inner]) || !e.target) return
        for (let i = 0; i < this[_inner].length; i++) {
          if (!this[_inner][i] || !this[_inner][i].contains || this[_inner][i].contains(e.target)) return
        }
        this[_callback](e.target)
      } catch (error) {
        throw error
      }
    }.bind(this)
  }
  bind () {
    on(this[_outer], 'mouseup', this[_handler])
  }
  unbind () {
    off(this[_outer], 'mouseup', this[_handler])
  }
  update (callback) {
    typeof callback === 'function' ? this[_callback] = callback : ''
  }
}

export default ClickOutside
