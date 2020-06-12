import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};

  constructor(
    header,
    {
      data = [],
      sorting = {
        _sort: 'title',
        _order: 'asc',
        _start: 0,
        _end: 30,
      },
      url = 'api/rest/products'
    } = {}) {
    this.header = header;
    this.data = data;
    this.sorting = sorting;
    this.url = `${BACKEND_URL}/${url}`;
    this.query = `?_sort=${this.sorting._sort}&_order=${this.sorting._order}&_start=${this.sorting._start}&_end=${this.sorting._end}`;

    this.render();
    this.initEventListeners();
  }

  addTableLoadingCss() {
    this.element.classList.add('sortable-table_loading');
    this.subElements.body.innerHTML = '';
  }

  removeTableLoadingCss(response) {
    this.element.classList.remove('sortable-table_loading');
    this.subElements.body.innerHTML = this.getTableRows(response);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((sum, subElement) => {
      sum[subElement.dataset.element] = subElement;
      return sum;
    }, {});
  }

  sortOnServer(event) {
    const target = event.target.closest('[data-sortable="true"]');
    if(target) {
      const {name, order} = target.dataset;
      const sortedArrow = target.querySelector(".sortable-table__sort-arrow");
      target.dataset.order = order === 'asc' ? 'desc' : 'asc';

      if(!sortedArrow) {
        target.append(this.subElements.arrow);
      }

      this.sorting._sort = name;
      this.sorting._order = target.dataset.order;

      this.query = `?_sort=${this.sorting._sort}&_order=${this.sorting._order}&_start=${this.sorting._start}&_end=${this.sorting._end}`;
      this.fetchData(this.url + this.query);
    }
  }

  get tableHeader() {
    return '<div data-element="header" class="sortable-table__header sortable-table__row">' +
              this.header.map( (item) => this.tableHeaderRow(item) ).join("") +
           '</div>';
  }

  tableHeaderRow(row) {
    const {id, title, sortable} = row;
    const defaultSorting = this.sorting._sort === id ? this.sorting._order : "asc";

    return `<div class="sortable-table__cell" data-name="${id}" data-sortable="${sortable}" data-order="${defaultSorting}">
              <span>${title}</span>
              ${this.getHeaderSortingArrow(id)}
            </div>`;
  }

  getHeaderSortingArrow(rowId) {
    return this.sorting._sort === rowId && this.sorting._order ? `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>` : "";
  }

  tableBody(data) {
    return '<div data-element="body" class="sortable-table__body">' +
             this.getTableRows(data) +
           '</div>';
  }

  getTableRows(data) {
    return data.map( (item) => this.tableRow(item) ).join("");
  }

  tableRow(item) {
    const templateResult = this.header.map( (index) => {
      if (index.template){
        return index.template(item[index.id]);
      }
      return '<div class="sortable-table__cell">' + item[index.id] + '</div>'
    }).join("");

    return `<a href="/products/${item.id}" class="sortable-table__row">${templateResult}</a>`
  }

  get tableLoader() {
    return `<div data-element='loading' class='loading-line sortable-table__loading-line'>
            </div>`
  }

  get tableEmptyPlaceholder() {
    return `<div data-element='emptyPlaceholder' class='sortable-table__empty-placeholder'>
              Не найдено товаров удовлетворяющих выбранному критерию
            </div>`;
  }

  getTable(data) {
    return `<div class="sortable-table">
              ${this.tableHeader}
              ${this.tableBody(data)}
              ${this.tableLoader}
              ${this.tableEmptyPlaceholder}
           </div>`
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortOnServer.bind(this));
  }

  async fetchData(url) {
    this.addTableLoadingCss();
    const response = await fetchJson(url);

    this.removeTableLoadingCss(response);
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTable(this.data);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    return this.fetchData(this.url + this.query);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

