import fetchJSON from './utils/fetch-json.js';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;
  dataUrl = 'https://course-js.javascript.ru/';

  constructor({
    data = [],
    url = 'api/dashboard/orders',
    range = {
      from : new Date(),
      to: new Date()
    },
    label = '',
    link = '',
    value = 0,
    formatHeading
  } = {}) {
    this.data = data;
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.query = `?from=${this.range.from}&to=${this.range.to}`;
    this.requestUrl = this.dataUrl + this.url + this.query;

    this.render();
    this.fetchData(this.requestUrl);
  }

  async fetchData(url) {
    const response = await fetchJSON(url);
    this.value = Object.entries(response).reduce((sum, [key, value]) => sum + value, 0)
    this.data = Object.entries(response).map(([key, value]) => value);

    this.element.classList.remove('column-chart_loading');
    this.subElements.header.innerHTML = this.formatValue(this.value);
    this.subElements.body.innerHTML = this.getColumnBody(this.data);

  }

  formatValue(value) {
    return this.formatHeading ? this.formatHeading(value) : value;
  }

  getColumnBody(data) {
    const maxValue = Math.max(...data);

    return data
    .map(item => {
      const scale = this.chartHeight / maxValue;
      const percent = (item / maxValue * 100).toFixed(0);

      return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
    })
    .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  update(from, to) {
    const requestQuery = `?from=${from}&to=${to}`;
    const requestUrl = this.dataUrl + this.url + requestQuery;

    return this.fetchData(requestUrl);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
