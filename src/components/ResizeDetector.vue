<template>
  <div class="resize-detector" tabindex="-1"></div>
</template>

<script>

function getInternetExplorerVersion () {
  const ua = window.navigator.userAgent
  
	const msie = ua.indexOf('MSIE ')
	if (msie > 0) {
		// IE 10 or older => return version number
		return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
  }
  
	const trident = ua.indexOf('Trident/')
	if (trident > 0) {
		// IE 11 => return version number
		const rv = ua.indexOf('rv:')
		return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
	}

	const edge = ua.indexOf('Edge/')
	if (edge > 0) {
		// Edge (IE 12+) => return version number
		return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
	}

	// other browser
	return -1
}
const isIE = getInternetExplorerVersion() !== -1

export default {
  name: 'ResizeDetector',
  mounted () {
    this.$nextTick(() => {
			this._w = this.$el.offsetWidth
			this._h = this.$el.offsetHeight
		})
		const object = document.createElement('object')
		this._resizeObject = object
		object.setAttribute('aria-hidden', 'true')
		object.setAttribute('tabindex', -1)
		object.onload = this.addResizeHandlers
		object.type = 'text/html'
		if (isIE) {
			this.$el.appendChild(object)
		}
		object.data = 'about:blank'
		if (!isIE) {
			this.$el.appendChild(object)
		}
  },
  beforeDestroy () {
    this.removeResizeHandlers()
  },
  methods: {
    compareAndNotify () {
			if (this._w !== this.$el.offsetWidth || this._h !== this.$el.offsetHeight) {
				this._w = this.$el.offsetWidth
        this._h = this.$el.offsetHeight
				this.$emit('resize')
			}
		},
		addResizeHandlers () {
			this._resizeObject.contentDocument.defaultView.addEventListener('resize', this.compareAndNotify)
			this.compareAndNotify()
		},
		removeResizeHandlers () {
			if (this._resizeObject && this._resizeObject.onload) {
				if (!isIE && this._resizeObject.contentDocument) {
					this._resizeObject.contentDocument.defaultView.removeEventListener('resize', this.compareAndNotify)
				}
				delete this._resizeObject.onload
			}
		}
  }
}
</script>

<style scoped>
.resize-detector,
.resize-detector >>> object {
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
  border: none;
  padding: 0;
  margin: 0;
  opacity: 0;
	pointer-events: none;
	z-index: -1000;
  background: transparent;
}
</style>