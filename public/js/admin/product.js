const unlistButtons = document.querySelectorAll('.unlist-btn');
const editButtons = document.querySelectorAll('.edit-btn');
let imagedata = '';
// import Cropper from 'cropperjs';


unlistButtons.forEach((btn) => {
    btn.addEventListener('click', async function () {
        const productId = this.getAttribute('data-id');
        const currentText = this.textContent.trim().toLowerCase();

        // Determine action based on current text
        const isCurrentlyListed = currentText === 'listed';

        const confirmationMessage = isCurrentlyListed
            ? {
                title: 'Unlist Product?',
                text: 'Are you sure you want to unlist this product?',
                confirmButtonText: 'Yes, unlist it!',
            }
            : {
                title: 'List Product?',
                text: 'Are you sure you want to list this product?',
                confirmButtonText: 'Yes, list it!',
            };

        const result = await Swal.fire({
            ...confirmationMessage,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        this.disabled = true;

        // Send PATCH request
        fetch(`/admin/product/unlist/${productId}`, { method: 'PATCH' })
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Toggle button label and class
                    if (data.newStatus === false) {
                        this.textContent = 'Listed';
                        this.classList.remove('btn-danger');
                        this.classList.add('btn-success');
                    } else {
                        this.textContent = 'Unlisted';
                        this.classList.remove('btn-success');
                        this.classList.add('btn-danger');
                    }
                } else {
                    Swal.fire('Error', 'Failed to update product status.', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                Swal.fire('Error', 'Something went wrong.', 'error');
            })
            .finally(() => {
                this.disabled = false;
            });
    });
});


// Add product
document.addEventListener('DOMContentLoaded', function () {
    let cropper;
    let currentImageIndex = 0;
    let imagesToCrop = [];
    const croppedImages = []; // Array to store cropped images
    const cropControls = document.getElementById('addcropControls');
    const cropperImage = document.getElementById('addcropperImage');
    const nextButton = document.getElementById('nextButton');
    const productImageInput = document.getElementById('addproductImageInput');
    const addbtn = document.getElementById('addproductbtn')
    productImageInput.addEventListener('change', (event) => {
        let files = Array.from(event.target.files);

        if (files.length > 3) {
            Swal.fire({
                icon: 'error',
                title: 'Limit Reached',
                text: 'Only the first 3 images will be used. First 3 of them will be upload Please corp ',
                background: '#f8d7da',
                color: '#721c24',
                iconColor: '#721c24',
                customClass: {
                    popup: 'rounded-lg',
                },
            });

            files = files.slice(0, 3); // take only first 3 files
        }

        imagesToCrop = files;
        currentImageIndex = 0;

        if (imagesToCrop.length > 0) {
            cropControls.style.display = 'block';
            loadImageToCrop(imagesToCrop[currentImageIndex]);
        }
    });


    function loadImageToCrop(file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            cropperImage.src = event.target.result;
            cropperImage.style.display = 'block';


            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(cropperImage, {
                aspectRatio: 1,
                viewMode: 1,
            });
        };
        reader.readAsDataURL(file);
    }



    nextButton.addEventListener('click', () => {
        if (cropper) {
            const canvas = cropper.getCroppedCanvas();
            canvas.toBlob((blob) => {
                croppedImages.push(blob);
                currentImageIndex++;

                if (currentImageIndex < imagesToCrop.length || currentImageIndex >= 4) {
                    loadImageToCrop(imagesToCrop[currentImageIndex]);
                } else {

                    nextButton.style.display = 'none';
                    addbtn.style.display = 'block';
                }
            });
        }
    });

    const addform = document.getElementById('addProductForm');

    addform.action = "/admin/product/add";

//    const addbtn = document.getElementById('addproductbtn');
const spinner = document.getElementById('addbtn-spinner');
const btnText = document.getElementById('addbtn-text');

addbtn.addEventListener('click', (e) => {
    e.preventDefault();

    let isValid = validateForm();
    if (!isValid) return;

    const formdata = new FormData(addform);
    croppedImages.forEach((image, index) => {
        formdata.append('addimage', image, `croppedImage${index}.jpg`);
    });

    // Show spinner and disable button
    spinner.classList.remove('d-none');
    addbtn.disabled = true;

    fetch(addform.action, {
        method: 'POST',
        body: formdata,
    })
        .then(res => res.json())
        .then((res) => {
            spinner.classList.add('d-none');
            addbtn.disabled = false;

            if (res.success === true) {
                window.location.reload(true);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Already Exists',
                    text: res.message,
                    background: '#f8d7da',
                    color: '#721c24',
                    iconColor: '#721c24',
                    customClass: {
                        popup: 'rounded-lg',
                    },
                });
            }
        })
        .catch(err => {
            console.error(err);
            spinner.classList.add('d-none');
            addbtn.disabled = false;

            Swal.fire({
                icon: 'error',
                title: 'Something went wrong!',
                text: 'Please try again later.',
            });
        });
});


    // Validation
    function validateForm() {
        let isValid = true;
        const productName = document.getElementById('newProductName');
        const productCategory = document.getElementById('newProductCategory');
        const productDescription = document.getElementById('newProductDescription');
        const productPrice = document.getElementById('newProductPrice');
        const ProductOffer = document.getElementById('newProductOffer');
        const productStock = document.getElementById('newProductStock');
        const images = productImageInput.files;

        clearErrors();


        if (productName.value.trim() === "") {
            displayError(productName, 'Product name is required');
            isValid = false;
        }


        if (productCategory.value === "") {
            displayError(productCategory, 'Please select a category');
            isValid = false;
        }


        if (productDescription.value.trim() === "") {
            displayError(productDescription, 'Description is required');
            isValid = false;
        }


        if (productPrice.value.trim() === "" || parseFloat(productPrice.value) <= 0) {
            displayError(productPrice, 'Please enter a valid price');
            isValid = false;
        }
        if (ProductOffer.value.trim() === "" || parseFloat(ProductOffer.value) <= 0 || parseFloat(ProductOffer.value) >= 100) {
            displayError(ProductOffer, 'Please enter a valid offer');
            isValid = false;
        }


        if (productStock.value.trim() === "" || parseInt(productStock.value) < 0) {
            displayError(productStock, 'Please enter a valid offer 0-99');
            isValid = false;
        }

        if (images.length === 0) {
            displayError(imageInput, 'Please upload at least one image');
            isValid = false;
        }

        return isValid;
    }

    function displayError(inputElement, message) {
        const errorElement = document.createElement('small');
        errorElement.className = 'text-danger';
        errorElement.innerText = message;
        inputElement.parentNode.appendChild(errorElement);
    }

    //  clear previous errors
    function clearErrors() {
        const errors = document.querySelectorAll('.text-danger');
        errors.forEach(error => error.remove());
    }

});

