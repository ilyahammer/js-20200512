class Tooltip {
  element;

  showTooltip = (event) => {
    const target = event.target.closest("[data-tooltip]");
    if(target){
      this.element.textContent = target.dataset.tooltip;
      document.body.append(this.element);

      document.addEventListener('pointermove', this.moveTooltip);
    }
  };

  moveTooltip = (event) => {
    const left = event.clientX + 5;
    const top = event.clientY + 5;

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
  };

  hideTooltip = () => {
    if (this.element){
      this.remove();
      document.removeEventListener('pointermove', this.moveTooltip);
    }
  };

  constructor() {
    this.render();
  }

  initialize() {
    document.addEventListener('pointerover', this.showTooltip);
    document.addEventListener('pointerout', this.hideTooltip);
  }

  get tooltipTemplate() {
    return `<div class="tooltip"></div>`;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.tooltipTemplate;
    this.element = element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = {};
    document.removeEventListener('pointerover', this.showTooltip);
    document.removeEventListener('pointerout', this.hideTooltip);
  }
}

const tooltip = new Tooltip();

export default tooltip;
