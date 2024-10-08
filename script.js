let imageGrid = document.querySelector('.image-grid');
let addImageBtn = document.querySelector('#add-image-btn');
let imageInput = document.querySelector('#image-input');

addImageBtn.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', () => {
    let file = imageInput.files[0];
    let reader = new FileReader();
    reader.onload = () => {
        let imageData = reader.result;
        let img = document.createElement('img');
        img.src = imageData;
        imageGrid.appendChild(img);
    };
    reader.readAsDataURL(file);
});
