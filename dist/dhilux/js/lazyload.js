

"use strict"

export default class LazyLoad{
    constructor() {
        if ('loading' in HTMLImageElement.prototype){
            try{
                this.images = document.querySelectorAll('img[loading="lazy"]');
                this.images.forEach(img => {
                    let item = img.closest('.item');
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
                            img.src = noImg;
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
