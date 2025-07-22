// delete category 
const deletebtn = document.querySelectorAll('.deletebutton')

deletebtn.forEach((categories) => {
    // const deletebnt=document.getElementById('deletebutton')
    categories.addEventListener('click', function (e) {
        const id = this.dataset.cid
        console.log(id);
        const id2 = categories.getAttribute('data-cid')
        console.log(id2);

        fetch(`/admin/category/unlist/${id}`, {
            method: 'PATCH',

        })
            .then((res) => res.json()
            )
            .then(res => {
                if (res.success === true) {
                    window.location.reload(true)
                }
            })
            .catch((err) => console.log('the deletion error' + err)
            )

    })
})





// add category 

const editbtn = document.querySelectorAll('.edit-btn')
const form = document.getElementById('addCategoryForm')



form.addEventListener('submit', (e) => {
    const categoryname = document.getElementById('newCategoryName').value.trim()
    console.log('thsi is ', categoryname);

    const Categorydiscription = document.getElementById('Categorydiscription').value.trim()
    e.preventDefault()
    console.log(categoryname);
    if (categoryname == '' || Categorydiscription == '') {
        return Swal.fire({

            text: 'Input cannot be empty. Please enter something.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    const formdata = new FormData(e.target)
    let formjson = {}
    formdata.forEach((val, ind) => {
        formjson[ind] = val
    })
    // console.log(formjson);

    e.preventDefault()
    fetch('/admin/category/add',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Important to indicate JSON format
            },
            body: JSON.stringify(formjson)
        }

    )
        .then((res => res.json()))
        .then((res) => {
            if (res.success === true) {
                return window.location.href = '/admin/category'
            }
            else if (res.success === false) {
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
        .catch((err) => console.log("when fetching add data " + err)
        )


})


// edit category 



document.addEventListener('DOMContentLoaded', (e) => {
    editbtn.forEach((btn) => {
        btn.addEventListener('click', function (e) {
            // e.preventDefault()
            // const catdiscription

            const currentid = this.dataset.id
            const currentname = this.dataset.name
            const currentdiscription = this.dataset.discription

            document.getElementById('categoriesdiscription').value = currentdiscription


            document.getElementById('CategoryName').value = currentname

            const formedit = document.getElementById('editCategoryForm')


            formedit.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formdata1 = {};
    let hasEmptyField = false;

    formData.forEach((value, key) => {
        if (value.trim() === "") {
            hasEmptyField = true;

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `${key} cannot be empty`,
                background: '#f8d7da',
                color: '#721c24',
                iconColor: '#721c24',
                customClass: {
                    popup: 'rounded-lg',
                },
            });

            return;
        }

        formdata1[key] = value;
    });

    if (hasEmptyField) return;

    try {
        const response = await fetch(`/admin/category/edit/${currentid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formdata1),
        });

        const res = await response.json();

        if (res.success) {
            window.location.href = '/admin/category';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: res.message || 'Something went wrong!',
                background: '#f8d7da',
                color: '#721c24',
                iconColor: '#721c24',
                customClass: {
                    popup: 'rounded-lg',
                },
            });
        }
    } catch (err) {
        console.error('Error:', err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Server error occurred. Please try again later.',
            background: '#f8d7da',
            color: '#721c24',
            iconColor: '#721c24',
            customClass: {
                popup: 'rounded-lg',
            },
        });
    }
});



            $('#editCategoryModal').modal('show');

        })

    })
})