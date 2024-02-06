/*
Global Variables
*/
var theCreateItemModal = document.getElementById("create-item-modal");
var fileUploadInput = document.getElementById("file-uploader");
var unlistedListItems = document.getElementById("unlisted-list-items")

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
    console.log("do upload here");
    const image = fileUploadInput.files[0];

    if (!image.type.includes('image')) {
        return alert('Only images are allowed!');
    }
    if (image.size > 10_000_000) {
        return alert('Maximum upload size is 10MB!');
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(image);
    fileReader.onload = (fileReaderEvent) => {
        createListItem(fileReaderEvent.target.result);
    }
}
function createListItem(imageUrl){
    const imageDiv = document.createElement("div");
    imageDiv.setAttribute("class", "list-item");
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
function drag(ev) {
    // Check whether the element being dragged is the item div
    // or a child of the div, setting the "id to move later" to the item div
    if (ev.target.classList.contains("list-item")){
        ev.dataTransfer.setData("itemDivId", ev.target.id);
    }else if(ev.target.parentNode.classList.contains("list-item")){
        ev.dataTransfer.setData("itemDivId", ev.target.parentNode.id);
    }
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
