const unlistButtons = document.querySelectorAll('.unlist-btn');
const editButtons = document.querySelectorAll('.edit-btn');
let imagedata=''



document.addEventListener('DOMContentLoaded', function () {
    const imageContainer = document.getElementById('currentImages');
  
    editButtons.forEach(button => {
      button.addEventListener('click', function () {
        // Get product data from button attributes
        const productImages = JSON.parse(this.getAttribute('data-images'));
  
        // Clear any previous images in the modal
        imageContainer.innerHTML = '';
  
        // Populate the modal with the product images
        productImages.forEach(image => {
          const imageWrapper = document.createElement('div');
          imageWrapper.classList.add('position-relative', 'm-2');
          imageWrapper.innerHTML = `
            <img src="/uploads/${image}" class="product-image img-thumbnail" style="width: 100px; height: 100px;" alt="Product Image">
            <button type="button" class="btn btn-danger btn-sm delete-image-btn position-absolute" style="top: 5px; right: 5px;" data-image="${image}">&times;</button>
          `;
          imageContainer.appendChild(imageWrapper);
        });
      });
    });
  
    // Handle image deletion inside modal
    imageContainer.addEventListener('click', function (event) {
      if (event.target.classList.contains('delete-image-btn')) {
        let imageToDelete = event.target.getAttribute('data-image');
        
        // Remove the file extension
        imageToDelete = imageToDelete.replace(/\.[^/.]+$/, '');
  
        // Confirmation before deletion
        const confirmed = window.confirm('Are you sure you want to delete this image?');
        if (confirmed) {
          // Make a fetch request to delete the image
          fetch(`/product/image/delete/${imageToDelete}`, {
            method: 'PATCH'
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Remove the image from the modal
              event.target.closest('.position-relative').remove();
            } else {
              console.error('Failed to delete the image.');
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
        }
      }
    });
  });
// Function to handle the edit modal
function showEditModal(button) {
    imagedata=button.dataset
   const productId = button.dataset.id;
    const productName = button.dataset.name;
    const productCategory = button.dataset.category;
    const productDescription = button.dataset.description;
    const productImages = JSON.parse(button.dataset.images); // Assuming images are passed as JSON array
    const form = document.getElementById('editProductForm');

    // Populate the modal fields
    document.getElementById('productName').value = productName;
    document.getElementById('productCategory').value = productCategory;
    document.getElementById('productDescription').value = productDescription;
    form.action = `/admin/product/images/${productId}`;

    // Display current images
    const currentImagesDiv = document.getElementById('currentImages');
    currentImagesDiv.innerHTML = ''; // Clear existing images

  

    // Show the modal
    $('#editProductModal').modal('show');
}



// Handle unlist button clicks
unlistButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
        const productId = this.getAttribute('data-id');
        const currentStatus = this.textContent.toLowerCase();
        const confirmationMessage = currentStatus === 'listed' 
            ? 'Are you sure you want to unlist this product?' 
            : 'Are you sure you want to list this product?';

        if (!window.confirm(confirmationMessage)) {
            return;
        }

        // Send the PATCH request to update product status
        fetch(`/admin/product/unlist/${productId}`, { method: 'PATCH' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Toggle the button text and class based on newStatus
                    if (data.newStatus === false) {
                        this.textContent = 'Listed';
                        this.classList.remove('btn-danger');
                        this.classList.add('btn-success');
                    } else {
                        this.textContent = 'Unlist';
                        this.classList.remove('btn-success');
                        this.classList.add('btn-danger');
                    }
                } else {
                    console.error('Failed to update product status');
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    });
});

//edit section 
document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll('.edit-btn');
    const imageContainer = document.getElementById('currentImages');
    let deletedImages = []; // Array to store images marked for deletion
    let productId;

    // Loop through each edit button to handle modal display
    editButtons.forEach(button => {
        button.addEventListener('click', handleEditButtonClick);
    });

    // Handle image deletion inside modal
    imageContainer.addEventListener('click', handleImageDeletion);

    // Handle form submission to update the product
    const form = document.getElementById('editProductForm');
    form.addEventListener('submit', handleFormSubmission);

    function handleEditButtonClick() {
        // Get product data from button attributes
        const productImages = JSON.parse(this.getAttribute('data-images'));
        productId = this.getAttribute('data-id');
        const productName = this.getAttribute('data-name');
        const productCategory = this.getAttribute('data-category');
        const productDescription = this.getAttribute('data-description');

        // Clear previous images from the modal
        imageContainer.innerHTML = '';

        // Populate the modal with product images
        productImages.forEach(image => {
            const imageWrapper = document.createElement('div');
            imageWrapper.classList.add('position-relative', 'm-2');
            imageWrapper.innerHTML = `
                <img src="/uploads/${image}" class="product-image img-thumbnail" style="width: 100px; height: 100px;" alt="Product Image">
                <button type="button" class="btn btn-danger btn-sm delete-image-btn position-absolute" style="top: 5px; right: 5px;" data-image="${image}" aria-label="Delete image">&times;</button>
            `;
            imageContainer.appendChild(imageWrapper);
        });

        // Clear the deletedImages array when modal opens
        deletedImages = [];

        // Set the form fields with product info
        document.getElementById('productName').value = productName;
        document.getElementById('productCategory').value = productCategory;
        document.getElementById('productDescription').value = productDescription;

        // Set form action to the correct product ID
        const form = document.getElementById('editProductForm');
        form.action = `/admin/product/images/edit/${productId}`;

        // Show the modal
        $('#editProductModal').modal('show');
    }

    function handleImageDeletion(event) {
        if (event.target.classList.contains('delete-image-btn')) {
            const imageToDelete = event.target.getAttribute('data-image');
            deletedImages.push(imageToDelete); // Add image to the list of deleted images
            event.target.closest('.position-relative').remove(); // Remove image from the modal
        }
    }

    function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    // Create FormData object and append all form data
    const formData = new FormData(this);
    formData.append('deletedImages', JSON.stringify(deletedImages)); // Send the deleted images array

    const url = form.action; // Get the form action URL

    // Submit the form data via fetch
    fetch(url, {
        method: 'POST',
        body: formData, // Do not convert to JSON; keep it as FormData
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response:", data);
        if(data.success===true){
            window.location.href='/admin/product'
        }
        // Handle the response here, such as showing a success message
    })
    .catch(error => {
        console.error("Error:", error);
        // Handle error
    });
}

});
