const unlist = document.querySelectorAll('.unlist-btn');

unlist.forEach((btn) => {
    btn.addEventListener('click', function (e) {
        const productId = this.getAttribute('data-id');
        currentstatus = this.textContent.toLowerCase()
        const conformation = currentstatus === 'listed' ?
            'Are you sure,You want to unlist' :
            'Are you sure,You want to list'

        const conformationmsg = window.confirm(conformation)

        if (!conformationmsg) {
            return
        }
        // Send the PATCH request to update product status
        fetch(`/admin/product/unlist/${productId}`, {
            method: 'PATCH',
        })
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
