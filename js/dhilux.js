import LazyLoad from "./lazyload.js";
import Accordion from "./accordion.js";
import Modals from "./modals.js";
import A11YTables from "./a11y_tables.js";

let ll = new LazyLoad();
document.querySelectorAll('details').forEach(d => {
    new Accordion(d);
})
