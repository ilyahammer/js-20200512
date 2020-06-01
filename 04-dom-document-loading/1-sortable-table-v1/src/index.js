export default class SortableTable {
  element;
  subElements = {};

  constructor(header, { data } = {}) {
    this.header = header;
    this.data = data;

    this.render();
  }

  getSubElements(element) {
    return {
             tableHeader: element.querySelector('.sortable-table__header'),
             tableBody: element.querySelector('.sortable-table__body'),
         }
  }

  sort(field, order) {
    const sortHeader = this.header.find( (item) => item.id === field );
    const tableBody = this.subElements.tableBody;
    const sortMultiplier = order === "asc" ? 1 : -1;
    const sortType = sortHeader.sortType;

    function makeSorting(data) {
      return data.sort((a, b) => {
        switch (sortType) {
          case "number":
            return sortMultiplier * (a[field] - b[field]);
          case "string":
            return sortMultiplier * a[field].localeCompare(b[field], 'default');
          default:
            return sortMultiplier * (a[field] - b[field])
        }
      });
    }
    tableBody.innerHTML = makeSorting(this.data).map( (item) => this.tableRows(item) ).join("");
  }


  get tableHeader() {
    return '<div data-element="header" class="sortable-table__header sortable-table__row">' +
              this.header.map( (item) => this.tableHeaderRow(item) ).join("") +
           '</div>'
  }

  tableHeaderRow(row) {
    let headerId = row.id;
    let headerTitle = row.title;
    let headerSortable = row.sortable;

    return `<div class="sortable-table__cell" data-name="${headerId}" data-sortable="${headerSortable}">
              <span>${headerTitle}</span>
              <span class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>
            </div>`
  }

  tableBody(data) {
    return '<div data-element="body" class="sortable-table__body">' +
             data.map( (item) => this.tableRows(item) ).join("") +
           '</div>'
  }

  tableRows(data) {
    const templateResult = this.header.map( (index) => {
      if (index.template){
        return index.template(data[index.id]);
      }
      return '<div class="sortable-table__cell">' + data[index.id] + '</div>'
    }).join("");

    return `<a href="/products/${data.id}" class="sortable-table__row">${templateResult}</a>`
  }

  getTable(data) {
    return '<div class="sortable-table">' +
             this.tableHeader +
             this.tableBody(data) +
           '</div>'
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTable(this.data);
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element)
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = {};
    this.subElements = {};
  }
}

