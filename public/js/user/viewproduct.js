const imagediv = document.getElementById('maininagediv');


imagediv.addEventListener('mousemove', function (e) {
    imagediv.style.setProperty('--display', 'block');
    const pointe = {
        x: (e.offsetX * 100) / imagediv.offsetWidth,
        y: (e.offsetY * 100) / imagediv.offsetHeight
    };
    imagediv.style.setProperty('--zoom-x', pointe.x + '%');
    imagediv.style.setProperty('--zoom-y', pointe.y + '%');
    console.log(pointe);
});


imagediv.addEventListener('mouseleave', function () {
    imagediv.style.setProperty('--display', 'none');
});



const id = window.location.pathname.split('/')[2]

let quantity = 1;




// add to cart btn
const addtobtn = document.getElementById('addtocart')


addtobtn.addEventListener('click', (e) => {
    e.preventDefault()
    console.log('clicked');
    console.log(quantity)

    const priductisdata = addtobtn.dataset.product
    const price = addtobtn.dataset.price
    const dataset = { priductisdata, quantity, price }


    fetch('/cart', {
        method: 'POST',
        body: JSON.stringify(dataset),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(res => {

            if (res.success == true) {
                console.log('ok');
               
            Swal.fire({
                title: 'Added to Cart!',
                text: 'Product has been added to your cart successfully',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });
            }
            else if(res.success==false){
                Swal.fire({
                    title: 'Added to Cart!',
                    text: 'Product is aldredy in your cart',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500
                });
            }

            else {
                window.location.href = '/signin'
            }

        })

})
const wishlistbtn=document.querySelectorAll('#wishlistbtn') 
wishlistbtn.forEach(btns=>{
    btns.addEventListener('click',(e)=>{
        const productid=btns.dataset.productid
        console.log(productid);
        fetch(`/wishlist/${productid}`,{
            method:'PATCH',
            
        })
        .then(res=>res.json())
        .then(res=>{
            if(res.success===true){
                Swal.fire({
                    title: 'Added to Wishlist!',
                    text: res.message,
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            else if (res.success === false) {
                Swal.fire({
                    title: 'Failed to Add to Wishlist!',
                    text: res.message,
                    icon: 'error', 
                    showConfirmButton: false,
                    timer: 1000
                });
            }
            else if (res.success == 'nologined') {
                Swal.fire({
                    title: 'Failed to Add to Wishlist!',
                    text: res.message,
                    icon: 'error', 
                    showConfirmButton: false,
                    timer: 1900
                });
            }
           
            
            
        })
        

    })
})