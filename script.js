let imageGrid = document.querySelector('.image-grid');
let addImageBtn = document.querySelector('#add-image-btn');
let downloadBtn = document.querySelector('#download-btn');
let uploadBtn = document.querySelector('#upload-btn');
let imageInput = document.querySelector('#image-input');
let images = [];

// Cargar imágenes desde localStorage
let storedImages = localStorage.getItem('images');
if (storedImages) {
    images = JSON.parse(storedImages);
    images.forEach((image) => {
        let img = document.createElement('img');
        img.src = image;
        imageGrid.appendChild(img);
    });
}

addImageBtn.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', () => {
    let file = imageInput.files[0];
    let reader = new FileReader();
    reader.onload = () => {
        let imageData = reader.result;
        images.push(imageData);
        localStorage.setItem('images', JSON.stringify(images));
        let img = document.createElement('img');
        img.src = imageData;
        imageGrid.appendChild(img);
    };
    reader.readAsDataURL(file);
});

downloadBtn.addEventListener('click', () => {
    let blob = new Blob([JSON.stringify(images)], { type: 'application/json' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'images.json';
    a.click();
});

uploadBtn.addEventListener('click', () => {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', () => {
        let file = input.files[0];
        let reader = new FileReader();
        reader.onload = () => {
            let imageData = reader.result;
            images = JSON.parse(imageData);
            localStorage.setItem('images', imageData);
            imageGrid.innerHTML = '';
            images.forEach((image) => {
                let img = document.createElement('img');
                img.src = image;
                imageGrid.appendChild(img);
            });
        };
        reader.readAsText(file);
    });
    input.click();
});
