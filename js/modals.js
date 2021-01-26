/**
 * Module for creating modals for the DHIL
 * @author Joey Takeda
 */

'use strict';

/** Requires the dialog polyfill from google */
import dialogPolyfill from '../lib/dialog-polyfill/dist/dialog-polyfill.esm.js'

/** Class for creating modals */
export default class Modals {
    /** DOM parser */
    parser = new DOMParser();
    /** Index to store retrieved fragments */
    index = new Map();
    /** Constructs the set of modals to use from the selector */
    constructor(selector) {
        this.selector = selector;
        this.links = this.getLinks();
    }

    getLinks(){
        return [...Array.from(document.querySelectorAll(this.selector)).filter(this.linkFilter)]
    }

    /**
     * Set the click event for each link
     *
     * @returns null
     */
    init(){
        for (const link of this.links){
            console.log(link);
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
        let link = e.currentTarget;
        try{
            e.preventDefault();
            this.current = await this.getDialog(link);
            this.current.showModal();
        } catch(err){
            this.errorHandler(err);
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
                    // Register the dialog if necessary
                    dialogPolyfill.registerDialog(dialog);
                    document.body.appendChild(dialog);
                    this.index.set(uri, dialog);
                    return resolve(dialog);
                })
                .catch(this.errorHandler);
        });
    }

    /**
     * Retrieves the dialog from the text response
     *
     * @param text - String response
     * @returns {HTMLDialogElement|void}
     */
    getDialogFromText(text){
        let DOM = this.parser.parseFromString(text, 'text/html');
        let dialog = DOM.querySelector('dialog');
        return this.processDialog(dialog);
    }

    /**
     * Filters sets of links. By default, it only returns links that
     * end with digits
     *
     * @param {HTMLAnchorElement} link - The link to use
     * @returns {boolean}
     */
    linkFilter(link){
        return /\d+\/?$/.test(link.getAttribute('href'));
    }

    /**
     * Processes the dialog element; by default, this does nothing
     * but can be used to add event listeners etc.
     *
     * @param dialog
     * @returns {HTMLDialogElement}
     */
    processDialog(dialog){
        return dialog;
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
        return;
    }
}