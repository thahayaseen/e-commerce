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
              <p><span class="coupon-status ${coupon.status === true ? 'status-active' : 'status-inactive'}">${coupon.status === 'true' ? 'Active' : 'Inactive'}</span></p>
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
      const newCoupon = {
        code: document.getElementById('couponCode').value,
        discount: parseInt(document.getElementById('discountAmount').value),
        expiryDate: document.getElementById('expiryDate').value,
        status: 'true',
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
        coupons.push(data);
        console.log(data+'fgsdf');
        
        closeModal('addCouponModal');
        document.getElementById('addCouponForm').reset();
        window.location.reload()
      })
      .catch(error => console.error('Error adding coupon:', error));
    }

    function editCoupon(id) {
      console.log('Editing coupon:', id);
      const coupon = coupons.find(c => c._id === id);

      if (coupon) {
        document.getElementById('editCouponId').value = coupon._id;
        document.getElementById('editCouponCode').value = coupon.code;
        document.getElementById('editDiscountAmount').value = coupon.discount;
        const expiryDate = new Date(coupon.expiryDate);
        const formattedDate = expiryDate.toISOString().split('T')[0];
        document.getElementById('editExpiryDate').value = formattedDate;
        if(coupon.status){
            document.getElementById('editStatus').value = 'Active';
        }else document.getElementById('editStatus').value = 'Inactive'
        document.getElementById('editMaxAmount').value = coupon.max;
        document.getElementById('editMinAmount').value = coupon.min;
        openModal('editCouponModal');
      } else {
        console.error('Coupon not found:', id);
      }
    }

    function updateCoupon() {
        let ustatus
      const id = document.getElementById('editCouponId').value;
      if((document.getElementById('editStatus').value)=='Active'){
            ustatus=true
      }
      else false
      const updatedCoupon = {
        code: document.getElementById('editCouponCode').value,
        discount: parseInt(document.getElementById('editDiscountAmount').value),
        expiryDate: document.getElementById('editExpiryDate').value,
        status:ustatus ,
        min: parseInt(document.getElementById('editMinAmount').value),
        max: parseInt(document.getElementById('editMaxAmount').value)
      };

      fetch(`/admin/coupon/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCoupon)
      })
      .then(response => response.json())
      .then(() => {
        const couponIndex = coupons.findIndex(c => c._id === id);
        if (couponIndex !== -1) {
          coupons[couponIndex] = { ...coupons[couponIndex], ...updatedCoupon };
          renderCouponCards();
          closeModal('editCouponModal');
        }
      })
      .catch(error => console.error('Error updating coupon:', error));
    }

    function deleteCoupon(id) {
      if (confirm('Are you sure you want to delete this coupon?')) {
        fetch(`/admin/coupon/${id}`, {
          method: 'DELETE'
        })
        .then(() => {
          console.log('deleted');
          console.log(coupons);
          
          coupons = coupons.filter(c => c._id !== id);
          renderCouponCards();
        })
        .catch(error => console.error('Error deleting coupon:', error));
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
      if (backdrop) {
        backdrop.remove();
      }
    }

    renderCouponCards();
  }