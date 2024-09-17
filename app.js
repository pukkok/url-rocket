const canvas = document.getElementById('draw-canvas')
const ctx = canvas.getContext('2d')
const copyBtn = document.getElementById('copy')
const resetBtn = document.getElementById('reset')

canvas.width = 800
canvas.height = 800

let isDown = false
let coords = []
let infos = []

// 좌표들을 URL의 쿼리 파라미터로 변환하는 함수
const updateURLWithCoords = () => {
    const url = new URL(window.location)
    const encodedCoords = encodeURIComponent(JSON.stringify(infos)) // JSON을 문자열로 변환 후 URI 인코딩
    url.searchParams.set('coords', encodedCoords) // 쿼리 파라미터 설정
    window.history.replaceState(null, '', url) // URL 업데이트 (페이지 이동 없이)
}

// 마우스를 눌렀을 때
const penDown = (e) => {
    if (e.which === 3) return // 오른쪽 클릭 무시
    isDown = true
    ctx.beginPath()
    ctx.moveTo(e.offsetX, e.offsetY)
    coords = [{ x: e.offsetX, y: e.offsetY }]
}

// 마우스를 움직일 때
const penMove = (e) => {
    if (!isDown) return
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.stroke()
    coords = [...coords, { x: e.offsetX, y: e.offsetY }]
}

// 마우스를 뗐을 때
const penUp = () => {
    isDown = false
    infos = [...infos, coords] // 그린 좌표들을 저장
    coords = []
    updateURLWithCoords() // 좌표 정보를 URL에 반영
}

canvas.addEventListener('mousedown', penDown)
canvas.addEventListener('mousemove', penMove)
canvas.addEventListener('mouseup', penUp)

// 복사 버튼 클릭 시
copyBtn.addEventListener('click', () => {
    window.navigator.clipboard.writeText(window.location.href).then(() => {
        alert("URL 복사 완료")
    })
})

// 리셋 버튼 클릭 시
resetBtn.addEventListener('click', () => {
    infos = [] // 좌표 정보 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height) // 캔버스 지우기
    const url = new URL(window.location)
    url.searchParams.delete('coords') // URL에서 좌표 쿼리 삭제
    window.history.replaceState(null, '', url) // URL 업데이트
    // alert("초기화 완료")
})

// 페이지가 로드될 때 쿼리 파라미터에서 좌표 복구
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search)
    const coordsParam = urlParams.get('coords')
    if (coordsParam) {
        const decodedCoords = JSON.parse(decodeURIComponent(coordsParam))
        infos = decodedCoords
        infos.forEach(coordSet => {
            ctx.beginPath()
            coordSet.forEach((coord, index) => {
                if (index === 0) {
                    ctx.moveTo(coord.x, coord.y)
                } else {
                    ctx.lineTo(coord.x, coord.y)
                }
            })
            ctx.stroke()
        })
    }
})
