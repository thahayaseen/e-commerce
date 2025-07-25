class SearchComponent {
  constructor(container) {
    this.container = container
    this.config = JSON.parse(container.dataset.searchConfig)
    this.searchInput = container.querySelector(".search-input")
    this.clearButton = container.querySelector(".clear-search")
    this.filters = container.querySelectorAll(".search-filter")

    this.searchTimeout = null
    this.currentQuery = ""
    this.currentFilters = {}

    this.init()
  }

  init() {
    this.populateFromURL()
    this.setupEventListeners()
    this.setupKeyboardShortcuts()
  }

  populateFromURL() {
    const urlParams = new URLSearchParams(window.location.search)
    
    // Populate search input from 'q' parameter
    const queryParam = urlParams.get('q')
    if (queryParam) {
      this.searchInput.value = queryParam
      this.currentQuery = queryParam
    }

    // Populate filters from URL parameters
    this.filters.forEach((filter) => {
      const filterKey = filter.dataset.filter
      const filterValue = urlParams.get(filterKey)
      
      if (filterValue) {
        // Handle different input types
        if (filter.type === 'checkbox') {
          filter.checked = filterValue === 'true' || filterValue === '1'
        } else if (filter.type === 'radio') {
          if (filter.value === filterValue) {
            filter.checked = true
          }
        } else {
          // For select, text, etc.
          filter.value = filterValue
        }
        
        this.currentFilters[filterKey] = filterValue
      }
    })
  }

  setupEventListeners() {
    // Search input with debounce
    this.searchInput.addEventListener("input", (e) => {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value)
      }, this.config.debounceDelay || 300)
    })

    // Clear search
    this.clearButton.addEventListener("click", () => {
      this.clearSearch()
    })

    // Filter changes
    this.filters.forEach((filter) => {
      filter.addEventListener("change", (e) => {
        let filterValue = e.target.value
        
        // Handle checkbox filters
        if (e.target.type === 'checkbox') {
          filterValue = e.target.checked ? e.target.value : ''
        }
        
        this.currentFilters[e.target.dataset.filter] = filterValue
        this.performSearch(this.currentQuery)
      })
    })

    // Enter key to search immediately
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        clearTimeout(this.searchTimeout)
        this.performSearch(this.searchInput.value)
      }
    })
  }

  setupKeyboardShortcuts() {
    // Ctrl/Cmd + K to focus search
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        this.searchInput.focus()
      }
    })
  }

  performSearch(query) {
    this.currentQuery = query.trim()

    const searchData = {
      query: this.currentQuery,
      filters: this.currentFilters,
      ...this.config.additionalParams,
    }

    this.makeSearchRequest(searchData)
  }

  makeSearchRequest(searchData) {
    const route = this.searchInput.dataset.searchRoute
    const method = this.searchInput.dataset.searchMethod || "GET"

    let url = route
    
    if (method === "GET") {
      const params = new URLSearchParams()
      if (searchData.query) params.append("q", searchData.query)

      Object.entries(searchData.filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      Object.entries(searchData.additionalParams || {}).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    if(params.has('page')){
      params.set('page',1)
    }

      if (params.toString()) {
        url += (url.includes("?") ? "&" : "?") + params.toString()
      }
    }

    document.location.href = url
  }

  clearSearch() {
    this.searchInput.value = ""
    this.currentQuery = ""
    this.currentFilters = {}
    
    // Clear all filter inputs
    this.filters.forEach((filter) => {
      if (filter.type === 'checkbox' || filter.type === 'radio') {
        filter.checked = false
      } else {
        filter.value = ''
      }
    })
    
    this.performSearch("")
  }
}

// Auto-initialize search components
document.addEventListener("DOMContentLoaded", () => {
  const searchComponents = document.querySelectorAll(".search-component")
  searchComponents.forEach((container) => {
    new SearchComponent(container)
  })
})

// Export for manual initialization
window.SearchComponent = SearchComponent