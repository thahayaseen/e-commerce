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

document.getElementById('minusBtn').addEventListener('click', function () {
    if (quantity > 1) {
        quantity--;
        document.getElementById('quantityDisplay').textContent = quantity;
    }
});

document.getElementById('plusBtn').addEventListener('click', function () {
    console.log(id);

    fetch(`/productstock/${id}`, {
        method: 'GET'
    })
        .then(res => res.json())
        .then(res => {
            if (res.stock <= quantity||quantity>=5) {
                console.log(res.stock);
                return alert('cannot add more quantity')
            }
            quantity++
            document.getElementById('quantityDisplay').textContent = quantity;


        })
});
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
                alert('product successfully added to cart')
            }

            else {
                window.location.href = '/signin'
            }

        })

})