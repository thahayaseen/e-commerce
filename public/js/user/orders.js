const ordercancelbtn=document.querySelectorAll('.cancelbtn')


ordercancelbtn.forEach(function (btn){
    btn.addEventListener('click',(e)=>{
       const conformation= confirm('are you sure want ed to cancel your order')
        if(conformation){
            const id=e.target.dataset.orderid
        console.log(id);
        fetch(`/orders/${id}`,{
            method:'PATCH'
        })
        .then(res=>res.json())
        .then(res=>{
            if(res.success){
                alert('Your order successfully Cancelled')
                window.location.href='/user/orders'
            }
        })
        }
    })
    
})