

/**
 * Adds a sticky-change event for all sticky elements
 * A simplified and refactored version of
 * Eric Bidelman's example here: https://developers.google.com/web/updates/2017/09/sticky-headers
 *
 * @author Joey Takeda
 *
 */

"use strict";

export default class StickyElements{
    constructor(selector = '.sticky') {
        this.selector = selector;
        this.sentinelCSS =  {
            "position": "relative",
            "left": 0,
            "right": 0,
            "height":"1px",
            "margin-bottom": "-1px",
            "visibility": "hidden"
        }
        try {
            this.init();
        } catch(e){
            console.log(`StickyElements: Error: ${e}`);
        }
    }

    /**
     * Getter to return all of the sticky elements
     * @returns {Array[Element]}
     */
    get els(){
        return [...Array.from(document.querySelectorAll(this.selector))]
            .filter(el => window.getComputedStyle(el).position == 'sticky');
    }

    /**
     * Initialization function
     */
    init(){
        if (this.els.length === 0){
            console.log(`StickyElements: No elements found with selector ${this.selector}`);
            return;
        }
        this.setup();
        this.listen();
    }

    /**
     * Sets up everything
     */

    setup(){
        this.addCSS();
        for (const el of this.els){
            this.observe(el);
        }
    }

    /**
     * Adds CSS to the document
     */

    addCSS(){
        let stylesheets = window.document.styleSheets;
        let last = stylesheets[stylesheets.length - 1];
        // Map the this.sentinelCSS object to a proper CSS string
        let str = Object.entries(this.sentinelCSS)
            .map(([key, value])=> `${key}:${value}`)
            .join(';');
        last.addRule('.sentinel', str);
    }

    /**
     * Create the sentinel for the IntersectionObserver to observe
     * to see whether it crosses the boundary; note that this
     * only works for top
     * @param {Element} el
     */

    observe(el){
        const sentinel = this.addSentinel(el);
        const observer = new IntersectionObserver((records, observer) => {
            for (const record of records) {
                const targetInfo = record.boundingClientRect;
                const rootBoundsInfo = record.rootBounds;
                if (targetInfo.bottom < rootBoundsInfo.top) {
                    this.fire(true, el);
                }

                if (targetInfo.bottom >= rootBoundsInfo.top &&
                    targetInfo.bottom < rootBoundsInfo.bottom) {
                    this.fire(false, el);
                }
            }
        }, {
            threshold: [0],
            root: this._getScrollableParent(el)
        });
        observer.observe(sentinel);
    }


    /**
     * Adds a sentinel beside the element we want to look at,
     * and returns it for later use
     * @param el
     * @returns {Element}
     */
    addSentinel(el){
        const sentinel = document.createElement('div');
        sentinel.classList.add('sentinel');
        let elStyle = window.getComputedStyle(el);
        // Position this above the preceding element
        sentinel.style.top = `calc(-1* (${elStyle.top} + ${elStyle.height} + 1px))`;
        // Return the element itself
        return el.insertAdjacentElement('afterend',sentinel);
    }

    /**
     * Set up the document listener to listen to the sticky-change event
     */
    listen() {
        document.addEventListener('sticky-change', this.stickyChangeListener);
    }

    /**
     * Add a listener for the event for the entire document
     * @param e
     */
    stickyChangeListener(e){
        // Update sticking header title.
        const [el, stuck] = [e.detail.target, e.detail.stuck];
        el.classList.toggle('stuck', stuck);
    }


    /**
     * Dispatches a `sticky-event` custom event on the element.
     * @param {boolean} stuck
     * @param {!Element} target Target element of event.
     */
    fire(stuck, target) {
        const evt = new CustomEvent('sticky-change', {detail: {stuck, target}});
        document.dispatchEvent(evt);
    }

    /**
     * Private method for returning the scrollable parent (i.e. container) for an element.
     * Inspired by: https://github.com/olahol/scrollparent.js/blob/master/scrollparent.js#L13
     * @param {!Element} el
     * @return {!Element | null} null for the viewport or the parent node
     */
    _getScrollableParent(el){
        return (! el || el === document.body) ? null : (this._isScrollable(el) ? el: this._getScrollableParent(el.parentElement));
    }

    /**
     * Private method for determining if an element is scrollable
     * Inspired by: https://github.com/olahol/scrollparent.js/blob/master/scrollparent.js#L13
     * @param {!Element} el
     * @return {boolean}
     */
    _isScrollable(el){
        const hasScrollableContent = el.scrollHeight > el.clientHeight;
        const overflowYStyle = window.getComputedStyle(el).overflowY;
        const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;
        return hasScrollableContent && ! isOverflowHidden;
    }

}