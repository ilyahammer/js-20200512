export default class SortableTable {
  element;
  subElements = {};

  constructor(header, { data, sorted = {id :'price', order: 'asc'} } = {}) {
    this.header = header;
    this.data = data;
    this.sorted = sorted;

    this.render();
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((sum, subElement) => {
      sum[subElement.dataset.element] = subElement;
      return sum;
    }, {});
  }

  sortOnClick(event) {
    const target = event.target.closest('[data-sortable="true"]');
    if(target) {
      const dataset = target.dataset;
      const rowName = dataset.name;
      const rowOrder = dataset.order;
      const sortedData = this.makeSorting(rowName, rowOrder);
      const sortedArrow = target.querySelector(".sortable-table__sort-arrow");

      target.dataset.order = rowOrder === 'asc' ? 'desc' : 'asc';
      sortedArrow || target.append(this.subElements.arrow);
      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  }

  makeSorting(field, order) {
    const dataArr = [...this.data];
    const sortHeader = this.header.find(item => item.id === field);
    const sortMultiplier = order === "asc" ? 1 : -1;
    const {sortType, customSort} = sortHeader;

    return dataArr.sort((a, b) => {
        switch (sortType) {
        case "number":
          return sortMultiplier * (a[field] - b[field]);
        case "string":
          return sortMultiplier * a[field].localeCompare(b[field], 'ru');
        case "custom":
          return sortMultiplier * customSort(a, b);
        default:
          return sortMultiplier * (a[field] - b[field]);
        }
    });
  }

  get tableHeader() {
    return '<div data-element="header" class="sortable-table__header sortable-table__row">' +
              this.header.map( (item) => this.tableHeaderRow(item) ).join("") +
           '</div>';
  }

  tableHeaderRow(row) {
    const {id, title, sortable} = row;
    const defaultSorting = this.sorted.id === id ? this.sorted.order : "asc";

    return `<div class="sortable-table__cell" data-name="${id}" data-sortable="${sortable}" data-order="${defaultSorting}">
              <span>${title}</span>
              ${this.getHeaderSortingArrow(id)}
            </div>`;
  }

  getHeaderSortingArrow(rowId) {
    return this.sorted.id === rowId && this.sorted.order ? `
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

  getTable(data) {
    return '<div class="sortable-table">' +
             this.tableHeader +
             this.tableBody(data) +
           '</div>'
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.sortOnClick.bind(this));
  }

  render() {
    const element = document.createElement("div");
    const sortedData = this.makeSorting(this.sorted.id, this.sorted.order);

    element.innerHTML = this.getTable(sortedData);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