//------------------------------------------------

// edit Selection
document.addEventListener('DOMContentLoaded', function () {
    const editButtons = document.querySelectorAll('.edit-btn');
    const imageContainer = document.getElementById('currentImages');
    let deletedImages = []; // Array to store images marked for deletion
    let productId;

    // loop through each edit button    
    editButtons.forEach(button => {
        button.addEventListener('click', handleEditButtonClick);
    });

    //  image deletion  
    imageContainer.addEventListener('click', handleImageDeletion);

    //  form submission to update the product
    const form = document.getElementById('editProductForm');
    form.addEventListener('submit', handleFormSubmission);

    function handleEditButtonClick() {

        const productImages = JSON.parse(this.getAttribute('data-images'));
        productId = this.getAttribute('data-id');
        const productName = this.getAttribute('data-name');
        const productCategoryId = this.getAttribute('data-category'); // Get category ID
        const productDescription = this.getAttribute('data-description');
        const stock = this.dataset.stock;
        const price = this.dataset.price;
        const offer = this.dataset.offer;

        // Clear previous images from the modal
        imageContainer.innerHTML = '';

        // Populate the modal with product images
        productImages.forEach(image => {
            const imageWrapper = document.createElement('div');
            imageWrapper.classList.add('position-relative', 'm-2');
            imageWrapper.innerHTML = `
                <img src="${image}" class="product-image img-thumbnail" style="width: 100px; height: 100px;" alt="Product Image">
                <button type="button" class="btn btn-danger btn-sm delete-image-btn position-absolute" style="top: 5px; right: 5px;" data-image="${image}" aria-label="Delete image">&times;</button>
            `;
            imageContainer.appendChild(imageWrapper);
        });

        // Clear the deletedImages array when modal opens
        deletedImages = [];

        // Set the form fields with product info
        document.getElementById('productName').value = productName;
        document.getElementById('productDescription').value = productDescription;
        document.getElementById('productStock').value = stock;
        document.getElementById('productprice').value = price;
        document.getElementById('productOffer').value = offer;

        //  correct category in the dropdown
        const categorySelect = document.getElementById('productCategory');
        categorySelect.value = productCategoryId;

        // form action to the correct product ID
        form.action = `/admin/product/images/edit/${productId}`;

        // Show the modal
        $('#editProductModal').modal('show');
    }

    function handleImageDeletion(event) {
        if (event.target.classList.contains('delete-image-btn')) {
            const imageToDelete = event.target.getAttribute('data-image');
            Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to delete this image?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    deletedImages.push(imageToDelete); // Add image to the list of deleted images
                    event.target.closest('.position-relative').remove(); // Remove image from the modal
                }
            });

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
            method: 'PATCH',
            body: formData, // Do not convert to JSON; keep it as FormData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload(true)
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: `Failed to update product: ${data.message}`,
                        background: '#f8d7da',
                        color: '#721c24',
                        iconColor: '#721c24',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#d33',
                        customClass: {
                            popup: 'rounded-lg',
                        },
                    });

                }
            })
            .catch(error => {
                console.error("Error:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while processing your request. Please try again.',
                });

            });
    }



    // Select DOM elements
    const productImageInput = document.getElementById('productImageInput');
    const cropperImage = document.getElementById('cropperImage');
    const cropControls = document.getElementById('cropControls');
    const croppedImagesPreview = document.getElementById('croppedImagesPreview');
    const saveCroppedImageBtn = document.getElementById('saveCroppedImage');
    const cropNextImageBtn = document.getElementById('cropNextImage');
    const editProductForm = document.getElementById('editProductForm');

    let cropper;
    let currentImageIndex = 0;
    let imagesToCrop = [];

    // Handle image file selection
    productImageInput.addEventListener('change', (event) => {
        const files = event.target.files;
        imagesToCrop = Array.from(files);
        currentImageIndex = 0; // Reset index to start from the first image

        if (imagesToCrop.length > 0) {
            // Show cropping controls
            cropControls.style.display = 'block';
            loadImageToCrop(imagesToCrop[currentImageIndex]);
        }


    });

    // Load image into the cropper
    function loadImageToCrop(file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            cropperImage.src = event.target.result;
            cropperImage.style.display = 'block';

            // Initialize Cropper.js
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(cropperImage, {
                aspectRatio: 0.7 / 0.5,
                viewMode: 1,
                background: false
            });
        };
        reader.readAsDataURL(file);
    }

    // Crop and save the image
    saveCroppedImageBtn.addEventListener('click', function () {
        const canvas = cropper.getCroppedCanvas();


        canvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('croppedImage', blob, 'croppedImage.jpg');

            // Show the cropped image preview
            const imgPreview = document.createElement('img');
            imgPreview.src = URL.createObjectURL(blob);
            imgPreview.classList.add('img-thumbnail', 'm-2');
            imgPreview.style.width = '90px';
            imgPreview.style.height = '90px';
            croppedImagesPreview.appendChild(imgPreview);

            // Submit the cropped image
            fetch(`/admin/product/images/edit/${productId}`, {
                method: 'PATCH',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {

                        Swal.fire({
                            icon: 'error',
                            title: 'Update Failed',
                            text: `Cropped image uploaded successfully`,
                            background: '#f8d7da',
                            color: '#721c24',
                            iconColor: '#721c24',
                            confirmButtonText: 'Okay',
                            confirmButtonColor: '#d33',
                            customClass: {
                                popup: 'rounded-lg',
                            },
                        });

                        window.location.reload(true)

                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Update Failed',
                            text: `Upload failed ${data.message}`,
                            background: '#f8d7da',
                            color: '#721c24',
                            iconColor: '#721c24',
                            confirmButtonText: 'Okay',
                            confirmButtonColor: '#d33',
                            customClass: {
                                popup: 'rounded-lg',
                            },
                        });


                    }
                })
                .catch(error => {
                    console.log('An error occurred: ' + error);
                });

            // Process the next image for cropping
            processNextImageForCropping();
        }, 'image/jpeg');
    });

    // Process the next image
    function processNextImageForCropping() {
        currentImageIndex++;
        if (currentImageIndex < imagesToCrop.length) {
            loadImageToCrop(imagesToCrop[currentImageIndex]);
        } else {
            // No more images to crop
            cropControls.style.display = 'none';
            cropperImage.style.display = 'none';
            imagesToCrop = [];
            window.location.href = '/admin/product'
            // Clear imagesToCrop array
        }
    }

    // Prevent default form submission
    editProductForm.addEventListener('submit', function (event) {
        event.preventDefault();
        // Handle other form data submission if needed, for example:
        const formData = new FormData(editProductForm);

        fetch(`/admin/product/edit/${productId}`, {
            method: 'PATCH',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Product updated successfully',
                        background: '#d4edda', // green background for success
                        color: '#155724',       // dark green text
                        iconColor: '#155724',   // icon matches text
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#28a745', // Bootstrap-style green
                        customClass: {
                            popup: 'rounded-lg',
                        },
                    });


                    // Optionally close the modal or reset the form
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: `Failed to update : ${data.message}`,
                        background: '#f8d7da',
                        color: '#721c24',
                        iconColor: '#721c24',
                        confirmButtonText: 'Okay',
                        confirmButtonColor: '#d33',
                        customClass: {
                            popup: 'rounded-lg',
                        },
                    });

                }
            })
            .catch(error => {
                console.log('An error occurred: ' + error);
            });
    });

});

