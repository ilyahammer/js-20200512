//import SortableList from '../../../09-tests-routes-browser-history-api/2-sortable-list/solution/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    price: 100,
    discount: 0,
    images: []
  };

  onSubmit = async (event) => {
    event.preventDefault();

    const productData = this.getFormData();
    const productUrl = new URL(this.productUrl, BACKEND_URL);
    const response = await fetchJson(productUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const dispatchEvent = this.productId
      ? new CustomEvent('product-updated', { detail: response.id })
      : new CustomEvent('product-saved', { detail: response.id });

    this.element.dispatchEvent(dispatchEvent);
  };

  uploadImage = () => {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.click();

    imageInput.onchange = async () => {
      const [file] = imageInput.files;
      const { productForm, imageListContainer } = this.subElements;

      if (file) {
        const formData = new FormData();
        formData.append('image', file);

        productForm.uploadImage.classList.add('is-loading');
        const response = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
        });

        imageListContainer.firstElementChild.append(this.getImageItem(response.data.link, file.name));
        productForm.uploadImage.classList.remove('is-loading');
        imageInput.remove();
      }
    };
  };

  deleteImage = (event) => {
    const target = event.target;

    if (target.dataset.hasOwnProperty("deleteHandle")){
      const element = target.closest("li");
      element.remove();
    }
  }

  constructor (productId) {
    this.productId = productId;
    this.formData = this.defaultFormData;
    this.subcategoryUrl = '/api/rest/categories?_sort=weight&_refs=subcategory';
    this.productUrl = '/api/rest/products';
  }

  initEventListeners() {
    const { productForm, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    productForm.uploadImage.addEventListener('click', this.uploadImage);
    imageListContainer.addEventListener('click', this.deleteImage);
  }

  async getCategoryList() {
    const response = await fetchJson(BACKEND_URL + this.subcategoryUrl);
    const categories = []
    for (let category of response) {
      for (let subcategory of category.subcategories) {
        categories.push(new Option(category.title + " > " + subcategory.title, subcategory.id));
      }
    }

    return categories;
  }

  async getProductInfo() {
    const productUrl = new URL(this.productUrl, BACKEND_URL);
    productUrl.searchParams.set("id", this.productId);

    return await fetchJson(productUrl);
  }

  get template() {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" value="${this.formData.title}" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${this.formData.description}</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
            <ul class="sortable-list"></ul>
          </div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory"></select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" value="${this.formData.price}" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" value="${this.formData.discount}" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" value="${this.formData.quantity}" type="number" class="form-control" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async render() {
    this.categories = await this.getCategoryList();
    if (this.productId){
      this.productData = await this.getProductInfo();
    } else {
      this.productData = [this.formData];
    }

    this.renderForm();
    this.setProductForm();
    this.generateImagesList();
    this.initEventListeners();

    return this.element;
  }

  get templateNotFound() {
    return `
      <div>
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>`;
  }

  renderForm() {
    const element = document.createElement("div");
    element.innerHTML = !this.productData || this.productData.length === 0
      ? this.templateNotFound
      : this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  setProductForm() {
    const productForm = this.subElements.productForm;
    const excludedFields = ['images'];
    const [productData] = this.productData;


    if (productForm) {
      const fields = Object.keys(this.formData).filter(item => !excludedFields.includes(item));
      productForm.subcategory.append(...this.categories);

      fields.forEach(item => {
        const element = productForm[item];

        if(element.tagName === "SELECT"){
          element.value = productData[item].toString() || this.formData[item];
        } else {
          element.value = productData[item] || this.formData[item];
        }
      });
    }
  }

  generateImagesList() {
    const imageListContainer = this.subElements.imageListContainer;
    const [productData] = this.productData;
    const images = productData.images;
    const imageItems = images.map(({ url, source }) => this.getImageItem(url, source));

    imageListContainer.firstElementChild.append(...imageItems);
  }

  getImageItem(url, imageName) {
    const result = document.createElement('div');
    result.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(imageName)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(imageName)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return result.firstElementChild;
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const values = {};

    for (const field of fields) {
      values[field] = formatToNumber.includes(field)
        ? parseInt(productForm[field].value)
        : productForm[field].value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
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
