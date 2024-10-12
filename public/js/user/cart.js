const addbtn = document.querySelectorAll('.plusbtn');
const minusbtn = document.querySelectorAll('.minusbtn');
const quantities = document.querySelectorAll('.quantityid');
const deletebtn = document.querySelectorAll('.deletebtn');
const toatalprice = document.querySelectorAll('.productprice');
const summerytoatal = document.querySelector('.summerytoatal');

quantities.forEach((quantity, index) => {
    let number = parseInt(quantity.dataset.quntity);
    let id = quantity.dataset.productid;

    const updateDisplay = () => {
        quantity.textContent = number; 
    };

    const checkAndUpdateQuantity = (increase) => {
        fetch(`/cart/update/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ index, number: increase ? number + 1 : number }), 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
              
                if (increase) number++;  
                toatalprice[index].textContent = data.totalprice; 
                summerytoatal.textContent = data.sumtoatal;  
                quantity.textContent = number;  
            } else {
                alert(data.message || 'This is the maximum quantity that you can take.');
            }
        })
        .catch(error => {
            console.error('Error updating quantity:', error);
        });
    };

    
    const plusButton = addbtn[index];
    const minusButton = minusbtn[index];


    minusButton.addEventListener('click', () => {
        if (number > 1) { 
            number--;
            checkAndUpdateQuantity(false); 
        }
    });

  
    plusButton.addEventListener('click', () => {
       if(number<5){
        checkAndUpdateQuantity(true);  
       }
       else alert('the maximum quantity reached')
    });

    updateDisplay();  

    // Delete button 
    deletebtn[index].addEventListener('click', (e) => {
        const confirmation = confirm('Do you want to remove this item from the cart?');
        if (confirmation) {
            fetch('/cart/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ index }),  
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    window.location.href = '/cart';  
                }
            })
            .catch(error => {
                console.error('Error deleting item from cart:', error);
            });
        }
    });
});
