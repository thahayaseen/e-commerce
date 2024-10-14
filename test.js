document.addEventListener('DOMContentLoaded', function () {
    const filterForm = document.getElementById('filterForm');
    const sortForm = document.getElementById('sortForm');
    const paginationLinks = document.querySelectorAll('.pagination .page-link');

    function getUrlParams() {
        return new URLSearchParams(window.location.search);
    }

    function updateQueryString(formData) {
        const params = new URLSearchParams(formData);
        return params.toString();
    }

    function applyFiltersAndSort(page = null) {
        const filterData = new FormData(filterForm);
        const sortData = new FormData(sortForm);
        const currentParams = getUrlParams();


        const limit = currentParams.get('limit') || '6';
        filterData.append('limit', limit);


        const currentSort = currentParams.get('sort');
        if (currentSort && !sortData.get('sort')) {
            sortData.set('sort', currentSort);
        }

        if (page) {
            filterData.append('page', page);
        }

        const queryString = updateQueryString(filterData) + '&' + updateQueryString(sortData);
        window.location.href = `${window.location.pathname}?${queryString}`;
    }

    filterForm.addEventListener('submit', function (e) {
        // e.preventDefault();
        // applyFiltersAndSort();
        
    });

    sortForm.querySelector('select[name="sort"]').addEventListener('change', function () {
        applyFiltersAndSort();
    });

    paginationLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            applyFiltersAndSort(page);
        });
    });

    // Set initial values based on URL parameters
    const urlParams = getUrlParams();
    urlParams.forEach((value, key) => {
        const element = filterForm.elements[key] || sortForm.elements[key];
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = (value === 'on' || value === 'true');
            } else {
                element.value = value;
            }
        }
    });
});
document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const productCards = document.querySelectorAll('.productlist .card');

    productCards.forEach(card => {
        const productName = card.querySelector('.card-title').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            card.style.display = ''
        } else {
            card.style.display = 'none'
        }
    });
});
