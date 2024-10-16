const actionbtn=document.querySelectorAll('.actionbtn')

actionbtn.forEach(btn=>{
    btn.addEventListener('change',(e)=>{
       const action= btn.value
       const orderid=btn.dataset.id
        // console.log(orderid);
        
       fetch('/admin/orders',{
        method:'PATCH',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            action,orderid
        })

       })
       .then(res=>res.json())
       .then(res=>{
        if(res.success){
            window.location.href='/admin/orders'
        }
       })
        
    })
    
})


//view order 
document.querySelectorAll('.vieworder').forEach(button => {
    button.addEventListener('click', (e) => {
      const orderId = button.dataset.id;
  
      fetch(`/admin/orderlist/${orderId}`, {
        method: 'GET',
      })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          populateOrderModal(response.data);
        } else {
          console.error('Error fetching order details:', response.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  });
  
  function populateOrderModal(order) {
    document.getElementById('orderId').textContent = order._id;
    document.getElementById('customerName').textContent = order.name;
    document.getElementById('orderDate').textContent = new Date(order.createdAt).toLocaleDateString();
    document.getElementById('orderStatus').textContent = order.status;
    document.getElementById('orderStatus').className = `badge badge-pill badge-${getStatusClass(order.status)}`;
    document.getElementById('shippingAddress').innerHTML = formatAddress(order.shippingAddress);
  
    let itemsHtml = '';
    let subtotal = 0;
    order.products.forEach(item => {
      subtotal += item.quantity * item.price;
      itemsHtml += `
        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="row no-gutters">
              <div class="col-md-4">
                <img src="/uploads/${item.productid.images[0]}" class="card-img h-100" alt="${item.productid.name}" style="object-fit: cover;">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${item.productid.name}</h5>
                  <p class="card-text">
                    Quantity: ${item.quantity}<br>
                    Price: $${item.price}<br>
                    Subtotal: $${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    document.getElementById('orderItems').innerHTML = itemsHtml;
    document.getElementById('orderSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('coupon').textContent = `${order.coupon.couponcode}(₹${order.coupon.discount})`||'no'
    document.getElementById('orderShipping').textContent = 'free'
    document.getElementById('orderTotal').textContent = (subtotal-order.coupon.discount).toFixed(2);
  }
  
  function getStatusClass(status) {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }
  
  function formatAddress(address) {
    return `
      ${address.addressline1}<br>
      ${address.addressline2}
      ${address.city}, ${address.state} ${address.zipcode}<br>
      ${address.phone},<br>
      ${address.country}
    `;
  }
  