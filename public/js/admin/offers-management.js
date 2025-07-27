// Import necessary libraries
const toastr = window.toastr
const $ = window.$
const Swal = window.Swal

class OffersManager {
  constructor() {
    this.init()
  }

  init() {
    this.setupToastr()
    this.setupEventListeners()
    this.hideSelectionGroups()
  }

  setupToastr() {
    toastr.options = {
      closeButton: true,
      progressBar: true,
      positionClass: "toast-top-right",
      timeOut: 3000,
      extendedTimeOut: 1000,
      preventDuplicates: true,
      newestOnTop: true,
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    }
  }

  hideSelectionGroups() {
    document.querySelectorAll("#categorySelection, #productSelection").forEach((el) => (el.style.display = "none"))
  }

  setupEventListeners() {
    // Application type change handler
    document.getElementById("applicationType").addEventListener("change", this.handleApplicationTypeChange.bind(this))

    // Save offer handler
    document.getElementById("saveOffer").addEventListener("click", this.handleSaveOffer.bind(this))

    // Attach table event listeners
    this.attachTableEventListeners()

    // Modal reset handler
    $("#addOfferModal").on("hidden.bs.modal", this.resetForm.bind(this))

    // Date validation
    this.setupDateValidation()
  }

  setupDateValidation() {
    const validFromInput = document.querySelector('input[name="validFrom"]')
    const validUntilInput = document.querySelector('input[name="validUntil"]')

    validFromInput.addEventListener("change", () => {
      validUntilInput.min = validFromInput.value
      if (validUntilInput.value && validUntilInput.value < validFromInput.value) {
        validUntilInput.value = validFromInput.value
      }
    })

    validUntilInput.addEventListener("change", () => {
      if (validFromInput.value && validUntilInput.value < validFromInput.value) {
        this.showFieldError(validUntilInput, "End date must be after start date")
      } else {
        this.clearFieldError(validUntilInput)
      }
    })
  }

  handleApplicationTypeChange(event) {
    const selected = event.target.value
    const categorySelection = document.getElementById("categorySelection")
    const productSelection = document.getElementById("productSelection")

    // Hide all selection groups
    categorySelection.style.display = "none"
    productSelection.style.display = "none"

    // Clear all selections
    document
      .querySelectorAll('input[name="products"], input[name="categories"]')
      .forEach((input) => (input.checked = false))

    // Show relevant selection group
    if (selected === "category") {
      categorySelection.style.display = "block"
    } else if (selected === "product") {
      productSelection.style.display = "block"
    }

    this.clearFieldError(event.target)
  }

  validateForm(formData) {
    const errors = []
    let isValid = true

    // Clear previous errors
    this.clearAllErrors()

    // Required field validations
    const requiredFields = [
      { name: "name", label: "Offer name" },
      { name: "discountType", label: "Discount type" },
      { name: "discountValue", label: "Discount value" },
      { name: "applicationType", label: "Application type" },
      { name: "validFrom", label: "Valid from date" },
      { name: "validUntil", label: "Valid until date" },
    ]

    requiredFields.forEach((field) => {
      const value = formData[field.name]
      const element = document.querySelector(`[name="${field.name}"]`)

      if (!value || value.toString().trim() === "") {
        errors.push(`${field.label} is required`)
        this.showFieldError(element, `${field.label} is required`)
        isValid = false
      }
    })

    // Discount value validation
    const discountValue = Number.parseFloat(formData.discountValue)
    const discountType = formData.discountType
    const discountValueElement = document.querySelector('[name="discountValue"]')

    if (formData.discountValue && !isNaN(discountValue)) {
      if (discountValue <= 0) {
        errors.push("Discount value must be greater than 0")
        this.showFieldError(discountValueElement, "Discount value must be greater than 0")
        isValid = false
      } else if (discountType === "percentage" && discountValue >= 100) {
        errors.push("Percentage discount cannot exceed 100%")
        this.showFieldError(discountValueElement, "Percentage discount cannot exceed 100%")
        isValid = false
      }
    }

    // Date validation
    const validFrom = new Date(formData.validFrom)
    const validUntil = new Date(formData.validUntil)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (formData.validFrom && formData.validUntil) {
      if (validUntil <= validFrom) {
        errors.push("End date must be after start date")
        this.showFieldError(document.querySelector('[name="validUntil"]'), "End date must be after start date")
        isValid = false
      }
    }

    // Selected items validation
    if (formData.applicationType && formData.applicationType !== "all") {
      const selectedItems = JSON.parse(formData.selectedItems || "[]")
      if (!selectedItems || selectedItems.length === 0) {
        errors.push("Please select at least one item for the offer")
        const applicationType = document.querySelector('[name="applicationType"]')
        this.showFieldError(applicationType, "Please select at least one item")
        isValid = false
      }
    }

   

    return { isValid, errors }
  }

