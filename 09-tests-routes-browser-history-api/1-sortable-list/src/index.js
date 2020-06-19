export default class SortableList {
  element;
  subElements = {};

  onDragStart = (event) => {
    event.preventDefault();
    const target = event.target;

    this.draggableElement = target.closest('.sortable-list__item');
    this.parentElement = target.closest('.sortable-list');
    this.dragHandle = target.closest('[data-grab-handle]');
    this.deleteHandle = target.closest('[data-delete-handle]');

    if (this.draggableElement && this.dragHandle) {
      const {left, top} = this.draggableElement.getBoundingClientRect();
      const width = this.draggableElement.offsetWidth;
      const height = this.draggableElement.offsetHeight;
      this.skeleton = this.getSkeleton(width, height);

      this.draggableElement.style.width = this.draggableElement.offsetWidth + 'px';
      this.draggableElement.classList.add('sortable-list__item_dragging');

      this.draggableElement.replaceWith(this.skeleton);
      this.parentElement.append(this.draggableElement);

      this.ShiftX = event.clientX - left;
      this.ShiftY = event.clientY - top;

      this.moveDraggingElementTo(this.draggableElement, event);
      this.currentDraggableElement = this.draggableElement;

      document.addEventListener('pointermove', this.onPointerMove);
      document.addEventListener('pointerup', this.onPointerUp);
    }

    if (this.deleteHandle && this.draggableElement) {
      this.draggableElement.remove();
    }
  };

  onPointerMove = (event) => {

    const clientY = event.clientY;
    const skeleton = this.skeleton;
    const { top, bottom } = this.skeleton.getBoundingClientRect();

    this.moveDraggingElementTo(this.currentDraggableElement, event);

    const isDroppable = this.getDroppableArea(this.currentDraggableElement, event);
    const droppableArea = this.parentElement.contains(isDroppable);
    const hasParent = isDroppable
      ? isDroppable.matches('.sortable-list__item')
      : false;

    if (droppableArea && hasParent) {
      const droppableAreaTop = isDroppable.getBoundingClientRect().top;
      const droppableAreaMiddle = isDroppable.offsetHeight / 2 + droppableAreaTop;
      console.log(droppableAreaTop)
      console.log(droppableAreaMiddle)

      if(clientY > bottom && clientY > droppableAreaMiddle) {
          isDroppable.after(skeleton);
      }
      if(clientY < top && clientY < droppableAreaMiddle) {
          isDroppable.before(skeleton);
      }
   }
  };

  onPointerUp = () => {
    this.skeleton.replaceWith(this.currentDraggableElement);
    this.clearDragElements();
  };

  constructor({ items } = {}) {

    this.items = items;
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('pointerdown', this.onDragStart);
  }

  getDroppableArea(element, { clientX, clientY }) {
    this.currentDraggableElement.hidden = true;
    element.style.display = 'none';
    const nearestElement = document.elementFromPoint(clientX, clientY);
    element.style.display = '';

    return nearestElement;

  }

  moveDraggingElementTo (element, {clientX, clientY}) {
    const top = clientY - this.ShiftY;
    const left = clientX - this.ShiftX;

    element.style.top = top + 'px';
    element.style.left = left + 'px';
  }

  getSkeleton(width, height) {
    const element = document.createElement("div");
    element.className = 'sortable-list__placeholder';
    element.style.width = width + 'px';
    element.style.height = height + 'px';

    return element;
  }

  get template() {
    return `<ul class="sortable-list"></ul>`
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.items.forEach( item => item.classList.add('sortable-list__item') );
    this.element.append(...this.items);
  }

  clearDragElements() {
    this.currentDraggableElement.classList.remove('sortable-list__item_dragging');
    this.currentDraggableElement.style.top = '';
    this.currentDraggableElement.style.left = '';
    this.currentDraggableElement.style.width = '';
    this.currentDraggableElement.style.height = '';

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

}
