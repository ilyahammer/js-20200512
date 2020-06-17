export default class RangePicker {
  element;
  subElements = {};
  calendarLocale = 'ru-RU';
  selectingFrom = true;

  onToggle = () => {
    this.element.classList.toggle("rangepicker_open");
    this.renderRangePicker();
  };

  onDocumentClick = (event) => {
    const target = event.target;
    const openedRangePicker = this.element.classList.contains("rangepicker_open");
    const clickOnRangePicker = this.element.contains(target);

    if (openedRangePicker && !clickOnRangePicker) {
      this.element.classList.remove("rangepicker_open");
    }
  };

  showPrevious = () => {
    this.from.setMonth(this.from.getMonth() - 1);
    this.renderRangePicker();
  };

  showNext = () => {
    this.from.setMonth(this.from.getMonth() + 1);
    this.renderRangePicker();
  };

  onSelectorClick = (event) => {
    const target = event.target;
    if (target.classList.contains('rangepicker__cell')){
      this.onRangePickerCellClick(target);
    }
  };

  constructor({
    from = new Date(2019, 9, 2),
    to = new Date(2019, 10, 5)
  } = {}) {
    this.from = new Date(from);
    this.range = {from: new Date(from), to: new Date(to)};

    this.render();
  }

  initEventListeners() {
    document.addEventListener('click', this.onDocumentClick, true);
    this.subElements.input.addEventListener('click', this.onToggle);
    this.subElements.selector.addEventListener('click', this.onSelectorClick);
  }

  onRangePickerCellClick(target) {
    const { value } = target.dataset;

    if (value) {
      const dateValue = new Date(value);

      if (this.selectingFrom) {
        this.range = {
          from: dateValue,
          to: null
        };
        this.selectingFrom = false;
        this.renderHighlight();
      } else {
        if (dateValue > this.range.from) {
          this.range.to = dateValue;
        } else {
          this.range.to = this.range.from;
          this.range.from = dateValue;
        }

        this.selectingFrom = true;
        this.renderHighlight();
      }

      if (this.range.from && this.range.to) {
        this.dispatch();
        this.element.classList.remove("rangepicker_open");
        this.subElements.from.innerHTML = this.formatDateToString(this.range.from);
        this.subElements.to.innerHTML = this.formatDateToString(this.range.to);
      }
    }
  }

  dispatch() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.range
    }));
  }

  renderRangePicker() {
    const firstMonth = new Date(this.from);
    const nextMonth = new Date(this.from);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.subElements.selector.innerHTML = `
        <div class="rangepicker__selector-arrow"></div>
        <div class="rangepicker__selector-control-left"></div>
        <div class="rangepicker__selector-control-right"></div>
        ${this.renderMonthCalendar(firstMonth)}
        ${this.renderMonthCalendar(nextMonth)}`;
    const leftControl = document.querySelector('.rangepicker__selector-control-left');
    const rightControl = document.querySelector('.rangepicker__selector-control-right');

    leftControl.addEventListener('click', this.showPrevious);
    rightControl.addEventListener('click', this.showNext);
    this.renderHighlight();
  }

  renderCalendarByDate(date) {
    const newDate = date;
    newDate.setDate(1);
    const daysInThisMonth = this.getDaysByMonth(date);
    const dayOfWeek = (day) => day === 0 ? 7 : day;
    let result = `<button type="button" class="rangepicker__cell"
                   style="--start-from:${dayOfWeek(newDate.getDay())}"
                   data-value="${newDate.toISOString()}">${newDate.getDate()}</button>`;

    for(let i = 2; i <= daysInThisMonth; i++){
      newDate.setDate(i);
      result += `<button type="button" class="rangepicker__cell"
                  data-value="${newDate.toISOString()}">${newDate.getDate()}</button>`;
    }

    return result;
  }

  renderHighlight() {
    const { from, to } = this.range;

    for (const cell of this.element.querySelectorAll('.rangepicker__cell')) {
      const { value } = cell.dataset;
      const cellDate = new Date(value);

      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-between');
      cell.classList.remove('rangepicker__selected-to');

      if (from && value === from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      } else if (to && value === to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      } else if (from && to && cellDate >= from && cellDate <= to) {
        cell.classList.add('rangepicker__selected-between');
      }
    }

    if (from) {
      const selectedFromElem = this.element.querySelector(`[data-value="${from.toISOString()}"]`);
      if (selectedFromElem) {
        selectedFromElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-from');
      }
    }

    if (to) {
      const selectedToElem = this.element.querySelector(`[data-value="${to.toISOString()}"]`);
      if (selectedToElem) {
        selectedToElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-to');
      }
    }
  }

  getDaysByMonth(date) {
    const thisMonth = new Date(date);
    return new Date(thisMonth.getFullYear(), thisMonth.getMonth()+1, 0).getDate();
  }

  renderMonthCalendar(date) {
    const monthName = date.toLocaleDateString(this.calendarLocale, {month: "long"});

    return `<div class="rangepicker__calendar">
              <div class="rangepicker__month-indicator">
                <time datetime="${monthName}">${monthName}</time>
              </div>
              <div class="rangepicker__day-of-week">
                <div>Пн</div>
                <div>Вт</div>
                <div>Ср</div>
                <div>Чт</div>
                <div>Пт</div>
                <div>Сб</div>
                <div>Вс</div>
              </div>
              <div class="rangepicker__date-grid">
                ${this.renderCalendarByDate(date)}
              </div>
            </div>`
  }

  formatDateToString(date){
    return date.toLocaleDateString(this.calendarLocale);
  }

  get template() {
    return `
         <div class="rangepicker">
             <div class="rangepicker__input" data-element="input">
             <span data-element="from">${this.formatDateToString(this.range.from)}</span> -
             <span data-element="to">${this.formatDateToString(this.range.to)}</span>
             </div>
             <div class="rangepicker__selector" data-element="selector"></div>
         </div>`;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce( (accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
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
