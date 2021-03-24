/**
 * Set of Javascript to creates responsive, accessible tables; most of this is
 * taken from Adrian Rosseli's https://adrianroselli.com/2017/11/a-responsive-accessible-table.html
 * But with some slight adaptations
 *
 */


export default class A11YTables{
    constructor(q = 'table'){
        this.query = q;
        this.tables = [];
    }

    init() {
        document.querySelectorAll(this.query).forEach((tbl, i) => {
            this.tables.push(new A11YTable(tbl, i));
        });
    }
}

class A11YTable{
    constructor(tbl, pos){
        console.log(this);
        this.table = tbl;
        this.pos = pos;
        this.stylesheet = null;
        if (this.table.tagName != "TABLE"){
            console.log('Not a table, bailing');
            return;
        }
        this.init();
    }

    get ariaRoles(){
        return {
            'tbody, thead, tfoot': 'rowgroup',
            'tr': 'row',
            'td': 'cell',
            'thead th': 'columnheader',
            'tbody tr th': 'rowheader'
        }
    }

    get headers(){
        return [...this.table.querySelectorAll('thead th')].map(th => th.innerText);
    }



    addARIA(){
        let _ = this;
        const setRole = (el, role) => {
            if (!el.getAttribute('role')) el.setAttribute('role', role);
        }
        setRole(this.table, 'table');
        for (const q in this.ariaRoles){
            const elements = [...this.table.querySelectorAll(q)];
            const role = _.ariaRoles[q];
            elements.forEach(el => {
                setRole(el, _.ariaRoles[q]);
                if (role == 'cell'){
                    _.handleCell(el);
                }
            });
        }
    }

    handleCell(cell){
        if (cell.innerText.trim().length == 0){
            cell.classList.add('empty-cell');
        }
        if (this.headers.length > 0){
            cell.setAttribute('data-value', this.headers[cell.cellIndex]);
        }
    }

    init(){
        if (!this.table.id) {
            this.table.id = `tbl_${this.pos}`;
        }
        this.addARIA();

    }
}