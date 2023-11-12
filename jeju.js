// 데이터 추출 영역
const dataList = fetch('https://apis.data.go.kr/4180000/cctour/getTourList?serviceKey=7DPe2gTV4HrKUEw7CK%2BlMTa%2FE3YseFoGSsqQ3V7e81xuvQkoMEnpdyE39OdVg8yvD%2FBRHo%2FrT%2FRDM5sItw6TGA%3D%3D&pageNo=1&numOfRows=30')
.then((response) => {
    return response.json();
})
.then((data) => {
    return(data)
})

let flag = false
main(dataList);

// 데이터 처리 영역
async function main(dataList){
    let dataObj = await dataList    // 객체로 데이터 받아오기
    const tourList = dataObj['data']    // 데이터 객체의 원하는 항목 추출
    const tourGubunSet = makeGubunSet(tourList);    // 구분 항목에 대한 세트 생성.
    const nolatlng = getLocation(tourList)
    const markerList = makersmarker(nolatlng, tourList)
    console.log('tourList', tourList);
    let tourNmList = []     // 관광지 이름 리스트
    tourList.forEach((tour) => {
        tourNmList.push(tour.tourNm)
    })



    // getTour(tourList[i]['tourNo'], tourList[i]['tourGubun'])
    /* 결과
    1 '관광지' : 구곡폭포
    2 '관광지' : 춘천호반
    3 '관광지' : 청평사(춘천)
    4 '관광단지': 신영
    5 '관광단지': 라비에벨
    */

    makeMenuBar(tourGubunSet)   // 최상위 메뉴바 생성. 가장 먼저 호출해야함.

    makeChildMenuBar(tourList) // 하위 메뉴바 생성. 동적으로 생성하길 원함.
    // 번호와 tourList 넘겨주면 생성, 번호 넘겨주지 말고 전체 생성
    // delChildMenuBar()   // 하위 메뉴바 삭제도 만들자.
    // 하위 메뉴 클릭시 이벤트 
    nolatlng.forEach((nll) => {
        document.getElementById(`${nll.no}`).addEventListener('click', (e) => {
            panTo(nolatlng[`${nll.no - 1}`])
            sleep(1000).then(makeInfo(tourList[`${nll.no - 1}`]))
        });
    });
    // chuncheon 로고 클릭시 지도 원위치
    document.getElementById('logo').addEventListener('click', (e) => {
            map.setCenter(new kakao.maps.LatLng(37.85068, 127.73700))
            map.setLevel(10, {animate: {duration: 500}});
            sleep(1000).then(delInfo())
        
    })
}




// top 메뉴가 될 항목 구분 세트 생성
function makeGubunSet(tourList){
    let tourGubun = []
    tourList.forEach(tour => {
        tourGubun.push(tour['tourGubun'])
    });
    const tourGubunSet = new Set(tourGubun);
    return tourGubunSet;
}

// list 개수에 따라 메뉴 더 늘어남.
function makeMenuBar(list){  
    // 최상위 메뉴바 만드는 함수. innerHTML을 할 것이라 호출하는 순서 중요
    const location = document.getElementById("nav")
    let html = ''
    let menu = ''
    list.forEach((key) => {
        menu += `<ul>${key}</ul>`
    })
    html += menu
    location.innerHTML = html
}

// 관광지, 관광단지 이름의 메뉴버튼, 누르면 지도에 표시.
function makeChildMenuBar(tourList) {
    let tourNm = []
    tourList.forEach((tour) => {
        const nav1 = document.querySelector("#nav ul")
        const nav2 = document.querySelector("#nav ul+ul")
        let link_html = ''
        const tourNm = tour['tourNm'];
        const tourNo = tour['tourNo']
        const tourGubun = tour['tourGubun']
        // const ch = document.querySelector(`#nav li:nth-child(${tourNo})`)
        // 하위 메뉴를 몇개씩 구분할지 결정.
        if(tourNo >= 4){
            nav2.innerHTML += `<li id="${tourNo}">${tourNm}</li>`
        }
        else{
        nav1.innerHTML += `<li id="${tourNo}">${tourNm}</li>`
        }
    })
}


function getLocation(tourList){
    let locationList = []
    tourList.forEach((tour) => {
        locationList.push({
            'no': tour['tourNo'],
            'lat': tour['latitude'],
            'lng': tour['longtitude']
        })

    })
    return locationList
}

function makeInfo(tour){
    const div = document.getElementById("info");
    div.style.display = "block";
    div.style.animation = "appear 1s";
    div.innerHTML = '';
    div.innerHTML = `<p style="padding: 10px 50px;">${tour.info}</p>`;
}

function delInfo(){
    isDelInfoRunning = true
    const div = document.getElementById("info");
    div.style.animation = "disappear 0.5s";
    setTimeout(function () {
        div.style.display = "none";
    }, 500);
    div.innerHTML = '';
    isDelInfoRunning = false
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}



// nolatlng


// 인증키
// 7DPe2gTV4HrKUEw7CK+lMTa/E3YseFoGSsqQ3V7e81xuvQkoMEnpdyE39OdVg8yvD/BRHo/rT/RDM5sItw6TGA==
var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
mapOption = {
center: new kakao.maps.LatLng(37.85068, 127.73700), // 지도의 중심좌표
level: 10, // 지도의 확대 레벨
mapTypeId : kakao.maps.MapTypeId.ROADMAP // 지도종류
}; 

// 지도를 생성한다 
var map = new kakao.maps.Map(mapContainer, mapOption); 

//nolatlng
function makersmarker(markers, tourList){
    // 마커를 담을 배열
    var markerArray = [];
    // 반복문을 사용하여 마커 생성
    for (var i = 0; i < markers.length; i++) {
        var marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(markers[i].lat, markers[i].lng),
            map: map // 마커를 표시할 지도 객체
        });
        // 생성한 마커를 배열에 추가
        markerArray.push(marker);
    }


    // 마커 인포윈도우에 넣을 내용
    // tourNm
    // newAddr
    // convenienceFacility

    // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
    // 인포윈도우를 생성합니다
    var infowindowList = []

    tourList.forEach((tour) => {
        const tc = tour['convenienceFacility'].split('+')
        infowindowList.push(new kakao.maps.InfoWindow({
            content : `<div style="padding:5px;">이름: ${tour.tourNm}<br>주소: ${tour.newAddr}<br>시설: ${tc}</div><br>`,
            removable : false
        }));
    });

    markerArray.forEach((marker, index) => {
        kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindowList[index]));
        kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindowList[index]));
        //     // 마커에 클릭이벤트를 등록합니다
        // kakao.maps.event.addListener(marker, 'click', function() {
        //     // 마커 위에 인포윈도우를 표시합니다
        //     infowindow.open(map, marker);  
        // });
    })

    return markerArray
}


// 인포윈도우를 표시하는 클로저를 만드는 함수입니다 
function makeOverListener(map, marker, infowindow) {
    return function() {
        infowindow.open(map, marker);
    };
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
    return function() {
        infowindow.close();
    };
}


function panTo(markers) {
    // 이동할 위도 경도 위치를 생성합니다 
    var moveLatLon = new kakao.maps.LatLng((markers.lat), (markers.lng));
    
    // 지도 중심을 부드럽게 이동시킵니다
    // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
    map.panTo(moveLatLon);  

    setTimeout(function (){
        map.setLevel(5, {animate: {duration: 500}});
    }, 500)

}  
