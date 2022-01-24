/*!
 * chartjs-chart-matrix v1.0.2
 * https://chartjs-chart-matrix.pages.dev/
 * (c) 2021 Jukka Kurkela
 * Released under the MIT license
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(require('chart.js'), require('chart.js/helpers'))
        : typeof define === 'function' && define.amd
        ? define(['chart.js', 'chart.js/helpers'], factory)
        : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self),
          factory(global.Chart, global.Chart.helpers))
})(this, (Chart, helpers) => {
    function _interopDefaultLegacy(e) {
        return e && typeof e === 'object' && 'default' in e ? e : { default: e }
    }

    const Chart__default = /* #__PURE__ */ _interopDefaultLegacy(Chart)

    const version = '1.0.2'

    class MatrixController extends Chart.DatasetController {
        initialize() {
            this.enableOptionSharing = true
            super.initialize()
        }

        update(mode) {
            const me = this
            const meta = me._cachedMeta

            me.updateElements(meta.data, 0, meta.data.length, mode)
        }

        updateElements(rects, start, count, mode) {
            const me = this
            const reset = mode === 'reset'
            const { xScale, yScale } = me._cachedMeta
            const firstOpts = me.resolveDataElementOptions(start, mode)
            const sharedOptions = me.getSharedOptions(mode, rects[start], firstOpts)

            for (let i = start; i < start + count; i++) {
                const parsed = !reset && me.getParsed(i)
                const x = reset ? xScale.getBasePixel() : xScale.getPixelForValue(parsed.x)
                const y = reset ? yScale.getBasePixel() : yScale.getPixelForValue(parsed.y)
                const options = me.resolveDataElementOptions(i, mode)
                const { width, height, anchorX, anchorY } = options
                const properties = {
                    x: anchorX === 'left' ? x : x - width / (anchorX === 'right' ? 1 : 2),
                    y: anchorY === 'top' ? y : y - height / (anchorY === 'bottom' ? 1 : 2),
                    width,
                    height,
                    options
                }
                me.updateElement(rects[i], i, properties, mode)
            }

            me.updateSharedOptions(sharedOptions, mode)
        }

        draw() {
            const me = this
            const data = me.getMeta().data || []
            let i
            let ilen

            for (i = 0, ilen = data.length; i < ilen; ++i) {
                data[i].draw(me._ctx)
            }
        }
    }

    MatrixController.id = 'matrix'

    MatrixController.version = version

    MatrixController.defaults = {
        dataElementType: 'matrix',

        animations: {
            numbers: {
                type: 'number',
                properties: ['x', 'y', 'width', 'height']
            }
        },
        anchorX: 'center',
        anchorY: 'center'
    }

    MatrixController.overrides = {
        interaction: {
            mode: 'nearest',
            intersect: true
        },

        scales: {
            x: {
                type: 'linear',
                offset: true
            },
            y: {
                type: 'linear',
                reverse: true
            }
        }
    }

    /**
     * Helper function to get the bounds of the rect
     * @param {MatrixElement} rect the rect
     * @param {boolean} [useFinalPosition]
     * @return {object} bounds of the rect
     * @private
     */
    function getBounds(rect, useFinalPosition) {
        const { x, y, width, height } = rect.getProps(
            ['x', 'y', 'width', 'height'],
            useFinalPosition
        )
        return { left: x, top: y, right: x + width, bottom: y + height }
    }

    function limit(value, min, max) {
        return Math.max(Math.min(value, max), min)
    }

    function parseBorderWidth(rect, maxW, maxH) {
        const value = rect.options.borderWidth
        let t
        let r
        let b
        let l

        if (helpers.isObject(value)) {
            t = +value.top || 0
            r = +value.right || 0
            b = +value.bottom || 0
            l = +value.left || 0
        } else {
            t = r = b = l = +value || 0
        }

        return {
            t: limit(t, 0, maxH),
            r: limit(r, 0, maxW),
            b: limit(b, 0, maxH),
            l: limit(l, 0, maxW)
        }
    }

    function boundingRects(rect) {
        const bounds = getBounds(rect)
        const width = bounds.right - bounds.left
        const height = bounds.bottom - bounds.top
        const border = parseBorderWidth(rect, width / 2, height / 2)

        return {
            outer: {
                x: bounds.left,
                y: bounds.top,
                w: width,
                h: height
            },
            inner: {
                x: bounds.left + border.l,
                y: bounds.top + border.t,
                w: width - border.l - border.r,
                h: height - border.t - border.b
            }
        }
    }

    function inRange(rect, x, y, useFinalPosition) {
        const skipX = x === null
        const skipY = y === null
        const bounds = !rect || (skipX && skipY) ? false : getBounds(rect, useFinalPosition)

        return (
            bounds &&
            (skipX || (x >= bounds.left && x <= bounds.right)) &&
            (skipY || (y >= bounds.top && y <= bounds.bottom))
        )
    }

    class MatrixElement extends Chart.Element {
        constructor(cfg) {
            super()

            this.options = undefined
            this.width = undefined
            this.height = undefined

            if (cfg) {
                Object.assign(this, cfg)
            }
        }

        draw(ctx) {
            const { options } = this
            const { inner, outer } = boundingRects(this)

            ctx.save()

            if (outer.w !== inner.w || outer.h !== inner.h) {
                ctx.beginPath()
                ctx.rect(outer.x, outer.y, outer.w, outer.h)
                ctx.clip()
                ctx.rect(inner.x, inner.y, inner.w, inner.h)
                ctx.fillStyle = options.backgroundColor
                ctx.fill()
                ctx.fillStyle = options.borderColor
                ctx.fill('evenodd')
            } else {
                ctx.fillStyle = options.backgroundColor
                ctx.fillRect(inner.x, inner.y, inner.w, inner.h)
            }

            ctx.restore()
        }

        inRange(mouseX, mouseY, useFinalPosition) {
            return inRange(this, mouseX, mouseY, useFinalPosition)
        }

        inXRange(mouseX, useFinalPosition) {
            return inRange(this, mouseX, null, useFinalPosition)
        }

        inYRange(mouseY, useFinalPosition) {
            return inRange(this, null, mouseY, useFinalPosition)
        }

        getCenterPoint(useFinalPosition) {
            const { x, y, width, height } = this.getProps(
                ['x', 'y', 'width', 'height'],
                useFinalPosition
            )
            return {
                x: x + width / 2,
                y: y + height / 2
            }
        }

        tooltipPosition() {
            return this.getCenterPoint()
        }

        getRange(axis) {
            return axis === 'x' ? this.width / 2 : this.height / 2
        }
    }

    MatrixElement.id = 'matrix'
    MatrixElement.defaults = {
        backgroundColor: undefined,
        borderColor: undefined,
        borderWidth: undefined,
        anchorX: undefined,
        anchorY: undefined,
        width: 20,
        height: 20
    }

    Chart__default.default.register(MatrixController, MatrixElement)
})
