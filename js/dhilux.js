import LazyLoad from "./lazyload.js";
import Accordion from "./accordion.js";

let ll = new LazyLoad();
document.querySelectorAll('details').forEach(d => {
    new Accordion(d);
})