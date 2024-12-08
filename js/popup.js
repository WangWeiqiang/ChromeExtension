const getMeta = (url, cb) => {
  const img = new Image();
  img.onload = () => cb(null, img);
  img.onerror = (err) => cb(err);
  img.src = url;
};

// Use like:

var originalImage=[];
var selectedImage=[];
var pendingDownload=[];
var minSize=9999;
var maxSize=0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if (request.reloaded) {
    loadImages();
  }

  if(request.refresh){
    loadImages();
  }
});

document.addEventListener("DOMContentLoaded", function() {

  // Retrieve the stored images from local storage
  loadImages();
});


function loadImages(){
  chrome.storage.local.get("images", function(data) {
    originalImage=[];
    pendingDownload=[];
    if (data.images) {
      const imageContainer = document.getElementById("imageContainer");
     

      // Display the collected images in the popup
      for (const imageUrl of data.images) {
        originalImage.push({url:imageUrl,size:{w:0,h:0}});
        pendingDownload.push({url:imageUrl,size:{w:0,h:0}});
        getMeta(imageUrl, (err, img) => {
          if(img!=undefined){
            originalImage.filter((item)=>item.url==imageUrl)[0].size={w:img.naturalWidth,h:img.naturalHeight};
            if(img.naturalWidth<minSize){
              minSize=img.naturalWidth;
            }
            if(img.naturalWidth>maxSize){
              maxSize=img.naturalWidth;
            }
            $( "#slider-range" ).slider({
              range: true,
              min: minSize,
              max: maxSize,
              values: [ minSize, maxSize ],
              slide: function( event, ui ) {
                $( "#amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
                FileterImage(ui.values[ 0 ],ui.values[ 1 ]);
              }
            });
          }
        });
        
      }

      ShowImages(originalImage);
    }
  });
}
function FileterImage(min,max){
  selectedImage=[];
  pendingDownload=[];
  originalImage.forEach((item)=>{
    if(item.size.w>=min && item.size.w<=max){
      selectedImage.push(item);
      pendingDownload.push(item);
    }
  });

  ShowImages(selectedImage);
  
}

$(function() {
  const downloadButton = $("#downloadButton");
  
  $("#downloadButton").on('click',function() {
    const imageName = $("#imageName").val();
    chrome.runtime.sendMessage({ customName:imageName, images: pendingDownload });
  });


  $("#refreshButton").on('click',function() {
   
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id,{ refresh: true });
    });

  });

});

function ShowImages(list){
  const imageContainer = document.getElementById("imageContainer");

  imageContainer.innerHTML="";
  selctorId="image-";
  index = 0;
  list.forEach((item)=>{
    const card = document.createElement("div");
    card.className="card";
 

    const img = document.createElement("img");
    img.className="download-img card-selected  img-fluid";
    img.src = item.url;
    img.title=item.size.w+"x"+item.size.h;
    img.data="#"+selctorId+index;
    img.onclick=function(e){
      e.target.classList.toggle("card-selected");
      
      $( e.target.data).prop( "checked", !$( e.target.data).prop( "checked" ) );

      if($( e.target.data).prop( "checked" )){
        pendingDownload.indexOf(item.url)==-1?pendingDownload.push(item.url):null;
        
      }else{
        pendingDownload.splice(pendingDownload.indexOf(item.url),1);
      }

      console.log(pendingDownload.length);
      
    }


    card.appendChild(img);
    

    const checkBox = document.createElement("input");
    checkBox.type="checkbox";
    checkBox.className="download-img-checkbox";
    checkBox.value=item.url;
    checkBox.id=selctorId+index;
    checkBox.checked=true;
    
    card.appendChild(checkBox);
    index++;

    imageContainer.appendChild(card);
  });
}
