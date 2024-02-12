/*
Global Variables
*/
var theCreateItemModal = document.getElementById("create-item-modal");
var fileUploadInput = document.getElementById("file-uploader");
var unlistedListItems = document.getElementById("unlisted-list-items")
var nextItemId = 1; // NTS: Does NOT correlate to num of items

/*
Tier List Functions
*/
function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
}

/*
Modal Functions
*/
function openModal(){
    theCreateItemModal.style.display = "block";
}
function closeModal(){
    theCreateItemModal.style.display = "none";
}
function uploadImage(){
    console.log(fileUploadInput.files);
    for (let file of fileUploadInput.files){
        readImageFile(file);
    }
}
function readImageFile(file){
    if (!file.type.includes('image')) {
        return alert('Only images are allowed!');
    }
    if (file.size > 10_000_000) {
        return alert('Maximum upload size is 10MB!');
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = (fileReaderEvent) => {
        createListItem(fileReaderEvent.target.result);
    }
}
function createImageFromText(el){
    const canvasText = el.value;
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = 100;
    tempCanvas.height = 100;
    tempContext.fillStyle = "white";
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempContext.fillStyle = "black";
    tempContext.font = "48px serif";
    tempContext.textBaseline = 'middle';
    tempContext.fillText(canvasText, 0, tempCanvas.height/2, 100);
    createListItem(tempContext.canvas.toDataURL());
}
function createListItem(imageUrl){
    if (nextItemId == Number.MAX_SAFE_INTEGER){
        throw new Error("idk how but you've made an insurmountable amount of items. restart the page");
    }
    const imageDiv = document.createElement("div");
    imageDiv.setAttribute("class", "list-item");
    imageDiv.setAttribute("id", "item-" + nextItemId.toString());
    nextItemId += 1;
    imageDiv.setAttribute("draggable", true);
    imageDiv.ondragstart = function() {
        drag(event, imageDiv);
    }
    const imageNode = document.createElement("img");
    imageNode.setAttribute("src", imageUrl);
    imageDiv.appendChild(imageNode)
    unlistedListItems.appendChild(imageDiv);
    closeModal();
}


/*
Dragging Functions
*/
// What happens when dragging?
// Regardless may want to use this somewhere: "DataTransfer.setDragImage()"
function previewDrop(ev){
    ev.preventDefault();
}
function drag(ev, el) {
    ev.dataTransfer.setData("itemDivId", el.id);
}
function drop(ev, el) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("itemDivId");
    el.appendChild(document.getElementById(data));
}

/*
Doc Setup Functions
*/
// Clicking outside an open modal, closes the modal
window.onclick = function(event){
    if(event.target == theCreateItemModal){
        closeModal();
    }
}