  showFieldError(element, message) {
    if (!element) return

    element.classList.add("is-invalid")
    const feedback = element.parentNode.querySelector(".invalid-feedback")
    if (feedback) {
      feedback.textContent = message
      feedback.style.display = "block"
    }
  }

  clearFieldError(element) {
    if (!element) return

    element.classList.remove("is-invalid")
    const feedback = element.parentNode.querySelector(".invalid-feedback")
    if (feedback) {
      feedback.textContent = ""
      feedback.style.display = "none"
    }
  }

  clearAllErrors() {
    document.querySelectorAll(".is-invalid").forEach((element) => {
      element.classList.remove("is-invalid")
    })
    document.querySelectorAll(".invalid-feedback").forEach((feedback) => {
      feedback.textContent = ""
      feedback.style.display = "none"
    })
  }

  async handleSaveOffer(event) {
    event.preventDefault()

    const saveButton = document.getElementById("saveOffer")
    const spinner = saveButton.querySelector(".spinner-border")
    const form = document.getElementById("offerForm")

    try {
      // Show loading state
      saveButton.disabled = true
      spinner.classList.remove("d-none")

      // Handle active checkbox
      const activeCheckbox = document.getElementById("isActive")
      const hiddenActiveInput = form.querySelector('input[name="isActive"][type="hidden"]')

      if (activeCheckbox.checked) {
        hiddenActiveInput.disabled = true
      } else {
        hiddenActiveInput.disabled = false
      }

      const formData = new FormData(form)
      const applicationType = document.getElementById("applicationType").value

      // Handle selected items based on application type
      let selectedItems = []
      if (applicationType === "category") {
        selectedItems = Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(
          (input) => input.value,
        )
      } else if (applicationType === "product") {
        selectedItems = Array.from(document.querySelectorAll('input[name="products"]:checked')).map(
          (input) => input.value,
        )
      } else if (applicationType === "all") {
        selectedItems = ["all"]
      }

      formData.set("selectedItems", JSON.stringify(selectedItems))

      // Convert FormData to object
      const data = {}
      for (const [key, value] of formData) {
        data[key] = value
      }

      // Validate form
      const validation = this.validateForm(data)
      if (!validation.isValid) {
        toastr.error(validation.errors.join("<br>"), "Validation Error", {
          allowHtml: true,
        })
        return
      }

      // Submit form
      const response = await fetch("/admin/offers/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toastr.success("Offer saved successfully")
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else if (!result.success) {
        console.log( result.failedProducts);
        toastr.error(result.message)
        if (result.failedProducts?.length) {
         
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }else{

        }
      }
    } catch (error) {
      console.error("Error saving offer:", error)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      toastr.error(error.message || "An unexpected error occurred")
    } finally {
      // Hide loading state
      saveButton.disabled = false
      spinner.classList.add("d-none")
    }
  }

  async handleEditOffer(event) {
    const offerId = event.currentTarget.dataset.id

    try {
      const response = await fetch(`/admin/offers/${offerId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch offer details")
      }

      const offer = await response.json()

      this.populateForm(offer, offerId)

      // Show modal
      $("#addOfferModal").modal("show")
      document.querySelector(".modal-title").textContent = "Edit Offer"
    } catch (error) {
      console.error("Error fetching offer:", error)
      toastr.error("Failed to fetch offer details")
    }
  }

  populateForm(offer, offerId) {
    const form = document.getElementById("offerForm")

    // Reset form first
    this.resetForm()

    // Populate basic fields
    document.querySelector('input[name="name"]').value = offer.name || ""
    document.querySelector('input[name="offerid"]').value = offerId || ""
    document.querySelector('select[name="discountType"]').value = offer.discountType || ""
    document.querySelector('input[name="discountValue"]').value = offer.discountValue || ""

    // Handle application type
    const applicationTypeSelect = document.querySelector('select[name="applicationType"]')
    applicationTypeSelect.value = offer.applicationType || ""
    applicationTypeSelect.dispatchEvent(new Event("change"))

    // Handle dates
    if (offer.validFrom) {
      document.querySelector('input[name="validFrom"]').value = offer.validFrom.split("T")[0]
    }
    if (offer.validUntil) {
      document.querySelector('input[name="validUntil"]').value = offer.validUntil.split("T")[0]
    }

    // Handle optional fields

    document.querySelector('input[name="isActive"]').checked = offer.isActive !== false

    // Handle selected items
    if (offer.selectedItems && Array.isArray(offer.selectedItems)) {
      setTimeout(() => {
        if (offer.applicationType === "category") {
          offer.selectedItems.forEach((catId) => {
            const checkbox = document.getElementById(`category-${catId}`)
            if (checkbox) checkbox.checked = true
          })
        } else if (offer.applicationType === "product") {
          offer.selectedItems.forEach((prodId) => {
            const checkbox = document.getElementById(`product-${prodId}`)
            if (checkbox) checkbox.checked = true
          })
        }
      }, 100)
    }
  }

  async handleDeleteOffer(event) {
    const offerId = event.currentTarget.dataset.id

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this offer? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      })

      if (result.isConfirmed) {
        const response = await fetch(`/admin/offers/delete/${offerId}`, {
          method: "POST",
        })

        const data = await response.json()

        if (data.success) {
          toastr.success("Offer deleted successfully")
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          toastr.error(data.message || "Failed to delete offer")
        }
      }
    } catch (error) {
      console.error("Error deleting offer:", error)
      toastr.error(error.message || "An unexpected error occurred")
    }
  }

  resetForm() {
    const form = document.getElementById("offerForm")
    form.reset()

    // Clear all errors
    this.clearAllErrors()

    // Reset modal title
    document.querySelector(".modal-title").textContent = "Add New Offer"

    // Hide selection groups
    this.hideSelectionGroups()

    // Reset hidden fields
    document.querySelector('input[name="offerid"]').value = ""

    // Reset active checkbox
    document.getElementById("isActive").checked = true
    document.querySelector('input[name="isActive"][type="hidden"]').disabled = false
  }

  // Handle search results
  handleOfferSearchResults(data, total, query, filters) {
    const tbody = document.querySelector(".table tbody")

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-4">
            <i class="mdi mdi-magnify mdi-48px"></i>
            <p class="mt-2">No offers found matching your search criteria</p>
          </td>
        </tr>
      `
      return
    }

    // Render search results
    tbody.innerHTML = data
      .map(
        (offer, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${this.escapeHtml(offer.name)}</td>
        <td>${this.escapeHtml(offer.discountType)}</td>
        <td>
          ${offer.discountType === "percentage" ? offer.discountValue + "%" : "₹" + offer.discountValue}
        </td>
        <td>${this.escapeHtml(offer.applicationType)}</td>
        <td>
          ${new Date(offer.validUntil).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
        </td>
        <td>
          <div class="badge ${offer.isActive ? "badge-success" : "badge-danger"}">
            ${offer.isActive ? "Active" : "Inactive"}
          </div>
        </td>
        <td>
          <button class="btn btn-info btn-sm edit-offer" data-id="${offer._id}">
            <i class="mdi mdi-pencil"></i>
          </button>
          <button class="btn btn-danger btn-sm delete-offer" data-id="${offer._id}">
            <i class="mdi mdi-delete"></i>
          </button>
        </td>
      </tr>
    `,
      )
      .join("")

    // Re-attach event listeners for new buttons
    this.attachTableEventListeners()
  }

  // Handle search errors
  handleSearchError(message) {
    toastr.error(message || "Search failed")
  }

  // Utility method to escape HTML
  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  // Re-attach event listeners for dynamically created buttons
  attachTableEventListeners() {
    // Remove existing listeners to prevent duplicates
    document.querySelectorAll(".edit-offer").forEach((button) => {
      button.removeEventListener("click", this.handleEditOffer)
      button.addEventListener("click", this.handleEditOffer.bind(this))
    })

    document.querySelectorAll(".delete-offer").forEach((button) => {
      button.removeEventListener("click", this.handleDeleteOffer)
      button.addEventListener("click", this.handleDeleteOffer.bind(this))
    })
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new OffersManager()
})
