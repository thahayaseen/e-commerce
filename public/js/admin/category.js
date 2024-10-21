// delete category 
const deletebtn=document.querySelectorAll('.deletebutton')

deletebtn.forEach((categories)=>{
    // const deletebnt=document.getElementById('deletebutton')
    categories.addEventListener('click',function(e){
        const id= this.dataset.cid
        fetch(`/admin/category/unlist/${id}`,{
            method:'PATCH',
            
        })
        .then((res)=>res.json()
        )
        .then(res=>{
            if (res.success===true) {
                window.location.href='/admin/category'
            }
        })
        .catch((err)=>console.log('the deletion error'+err)
        )
        
    })
})





// add category 

const editbtn=document.querySelectorAll('.edit-btn')
const form =document.getElementById('addCategoryForm')



form.addEventListener('submit',(e)=>{
    const categoryname =document.getElementById('newCategoryName').value.trim()
    const Categorydiscription =document.getElementById('Categorydiscription').value.trim()
    e.preventDefault()
    console.log(categoryname);
   if(categoryname==''||Categorydiscription==''){
   return Swal.fire({
         
          text: 'Input cannot be empty. Please enter something.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
   }
   
   const formdata=new FormData(e.target)
   let formjson={}
   formdata.forEach((val,ind)=>{
       formjson[ind]=val
   })
   // console.log(formjson);
   
   e.preventDefault()
   fetch('/admin/category/add',
       {
           method:'POST',
           headers: {
               'Content-Type': 'application/json', // Important to indicate JSON format
             },
           body :JSON.stringify(formjson)
       }

   )
   .then((res=>res.json()))
   .then((res)=>{
       if(res.success===true){
      return window.location.href='/admin/category'
   }
   else if(res.success===false){
   console.log('errors');
   

    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: res.message,
    
      
      background: '#f8d7da',
      color: '#721c24',
      iconColor: '#721c24',
      customClass: {
        popup: 'rounded-lg',
      },
    });
  


   }

}
   )
   .catch((err)=>console.log("when fetching add data "+err)
   )
   
   
})


// edit category 



document.addEventListener('DOMContentLoaded',(e)=>{
    editbtn.forEach((btn)=>{
        btn.addEventListener('click',function(e){
            // e.preventDefault()
            // const catdiscription
            
            const currentid=this.dataset.id
            const currentname=this.dataset.name
            const currentdiscription=this.dataset.discription
            
            document.getElementById('categoriesdiscription').value=currentdiscription
            
    
            document.getElementById('CategoryName').value = currentname
    
            const formedit=document.getElementById('editCategoryForm')


            formedit.addEventListener('submit',(e)=>{
            e.preventDefault()

            data=new FormData(e.target)
            let formdata1={}
                data.forEach((val,ind)=>{
                    formdata1[ind]=val
                })
                console.log(formdata1);
                
               fetch(`/admin/category/edit/${currentid}`,{
                method:'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                  },
                  body:JSON.stringify(formdata1)
               })
               .then((res=>res.json()))
               .then((res)=>{
                   if(res.success===true){
                  return window.location.href='/admin/category'
               }
               else if(res.success===false){
               console.log('errors');
               
            
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: res.message,
                
                  
                  background: '#f8d7da',
                  color: '#721c24',
                  iconColor: '#721c24',
                  customClass: {
                    popup: 'rounded-lg',
                  },
                });
              
            
            
               }
            
            }
               )
               .catch((err)=>console.log('err is'+err)
               )
                
            })


        $('#editCategoryModal').modal('show');
            
        })
        
    })
})