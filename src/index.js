import './sass/_imageSearchApp.scss'
import { fetchImages } from './js/fetch-images'
import { renderGallery } from './js/render-gallery'
import { onScroll, onToTopBtn } from './js/scroll'
import Notiflix from 'notiflix'
import SimpleLightbox from 'simplelightbox'
import 'simplelightbox/dist/simple-lightbox.min.css'

const searchForm = document.querySelector('#search-form')
const gallery = document.querySelector('.gallery')
const loadMoreBtn = document.querySelector('.btn-load-more')
let query = ''
let page = 1
let simpleLightBox
const perPage = 40

searchForm.addEventListener('submit', onSearchForm)
loadMoreBtn.addEventListener('click', onLoadMoreBtn)

onScroll()
onToTopBtn()

function onSearchForm(e) {
  e.preventDefault()
  window.scrollTo({ top: 0 })
  page = 1
  query = e.currentTarget.searchQuery.value.trim()
  gallery.innerHTML = ''
  loadMoreBtn.classList.add('is-hidden')

  if (query === '') {
    alertNoEmptySearch()
    return
  }

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        alertNoImagesFound()
      } else {
        renderGallery(data.hits)
        simpleLightBox = new SimpleLightbox('.gallery a').refresh()
        alertImagesFound(data)

        if (data.totalHits > perPage) {
          loadMoreBtn.classList.remove('is-hidden')
        }
      }
    })
    .catch(error => console.log(error))
}

function onLoadMoreBtn() {
  page += 1
  simpleLightBox.destroy()

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      renderGallery(data.hits)
      simpleLightBox = new SimpleLightbox('.gallery a').refresh()

      const totalPages = Math.ceil(data.totalHits / perPage)

      if (page > totalPages) {
        loadMoreBtn.classList.add('is-hidden')
        alertEndOfSearch()
      }
    })
    .catch(error => console.log(error))
}

function alertImagesFound(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`)
}

function alertNoEmptySearch() {
  Notiflix.Notify.failure('The search string cannot be empty. Please specify your search query.')
}

function alertNoImagesFound() {
  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.')
}

function alertEndOfSearch() {
  Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.")
}

function sendForm() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', document.forms.search-form.action);
    xhr.responseType = 'json';
    xhr.onload = () => {
      document.forms.search-form.querySelector('[type="submit"]').disabled = false;
      document.forms.search-form.querySelector('.submit-spinner').classList.add('submit-spinner_hide');
      if (xhr.status !== 200) {
        return;
      }
      const response = xhr.response;
    }
    xhr.onerror = () => {
      document.forms.search-form.querySelector('[type="submit"]').disabled = false;
      document.forms.search-form.querySelector('.submit-spinner').classList.add('submit-spinner_hide');
    };
    document.forms.search-form.querySelector('[type="submit"]').disabled = true;
    document.forms.search-form.querySelector('.submit-spinner').classList.remove('submit-spinner_hide');
    xhr.send(new FormData(document.forms.search-form));
  }
  // при отправке формы
  document.forms.search-form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendForm();
  });