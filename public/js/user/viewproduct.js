const imagediv = document.getElementById('maininagediv');


imagediv.addEventListener('mousemove', function(e) {
    imagediv.style.setProperty('--display', 'block'); 
    const pointe = {
        x: (e.offsetX * 100) / imagediv.offsetWidth,
        y: (e.offsetY * 100) / imagediv.offsetHeight
    };
    imagediv.style.setProperty('--zoom-x', pointe.x + '%'); 
    imagediv.style.setProperty('--zoom-y', pointe.y + '%'); 
    console.log(pointe); 
});


imagediv.addEventListener('mouseleave', function() {
    imagediv.style.setProperty('--display', 'none'); 
});