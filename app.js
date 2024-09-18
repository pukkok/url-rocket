const paintBtn = document.getElementById('paint')
const removeBtn = document.getElementById('remove')
const copyBtn = document.getElementById('copy')
const resetBtn = document.getElementById('reset')
const pixelBox = document.getElementById('pixel')

const myColor = 'rgb(30, 30, 46)' // #1E1E2E

// 400개의 픽셀 생성 (20줄 * 20픽셀)
Array(400).fill(0).forEach((_, index) => {
    const span = document.createElement('span')
    span.dataset.index = index // 픽셀의 인덱스를 저장
    pixelBox.append(span)
})

let isPaintMode = true
paintBtn.addEventListener('click', () => isPaintMode = true)
removeBtn.addEventListener('click', () => isPaintMode = false)

let isDown = false
const pixels = document.querySelectorAll('span')

// 마우스 이벤트 리스너 추가
pixelBox.addEventListener('mouseleave', () => isDown = false)
pixels.forEach(pixel => {
    function paint(pixel) {
        if (isPaintMode) {
            pixel.style.backgroundColor = myColor
        } else {
            pixel.style.backgroundColor = ''
        }
    }

    pixel.addEventListener('mousedown', () => {
        isDown = true
        paint(pixel)
    })
    pixel.addEventListener('mouseenter', () => {
        if (!isDown) return
        paint(pixel)
    })
    pixel.addEventListener('mouseup', () => {
        isDown = false
    })
})

// 알파벳 인덱스
const alphabetLower = 'abcdefghijklmnopqrst'  // 소문자: 첫 그룹 (0~9)
const alphabetUpper = 'ABCDEFGHIJKLMNOPQRST'  // 대문자: 두 번째 그룹 (10~19)

// 인코딩 함수: 각 줄의 데이터를 문자와 숫자로 압축
const compressPixelData = () => {
    let encodedData = ''
    for (let row = 0; row < 20; row++) {
        const rowPixels = [...pixels].slice(row * 20, (row + 1) * 20)
        const leftGroup = []
        const rightGroup = []

        rowPixels.slice(0, 10).forEach((pixel, i) => {
            if (pixel.style.backgroundColor === myColor) {
                leftGroup.push(i)
            }
        })

        rowPixels.slice(10, 20).forEach((pixel, i) => {
            if (pixel.style.backgroundColor === myColor) {
                rightGroup.push(i)
            }
        })

        if (leftGroup.length > 0) {
            encodedData += `${alphabetLower[row]}${leftGroup.join('')}`
        }
        if (rightGroup.length > 0) {
            encodedData += `${alphabetUpper[row]}${rightGroup.join('')}`
        }
    }
    return encodedData
}

// URL에 데이터를 저장하는 함수
const updateURLWithPixelData = () => {
    const compressedData = compressPixelData() // 데이터를 압축
    const url = new URL(window.location)
    url.searchParams.set('pixels', compressedData)
    window.history.replaceState(null, '', url)
}

// 복사 버튼 클릭 시 URL 복사
copyBtn.addEventListener('click', () => {
    updateURLWithPixelData() // URL 업데이트
    window.navigator.clipboard.writeText(window.location.href).then(() => {
        alert("URL 복사 완료")
    })
})

// 리셋 버튼 클릭 시 모든 픽셀 초기화
resetBtn.addEventListener('click', () => {
    pixels.forEach(pixel => pixel.style.backgroundColor = '')
    const url = new URL(window.location)
    url.searchParams.delete('pixels')
    window.history.replaceState(null, '', url)
})

// 압축된 데이터를 복원하는 함수
const decompressPixelData = (compressed) => {
    let currentGroup = null
    let row = null
    compressed.split('').forEach(char => {
        if (alphabetLower.includes(char)) {
            currentGroup = 'left' // 왼쪽
            row = alphabetLower.indexOf(char)
        } else if (alphabetUpper.includes(char)) {
            currentGroup = 'right' // 오른쪽
            row = alphabetUpper.indexOf(char)
        } else {
            const index = Number(char)
            const pixelIndex = currentGroup === 'left' 
                ? row * 20 + index
                : row * 20 + index + 10
            
            pixels[pixelIndex].style.backgroundColor = myColor // 해당 픽셀 복원
        }
    })
}

// 페이지 로드 시 URL에서 데이터 복원
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search)
    const pixelData = urlParams.get('pixels')
    if (pixelData) {
        console.log(pixelData)
        decompressPixelData(pixelData) // 압축된 데이터를 복원
    }
})