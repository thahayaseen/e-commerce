const btns = document.querySelectorAll('.accses');
let  currentBtn
btns.forEach((btn) => {
    btn.addEventListener('click', function () {
         currentBtn = btn; // Store the current button reference
        const currentStatus = btn.textContent.toLowerCase(); // Get the current status

        // Set the action type in the modal
        document.getElementById('actionType').textContent = currentStatus === 'block' ? 'block' : 'unblock';
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        modal.show();
        document.getElementById('confirmButton').addEventListener('click',()=>{
            modal.hide()
        })
        document.getElementById('cancel').addEventListener('click',()=>{
            modal.hide()
        })
    });
});

// Handle the confirm button click
document.getElementById('confirmButton').addEventListener('click', () => {
    const userId = currentBtn.getAttribute('userid');
    const statusLabel = currentBtn.closest('tr').querySelector('.user-status'); // Get the status label in the same row

    // Send the PATCH request to update user access status
    fetch(`/admin/users/accses/${userId}`, {
        method: 'PATCH',
    })
    .then((res) => res.json())
    .then((res) => {
        if (res.success) {
            // Toggle the button text and class based on res.udata (new status)
            if (res.udata === false) {
                currentBtn.textContent = 'Block';
                currentBtn.classList.remove('btn-success');
                currentBtn.classList.add('btn-danger');

                statusLabel.textContent = 'Active';
                statusLabel.classList.remove('badge-danger');
                statusLabel.classList.add('badge-success');
            } else {
                currentBtn.textContent = 'Unblock';
                currentBtn.classList.remove('btn-danger');
                currentBtn.classList.add('btn-success');

                statusLabel.textContent = 'Blocked';
                statusLabel.classList.remove('badge-success');
                statusLabel.classList.add('badge-danger');
            }
        } else {
            console.error('Failed to update user status');
        }
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
    });

    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
    modal.hide();
});
