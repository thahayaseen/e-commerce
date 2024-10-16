const wishlistbtn=document.querySelectorAll('#wishlistbtn') 
wishlistbtn.forEach(btns=>{
    btns.addEventListener('click',(e)=>{
        const productid=btns.dataset.productid
        console.log(productid);
        fetch(`/wishlist/${productid}`,{
            method:'PATCH',
            
        })
        

    })