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
