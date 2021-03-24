# dhilux
## /dəˈləks/

Set of helper styles and scripts for front-end development at the DHIL @ SFU.

## How to get 

Download using yarn

```
yarn add https://github.com/joeytakeda/dhilux
```

*Note*: There is one dependency: modularscale.

## How to use 

There are two main directories:
* `scss`
* `js`

### `scss`

Contains a number of helper functions and utilities

### `js`

* `Accordion` (`accordion.js`): A progressive enhancement for HTML `details` element, adapted from 
https://css-tricks.com/how-to-animate-the-details-element-using-waapi/ and modified slightly. To use
accordion, pass each `details` element to the constructor:

```
import Accordion from "accordion.js";

document.querySelectorAll('details').map(el => new Accordion(el))
```

* `LazyLoad` (`lazyload.js`): A progressive enhancement for `img[loading='lazy']` that adds a class
to a container element if an element has loaded (if the browser supports lazy loading).

To use:

```
import LazyLoad from "lazyload.js";
let sloth = new LazyLoad();

// Optional: add a default img if things fail or can't be loaded. Default: null
sloth.noImg = 'path/to/my/default/img.jpg';

//The parent selector on which to hook the loaded class; default: .item
sloth.parentSelector = "div.parent";

```

* A11Y Tables

Taken from https://adrianroselli.com/2017/11/a-responsive-accessible-table.html 
with some small modifications.

To use:

```
    import A11YTables from "a11y_tables.js";
    let accessibleTables = new A11YTables;
    accessibleTables.init();
```

Note you *must* include the associated SCSS stylesheet.

Both of these components have associated SCSS modules `scss/components/_accordion.scss` 
and `scss/components/_lazyload.scss`.

