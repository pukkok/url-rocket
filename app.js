// const canvas = document.getElementById('draw-canvas')
// const ctx = canvas.getContext('2d')
const paintBtn = document.getElementById('paint')
const removeBtn = document.getElementById('remove')

const copyBtn = document.getElementById('copy')
const resetBtn = document.getElementById('reset')

const pixelBox = document.getElementById('pixel')

Array(400).fill(0).forEach((_, idx) => {
    const span = document.createElement('span')
    span.dataset.index = idx // 픽셀의 인덱스를 저장
    pixelBox.append(span)
})
const myColor = 'rgb(30, 30, 46)' // #1E1E2E
let isPaintMode = true
paintBtn.addEventListener('click', () => {
    isPaintMode = true
    removeBtn.classList.remove('active')
    paintBtn.classList.add('active')
})
removeBtn.addEventListener('click', () => {
    isPaintMode = false
    paintBtn.classList.remove('active')
    removeBtn.classList.add('active')
})


let isDown = false
const pixels = document.querySelectorAll('span')

pixelBox.addEventListener('mouseleave', () => isDown = false)
pixels.forEach(pixel => {
    function paint(pixel){
        if(isPaintMode){
            pixel.style.backgroundColor = myColor
        }else{
            pixel.style.backgroundColor = ''
        }
    }

    pixel.addEventListener('mousedown', () => {
        isDown = true
        paint(pixel)
    })
    pixel.addEventListener('mouseenter', ()=>{
        if(!isDown) return
        paint(pixel)
    })
    pixel.addEventListener('mouseup', () => {
        isDown = false
    })
})

// 색칠된 픽셀 인덱스 정보를 URL로 저장
const updateURLWithPixelData = () => {
    const paintedIndexes = [...pixels]
        .filter(pixel => pixel.style.backgroundColor === myColor)
        .map(pixel => pixel.dataset.index) // 색칠된 픽셀 인덱스 배열로 저장
    const compressedData = btoa(paintedIndexes.join(',')) // Base64 인코딩
    const url = new URL(window.location);
    url.searchParams.set('pixels', compressedData);
    window.history.replaceState(null, '', url);
};

// 복사 버튼 클릭 시 URL 복사
copyBtn.addEventListener('click', () => {
    updateURLWithPixelData() // URL 업데이트
    window.navigator.clipboard.writeText(window.location.href).then(() => {
        alert("URL 복사 완료");
    });
});

// 리셋 버튼 클릭 시 모든 픽셀 초기화
resetBtn.addEventListener('click', () => {
    pixels.forEach(pixel => pixel.style.backgroundColor = '')
    const url = new URL(window.location)
    url.searchParams.delete('pixels')
    window.history.replaceState(null, '', url)
});

// 페이지 로드 시 URL에서 색칠된 픽셀 복원
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pixelData = urlParams.get('pixels');
    if (pixelData) {
        const paintedIndexes = atob(pixelData).split(',').map(Number);
        paintedIndexes.forEach(index => {
            pixels[index].style.backgroundColor = myColor; // 해당 인덱스 픽셀에 색칠
        });
    }
});