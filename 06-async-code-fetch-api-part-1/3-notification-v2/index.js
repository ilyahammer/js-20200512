class NotificationMessage {
  element;

  constructor(message, duration = 2000){
    this.message = message;
    this.duration = duration;

    this.render();
  }

  get template(){
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`;
  }

  render(){
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  show(target = document.body){
    target.append(this.element);
    setTimeout( () => this.remove(), this.duration);
    return this.element;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}

class SuccessNotificationMessage extends NotificationMessage {
  get template(){
    return `
      <div class="notification success" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">Success</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`;
  }

}

class WarningNotificationMessage extends NotificationMessage {
  get template(){
    return `
      <div class="notification warning" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">Warning</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`;
  }
}

class ErrorNotificationMessage extends NotificationMessage {

  constructor(message) {
    super(message);
    this.initEventListeners();
  }

  get template(){
    return `
      <div class="notification error">
        <div class="inner-wrapper">
          <div class="notification-header">Error: <span class="close">&times;</span></div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`;
  }

  show(target = document.body) {
    target.append(this.element);
  }

  initEventListeners() {
    const closeButton = this.element.querySelector('.close');
    closeButton.addEventListener('click', () => this.remove());
  }
}

export default class NotificationManager {
  static instance;
  stackLimit;
  element;
  notificationStack = [];

  constructor({stackLimit = 5} = {}) {
    if(NotificationManager.instance){
      return NotificationManager.instance;
    }

    this.stackLimit = stackLimit;
    this.render();
    NotificationManager.instance = this;
  }

  showMessage(message, {duration = 2000, type = 'success'} = {}) {
    const notificationType = this.getNotificationType(type);
    const notification = new notificationType(message, duration)
    notification.show(this.element);

    if(this.notificationStack.length >= this.stackLimit){
      this.notificationStack.shift().remove();
    }

    if(!(notification instanceof ErrorNotificationMessage)){
      this.notificationStack.push(notification);
    }
  }

  getNotificationType(type) {
    switch (type) {
      case 'success':
        return SuccessNotificationMessage;
      case 'warning':
        return WarningNotificationMessage;
      case 'error':
        return ErrorNotificationMessage;
      default:
        return NotificationMessage;
    }
  }

  render() {
    this.element = document.createElement("div");
    document.body.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationManager.instance = null;
    this.notificationStack = [];
  }
}

