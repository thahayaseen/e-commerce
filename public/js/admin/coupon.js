if (coupons) {
  function renderCouponCards() {
    const container = document.getElementById('couponContainer');
    container.innerHTML = '';
    coupons.forEach((coupon) => {
      const expiryDate = new Date(coupon.expiryDate);
      const formattedDate = expiryDate.toISOString().split('T')[0];
      const card = `
        <div class="col-md-4">
          <div class="coupon-card">
            <h3 class="coupon-code">${coupon.code}</h3>
            <p class="coupon-discount">${coupon.discount}% Off</p>
            <p class="coupon-expiry">Expires: ${formattedDate}</p>
            <p><span class="coupon-status ${coupon.status ? 'status-active' : 'status-inactive'}">${coupon.status ? 'Active' : 'Inactive'}</span></p>
            <div class="mt-3">
              <button class="btn btn-info btn-sm" onclick="editCoupon('${coupon._id}')">
                <i class="mdi mdi-pencil"></i> Edit
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteCoupon('${coupon._id}')">
                <i class="mdi mdi-delete"></i> Delete
              </button>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += card;
    });
  }

  function addCoupon() {
    const expiryDate = document.getElementById('expiryDate').value;
    if (validateDate(expiryDate)) {
   
      return;
    }

    const newCoupon = {
      code: document.getElementById('couponCode').value.toLowerCase().trim(),
      discount: parseInt(document.getElementById('discountAmount').value),
      expiryDate,
      status: true,
      min: parseInt(document.getElementById('minAmount').value),
      max: parseInt(document.getElementById('maxAmount').value)
    };

    fetch('/admin/coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoupon)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          coupons.push(data);
          closeModal('addCouponModal');
          document.getElementById('addCouponForm').reset();
          window.location.reload(true);

        } else {
          Swal.fire({
            text: data.message,
            icon: 'error',
            timer: 1600,
            timerProgressBar: true,
            willClose: () => window.location.href = '/admin/coupon'
          });
        }
      })
      .catch(error => {console.error('Error adding coupon:', error)
         Swal.fire({
            text: data.message||'An error while create coupon',
            icon: 'error',
            timer: 1600,
            timerProgressBar: true,
            willClose: () => window.location.href = '/admin/coupon'
          });
      });
  }

  function editCoupon(id) {
    const coupon = coupons.find(c => c._id === id);
    if (coupon) {
      document.getElementById('editCouponId').value = coupon._id;
      document.getElementById('editCouponCode').value = coupon.code;
      document.getElementById('editDiscountAmount').value = coupon.discount;
      document.getElementById('editExpiryDate').value = new Date(coupon.expiryDate).toISOString().split('T')[0];
      document.getElementById('editStatus').value = coupon.status ? 'Active' : 'Inactive';
      document.getElementById('editMaxAmount').value = coupon.max;
      document.getElementById('editMinAmount').value = coupon.min;
      openModal('editCouponModal');
    } else {
      console.error('Coupon not found:', id);
    }
  }

  function updateCoupon() {
    const expiryDate = document.getElementById('editExpiryDate').value;
    if (uvalidateDate(expiryDate)) {
 
      return;
    }

    const id = document.getElementById('editCouponId').value;
    const updatedCoupon = {
      code: document.getElementById('editCouponCode').value.toLowerCase(),
      discount: parseInt(document.getElementById('editDiscountAmount').value),
      expiryDate,
      status: document.getElementById('editStatus').value === 'Active',
      min: parseInt(document.getElementById('editMinAmount').value),
      max: parseInt(document.getElementById('editMaxAmount').value)
    };

    fetch(`/admin/coupon/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCoupon)
    })
      .then(response => response.json())
      .then((data) => {
        if (data.success) {
          const couponIndex = coupons.findIndex(c => c._id === id);
          if (couponIndex !== -1) {
            coupons[couponIndex] = { ...coupons[couponIndex], ...updatedCoupon };
            renderCouponCards();
            closeModal('editCouponModal');
          }
        } else {
          Swal.fire({
            text: data.message,
            icon: 'error'
          });
        }
      })
      .catch(error => console.error('Error updating coupon:', error));
  }

  async function deleteCoupon(id) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action will delete the coupon permanently.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`/admin/coupon/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete coupon');
    }

    // Remove coupon from list and re-render
    coupons = coupons.filter(c => c._id !== id);
    renderCouponCards();

    await Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: 'Coupon has been deleted successfully.',
      confirmButtonColor: '#3085d6',
    });

  } catch (error) {
    console.error('Error deleting coupon:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: error.message || 'Something went wrong.',
      confirmButtonColor: '#d33',
    });
  }
}


  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop', 'fade', 'show');
    document.body.appendChild(backdrop);
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  }

  
  function validateDate(date) {
  let error = false;
  const couponcode = document.getElementById('couponCode');
  const discountAmount = document.getElementById('discountAmount');
  const minAmount = document.getElementById('minAmount');
  const maxAmount = document.getElementById('maxAmount');
  const expiryDate = document.getElementById('expiryDate');

  // Coupon Code Validation
  if (couponcode.value.trim() === '') {
    couponcode.parentElement.children[2].innerText = 'Coupon code cannot be empty';
    error = true;
  } else {
    couponcode.parentElement.children[2].innerText = '';
  }

  // Discount Amount Validation
  const discountVal = Number(discountAmount.value);
  if (discountAmount.value.trim() === '' || isNaN(discountVal) || discountVal > 99) {
    discountAmount.parentElement.children[2].innerText = 'Discount must be a number and less than 100';
    error = true;
  } else {
    discountAmount.parentElement.children[2].innerText = '';
  }

  // Min and Max Amount Validation
  const minVal = Number(minAmount.value);
  const maxVal = Number(maxAmount.value);

  if (minAmount.value.trim() === '' || isNaN(minVal)) {
    minAmount.parentElement.children[2].innerText = 'Minimum amount cannot be empty';
    error = true;
  } else {
    minAmount.parentElement.children[2].innerText = '';
  }

  if (maxAmount.value.trim() === '' || isNaN(maxVal)) {
    maxAmount.parentElement.children[2].innerText = 'Maximum amount cannot be empty';
    error = true;
  } else if (maxVal < minVal) {
    maxAmount.parentElement.children[2].innerText = 'Maximum amount cannot be less than minimum amount';
    error = true;
  } else {
    maxAmount.parentElement.children[2].innerText = '';
  }

  // Expiry Date Validation
  const today = new Date().toISOString().split('T')[0];
  if (!date || date <= today) {
    expiryDate.parentElement.children[2].innerText = 'Expiry date must be in the future';
    error = true;
  } else {
    expiryDate.parentElement.children[2].innerText = '';
  }

  return error;
}

  // edit secrion
  function uvalidateDate(date) {
    let error=false
    const couponcode = document.getElementById('editCouponCode')
    const discountAmount = document.getElementById('editDiscountAmount')
    const minAmount = document.getElementById('editMinAmount')
    const maxAmount = document.getElementById('editMaxAmount')
    const expiryDate = document.getElementById('editExpiryDate')
    if (couponcode.value.trim() == '') {
      couponcode.parentElement.children[2].innerText = 'couponCode cannot make empty'
      console.log('no code');
    }
    else couponcode.parentElement.children[2].innerHTML = ''

    if (discountAmount.value.trim() == '') {
      discountAmount.parentElement.children[2].innerText = 'DiscountAmount cannot make empty'
      error=true
    }

    else discountAmount.parentElement.children[2].innerHTML = ''

    if (minAmount.value.trim() == '') {
      minAmount.parentElement.children[2].innerText = 'MinAmount cannot make empty'
      error=true
    }
    else minAmount.parentElement.children[2].innerHTML = ''

    if (maxAmount.value.trim() == '') {
      maxAmount.parentElement.children[2].innerText = 'MaxAmount cannot make empty'
      error=true
    }
    else maxAmount.parentElement.children[2].innerHTML = ''

    const today = new Date().toISOString().split('T')[0];
    console.log(today);
    console.log(date);
    
    if (date < today) {
      expiryDate.parentElement.children[2].innerText = 'expaid date cannot make empty and cannot past'
      error=true
    }
    else expiryDate.parentElement.children[2].innerHTML = ''

    return error
  }

  renderCouponCards();
}
