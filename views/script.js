var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(35.1379222, 129.05562775), //지도의 중심좌표.
	level: 8 //지도의 레벨(확대, 축소 정도)
};



var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

setTimeout(function(){ map.relayout(); }, 0);
// 지도에 확대 축소 컨트롤을 생성
let zoomControl = new kakao.maps.ZoomControl();

// 지도의 우측에 확대 축소 컨트롤을 추가
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

// 지도를 생성합니다    
//var map = new kakao.maps.Map(mapContainer, mapOption); 
// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();  

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

// 키워드로 장소를 검색합니다
searchPlaces();

// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {

    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch( keyword, placesSearchCB); 
}

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출합니다
        displayPlaces(data);

        // 페이지 번호를 표출합니다
        displayPagination(pagination);

    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}



/*
**********************************************************
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
*/
const dataSet = [
    {
      title: "옛날오막집",
      address: "부산 서구 구덕로 274번길 14",
      url: "https://www.youtube.com/watch?v=P-jNCiLMQN4",
      category: "한식",
    },
    {
      title: "이레옥",
      address: "부산 해운대구 마린시티3로 51",
      url: "https://www.youtube.com/watch?v=8VPVbZdWx5M",
      category: "한식",
    },
    {
      title: "호랑이젤라떡",
      address: "부산광역시 해운대구 달맞이길62번길 38",
      url: "https://www.youtube.com/watch?v=lwUfDmTO1fw",
      category: "디저트",
    },
    {
      title: "감천문화마을",
      address: "부산 사하구 감천동 10-63",
      url: "https://www.youtube.com/watch?v=F7gOKQxkDyM",
      category: "관광지",
    },
  ];

var geocoder = new kakao.maps.services.Geocoder();

function getCoordsByAddress(address) {
  // promise 형태로 반환
  return new Promise((resolve, reject) => {
    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(address, function (result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === kakao.maps.services.Status.OK) {
        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        return resolve(coords);
      }
      reject(new Error("getCoordsByAddress Error: not valid Address"));
    });
  });
}
setMap(dataSet);


function getContent(data){
  // 유튜브 섬네일 id 가져오기
  let replaceUrl = data.url;
  let finUrl = "";
  replaceUrl = replaceUrl.replace("https://youtu.be/", "");
  replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
  replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
  finUrl = replaceUrl.split("&")[0];

  // 인포윈도우 가공하기
  return `
  <div class="infowindow">
      <div class="infowindow-img-container">
        <img
          src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg"
          class="infowindow-img"
        />
      </div>
      <div class="infowindow-body">
        <h5 class="infowindow-title">${data.title}</h5>
        <p class="infowindow-address">${data.address}</p>
        <a href="${data.url}" class="infowindow-btn" target="_blank">영상이동</a>
      </div>
    </div>
  `;
}

async function setMap(dataSet) {
  for (var i = 0; i < dataSet.length; i++) {
    let coords = await getCoordsByAddress(dataSet[i].address);

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
      map: map, // 마커를 표시할 지도
      position: coords, // 마커를 표시할 위치
    });

    markerArray.push(marker);

    // 마커에 표시할 인포윈도우를 생성합니다
    var infowindow = new kakao.maps.InfoWindow({
      content: getContent(dataSet[i]), // 인포윈도우에 표시할 내용
    });

    infowindowArray.push(infowindow);

    // 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
    // 이벤트 리스너로는 클로저를 만들어 등록합니다
    // for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
    kakao.maps.event.addListener(
      marker,
      "click",
      makeOverListener(map, marker, infowindow, coords)
    );
    // 커스텀: 맵을 클릭하면 현재 나타난 인포윈도우가 없어지게끔
    kakao.maps.event.addListener(map, "click", makeOutListener(infowindow));
  }
}
// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
/* 
  커스텀
  1. 클릭시 다른 인포윈도우 닫기
  2. 클릭한 곳으로 지도 중심 이동하기
  */

  function makeOverListener(map, marker, infowindow,coords) {
    return function () {
      // 1. 클릭시 다른 인포윈도우 닫기
      closeInfoWindow();
      infowindow.open(map, marker);
      // 2. 클릭한 곳으로 지도 중심 옮기기
      map.panTo(coords);
    };
  }

  let infowindowArray = [];
  function closeInfoWindow(){
    for(let infowindow of infowindowArray){
      infowindow.close();
    }
  }

  function makeOutListener(infowindow) {
    return function () {
      infowindow.close();
    };
  }

  /*
**********************************************
5. 카테고리 분류
*/
const categoryMap = {
  korea: "한식",
  china: "중식",
  japan: "일식",
  america: "양식",
  wheat: "분식",
  dessert: "디저트",
  sushi: "회/초밥",
  TouristAttraction: "관광지",
};

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click",categoryHandler);

function categoryHandler(event){
  const categoryId = event.target.id;
  const category = categoryMap[categoryId];

  let categorizedDataSet = [];
  for (let data of dataSet) {
    if (data.category === category) {
      categorizedDataSet.push(data);
    }
  }

  //기존 마커 삭제
  closeMarker();

  //기존 인포윈도우 닫기
  closeInfoWindow();

  setMap(categorizedDataSet);
}

let markerArray = [];
function closeMarker(){
  for(marker of markerArray){
    marker.setMap(null);
  }
}
