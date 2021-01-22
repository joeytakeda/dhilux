"use strict"
/*
  * Progressive enhancement for browser-based lazy loading;
  *
  *
 */
export default class LazyLoad{
    constructor() {
        //Default, but can be a src.
        this.noImg = null;
        // Selector for the parent item to use to attach the class
        this.parentSelector = '.item';
        if ('loading' in HTMLImageElement.prototype){
            try{
                this.images = document.querySelectorAll('img[loading="lazy"]');
                this.images.forEach(img => {
                    let item = img.closest(this.parentSelector);
                    if (!img.complete) {
                        item.classList.add('loading');
                        img.addEventListener('load',  e => {
                            item.classList.add('loaded');
                        });
                        img.addEventListener('error', e=> {
                            console.log('Image ' + img.src + ' failed to load.');
                            item.classList.add('loaded');
                            item.classList.add('error');
                            img.classList.add('placeholder');
                            if (this.noImg !== null){
                                img.src = this.noImg;
                            }
                        })
                    }
                });
            }
            catch(e){
                console.log(`Error: ${e}`);
            }

        }
    }
}
