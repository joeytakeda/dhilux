/**
 * Module for creating modals for the DHIL
 * @author Joey Takeda
 */

'use strict';

/** Requires the dialog polyfill from google */
import dialogPolyfill from '../lib/dialog-polyfill/dist/dialog-polyfill.esm.js'

let _;
const parser = new DOMParser();
const body = document.body;

/** Class for creating modals */
export default class Modals {
    /** Constructs the set of modals to use from the selector */
    constructor(selector) {
        this.selector = selector;
        /** Index to store retrieved fragments */
        this.el = body;
        this.index = new Map();
        this.debug = false;
        this.linkClass = 'modal-link';
        this.ignoreIndexes = true;
        this.observerConfig =  {
            attributes:true,
            childList:false,
            subtree:false
        };
        this.observer = new MutationObserver(this.checkDialog.bind(this));
        this.active = false;
        this.backdropClose = true;
        this.filterParentsSelector = null;
        this.fetching = false;
    }

    // Getters
    get links(){
        let allLinks = this.el.querySelectorAll(this.selector);
        let filtered = Array.from(allLinks).filter(this.defaultLinkFilter.bind(this));
        return filtered;
    }

    get dialogs(){
        let values = [];
        this.index.forEach((v, k, m) => values.push(v))
        return [...values];
    }

    // Methods

    /**
     * Set the click event for each link
     *
     * @returns null
     */
    init(){
        _ = this;
        window.Modals = this;
        this.log(this);
        for (const link of this.links){
            this.log(link)
            link.classList.add(this.linkClass);
            link.addEventListener('click', this.clickHandler.bind(this));
        }
    }

    /**
     * Handles click event for any modal link
     *
     * @param {Object} e - The event object
     * @returns {Promise<void>}
     */
    async clickHandler(e){
        this.caller = e.currentTarget;
        try{
            e.preventDefault();
            // Don't do anything if we're already fetching
            if (this.fetching){
                console.log(`Tried to fetch again, so blocking `);
                return;
            }
            this.fetching = true;
            this.current = await this.getDialog(this.caller);
            this.observer.observe(this.current, this.observerConfig);
            this.current.showModal();
            this.fetching = false;
        } catch(err){
            this.errorHandler(err).bind(this);
        }
    }

    /**
     * Retrieves the fragment either from the index or by fetching
     * the content externally
     *
     * @param {HTMLAnchorElement} link - The link for that modal
     * @returns {Promise<HTMLDialogElement|void>}
     */
    async getDialog(link){
        let uri = this.modalURI(link);
        return new Promise( (resolve, reject) => {
            if (this.index.has(uri)) {
                return resolve(this.index.get(uri));
            }
            fetch(uri)
                .then(response => response.text())
                .then(text => {
                    let dialog = this.getDialogFromText(text);
                    this.processDialog(dialog);
                    // Register the dialog if necessary
                    dialogPolyfill.registerDialog(dialog);
                    if (!(typeof dialog.close === 'function')){
                        dialog.close = function(){
                            dialog.querySelector("form[method='close']").submit();
                        }
                    }
                    document.body.appendChild(dialog);
                    this.index.set(uri, dialog);
                    return resolve(dialog);
                })
                .catch(this.errorHandler.bind(this));
        });
    }

    /**
     * Retrieves the dialog from the text response
     *
     * @param text - String response
     * @returns {HTMLDialogElement|void}
     */
    getDialogFromText(text){
        let DOM = parser.parseFromString(text, 'text/html');
        let dialog = DOM.querySelector('dialog');
        return dialog
    }

    checkDialog(mutations){
        for (const mutation of mutations){
            if (mutation.attributeName === 'open'){
                this.active = !this.active;
                this.toggle();
            }
        }
    }

    toggle(){
        // Toggle the aux classes for scrolling stuff
        body.classList.toggle('dialog-active');
        this.caller.classList.toggle('active');
        // Set the event listener on the document to close on backdrop
        if (this.active){
            if (this.backdropClose) body.addEventListener('click', this.bodyClickHandler, true);
            return;
        }
        if (this.backdropClose) body.removeEventListener('click', this.bodyClickHandler, true);
        this.observer.disconnect();
        this.caller = null;
    }

    bodyClickHandler(e){
        // We can't bind this to the bodyClickHandler so that it can be removed,
        // so use the Window.modals object (also known as _);
        let el = (typeof e.path === 'object') ? e.path[0] : e.target;
        if (el === _.current){
            _.current.close();
        }
    }

    /**
     * Filters sets of links. By default, it only returns links that
     * end with digits
     *
     * @param {HTMLAnchorElement} link - The link to use
     * @returns {boolean}
     */
    defaultLinkFilter(link){


        if (this.filterParentsSelector !== null){
            if (link.closest(this.filterParentsSelector) !== null){
                 return false;
            }
        }

        if (typeof this.linkFilter === 'function'){
            console.log(this.linkFilter(link));
            if (!this.linkFilter(link)){
                return false;
            };
        }

        return /\d+\/?$/.test(link.getAttribute('href'));


    }

    /**
     * Processes the dialog element; by default, this removes an open attribute
     * (if it exists) but otherwise does nothing else
     *
     * @param dialog
     * @returns {null}
     */
    processDialog(dialog){
        if (dialog.hasAttribute('open')){
            dialog.removeAttribute('open');
        }
    }

    /**
     * Utility function to retrieve get the URI for the modal
     *
     * @param link
     * @returns {string}
     */
    modalURI(link){
        return link.getAttribute('href') + '/modal';
    }

    /**
     * Error handling function
     *
     * @param err
     * @returns void
     */
    errorHandler(err){
        console.trace(err);
        window.location = this.caller.href;
    }


    log(msg){
        if (this.debug){
            console.log(msg);
        }
    }
}

